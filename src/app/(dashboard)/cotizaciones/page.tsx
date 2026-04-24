import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Boleta } from "@/models/Boleta";
import { calcularCotizaciones, formatCLP, formatPct } from "@/lib/chile-tax";
import { Shield, AlertCircle } from "lucide-react";
import { KPICard } from "@/components/dashboard/kpi-card";
import { MESES_ES_SHORT } from "@/lib/utils";

export default async function CotizacionesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  await dbConnect();
  const anio = new Date().getFullYear();
  const boletas = await Boleta.find({ userId: session.user.id, anio }).lean();

  // Agrupar por mes
  const porMes = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    const brutoMes = boletas
      .filter((b) => b.mes === mes)
      .reduce((s, b) => s + b.montoBruto, 0);
    const cot = calcularCotizaciones(brutoMes);
    return {
      mes,
      mesNombre: MESES_ES_SHORT[i],
      bruto: brutoMes,
      ...cot,
    };
  });

  const totalAnual = porMes.reduce(
    (acc, m) => ({
      bruto: acc.bruto + m.bruto,
      base: acc.base + m.baseImponible,
      afp: acc.afp + m.afp,
      salud: acc.salud + m.salud,
      sis: acc.sis + m.sis,
      accidente: acc.accidente + m.accidenteTrabajo,
      total: acc.total + m.total,
    }),
    { bruto: 0, base: 0, afp: 0, salud: 0, sis: 0, accidente: 0, total: 0 }
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cotizaciones Previsionales</h1>
        <p className="text-muted-foreground mt-1">
          Ley 21.133 · Base imponible 80% del bruto · Año {anio}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Base imponible anual"
          value={totalAnual.base}
          icon={Shield}
          tone="default"
          trendLabel={`${formatPct(0.80)} del bruto`}
        />
        <KPICard
          label="AFP + comisión"
          value={totalAnual.afp}
          icon={Shield}
          tone="debt"
          trendLabel="10% + 1.16%"
        />
        <KPICard
          label="Salud"
          value={totalAnual.salud}
          icon={Shield}
          tone="income"
          trendLabel="Fonasa 7%"
        />
        <KPICard
          label="Total cotizaciones"
          value={totalAnual.total}
          icon={AlertCircle}
          tone="expense"
          trendLabel="A pagar en Previred"
        />
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Detalle mensual {anio}</h3>
          <p className="text-xs text-muted-foreground">
            Pagar mensualmente en previred.com o al Operación Renta
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Mes</th>
                <th className="px-4 py-3 text-right font-medium">Bruto</th>
                <th className="px-4 py-3 text-right font-medium">Base (80%)</th>
                <th className="px-4 py-3 text-right font-medium">AFP</th>
                <th className="px-4 py-3 text-right font-medium">Salud</th>
                <th className="px-4 py-3 text-right font-medium">SIS</th>
                <th className="px-4 py-3 text-right font-medium">Acc. Trab.</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {porMes.map((m) => (
                <tr
                  key={m.mes}
                  className="border-b last:border-0 hover:bg-accent/30 tabular-nums"
                >
                  <td className="px-4 py-2.5 font-medium">{m.mesNombre}</td>
                  <td className="px-4 py-2.5 text-right">{formatCLP(m.bruto)}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {formatCLP(m.baseImponible)}
                  </td>
                  <td className="px-4 py-2.5 text-right">{formatCLP(m.afp)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCLP(m.salud)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCLP(m.sis)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCLP(m.accidenteTrabajo)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">
                    {formatCLP(m.total)}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/50 font-semibold tabular-nums">
                <td className="px-4 py-3">TOTAL</td>
                <td className="px-4 py-3 text-right">{formatCLP(totalAnual.bruto)}</td>
                <td className="px-4 py-3 text-right">{formatCLP(totalAnual.base)}</td>
                <td className="px-4 py-3 text-right">{formatCLP(totalAnual.afp)}</td>
                <td className="px-4 py-3 text-right">{formatCLP(totalAnual.salud)}</td>
                <td className="px-4 py-3 text-right">{formatCLP(totalAnual.sis)}</td>
                <td className="px-4 py-3 text-right">{formatCLP(totalAnual.accidente)}</td>
                <td className="px-4 py-3 text-right">{formatCLP(totalAnual.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
