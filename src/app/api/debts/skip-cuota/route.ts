import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { Debt } from "@/models/Debt";
import { requireActiveUser, bad, badZod } from "@/lib/api-helpers";

const schema = z.object({
  cuotaNumero: z.number().int().min(1).max(360),
});

/** Mark a cuota as skipped/no-pagada. */
export async function POST(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !mongoose.isValidObjectId(id)) return bad("id inválido");

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badZod(parsed.error.flatten().fieldErrors);

  await dbConnect();
  const debt = await Debt.findOne({ _id: id, userId: u.userId });
  if (!debt) return bad("Deuda no encontrada", 404);

  const n = parsed.data.cuotaNumero;
  if (debt.cuotasTotales && n > debt.cuotasTotales) {
    return bad(`Cuota fuera de rango (1-${debt.cuotasTotales})`);
  }
  if (!debt.cuotasSaltadas.includes(n)) {
    debt.cuotasSaltadas.push(n);
    await debt.save();
  }
  return NextResponse.json({ item: debt.toObject() });
}

/** Unmark a cuota as skipped. */
export async function DELETE(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const cuotaNumero = Number(searchParams.get("cuotaNumero"));
  if (!id || !mongoose.isValidObjectId(id)) return bad("id inválido");
  if (!cuotaNumero || cuotaNumero < 1) return bad("cuotaNumero inválido");

  await dbConnect();
  const debt = await Debt.findOne({ _id: id, userId: u.userId });
  if (!debt) return bad("Deuda no encontrada", 404);

  debt.cuotasSaltadas = debt.cuotasSaltadas.filter((c) => c !== cuotaNumero) as typeof debt.cuotasSaltadas;
  await debt.save();
  return NextResponse.json({ item: debt.toObject() });
}
