import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { generateToken } from "@/lib/utils";
import { sendResetEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email().toLowerCase(),
});

/**
 * Always returns 200 with the same body, regardless of whether the email
 * exists. This prevents account enumeration. The actual email is only sent
 * if the account exists.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    // Even on invalid input, return success-like to keep responses uniform.
    return NextResponse.json({ ok: true });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email: parsed.data.email })
      .select("email nombre password emailVerified")
      .lean();

    // Only send if account exists, has a password (no Google-only users), and
    // is verified. Otherwise pretend we did.
    if (user && user.password && user.emailVerified) {
      const token = generateToken(48);
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
      await User.updateOne(
        { _id: user._id },
        { $set: { resetToken: token, resetTokenExpires: expires } }
      );
      await sendResetEmail(user.email, user.nombre || "", token);
    }
  } catch (e) {
    console.error("[forgot]", e);
    // Still return ok to avoid leaking server state.
  }

  return NextResponse.json({ ok: true });
}
