"use client";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatCLP } from "@/lib/utils";
import { AnimatedCLP } from "./animated-number";
import { bucketColor } from "./bucket-badge";
import type { Bucket } from "./types";

interface Props {
  totales: {
    ingreso: number;
    gastoTotal: number;
    restante: number;
    buckets: Record<Bucket, number>;
  };
  loading: boolean;
}

const BUCKET_LABEL: Record<Bucket, string> = {
  necesidades: "Necesidades",
  deseos: "Deseos",
  ahorros: "Ahorros",
};

export function DashboardCharts({ totales, loading }: Props) {
  const pieData = (["necesidades", "deseos", "ahorros"] as Bucket[]).map((b) => ({
    name: BUCKET_LABEL[b],
    value: totales.buckets[b],
    color: bucketColor(b),
  }));

  const barData = [
    { name: "Ingresos", value: totales.ingreso, color: "url(#gradIng)" },
    { name: "Gastos", value: totales.gastoTotal, color: "url(#gradGas)" },
  ];

  const restantePct = totales.ingreso > 0
    ? Math.max(0, Math.min(100, (totales.restante / totales.ingreso) * 100))
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Kpi
        label="Ingreso del mes"
        value={totales.ingreso}
        loading={loading}
        Icon={TrendingUp}
        iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        valueClass="text-emerald-600 dark:text-emerald-400"
        delay={0}
      />
      <Kpi
        label="Total gastado"
        value={totales.gastoTotal}
        loading={loading}
        Icon={TrendingDown}
        iconClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        valueClass="text-rose-600 dark:text-rose-400"
        delay={0.05}
      />
      <Kpi
        label="Restante"
        value={totales.restante}
        loading={loading}
        Icon={Wallet}
        iconClass={
          totales.restante < 0
            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
        }
        valueClass={
          totales.restante < 0
            ? "text-rose-600 dark:text-rose-400"
            : "text-blue-600 dark:text-blue-400"
        }
        suffix={
          totales.ingreso > 0 && totales.restante >= 0 ? (
            <span className="text-xs text-muted-foreground">
              {restantePct.toFixed(0)}% de tu ingreso
            </span>
          ) : null
        }
        delay={0.1}
      />

      <ChartCard title="Distribución 50/30/20" delay={0.15}>
        {totales.buckets.necesidades + totales.buckets.deseos + totales.buckets.ahorros === 0 ? (
          <EmptyChart hint="Empezá registrando algún gasto" />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  cornerRadius={4}
                  animationBegin={150}
                  animationDuration={700}
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} stroke="hsl(var(--card))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatCLP(v)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 text-xs flex-wrap">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </ChartCard>

      <ChartCard title="Ingresos vs Gastos" delay={0.2}>
        {totales.ingreso === 0 && totales.gastoTotal === 0 ? (
          <EmptyChart hint="Agregá un ingreso o un gasto" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradIng" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="gradGas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v: number) => formatCLP(v)}
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} animationDuration={700}>
                {barData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Dinero restante" delay={0.25}>
        {totales.ingreso === 0 ? (
          <EmptyChart hint="Agregá tu ingreso del mes" />
        ) : (
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Restante", value: Math.max(totales.restante, 0) },
                    { name: "Gastado", value: totales.gastoTotal },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={76}
                  startAngle={90}
                  endAngle={-270}
                  cornerRadius={6}
                  animationDuration={700}
                >
                  <Cell fill="url(#gradRem)" />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
                <defs>
                  <linearGradient id="gradRem" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl font-bold tabular-nums">
                {restantePct.toFixed(0)}%
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                disponible
              </div>
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

function Kpi({
  label, value, loading, Icon, iconClass, valueClass, suffix, delay,
}: {
  label: string;
  value: number;
  loading: boolean;
  Icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  valueClass: string;
  suffix?: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow p-5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className={"text-3xl font-bold tracking-tight " + valueClass}>
        {loading ? <span className="text-muted-foreground/40">—</span> : <AnimatedCLP value={value} />}
      </div>
      {suffix && <div className="mt-2">{suffix}</div>}
    </motion.div>
  );
}

function ChartCard({
  title, children, delay,
}: { title: string; children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow p-4"
    >
      <div className="text-xs font-medium text-muted-foreground mb-3 text-center uppercase tracking-wider">
        {title}
      </div>
      {children}
    </motion.div>
  );
}

function EmptyChart({ hint }: { hint: string }) {
  return (
    <div className="h-[180px] flex items-center justify-center text-center text-xs text-muted-foreground/70">
      {hint}
    </div>
  );
}
