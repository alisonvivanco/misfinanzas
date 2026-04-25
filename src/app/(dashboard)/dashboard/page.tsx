import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { isAdminEmail } from "@/lib/subscription-server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; anio?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const mes = Number(params.mes) || now.getMonth() + 1;
  const anio = Number(params.anio) || now.getFullYear();

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const dbUser = await User.findById(session.user.id)
    .select("plan upsellShownAt email")
    .lean();

  const isAdmin = isAdminEmail(dbUser?.email ?? session.user.email);
  // Solo elegible para upsell si: trial activo (no admin, no premium) y no ha
  // visto el modal antes.
  const upsellEligible =
    !isAdmin &&
    dbUser?.plan === "trial" &&
    !dbUser?.upsellShownAt;

  return (
    <DashboardClient
      initialMes={mes}
      initialAnio={anio}
      userId={session.user.id}
      upsellEligible={upsellEligible}
    />
  );
}
