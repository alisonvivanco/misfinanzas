import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { validarRut, normalizarRut } from "@/lib/rut";
import { generateToken } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";

const signupSchema = z.object({
  nombre: z.string().min(2).max(50),
  apellido: z.string().min(2).max(50),
  rut: z.string().refine(validarRut, { message: "RUT inválido" }),
  telefono: z.string().min(8).max(20),
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Al menos 1 mayúscula")
    .regex(/[0-9]/, "Al menos 1 número"),
  tipoIngreso: z.enum(["dependiente", "honorarios", "mixto", "negocio"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const rutNormalizado = normalizarRut(data.rut);

    await dbConnect();

    const existing = await User.findOne({
      $or: [{ email: data.email }, { rut: rutNormalizado }],
    }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email o RUT" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const verificationToken = generateToken(48);
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const trialEnds = new Date(
      Date.now() + Number(process.env.FREE_TRIAL_DAYS || 14) * 24 * 60 * 60 * 1000
    );

    const user = await User.create({
      ...data,
      rut: rutNormalizado,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires: tokenExpires,
      emailVerified: null,
      plan: "trial",
      trialEndsAt: trialEnds,
      tipoIngreso: data.tipoIngreso || "honorarios",
    });

    await sendVerificationEmail(user.email, user.nombre, verificationToken);

    return NextResponse.json(
      {
        success: true,
        message: "Cuenta creada. Revisa tu email para verificar.",
        userId: user._id.toString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json(
      { error: "Error al crear cuenta" },
      { status: 500 }
    );
  }
}
