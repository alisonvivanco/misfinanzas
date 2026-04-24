import { NextRequest, NextResponse } from "next/server";
import {
  GATE_COOKIE,
  GATE_MAX_AGE_SECONDS,
  gateTokenFor,
  getSitePassword,
} from "@/lib/site-gate";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  let password: string | undefined;
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : undefined;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 });
  }

  if (password !== getSitePassword()) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = await gateTokenFor(password);
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: GATE_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GATE_MAX_AGE_SECONDS,
  });
  return res;
}
