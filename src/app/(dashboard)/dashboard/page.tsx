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
  return <DashboardClient initialMes={mes} initialAnio={anio} />;
}
