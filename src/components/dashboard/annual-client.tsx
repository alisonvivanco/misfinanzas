"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank, CreditCard, Sparkles, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { MESES_ES_SHORT, formatCLP } from "@/lib/utils";
import { AnimatedCLP } from "./animated-number";

interface MonthRow {
  mes: number;
  ingreso: number;
  gastosFijos: number;
  gastosVariables: number;
  donaciones: number;
  gastoTotal: number;
  ahorros: number;
  balance: number;
}

interface AnnualData {
  anio: number;
  rows: MonthRow[];
  totales: {
    ingreso: number;
    gastosFijos: number;
    gastosVariables: number;
    donaciones: number;
    gastoTotal: number;
    ahorros: number;
    balance: number;
  };
  ahorroAcumulado: number;
  deudaPagada: number;
}

export function AnnualClient({ initialAnio }: { initialAnio: number }) {
  const [anio, setAnio] = useState(initialAnio);
  const [data, setData] = useState<AnnualData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/annual?anio=${anio}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [anio]);

  const isCurrentYear = anio === new Date().getFullYear();

  return (
    <div className="space-y-6">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-2xl border bg-card shadow-sm p-1">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setAnio((a) => a - 1)}
              className="rounded-xl p-2 hover:bg-muted transition"
              aria-label="Año anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <div className="px-3 py-1 min-w-[140px] text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Resumen anual
              </div>
              <div className="text-base font-bold tracking-tight">{anio}</div>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setAnio((a) => a + 1)}
              className="rounded-xl p-2 hover:bg-muted transition"
              aria-label="Año siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
          {!isCurrentYear && (
            <button
              onClick={() => setAnio(new Date().getFullYear())}
              className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Volver al año actual
            </button>
          )}
        </div>
      </motion.header>

      <p className="text-sm text-muted-foreground">
        Vista consolidada de los 12 meses · todo se calcula automáticamente.
      </p>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border bg-card animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <Kpi
              label="Ingreso total"
              value={data.totales.ingreso}
              Icon={TrendingUp}
              iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              valueClass="text-emerald-600 dark:text-emerald-400"
              delay={0}
            />
            <Kpi
              label="Gastos total"
              value={data.totales.gastoTotal}
              Icon={TrendingDown}
              iconClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
              valueClass="text-rose-600 dark:text-rose-400"
              delay={0.05}
            />
            <Kpi
              label="Ahorro acumulado"
              value={data.ahorroAcumulado}
              Icon={PiggyBank}
              iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              valueClass="text-amber-600 dark:text-amber-400"
              delay={0.1}
            />
            <Kpi
              label="Aportado a metas"
              value={data.totales.ahorros}
              Icon={Sparkles}
              iconClass="bg-violet-500/10 text-violet-600 dark:text-violet-400"
              valueClass="text-violet-600 dark:text-violet-400"
              delay={0.15}
            />
            <Kpi
              label="Deuda pagada"
              value={data.deudaPagada}
              Icon={CreditCard}
              iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
              valueClass="text-blue-600 dark:text-blue-400"
              delay={0.2}
            />
            <Kpi
              label="Balance"
              value={data.totales.balance}
              Icon={Wallet}
              iconClass={
                data.totales.balance >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }
              valueClass={
                data.totales.balance >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }
              delay={0.25}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="rounded-2xl border bg-card shadow-sm overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b bg-gradient-to-r from-muted/40 via-card to-card">
              <h3 className="font-semibold text-sm tracking-tight">Consolidado mensual {anio}</h3>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="text-[11px] text-muted-foreground bg-muted/20 uppercase tracking-wider font-medium">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Concepto</th>
                    {data.rows.map((r) => (
                      <th key={r.mes} className="px-3 py-2.5 text-right">{MESES_ES_SHORT[r.mes - 1]}</th>
                    ))}
                    <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <Row label="Ingresos" values={data.rows.map((r) => r.ingreso)} total={data.totales.ingreso} positive />
                  <Row label="Gastos fijos" values={data.rows.map((r) => r.gastosFijos)} total={data.totales.gastosFijos} />
                  <Row label="Gastos variables" values={data.rows.map((r) => r.gastosVariables)} total={data.totales.gastosVariables} />
                  <Row label="Donaciones" values={data.rows.map((r) => r.donaciones)} total={data.totales.donaciones} />
                  <Row label="Gasto total" values={data.rows.map((r) => r.gastoTotal)} total={data.totales.gastoTotal} bold />
                  <Row label="Balance mes" values={data.rows.map((r) => r.balance)} total={data.totales.balance} bold highlight balance />
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

function Row({
  label, values, total, bold, positive, highlight, balance,
}: {
  label: string;
  values: number[];
  total: number;
  bold?: boolean;
  positive?: boolean;
  highlight?: boolean;
  balance?: boolean;
}) {
  const cls = (bold ? "font-semibold " : "") + (highlight ? "bg-muted/30 " : "");
  return (
    <tr className={"border-t hover:bg-muted/20 transition-colors " + cls}>
      <td className="px-4 py-2.5">{label}</td>
      {values.map((v, i) => {
        const colorCls = balance
          ? v < 0
            ? "text-rose-600 dark:text-rose-400"
            : v > 0
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground/50"
          : positive && v > 0
          ? "text-emerald-600 dark:text-emerald-400"
          : v === 0
          ? "text-muted-foreground/50"
          : "";
        return (
          <td key={i} className={"px-3 py-2.5 text-right tabular-nums " + colorCls}>
            {v === 0 ? "—" : formatCLP(v)}
          </td>
        );
      })}
      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
        {total === 0 ? "—" : formatCLP(total)}
      </td>
    </tr>
  );
}

function Kpi({
  label, value, Icon, iconClass, valueClass, delay,
}: {
  label: string;
  value: number;
  Icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  valueClass: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow p-3.5 group"
    >
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={`h-6 w-6 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${iconClass}`}>
          <Icon className="h-3 w-3" />
        </div>
      </div>
      <div className={"text-lg font-bold " + valueClass}>
        <AnimatedCLP value={value} />
      </div>
    </motion.div>
  );
}
