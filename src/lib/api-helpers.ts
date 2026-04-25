import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSubscriptionStatus } from "@/lib/subscription";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  return { userId: session.user.id };
}

/**
 * Like requireUser, but also enforces an active subscription.
 * Returns 402 with { requiresSubscription: true } when expired.
 */
export async function requireActiveUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  await dbConnect();
  const dbUser = await User.findById(session.user.id)
    .select("email plan trialEndsAt subscribedUntil")
    .lean();
  if (!dbUser) {
    return { error: NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 }) };
  }
  const status = getSubscriptionStatus({
    email: dbUser.email,
    plan: dbUser.plan,
    trialEndsAt: dbUser.trialEndsAt,
    subscribedUntil: dbUser.subscribedUntil,
  });
  if (!status.active) {
    return {
      error: NextResponse.json(
        { error: "Tu prueba terminó. Suscríbete para seguir usando la herramienta.", requiresSubscription: true },
        { status: 402 }
      ),
    };
  }
  return { userId: session.user.id };
}

export function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export function badZod(issues: unknown) {
  return NextResponse.json({ error: "Datos inválidos", issues }, { status: 400 });
}
