import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Investment } from "@/models/Investment";
import { KPICard } from "@/components/dashboard/kpi-card";
import { DistribucionChart } from "@/components/charts/monthly-chart";
import { formatCLP, formatPct } from "@/lib/chile-tax";
import { TrendingUp, Plus, PieChart, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TIPO_LABEL: Record<string, string> = {
  apv: "APV",
  fondo_mutuo: "Fondo Mutuo",
  acciones: "Acciones",
  etf: "ETF",
  cripto: "Cripto",
  deposito_plazo: "Depósito a Plazo",
  bonos: "Bonos",
  otros: "Otros",
};

const TIPO_COLORS: Record<string, string> = {
  apv: "hsl(152 72% 45%)",
  fondo_mutuo: "hsl(221 83% 53%)",
  acciones: "hsl(271 70% 58%)",
  etf: "hsl(38 92% 55%)",
  cripto: "hsl(25 95% 53%)",
  deposito_plazo: "hsl(190 82% 50%)",
  bonos: "hsl(340 82% 52%)",
  otros: "hsl(215 16% 47%)",
};

export default async function InversionesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  await dbConnect();

  const inversiones = await Investment.find({ userId: session.user.id, activa: true })
    .sort({ fechaPrimerAporte: -1 })
    .lean();

  const totalInvertido = inversiones.reduce((s, i) => s + i.capitalInvertido, 0);
  const totalValor = inversiones.reduce((s, i) => s + i.valorActual, 0);
  const gananciaPerdida = totalValor - totalInvertido;
  const rentabilidad = totalInvertido > 0 ? gananciaPerdida / totalInvertido : 0;
  const totalAPV = inversiones
    .filter((i) => i.tipo === "apv")
    .reduce((s, i) => s + i.valorActual, 0);

  const porTipo = new Map<string, number>();
  inversiones.forEach((i) => {
    porTipo.set(i.tipo, (porTipo.get(i.tipo) || 0) + i.valorActual);
  });
  const distribucion = Array.from(porTipo.entries())
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: TIPO_LABEL[k] || k, value: v, color: TIPO_COLORS[k] }));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inversiones</h1>
          <p className="text-muted-foreground mt-1">
            APV, fondos mutuos, acciones, ETF, cripto
          </p>
        </div>
        <Link href="/inversiones/nueva">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" /> Nueva inversión
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Capital invertido" value={totalInvertido} icon={DollarSign} tone="default" />
        <KPICard label="Valor actual" value={totalValor} icon={TrendingUp} tone="investment" />
        <KPICard
          label="Ganancia / Pérdida"
          value={gananciaPerdida}
          icon={TrendingUp}
          tone={gananciaPerdida >= 0 ? "income" : "expense"}
          trendLabel={formatPct(rentabilidad)}
        />
        <KPICard label="APV (Ley 19.768)" value={totalAPV} icon={PieChart} tone="savings" />
      </div>

      {inversiones.length === 0 ? (
        <div className="rounded-2xl border bg-card p-16 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-1">Aún no hay inversiones</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Agrega tu APV, fondos mutuos, acciones o criptomonedas.
          </p>
          <Link href="/inversiones/nueva">
            <Button variant="gradient">Agregar mi primera inversión</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Distribución por tipo</h3>
              <DistribucionChart data={distribucion} />
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Top rendimiento</h3>
              <div className="space-y-3">
                {[...inversiones]
                  .sort((a, b) => b.rentabilidadPorcentaje - a.rentabilidadPorcentaje)
                  .slice(0, 5)
                  .map((i) => (
                    <div
                      key={i._id.toString()}
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/30"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{i.nombre}</div>
                        <div className="text-xs text-muted-foreground">
                          {TIPO_LABEL[i.tipo]}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-bold tabular-nums ${
                            i.rentabilidadPorcentaje >= 0 ? "text-income" : "text-expense"
                          }`}
                        >
                          {i.rentabilidadPorcentaje >= 0 ? "+" : ""}
                          {formatPct(i.rentabilidadPorcentaje)}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {formatCLP(i.valorActual)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="font-semibold">Portafolio completo</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr className="text-left">
                    <th className="px-5 py-3 font-medium">Instrumento</th>
                    <th className="px-5 py-3 font-medium">Tipo</th>
                    <th className="px-5 py-3 font-medium text-right">Invertido</th>
                    <th className="px-5 py-3 font-medium text-right">Valor actual</th>
                    <th className="px-5 py-3 font-medium text-right">G/P</th>
                    <th className="px-5 py-3 font-medium text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {inversiones.map((i) => (
                    <tr key={i._id.toString()} className="border-b last:border-0 hover:bg-accent/30">
                      <td className="px-5 py-3">
                        <div className="font-medium">{i.nombre}</div>
                        {i.ticker && (
                          <div className="text-xs text-muted-foreground">{i.ticker}</div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        <span className="px-2 py-0.5 rounded bg-accent">
                          {TIPO_LABEL[i.tipo]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {formatCLP(i.capitalInvertido)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-medium">
                        {formatCLP(i.valorActual)}
                      </td>
                      <td
                        className={`px-5 py-3 text-right tabular-nums ${
                          i.gananciaPerdida >= 0 ? "text-income" : "text-expense"
                        }`}
                      >
                        {i.gananciaPerdida >= 0 ? "+" : ""}
                        {formatCLP(i.gananciaPerdida)}
                      </td>
                      <td
                        className={`px-5 py-3 text-right tabular-nums font-semibold ${
                          i.rentabilidadPorcentaje >= 0 ? "text-income" : "text-expense"
                        }`}
                      >
                        {i.rentabilidadPorcentaje >= 0 ? "+" : ""}
                        {formatPct(i.rentabilidadPorcentaje)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
