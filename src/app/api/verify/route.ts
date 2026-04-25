import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 400 }
    );
  }

  const isFirstVerification = !user.emailVerified;

  user.emailVerified = new Date();
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  // Send welcome email only on the first verification, and don't block the
  // response if the email service is slow or fails.
  if (isFirstVerification && !user.welcomeSentAt) {
    sendWelcomeEmail(user.email, user.nombre || "")
      .then(() => User.updateOne({ _id: user._id }, { $set: { welcomeSentAt: new Date() } }))
      .catch((e) => console.error("[verify] welcome email failed", e));
  }

  return NextResponse.json({
    success: true,
    message: "Email verificado. Ya puedes iniciar sesión.",
  });
}
