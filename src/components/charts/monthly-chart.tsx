"use client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { formatCLP } from "@/lib/chile-tax";

export function IngresoVsGastoChart({ data }: { data: { mes: string; ingreso: number; gasto: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="ingreso" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(152 72% 45%)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(152 72% 45%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gasto" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(0 72% 58%)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(0 72% 58%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
        <XAxis dataKey="mes" stroke="hsl(215 16% 47%)" fontSize={12} />
        <YAxis stroke="hsl(215 16% 47%)" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(v: number) => formatCLP(v)}
          contentStyle={{ borderRadius: 12, border: "1px solid hsl(214 32% 91%)" }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="ingreso"
          stroke="hsl(152 72% 45%)"
          fillOpacity={1}
          fill="url(#ingreso)"
          strokeWidth={2}
          name="Ingresos"
        />
        <Area
          type="monotone"
          dataKey="gasto"
          stroke="hsl(0 72% 58%)"
          fillOpacity={1}
          fill="url(#gasto)"
          strokeWidth={2}
          name="Gastos"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DistribucionChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => formatCLP(v)}
          contentStyle={{ borderRadius: 12, border: "1px solid hsl(214 32% 91%)" }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BarComparativa({ data }: { data: { categoria: string; presupuesto: number; actual: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
        <XAxis dataKey="categoria" stroke="hsl(215 16% 47%)" fontSize={12} />
        <YAxis stroke="hsl(215 16% 47%)" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(v: number) => formatCLP(v)}
          contentStyle={{ borderRadius: 12, border: "1px solid hsl(214 32% 91%)" }}
        />
        <Legend />
        <Bar dataKey="presupuesto" fill="hsl(221 83% 53%)" radius={[8, 8, 0, 0]} name="Presupuesto" />
        <Bar dataKey="actual" fill="hsl(271 70% 58%)" radius={[8, 8, 0, 0]} name="Actual" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineTendencia({ data, dataKey, label, color }: {
  data: any[];
  dataKey: string;
  label: string;
  color: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
        <XAxis dataKey="mes" stroke="hsl(215 16% 47%)" fontSize={12} />
        <YAxis stroke="hsl(215 16% 47%)" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(v: number) => formatCLP(v)}
          contentStyle={{ borderRadius: 12, border: "1px solid hsl(214 32% 91%)" }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
          name={label}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
