import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Debt } from "@/models/Debt";
import { KPICard } from "@/components/dashboard/kpi-card";
import { formatCLP, formatPct } from "@/lib/chile-tax";
import { CreditCard, Plus, AlertCircle, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DeudasPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  await dbConnect();

  const deudas = await Debt.find({ userId: session.user.id })
    .sort({ saldada: 1, saldoActual: 1 })
    .lean();

  const activas = deudas.filter((d) => !d.saldada);
  const saldadas = deudas.filter((d) => d.saldada);
  const totalSaldo = activas.reduce((s, d) => s + d.saldoActual, 0);
  const totalPagoMin = activas.reduce((s, d) => s + d.pagoMinimoMensual, 0);
  const totalPagado = deudas.reduce(
    (s, d) => s + d.pagos.reduce((ss, p) => ss + p.monto, 0),
    0
  );
  const tasaPromedio = activas.length > 0
    ? activas.reduce((s, d) => s + d.tasaInteresAnual, 0) / activas.length
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pago de Deudas</h1>
          <p className="text-muted-foreground mt-1">
            Método Bola de Nieve · Paga la más pequeña primero
          </p>
        </div>
        <Link href="/deudas/nueva">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" /> Agregar deuda
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Saldo total" value={totalSaldo} icon={CreditCard} tone="debt" trendLabel={`${activas.length} activas`} />
        <KPICard label="Pago mínimo mensual" value={totalPagoMin} icon={AlertCircle} tone="expense" />
        <KPICard label="Pagado histórico" value={totalPagado} icon={TrendingDown} tone="income" />
        <KPICard label="Tasa promedio" value={tasaPromedio} icon={AlertCircle} tone="default" format="percent" />
      </div>

      {activas.length === 0 && saldadas.length === 0 ? (
        <div className="rounded-2xl border bg-card p-16 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-1">No tienes deudas registradas</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Agrega tarjetas de crédito, créditos de consumo o hipotecarios para hacerles seguimiento.
          </p>
          <Link href="/deudas/nueva">
            <Button variant="gradient">Agregar mi primera deuda</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {[...activas, ...saldadas].map((d) => {
            const pagado = d.pagos.reduce((s, p) => s + p.monto, 0);
            const pct = d.montoInicial > 0 ? (pagado / d.montoInicial) * 100 : 0;
            return (
              <div
                key={d._id.toString()}
                className={`rounded-2xl border bg-card p-5 card-hover ${d.saldada ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{d.nombre}</h3>
                      {d.saldada && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-income/10 text-income font-medium">
                          Saldada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {d.institucion} · {d.tipo.replace("_", " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tabular-nums">{formatCLP(d.saldoActual)}</div>
                    <div className="text-xs text-muted-foreground">
                      Interés: {formatPct(d.tasaInteresAnual)} · Pago mín: {formatCLP(d.pagoMinimoMensual)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium tabular-nums">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-income transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs tabular-nums pt-1">
                    <span className="text-income">Pagado: {formatCLP(pagado)}</span>
                    <span className="text-muted-foreground">de {formatCLP(d.montoInicial)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
