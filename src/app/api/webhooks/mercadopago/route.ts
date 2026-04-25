import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";

/**
 * MercadoPago webhook for subscriptions (preapproval) and payments.
 *
 * Configurar en MP dashboard → Tus integraciones → tu app → Webhooks:
 *   URL: https://misfinanzas.alisonvivanco.cl/api/webhooks/mercadopago
 *   Eventos: "Suscripciones" (subscription_preapproval) y "Pagos"
 *
 * Required env: MERCADOPAGO_ACCESS_TOKEN (de Mercado Pago developer panel).
 *
 * Auth model: el body del webhook puede ser falsificado, así que NO confiamos
 * en él. Solo lo usamos para extraer el ID y consultamos la API de MP con
 * nuestro access token, que sí es la verdad.
 */
export async function POST(req: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("[mp-webhook] MERCADOPAGO_ACCESS_TOKEN no configurado");
    // 200 to prevent MP from retrying in a loop while admin fixes the env.
    return NextResponse.json({ skipped: "no-token" }, { status: 200 });
  }

  let body: { type?: string; action?: string; data?: { id?: string | number } } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Also accept query params (MP sometimes sends both).
  const { searchParams } = new URL(req.url);
  const topic = body.type ?? searchParams.get("type") ?? searchParams.get("topic");
  const id = body.data?.id ?? searchParams.get("id") ?? searchParams.get("data.id");

  if (!topic || !id) {
    return NextResponse.json({ skipped: "no-topic-or-id" }, { status: 200 });
  }

  try {
    if (topic === "subscription_preapproval" || topic === "preapproval") {
      await handlePreapproval(String(id), accessToken);
    } else if (topic === "subscription_authorized_payment") {
      // Authorized payment refers to a specific charge. We can fetch the
      // preapproval it belongs to and re-sync from there.
      await handleAuthorizedPayment(String(id), accessToken);
    }
    // Other topics (payment, plan, etc.) — ignored for now.
  } catch (e) {
    console.error("[mp-webhook] error procesando", topic, id, e);
    // Return 200 anyway — MP retries indefinitely on 5xx, which can pile up.
    // Errors are logged so we can investigate.
    return NextResponse.json({ ok: false, error: String(e) }, { status: 200 });
  }

  return NextResponse.json({ ok: true });
}

/** GET handler so MP's "test" button doesn't 405. */
export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST only — usado por MercadoPago webhooks." });
}

interface MpPreapproval {
  id: string;
  status: "authorized" | "paused" | "cancelled" | "pending";
  external_reference?: string;
  next_payment_date?: string;
  date_created?: string;
  payer_email?: string;
  reason?: string;
}

async function fetchPreapproval(id: string, token: string): Promise<MpPreapproval | null> {
  const res = await fetch(`https://api.mercadopago.com/preapproval/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[mp-webhook] preapproval fetch fallo", id, res.status, await res.text());
    return null;
  }
  return (await res.json()) as MpPreapproval;
}

async function handlePreapproval(preapprovalId: string, token: string) {
  const pre = await fetchPreapproval(preapprovalId, token);
  if (!pre) return;

  await dbConnect();

  // Find user: prefer external_reference (userId we injected at subscribe time),
  // else fall back to existing mpPreapprovalId, else by payer_email.
  const externalRef = pre.external_reference;
  let userQuery: mongoose.FilterQuery<typeof User.prototype> | null = null;
  if (externalRef && mongoose.isValidObjectId(externalRef)) {
    userQuery = { _id: externalRef };
  } else if (pre.payer_email) {
    userQuery = { email: pre.payer_email.toLowerCase() };
  }
  if (!userQuery) {
    console.warn("[mp-webhook] no se pudo identificar al user para preapproval", preapprovalId);
    return;
  }

  const update: Record<string, unknown> = {
    mpPreapprovalId: pre.id,
    mpStatus: pre.status,
  };

  // Status mapping → plan + subscribedUntil.
  if (pre.status === "authorized") {
    update.plan = "premium";
    update.subscribedUntil = pre.next_payment_date
      ? new Date(pre.next_payment_date)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  } else if (pre.status === "paused" || pre.status === "cancelled") {
    // Don't shorten access — let it run out at subscribedUntil. Just record
    // status so admin can see it. We keep plan="premium" until subscribedUntil
    // expires; the layout's getSubscriptionStatus() does the active check.
  }

  const updatedUser = await User.findOneAndUpdate(userQuery, { $set: update }, { new: true }).lean();

  // Si el user pagó (authorized) Y vino con un referido Y todavía no se le
  // otorgó el bonus al referrer → otorgarle 30 días al referrer y marcar
  // referralBonusGrantedAt para evitar duplicar en webhooks repetidos.
  if (
    updatedUser &&
    pre.status === "authorized" &&
    updatedUser.referredBy &&
    !updatedUser.referralBonusGrantedAt
  ) {
    try {
      const referrer = await User.findById(updatedUser.referredBy)
        .select("subscribedUntil plan")
        .lean();
      if (referrer) {
        const base = referrer.subscribedUntil && new Date(referrer.subscribedUntil) > new Date()
          ? new Date(referrer.subscribedUntil)
          : new Date();
        const newUntil = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
        await User.updateOne(
          { _id: referrer._id },
          { $set: { subscribedUntil: newUntil, plan: "premium" } }
        );
        await User.updateOne(
          { _id: updatedUser._id },
          { $set: { referralBonusGrantedAt: new Date() } }
        );
        console.log(
          `[mp-webhook] referral bonus +30d para ${referrer._id} (referido ${updatedUser._id} pagó)`
        );
      }
    } catch (e) {
      console.error("[mp-webhook] error otorgando referral bonus", e);
    }
  }
}

interface MpAuthorizedPayment {
  preapproval_id?: string;
}

async function handleAuthorizedPayment(authPaymentId: string, token: string) {
  // Fetch the authorized_payment to get its preapproval_id, then re-sync
  // the preapproval (which is the source of truth for subscription state).
  const res = await fetch(
    `https://api.mercadopago.com/authorized_payments/${authPaymentId}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  if (!res.ok) {
    console.error("[mp-webhook] auth payment fetch fallo", authPaymentId, res.status);
    return;
  }
  const data = (await res.json()) as MpAuthorizedPayment;
  if (data.preapproval_id) {
    await handlePreapproval(data.preapproval_id, token);
  }
}
