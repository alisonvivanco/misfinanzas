import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { Saving } from "@/models/Saving";
import { requireActiveUser, bad, badZod } from "@/lib/api-helpers";

const addSchema = z.object({
  monto: z.number().positive(),
  fecha: z.string(),
  notas: z.string().max(200).optional(),
});

/** Add a contribution to a savings goal. Recalculates montoAhorrado. */
export async function POST(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !mongoose.isValidObjectId(id)) return bad("id inválido");

  const body = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return badZod(parsed.error.flatten().fieldErrors);

  await dbConnect();
  const saving = await Saving.findOne({ _id: id, userId: u.userId });
  if (!saving) return bad("Meta no encontrada", 404);

  saving.contribuciones.push({
    fecha: new Date(parsed.data.fecha + "T12:00:00Z"),
    monto: parsed.data.monto,
    notas: parsed.data.notas,
  } as never);
  saving.montoAhorrado = saving.contribuciones.reduce((s, c) => s + c.monto, 0);
  await saving.save();

  return NextResponse.json({ item: saving.toObject() }, { status: 201 });
}

/** Remove a contribution by its sub-document id. */
export async function DELETE(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const contribId = searchParams.get("contribId");
  if (!id || !mongoose.isValidObjectId(id)) return bad("id inválido");
  if (!contribId || !mongoose.isValidObjectId(contribId)) return bad("contribId inválido");

  await dbConnect();
  const saving = await Saving.findOne({ _id: id, userId: u.userId });
  if (!saving) return bad("Meta no encontrada", 404);

  const before = saving.contribuciones.length;
  saving.contribuciones = saving.contribuciones.filter(
    (c) => String(c._id) !== contribId
  ) as typeof saving.contribuciones;
  if (saving.contribuciones.length === before) return bad("Aporte no encontrado", 404);

  saving.montoAhorrado = saving.contribuciones.reduce((s, c) => s + c.monto, 0);
  await saving.save();

  return NextResponse.json({ item: saving.toObject() });
}
