import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { RecurringExpense } from "@/models/RecurringExpense";
import { requireActiveUser, bad, badZod } from "@/lib/api-helpers";

const tipoEnum = z.enum(["necesidades", "deseos", "ahorros"]);

const createSchema = z.object({
  descripcion: z.string().min(1).max(120),
  monto: z.number().nonnegative(),
  tipo: tipoEnum,
  diaPago: z.number().int().min(1).max(31).optional(),
});

const patchSchema = createSchema.partial().extend({
  activo: z.boolean().optional(),
});

export async function GET(_req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  await dbConnect();
  const items = await RecurringExpense.find({ userId: u.userId, activo: true })
    .sort({ createdAt: 1 })
    .lean();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badZod(parsed.error.flatten().fieldErrors);
  await dbConnect();
  const created = await RecurringExpense.create({ ...parsed.data, userId: u.userId });
  return NextResponse.json({ item: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !mongoose.isValidObjectId(id)) return bad("id inválido");
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return badZod(parsed.error.flatten().fieldErrors);
  await dbConnect();
  const updated = await RecurringExpense.findOneAndUpdate(
    { _id: id, userId: u.userId },
    { $set: parsed.data },
    { new: true }
  ).lean();
  return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !mongoose.isValidObjectId(id)) return bad("id inválido");
  await dbConnect();
  await RecurringExpense.deleteOne({ _id: id, userId: u.userId });
  return NextResponse.json({ ok: true });
}
