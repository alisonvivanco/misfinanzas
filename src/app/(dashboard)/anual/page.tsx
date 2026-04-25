import { AnnualClient } from "@/components/dashboard/annual-client";

export default async function AnnualPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string }>;
}) {
  const params = await searchParams;
  const anio = Number(params.anio) || new Date().getFullYear();
  return <AnnualClient initialAnio={anio} />;
}
