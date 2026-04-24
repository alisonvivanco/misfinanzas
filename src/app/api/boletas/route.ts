import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Boleta } from "@/models/Boleta";
import { tasaRetencionHonorarios } from "@/lib/chile-tax";

const boletaSchema = z.object({
  numeroBoleta: z.string().optional(),
  fechaEmision: z.string().transform((s) => new Date(s)),
  cliente: z.string().min(2),
  rutCliente: z.string().optional(),
  descripcion: z.string().min(3),
  montoBruto: z.number().positive(),
  porcentajeRetencion: z.number().optional(),
  estado: z.enum(["emitida", "pagada", "pendiente", "anulada"]).optional(),
  notas: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const url = new URL(req.url);
  const anio = url.searchParams.get("anio");
  const mes = url.searchParams.get("mes");
  const filter: any = { userId: session.user.id };
  if (anio) filter.anio = parseInt(anio);
  if (mes) filter.mes = parseInt(mes);
  const boletas = await Boleta.find(filter).sort({ fechaEmision: -1 }).lean();
  return NextResponse.json({ boletas });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = boletaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  await dbConnect();
  const data = parsed.data;
  const anio = data.fechaEmision.getFullYear();
  const porcentajeRetencion = data.porcentajeRetencion ?? tasaRetencionHonorarios(anio);
  const boleta = await Boleta.create({
    ...data,
    userId: session.user.id,
    porcentajeRetencion,
  });
  return NextResponse.json({ boleta }, { status: 201 });
}
