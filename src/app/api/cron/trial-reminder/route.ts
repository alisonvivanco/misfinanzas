import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendTrialReminderEmail } from "@/lib/email";

/**
 * Cron job (Vercel) que corre cada hora.
 * Encuentra usuarios cuya prueba expira en menos de ~12 horas (entre
 * +11h y +13h desde ahora) y les manda el recordatorio una sola vez.
 *
 * Vercel Cron añade automáticamente el header `x-vercel-cron-signature`
 * y limita el endpoint a invocaciones internas. Para invocación manual
 * (testing), también admite Authorization Bearer con CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  // Vercel cron requests come with this header set; accept them.
  const isVercelCron = req.headers.get("x-vercel-cron") !== null
    || req.headers.has("x-vercel-signature");

  // Manual / external trigger: require CRON_SECRET.
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const hasValidSecret = cronSecret && auth === `Bearer ${cronSecret}`;

  if (!isVercelCron && !hasValidSecret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await dbConnect();
  const now = Date.now();
  const lower = new Date(now + 11 * 60 * 60 * 1000); // 11h
  const upper = new Date(now + 13 * 60 * 60 * 1000); // 13h

  const candidates = await User.find({
    plan: "trial",
    trialEndsAt: { $gte: lower, $lte: upper },
    trialReminderSentAt: { $exists: false },
    emailVerified: { $ne: null },
  })
    .select("_id email nombre")
    .limit(200) // safety cap per run
    .lean();

  let sent = 0;
  const errors: string[] = [];
  for (const u of candidates) {
    try {
      await sendTrialReminderEmail(u.email, u.nombre || "", String(u._id));
      await User.updateOne(
        { _id: u._id },
        { $set: { trialReminderSentAt: new Date() } }
      );
      sent++;
    } catch (e) {
      errors.push(`${u.email}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return NextResponse.json({
    ok: true,
    candidatesFound: candidates.length,
    sent,
    errors,
  });
}
