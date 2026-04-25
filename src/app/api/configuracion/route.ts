import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { validarRut, normalizarRut } from "@/lib/rut";

const tipoBucket = z.enum(["necesidades", "deseos", "ahorros"]);

// Tasas como porcentaje (ej: 15.25), normalizamos a fracción al guardar.
const pct = z.number().min(0).max(100);

const schema = z.object({
  // Perfil
  nombre: z.string().min(1).max(50).optional(),
  apellido: z.string().min(1).max(50).optional(),
  telefono: z
    .string()
    .regex(/^(\+?56)?\s?9?\s?\d{4}\s?\d{4}$/, "Formato: +56 9 1234 5678")
    .optional(),
  rut: z
    .string()
    .refine((v) => !v || validarRut(v), { message: "RUT inválido" })
    .optional(),
  tipoIngreso: z.enum(["dependiente", "honorarios", "mixto", "negocio", "informal"]).optional(),

  // Tasas tributarias
  retencionHonorariosPct: pct.optional(),
  afpComisionPct: pct.optional(),
  planSalud: z.enum(["fonasa", "isapre"]).optional(),
  porcentajeSaludPct: pct.optional(),
  sisPorcentajePct: pct.optional(),
  accTrabajoPorcentajePct: pct.optional(),
  topeImponibleUF: z.number().min(0).max(1000).optional(),

  // 50/30/20
  donacionesBucket: tipoBucket.optional(),
  categoriasOverride: z.record(z.string(), tipoBucket).optional(),
});

export async function PATCH(req: NextRequest) {
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

  const data = parsed.data;
  const $set: Record<string, unknown> = {};

  if (data.nombre !== undefined) $set.nombre = data.nombre;
  if (data.apellido !== undefined) $set.apellido = data.apellido;
  if (data.telefono !== undefined) $set.telefono = data.telefono;
  if (data.rut !== undefined && data.rut !== "") $set.rut = normalizarRut(data.rut);
  if (data.tipoIngreso !== undefined) $set.tipoIngreso = data.tipoIngreso;

  // Las tasas se almacenan como fracción (0.1525), entran como porcentaje (15.25).
  if (data.retencionHonorariosPct !== undefined)
    $set["configuracion.retencionHonorarios"] = data.retencionHonorariosPct / 100;
  if (data.afpComisionPct !== undefined)
    $set["configuracion.afpComision"] = data.afpComisionPct / 100;
  if (data.porcentajeSaludPct !== undefined)
    $set["configuracion.porcentajeSalud"] = data.porcentajeSaludPct / 100;
  if (data.sisPorcentajePct !== undefined)
    $set["configuracion.sisPorcentaje"] = data.sisPorcentajePct / 100;
  if (data.accTrabajoPorcentajePct !== undefined)
    $set["configuracion.accTrabajoPorcentaje"] = data.accTrabajoPorcentajePct / 100;
  if (data.planSalud !== undefined) $set["configuracion.planSalud"] = data.planSalud;
  if (data.topeImponibleUF !== undefined)
    $set["configuracion.topeImponibleUF"] = data.topeImponibleUF;
  if (data.donacionesBucket !== undefined)
    $set["configuracion.donacionesBucket"] = data.donacionesBucket;
  if (data.categoriasOverride !== undefined)
    $set["configuracion.categoriasOverride"] = data.categoriasOverride;

  if (Object.keys($set).length === 0) {
    return NextResponse.json({ ok: true, changed: 0 });
  }

  try {
    await dbConnect();

    // Si vino un RUT distinto, validar unicidad.
    if ($set.rut) {
      const tomado = await User.findOne({
        rut: $set.rut,
        _id: { $ne: session.user.id },
      }).lean();
      if (tomado) {
        return NextResponse.json(
          { error: "Ese RUT ya está registrado en otra cuenta" },
          { status: 409 }
        );
      }
    }

    await User.updateOne({ _id: session.user.id }, { $set });
    return NextResponse.json({ ok: true, changed: Object.keys($set).length });
  } catch (err) {
    if (err instanceof Error && /duplicate key/i.test(err.message)) {
      return NextResponse.json(
        { error: "Ese RUT ya está registrado en otra cuenta" },
        { status: 409 }
      );
    }
    console.error("[configuracion]", err);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
