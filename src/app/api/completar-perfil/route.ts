import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { validarRut, normalizarRut } from "@/lib/rut";

const schema = z.object({
  rut: z.string().refine(validarRut, { message: "RUT inválido" }),
  telefono: z.string().min(8).max(20),
  tipoIngreso: z.enum(["dependiente", "honorarios", "mixto", "negocio"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const rutNormalizado = normalizarRut(parsed.data.rut);

  try {
    await dbConnect();

    const rutTomado = await User.findOne({
      rut: rutNormalizado,
      _id: { $ne: session.user.id },
    }).lean();
    if (rutTomado) {
      return NextResponse.json(
        { error: "Ese RUT ya está registrado en otra cuenta" },
        { status: 409 }
      );
    }

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          rut: rutNormalizado,
          telefono: parsed.data.telefono,
          tipoIngreso: parsed.data.tipoIngreso,
          profileComplete: true,
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      rut: updated.rut,
      plan: updated.plan,
    });
  } catch (err) {
    // Duplicate-key guard (race): fall back to friendly message.
    if (err instanceof Error && /duplicate key/i.test(err.message)) {
      return NextResponse.json(
        { error: "Ese RUT ya está registrado en otra cuenta" },
        { status: 409 }
      );
    }
    console.error("[completar-perfil]", err);
    return NextResponse.json({ error: "Error al guardar perfil" }, { status: 500 });
  }
}
