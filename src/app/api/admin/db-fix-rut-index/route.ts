import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { isAdminEmail } from "@/lib/subscription-server";

/**
 * One-shot fix for the rut index. Drops any unique-non-partial index on `rut`
 * and ensures the unique-partial one exists.
 *
 * Safe to call multiple times. Admin-only, same-origin only.
 */
export async function POST(req: NextRequest) {
  // Origin check (defense-in-depth).
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
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await dbConnect();
  const collection = User.collection;

  const before = await collection.indexes();
  const dropped: string[] = [];

  // Drop any unique-non-partial index whose key includes rut.
  for (const idx of before) {
    const i = idx as {
      name: string;
      key: Record<string, number>;
      unique?: boolean;
      partialFilterExpression?: Record<string, unknown>;
    };
    if (
      Object.prototype.hasOwnProperty.call(i.key, "rut") &&
      i.unique === true &&
      !i.partialFilterExpression
    ) {
      try {
        await collection.dropIndex(i.name);
        dropped.push(i.name);
      } catch (e) {
        return NextResponse.json(
          { error: `No se pudo dropear ${i.name}: ${e instanceof Error ? e.message : String(e)}` },
          { status: 500 }
        );
      }
    }
  }

  // Ensure the unique partial index exists.
  let createdPartial = false;
  try {
    await collection.createIndex(
      { rut: 1 },
      { unique: true, partialFilterExpression: { rut: { $type: "string" } } }
    );
    createdPartial = true;
  } catch (e) {
    // If it already exists with the same spec, MongoDB returns a no-op or matches.
    // Re-throw any unexpected error.
    return NextResponse.json(
      {
        error: `No se pudo crear el índice partial: ${e instanceof Error ? e.message : String(e)}`,
        dropped,
      },
      { status: 500 }
    );
  }

  const after = await collection.indexes();
  return NextResponse.json({
    ok: true,
    dropped,
    createdPartial,
    indexesAfter: after.map((i) => ({ name: i.name, key: i.key })),
  });
}
