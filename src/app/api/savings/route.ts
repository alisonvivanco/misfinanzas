import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { Saving } from "@/models/Saving";
import { requireActiveUser, bad, badZod } from "@/lib/api-helpers";

const createSchema = z.object({
  descripcion: z.string().min(1).max(120),
  meta: z.number().nonnegative(),
  montoAhorrado: z.number().nonnegative().optional(),
  fechaMeta: z.string().optional(),
});

const patchSchema = createSchema.partial();

export async function GET(_req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  await dbConnect();
  const items = await Saving.find({ userId: u.userId }).sort({ createdAt: 1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badZod(parsed.error.flatten().fieldErrors);
  await dbConnect();
  const created = await Saving.create({
    ...parsed.data,
    fechaMeta: parsed.data.fechaMeta ? new Date(parsed.data.fechaMeta + "T12:00:00Z") : undefined,
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
  const updated = await Saving.findOneAndUpdate(
    { _id: id, userId: u.userId },
    {
      $set: {
        ...parsed.data,
        ...(parsed.data.fechaMeta
          ? { fechaMeta: new Date(parsed.data.fechaMeta + "T12:00:00Z") }
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
  await Saving.deleteOne({ _id: id, userId: u.userId });
  return NextResponse.json({ ok: true });
}
