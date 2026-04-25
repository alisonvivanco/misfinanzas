import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { Debt } from "@/models/Debt";
import { requireActiveUser, bad, badZod } from "@/lib/api-helpers";

const createSchema = z.object({
  descripcion: z.string().min(1).max(120),
  monto: z.number().nonnegative(),
  cuotasTotales: z.number().int().min(1).max(360).optional(),
  fechaVencimiento: z.string().optional(),
});

const patchSchema = z.object({
  descripcion: z.string().min(1).max(120).optional(),
  monto: z.number().nonnegative().optional(),
  cuotasTotales: z.number().int().min(1).max(360).nullable().optional(),
  fechaVencimiento: z.string().optional(),
  saldada: z.boolean().optional(),
});

export async function GET(_req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  await dbConnect();
  const items = await Debt.find({ userId: u.userId }).sort({ createdAt: 1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badZod(parsed.error.flatten().fieldErrors);
  await dbConnect();
  const created = await Debt.create({
    ...parsed.data,
    fechaVencimiento: parsed.data.fechaVencimiento
      ? new Date(parsed.data.fechaVencimiento + "T12:00:00Z")
      : undefined,
    userId: u.userId,
  });
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
  const updated = await Debt.findOneAndUpdate(
    { _id: id, userId: u.userId },
    {
      $set: {
        ...parsed.data,
        ...(parsed.data.fechaVencimiento
          ? { fechaVencimiento: new Date(parsed.data.fechaVencimiento + "T12:00:00Z") }
          : {}),
      },
    },
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
  await Debt.deleteOne({ _id: id, userId: u.userId });
  return NextResponse.json({ ok: true });
}
