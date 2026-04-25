"use client";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { MESES_ES, formatCLP } from "@/lib/utils";
import { TIPO_PCT, TIPO_LABEL } from "@/lib/categorias";
import type { Bucket, MonthData } from "./types";
import { DashboardCharts } from "./dashboard-charts";
import { IncomesTable } from "./incomes-table";
import { FixedExpensesTable } from "./fixed-expenses-table";
import { VariableExpensesTable } from "./variable-expenses-table";
import { SavingsTable } from "./savings-table";
import { DebtsTable } from "./debts-table";
import { DonationsTable } from "./donations-table";

interface Props {
  initialMes: number;
  initialAnio: number;
}

const EMPTY: MonthData = {
  incomes: [],
  expenses: [],
  recurring: [],
  savings: [],
  debts: [],
  donations: [],
};

export function DashboardClient({ initialMes, initialAnio }: Props) {
  const [mes, setMes] = useState(initialMes);
  const [anio, setAnio] = useState(initialAnio);
  const [data, setData] = useState<MonthData>(EMPTY);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [incR, expR, recR, savR, debR, donR] = await Promise.all([
        fetch(`/api/income?mes=${mes}&anio=${anio}`),
        fetch(`/api/expenses?mes=${mes}&anio=${anio}`),
        fetch(`/api/recurring`),
        fetch(`/api/savings`),
        fetch(`/api/debts`),
        fetch(`/api/donations?mes=${mes}&anio=${anio}`),
      ]);
      const responses = [incR, expR, recR, savR, debR, donR];
      const failed = responses.find((r) => !r.ok);
      if (failed) {
        const body = await failed.json().catch(() => ({}));
        toast.error(body.error || `Error cargando datos (${failed.status})`);
        return;
      }
      const [inc, exp, rec, sav, deb, don] = await Promise.all(responses.map((r) => r.json()));
      setData({
        incomes: inc.items || [],
        expenses: exp.items || [],
        recurring: rec.items || [],
        savings: sav.items || [],
        debts: deb.items || [],
        donations: don.items || [],
      });
    } catch (e) {
      console.error("[dashboard load]", e);
      toast.error(e instanceof Error ? e.message : "Error cargando dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, anio]);

  const totales = useMemo(() => {
    const ingreso = data.incomes.reduce((s, i) => s + i.monto, 0);
    const gastoFijo = data.recurring.reduce((s, r) => s + r.monto, 0);
    const gastoVariable = data.expenses.reduce((s, e) => s + e.monto, 0);
    const donaciones = data.donations.reduce((s, d) => s + d.monto, 0);
    const gastoTotal = gastoFijo + gastoVariable + donaciones;
    const restante = ingreso - gastoTotal;

    const buckets: Record<Bucket, number> = { necesidades: 0, deseos: 0, ahorros: 0 };
    for (const r of data.recurring) buckets[r.tipo] += r.monto;
    for (const e of data.expenses) buckets[e.tipo] += e.monto;
    for (const d of data.donations) buckets.deseos += d.monto;

    return { ingreso, gastoFijo, gastoVariable, donaciones, gastoTotal, restante, buckets };
  }, [data]);

  const presupuesto = useMemo(
    () => ({
      necesidades: totales.ingreso * TIPO_PCT.necesidades,
      deseos: totales.ingreso * TIPO_PCT.deseos,
      ahorros: totales.ingreso * TIPO_PCT.ahorros,
    }),
    [totales.ingreso]
  );

  function shiftMonth(delta: number) {
    let m = mes + delta;
    let a = anio;
    if (m < 1) { m = 12; a -= 1; }
    if (m > 12) { m = 1; a += 1; }
    setMes(m); setAnio(a);
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de mes */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftMonth(-1)}
            className="rounded-lg border bg-card p-2 hover:bg-accent transition"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight min-w-[200px] text-center">
            {MESES_ES[mes - 1]} {anio}
          </h1>
          <button
            onClick={() => shiftMonth(1)}
            className="rounded-lg border bg-card p-2 hover:bg-accent transition"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* KPIs + Charts */}
      <DashboardCharts totales={totales} loading={loading} />

      {/* Ingresos + Gastos Fijos en 2 col */}
      <div className="grid lg:grid-cols-2 gap-4">
        <IncomesTable items={data.incomes} mes={mes} anio={anio} onChange={load} />
        <FixedExpensesTable items={data.recurring} onChange={load} />
      </div>

      {/* Gastos Variables full width */}
      <VariableExpensesTable items={data.expenses} mes={mes} anio={anio} onChange={load} />

      {/* Ahorros + Deudas + Donaciones */}
      <div className="grid lg:grid-cols-3 gap-4">
        <SavingsTable items={data.savings} onChange={load} />
        <DebtsTable items={data.debts} onChange={load} />
        <DonationsTable items={data.donations} mes={mes} anio={anio} onChange={load} />
      </div>

      {/* Presupuesto 50/30/20 + Presupuesto vs Actual */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold mb-4">Presupuesto 50/30/20</h3>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr><th className="text-left pb-2">Categoría</th><th className="text-right pb-2">%</th><th className="text-right pb-2">Presupuesto</th><th className="text-right pb-2">Gastado</th></tr>
            </thead>
            <tbody>
              {(["necesidades", "deseos", "ahorros"] as Bucket[]).map((b) => (
                <tr key={b} className="border-t">
                  <td className="py-2">{TIPO_LABEL[b]}</td>
                  <td className="text-right">{(TIPO_PCT[b] * 100).toFixed(0)}%</td>
                  <td className="text-right font-medium">{formatCLP(presupuesto[b])}</td>
                  <td className="text-right">
                    <span className={totales.buckets[b] > presupuesto[b] ? "text-destructive font-medium" : ""}>
                      {formatCLP(totales.buckets[b])}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="border-t font-semibold bg-muted/30">
                <td className="py-2">Total</td>
                <td className="text-right">100%</td>
                <td className="text-right">{formatCLP(totales.ingreso)}</td>
                <td className="text-right">{formatCLP(totales.buckets.necesidades + totales.buckets.deseos + totales.buckets.ahorros)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold mb-4">Presupuesto vs Actual</h3>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr><th className="text-left pb-2">Concepto</th><th className="text-right pb-2">Monto</th></tr>
            </thead>
            <tbody>
              <tr className="border-t"><td className="py-2">Ingresos</td><td className="text-right text-income font-medium">{formatCLP(totales.ingreso)}</td></tr>
              <tr className="border-t"><td className="py-2">Gastos fijos</td><td className="text-right">{formatCLP(totales.gastoFijo)}</td></tr>
              <tr className="border-t"><td className="py-2">Gastos variables</td><td className="text-right">{formatCLP(totales.gastoVariable)}</td></tr>
              <tr className="border-t"><td className="py-2">Donaciones</td><td className="text-right">{formatCLP(totales.donaciones)}</td></tr>
              <tr className="border-t font-semibold bg-muted/30">
                <td className="py-2">Restante</td>
                <td className={"text-right " + (totales.restante < 0 ? "text-destructive" : "text-income")}>
                  {formatCLP(totales.restante)}
                  {totales.restante < 0 && <span className="ml-2 text-xs">Saldo en contra</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
