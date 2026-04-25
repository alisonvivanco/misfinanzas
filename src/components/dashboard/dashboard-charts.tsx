"use client";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { formatCLP } from "@/lib/utils";
import { TIPO_COLOR, TIPO_LABEL } from "@/lib/categorias";
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

export function DashboardCharts({ totales, loading }: Props) {
  const pieData = (["necesidades", "deseos", "ahorros"] as Bucket[]).map((b) => ({
    name: TIPO_LABEL[b],
    value: totales.buckets[b],
    color: TIPO_COLOR[b],
  }));

  const barData = [
    { name: "Ingresos", value: totales.ingreso, color: "#22c55e" },
    { name: "Gastos", value: totales.gastoTotal, color: "#ef4444" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Kpi label="Ingreso total" value={totales.ingreso} loading={loading} positive />
      <Kpi label="Total gastado" value={totales.gastoTotal} loading={loading} negative />
      <Kpi label="Restante" value={totales.restante} loading={loading} positive={totales.restante >= 0} negative={totales.restante < 0} />

      <div className="rounded-2xl border bg-card p-4">
        <div className="text-xs font-medium text-muted-foreground mb-2 text-center">50/30/20</div>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
              {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={(v: number) => formatCLP(v)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-3 text-xs">
          {pieData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
              {d.name}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <div className="text-xs font-medium text-muted-foreground mb-2 text-center">Ingresos vs Gastos</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis hide />
            <Tooltip formatter={(v: number) => formatCLP(v)} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border bg-card p-4 flex flex-col">
        <div className="text-xs font-medium text-muted-foreground mb-2 text-center">Dinero restante</div>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={[
                { name: "Restante", value: Math.max(totales.restante, 0), color: "#3b82f6" },
                { name: "Gastado", value: totales.gastoTotal, color: "#e5e7eb" },
              ]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill="#3b82f6" />
              <Cell fill="#e5e7eb" />
            </Pie>
            <Tooltip formatter={(v: number) => formatCLP(v)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center text-xs text-muted-foreground">
          {totales.ingreso > 0
            ? `${((Math.max(totales.restante, 0) / totales.ingreso) * 100).toFixed(0)}% de tu ingreso`
            : "Sin ingresos"}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label, value, loading, positive, negative,
}: { label: string; value: number; loading: boolean; positive?: boolean; negative?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className={"text-3xl font-bold mt-2 " + (negative ? "text-destructive" : positive ? "text-income" : "")}>
        {loading ? "—" : formatCLP(value)}
      </div>
    </div>
  );
}
