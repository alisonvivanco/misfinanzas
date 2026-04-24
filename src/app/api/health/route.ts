import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conn = await dbConnect();
    const ok = conn.readyState === 1;
    return NextResponse.json({
      ok,
      db: ok ? "connected" : "disconnected",
      ts: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "db_error", ts: new Date().toISOString() },
      { status: 503 }
    );
  }
}
