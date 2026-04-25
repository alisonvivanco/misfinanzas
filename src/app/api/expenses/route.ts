import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { Expense } from "@/models/Expense";
import { requireActiveUser, bad, badZod } from "@/lib/api-helpers";

const tipoEnum = z.enum(["necesidades", "deseos", "ahorros"]);

const createSchema = z.object({
  categoria: z.string().min(1).max(80),
  monto: z.number().nonnegative(),
  tipo: tipoEnum,
  fecha: z.string().optional(),
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2000).max(2100),
});

export async function GET(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const { searchParams } = new URL(req.url);
  const mes = Number(searchParams.get("mes"));
  const anio = Number(searchParams.get("anio"));
  if (!mes || !anio) return bad("mes y anio requeridos");
  await dbConnect();
  const items = await Expense.find({ userId: u.userId, mes, anio })
    .sort({ createdAt: -1 })
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
  const created = await Expense.create({
    ...parsed.data,
    fecha: parsed.data.fecha ? new Date(parsed.data.fecha) : undefined,
    userId: u.userId,
  });
  return NextResponse.json({ item: created }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !mongoose.isValidObjectId(id)) return bad("id inválido");
  await dbConnect();
  await Expense.deleteOne({ _id: id, userId: u.userId });
  return NextResponse.json({ ok: true });
}
