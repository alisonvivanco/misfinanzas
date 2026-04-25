"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MESES_ES_SHORT, formatCLP } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setAnio((a) => a - 1)} className="rounded-lg border bg-card p-2 hover:bg-accent transition" aria-label="Año anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight min-w-[140px] text-center">
            Resumen {anio}
          </h1>
          <button onClick={() => setAnio((a) => a + 1)} className="rounded-lg border bg-card p-2 hover:bg-accent transition" aria-label="Año siguiente">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <p className="text-sm text-muted-foreground">
        Vista consolidada de los 12 meses. Todos los valores se actualizan automáticamente.
      </p>

      {loading && <div className="text-sm text-muted-foreground">Cargando…</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <Kpi label="Ingreso total" value={data.totales.ingreso} positive />
            <Kpi label="Gastos total" value={data.totales.gastoTotal} negative />
            <Kpi label="Ahorro acumulado" value={data.ahorroAcumulado} />
            <Kpi label="Inversión" value={data.totales.ahorros} />
            <Kpi label="Deuda pagada" value={data.deudaPagada} />
            <Kpi label="Balance" value={data.totales.balance} positive={data.totales.balance >= 0} negative={data.totales.balance < 0} />
          </div>

          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30">
              <h3 className="font-semibold text-sm uppercase tracking-wide">Consolidado mensual {anio}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/10">
                  <tr>
                    <th className="px-3 py-2 text-left">Concepto</th>
                    {data.rows.map((r) => (
                      <th key={r.mes} className="px-3 py-2 text-right">{MESES_ES_SHORT[r.mes - 1]}</th>
                    ))}
                    <th className="px-3 py-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <Row label="Ingresos" values={data.rows.map((r) => r.ingreso)} total={data.totales.ingreso} positive />
                  <Row label="Gastos fijos" values={data.rows.map((r) => r.gastosFijos)} total={data.totales.gastosFijos} />
                  <Row label="Gastos variables" values={data.rows.map((r) => r.gastosVariables)} total={data.totales.gastosVariables} />
                  <Row label="Donaciones" values={data.rows.map((r) => r.donaciones)} total={data.totales.donaciones} />
                  <Row label="Gasto total" values={data.rows.map((r) => r.gastoTotal)} total={data.totales.gastoTotal} bold />
                  <Row label="Balance mes" values={data.rows.map((r) => r.balance)} total={data.totales.balance} bold highlight />
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, values, total, bold, positive, highlight }: {
  label: string;
  values: number[];
  total: number;
  bold?: boolean;
  positive?: boolean;
  highlight?: boolean;
}) {
  const cls = (bold ? "font-semibold " : "") + (highlight ? "bg-muted/30 " : "");
  return (
    <tr className={"border-t " + cls}>
      <td className="px-3 py-2">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={"px-3 py-2 text-right " + (positive && v > 0 ? "text-income" : "")}>
          {v === 0 ? "—" : formatCLP(v)}
        </td>
      ))}
      <td className="px-3 py-2 text-right font-semibold">{total === 0 ? "—" : formatCLP(total)}</td>
    </tr>
  );
}

function Kpi({ label, value, positive, negative }: { label: string; value: number; positive?: boolean; negative?: boolean }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={"text-lg font-bold mt-1 " + (negative ? "text-destructive" : positive ? "text-income" : "")}>
        {formatCLP(value)}
      </div>
    </div>
  );
}
