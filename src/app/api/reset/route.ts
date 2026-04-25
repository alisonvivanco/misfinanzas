import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";

const schema = z.object({
  token: z.string().min(8),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Al menos 1 mayúscula")
    .regex(/[0-9]/, "Al menos 1 número"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  await dbConnect();
  // Token must exist and not be expired. Use uniform errors to avoid leaking
  // whether a token existed-but-expired vs never-existed.
  const user = await User.findOne({
    resetToken: parsed.data.token,
    resetTokenExpires: { $gt: new Date() },
  }).select("_id");

  if (!user) {
    return NextResponse.json(
      { error: "Enlace inválido o expirado" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  await User.updateOne(
    { _id: user._id },
    {
      $set: { password: hashed },
      $unset: { resetToken: "", resetTokenExpires: "" },
    }
  );

  return NextResponse.json({ ok: true });
}
