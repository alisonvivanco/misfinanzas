import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";

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

  user.emailVerified = new Date();
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return NextResponse.json({
    success: true,
    message: "Email verificado. Ya puedes iniciar sesión.",
  });
}
