import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendTrialReminderEmail } from "@/lib/email";

/**
 * Cron job (Vercel) — corre 1 vez al día (Hobby plan: daily-only).
 * Schedule: 0 12 * * * (mediodía UTC ≈ 9:00 AM Chile estándar).
 *
 * Encuentra usuarios cuya prueba expira en las próximas ~25 horas
 * y les manda el recordatorio una sola vez (controlado por
 * `trialReminderSentAt`). Como la prueba es de 1 día, esta ventana
 * cubre todos los signups del día previo independiente de la hora.
 *
 * Vercel Cron añade automáticamente headers de identidad. Para
 * invocación manual (testing) admite Authorization Bearer con
 * CRON_SECRET.
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
  // Daily cron: catch anyone whose trial expires in the next 25 hours and
  // hasn't been notified yet. With a 1-day trial, this catches every signup
  // from the previous ~24 hours exactly once.
  const upper = new Date(now + 25 * 60 * 60 * 1000);

  const candidates = await User.find({
    plan: "trial",
    trialEndsAt: { $gt: new Date(now), $lte: upper },
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
