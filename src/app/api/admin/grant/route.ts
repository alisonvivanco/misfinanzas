import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { isAdminEmail } from "@/lib/subscription-server";

const schema = z.object({
  userId: z.string().refine(mongoose.isValidObjectId, "id inválido"),
  action: z.enum(["free", "extend30", "trial"]),
});

export async function POST(req: NextRequest) {
  // Origin check — reject cross-site POSTs (defense-in-depth, since SameSite=Lax
  // on the session cookie already blocks most scenarios).
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
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

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  await dbConnect();
  const { userId, action } = parsed.data;
  const update: Record<string, unknown> = {};

  if (action === "free") {
    update.plan = "free";
    update.subscribedUntil = null;
  } else if (action === "extend30") {
    const target = await User.findById(userId).select("subscribedUntil").lean();
    const current = target?.subscribedUntil ? new Date(target.subscribedUntil) : new Date();
    const base = current.getTime() > Date.now() ? current : new Date();
    update.plan = "premium";
    update.subscribedUntil = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (action === "trial") {
    update.plan = "trial";
    update.trialEndsAt = new Date(Date.now() + Number(process.env.FREE_TRIAL_DAYS || 1) * 24 * 60 * 60 * 1000);
    update.subscribedUntil = null;
  }

  const updated = await User.findByIdAndUpdate(userId, { $set: update }, { new: true })
    .select("email plan trialEndsAt subscribedUntil")
    .lean();
  if (!updated) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  return NextResponse.json({ ok: true, user: updated });
}
