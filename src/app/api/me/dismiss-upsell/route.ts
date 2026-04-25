import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";

/**
 * Marca el upsell modal como visto. Se llama una vez por usuario,
 * cuando cierran el modal por cualquier vía (X, "lo haré más tarde",
 * o tras click en "suscribirme").
 */
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Origen inválido" }, { status: 403 });
    }
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  await dbConnect();
  await User.updateOne(
    { _id: session.user.id, upsellShownAt: { $exists: false } },
    { $set: { upsellShownAt: new Date() } }
  );
  return NextResponse.json({ ok: true });
}
