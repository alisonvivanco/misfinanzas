import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { Debt } from "@/models/Debt";
import { requireActiveUser, bad, badZod } from "@/lib/api-helpers";

const addSchema = z.object({
  monto: z.number().positive(),
  fecha: z.string(),
  notas: z.string().max(200).optional(),
});

/** Add a payment to a debt. Recalculates pagado and saldada. */
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
  const debt = await Debt.findOne({ _id: id, userId: u.userId });
  if (!debt) return bad("Deuda no encontrada", 404);

  debt.pagos.push({
    fecha: new Date(parsed.data.fecha + "T12:00:00Z"),
    monto: parsed.data.monto,
    notas: parsed.data.notas,
  } as never);
  debt.pagado = debt.pagos.reduce((s, p) => s + p.monto, 0);
  if (debt.pagado >= debt.monto) debt.saldada = true;
  await debt.save();

  return NextResponse.json({ item: debt.toObject() }, { status: 201 });
}

/** Remove a payment by its sub-document id. */
export async function DELETE(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const pagoId = searchParams.get("pagoId");
  if (!id || !mongoose.isValidObjectId(id)) return bad("id inválido");
  if (!pagoId || !mongoose.isValidObjectId(pagoId)) return bad("pagoId inválido");

  await dbConnect();
  const debt = await Debt.findOne({ _id: id, userId: u.userId });
  if (!debt) return bad("Deuda no encontrada", 404);

  const before = debt.pagos.length;
  debt.pagos = debt.pagos.filter((p) => String(p._id) !== pagoId) as typeof debt.pagos;
  if (debt.pagos.length === before) return bad("Pago no encontrado", 404);

  debt.pagado = debt.pagos.reduce((s, p) => s + p.monto, 0);
  if (debt.pagado < debt.monto) debt.saldada = false;
  await debt.save();

  return NextResponse.json({ item: debt.toObject() });
}
