import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { isAdminEmail } from "@/lib/subscription-server";

interface IndexSpec {
  name: string;
  key: Record<string, number>;
  unique?: boolean;
  partialFilterExpression?: Record<string, unknown>;
  sparse?: boolean;
}

interface RutDiagnosis {
  status: "ok" | "missing" | "stale" | "duplicate-rut-keys";
  message: string;
  recommendation?: string;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await dbConnect();

  const collection = User.collection;
  const rawIndexes = (await collection.indexes()) as IndexSpec[];
  const totalUsers = await collection.countDocuments({});
  const usersWithRut = await collection.countDocuments({ rut: { $type: "string" } });
  const usersNoRut = totalUsers - usersWithRut;

  // Find every index that touches the rut field (regardless of name).
  const rutIndexes = rawIndexes.filter((i) => Object.prototype.hasOwnProperty.call(i.key, "rut"));

  // Check if there's a stale unique-non-partial rut index that would cause
  // the second Google OAuth signup (rut undefined) to crash.
  const stalePartial = rutIndexes.find(
    (i) => i.unique === true && !i.partialFilterExpression
  );
  const goodPartial = rutIndexes.find(
    (i) =>
      i.unique === true &&
      i.partialFilterExpression &&
      JSON.stringify(i.partialFilterExpression) ===
        JSON.stringify({ rut: { $type: "string" } })
  );

  // Detect duplicate ruts across users (indicates a broken state).
  const dupAgg = await collection
    .aggregate([
      { $match: { rut: { $type: "string" } } },
      { $group: { _id: "$rut", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: "duplicates" },
    ])
    .toArray();
  const duplicateRuts = (dupAgg[0]?.duplicates as number | undefined) ?? 0;

  let rut: RutDiagnosis;
  if (duplicateRuts > 0) {
    rut = {
      status: "duplicate-rut-keys",
      message: `Hay ${duplicateRuts} RUT duplicados entre usuarios — algo falló en algún momento.`,
      recommendation:
        "Revisar manualmente en Atlas y decidir cuál user mantener. La fix de índice no resuelve duplicados ya creados.",
    };
  } else if (stalePartial) {
    rut = {
      status: "stale",
      message: `Existe un índice "${stalePartial.name}" sin partialFilterExpression. Si llegara un segundo signup con Google (rut undefined), MongoDB rechaza la inserción.`,
      recommendation:
        "Click en \"Arreglar índice\" abajo para dropearlo y recrear el partial. Es seguro: no afecta usuarios existentes.",
    };
  } else if (!goodPartial) {
    rut = {
      status: "missing",
      message: "No hay índice unique partial sobre rut.",
      recommendation:
        "Click en \"Arreglar índice\" para crearlo. Sin él, dos usuarios podrían tener el mismo RUT.",
    };
  } else {
    rut = { status: "ok", message: "Índice partial unique sobre rut está correcto." };
  }

  return NextResponse.json({
    totalUsers,
    usersWithRut,
    usersNoRut,
    duplicateRuts,
    rutIndexes,
    allIndexes: rawIndexes.map((i) => ({
      name: i.name,
      key: i.key,
      unique: i.unique,
      partial: i.partialFilterExpression || null,
    })),
    rut,
  });
}
