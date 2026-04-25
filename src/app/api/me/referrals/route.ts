import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { ensureReferralCode } from "@/lib/referral";

/**
 * Returns the current user's referral code + stats:
 * - code (lazy-generated on first call)
 * - link (full URL to share)
 * - referredCount: cuántos amigos se inscribieron con tu link
 * - paidCount: cuántos de esos pagaron al menos una vez
 * - monthsEarned: bonos otorgados (cantidad de referidos que pagaron)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  await dbConnect();
  const code = await ensureReferralCode(session.user.id);

  const userObjectId = new mongoose.Types.ObjectId(session.user.id);
  const [referredCount, paidCount, monthsEarned] = await Promise.all([
    User.countDocuments({ referredBy: userObjectId }),
    // Pagaron = referido tiene mpStatus authorized o subscribedUntil > ahora
    User.countDocuments({
      referredBy: userObjectId,
      $or: [
        { mpStatus: "authorized" },
        { subscribedUntil: { $gt: new Date() } },
      ],
    }),
    // Meses ganados = referidos a los que ya se les otorgó el bonus
    User.countDocuments({
      referredBy: userObjectId,
      referralBonusGrantedAt: { $exists: true },
    }),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://misfinanzas.alisonvivanco.cl";
  const link = `${baseUrl}/signup?ref=${code}`;

  return NextResponse.json({
    code,
    link,
    referredCount,
    paidCount,
    monthsEarned,
  });
}
