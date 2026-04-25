"use client";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MESES_ES, formatCLP } from "@/lib/utils";
import { TIPO_PCT } from "@/lib/categorias";
import { bucketColor } from "./bucket-badge";
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

const BUCKET_LABEL: Record<Bucket, string> = {
  necesidades: "Necesidades",
  deseos: "Deseos",
  ahorros: "Ahorros",
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

  const isCurrentMonth = mes === new Date().getMonth() + 1 && anio === new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-2xl border bg-card shadow-sm p-1">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => shiftMonth(-1)}
              className="rounded-xl p-2 hover:bg-muted transition"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <div className="px-3 py-1 min-w-[180px] text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {isCurrentMonth ? "Mes actual" : "Viendo"}
              </div>
              <div className="text-base font-bold tracking-tight">
                {MESES_ES[mes - 1]} {anio}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => shiftMonth(1)}
              className="rounded-xl p-2 hover:bg-muted transition"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
          {!isCurrentMonth && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                const now = new Date();
                setMes(now.getMonth() + 1);
                setAnio(now.getFullYear());
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Volver al mes actual
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* KPIs + Charts */}
      <DashboardCharts totales={totales} loading={loading} />

      {/* Ingresos + Gastos Fijos */}
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
        <BudgetBlock totales={totales} presupuesto={presupuesto} />
        <SummaryBlock totales={totales} />
      </div>
    </div>
  );
}

function BudgetBlock({
  totales, presupuesto,
}: {
  totales: { ingreso: number; buckets: Record<Bucket, number> };
  presupuesto: Record<Bucket, number>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Regla 50/30/20</h3>
        <span className="text-xs text-muted-foreground">Sobre tu ingreso</span>
      </div>
      <div className="space-y-4">
        {(["necesidades", "deseos", "ahorros"] as Bucket[]).map((b) => {
          const target = presupuesto[b];
          const actual = totales.buckets[b];
          const pct = target > 0 ? Math.min(100, (actual / target) * 100) : 0;
          const over = actual > target && target > 0;
          return (
            <div key={b}>
              <div className="flex items-center justify-between mb-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: bucketColor(b) }} />
                  <span className="font-medium">{BUCKET_LABEL[b]}</span>
                  <span className="text-xs text-muted-foreground">{(TIPO_PCT[b] * 100).toFixed(0)}%</span>
                </div>
                <div className="text-right">
                  <span className={"font-semibold tabular-nums " + (over ? "text-rose-600 dark:text-rose-400" : "")}>
                    {formatCLP(actual)}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums"> / {formatCLP(target)}</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{
                    background: over
                      ? "linear-gradient(90deg, #f43f5e, #be123c)"
                      : `linear-gradient(90deg, ${bucketColor(b)}, ${bucketColor(b)}cc)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function SummaryBlock({
  totales,
}: {
  totales: {
    ingreso: number;
    gastoFijo: number;
    gastoVariable: number;
    donaciones: number;
    restante: number;
  };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Resumen del mes</h3>
      </div>
      <div className="space-y-2.5">
        <Row label="Ingresos" value={totales.ingreso} positive />
        <Row label="Gastos fijos" value={-totales.gastoFijo} />
        <Row label="Gastos variables" value={-totales.gastoVariable} />
        <Row label="Donaciones" value={-totales.donaciones} />
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Te queda</span>
            <span
              className={
                "text-2xl font-bold tabular-nums " +
                (totales.restante < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")
              }
            >
              {formatCLP(totales.restante)}
            </span>
          </div>
          {totales.restante < 0 && (
            <div className="text-xs text-rose-600 dark:text-rose-400 text-right mt-0.5">
              Saldo en contra
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Row({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
  const cls = value === 0
    ? "text-muted-foreground"
    : positive
    ? "text-emerald-600 dark:text-emerald-400"
    : value < 0
    ? "text-foreground"
    : "";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={"font-medium tabular-nums " + cls}>
        {value < 0 ? "− " : ""}{formatCLP(Math.abs(value))}
      </span>
    </div>
  );
}
