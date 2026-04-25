import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/subscription-server";

/**
 * Configures (or inspects) the MercadoPago preapproval plan's notification_url
 * directly via the MP API. Useful when MP's UI doesn't expose a Webhooks tab.
 *
 * Reads:
 *   MERCADOPAGO_ACCESS_TOKEN — APP_USR-... from MP developer panel
 *   NEXT_PUBLIC_APP_URL or request host — to build the public webhook URL
 *   NEXT_PUBLIC_SUBSCRIBE_URL — to extract the preapproval_plan_id
 *
 * GET → returns current plan notification_url + the URL we'd set
 * POST → PUTs notification_url on the plan
 *
 * Admin-only (ADMIN_EMAILS), same-origin POST.
 */

function parsePlanId(): string | null {
  const url = process.env.NEXT_PUBLIC_SUBSCRIBE_URL || "";
  const m = url.match(/preapproval_plan_id=([a-f0-9]+)/i);
  return m ? m[1] : null;
}

function buildWebhookUrl(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const base = fromEnv || `https://${req.headers.get("host")}`;
  return `${base}/api/webhooks/mercadopago`;
}

async function getPlan(planId: string, token: string) {
  const res = await fetch(`https://api.mercadopago.com/preapproval_plan/${planId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, data: json };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const planId = parsePlanId();
  const desiredUrl = buildWebhookUrl(req);

  if (!token) {
    return NextResponse.json({
      configured: false,
      reason: "missing-access-token",
      planId,
      desiredUrl,
      message: "Falta MERCADOPAGO_ACCESS_TOKEN en Vercel.",
    });
  }
  if (!planId) {
    return NextResponse.json({
      configured: false,
      reason: "missing-plan-id",
      desiredUrl,
      message: "No se pudo extraer preapproval_plan_id de NEXT_PUBLIC_SUBSCRIBE_URL.",
    });
  }

  const { ok, status, data } = await getPlan(planId, token);
  if (!ok) {
    return NextResponse.json({
      configured: false,
      reason: "plan-fetch-failed",
      planId,
      desiredUrl,
      status,
      message: data?.message || "Error consultando el plan.",
    });
  }

  const currentUrl = (data?.back_url ?? data?.notification_url) as string | undefined;
  const matches = currentUrl === desiredUrl;
  return NextResponse.json({
    configured: matches,
    planId,
    desiredUrl,
    currentNotificationUrl: data?.notification_url ?? null,
    planStatus: data?.status,
    planReason: data?.reason,
  });
}

export async function POST(req: NextRequest) {
  // Same-origin guard.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Origen inválido" }, { status: 403 });
    }
  }

  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Falta MERCADOPAGO_ACCESS_TOKEN en Vercel" },
      { status: 400 }
    );
  }
  const planId = parsePlanId();
  if (!planId) {
    return NextResponse.json(
      { error: "No se pudo extraer preapproval_plan_id de NEXT_PUBLIC_SUBSCRIBE_URL" },
      { status: 400 }
    );
  }
  const desiredUrl = buildWebhookUrl(req);

  const res = await fetch(`https://api.mercadopago.com/preapproval_plan/${planId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ notification_url: desiredUrl }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      {
        error: data?.message || `MP API ${res.status}`,
        details: data,
      },
      { status: res.status }
    );
  }
  return NextResponse.json({
    ok: true,
    planId,
    notificationUrl: data?.notification_url ?? desiredUrl,
  });
}
