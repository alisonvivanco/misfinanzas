import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { Income } from "@/models/Income";
import { requireActiveUser, bad, badZod } from "@/lib/api-helpers";

const createSchema = z.object({
  fuente: z.string().min(1).max(120),
  monto: z.number().nonnegative(),
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
  const items = await Income.find({ userId: u.userId, mes, anio })
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
  const created = await Income.create({ ...parsed.data, userId: u.userId });
  return NextResponse.json({ item: created }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !mongoose.isValidObjectId(id)) return bad("id inválido");
  await dbConnect();
  await Income.deleteOne({ _id: id, userId: u.userId });
  return NextResponse.json({ ok: true });
}
