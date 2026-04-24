import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Boleta } from "@/models/Boleta";
import { Transaction } from "@/models/Transaction";
import { KPICard } from "@/components/dashboard/kpi-card";
import { DistribucionChart, BarComparativa } from "@/components/charts/monthly-chart";
import { calcularRegla503020, formatCLP } from "@/lib/chile-tax";
import { PieChart, Wallet, Target, TrendingDown } from "lucide-react";
import { MESES_ES } from "@/lib/utils";

export default async function PresupuestoPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  await dbConnect();

  const now = new Date();
  const anio = now.getFullYear();
  const mes = now.getMonth() + 1;

  const [boletasMes, trxMes] = await Promise.all([
    Boleta.find({ userId: session.user.id, anio, mes }).lean(),
    Transaction.find({ userId: session.user.id, anio, mes }).lean(),
  ]);

  const ingreso = boletasMes.reduce((s, b) => s + b.montoLiquido, 0);
  const regla = calcularRegla503020(ingreso);

  const porTipoRegla = { necesidades: 0, deseos: 0, ahorros: 0 };
  trxMes
    .filter((t) => t.tipo === "gasto" && t.tipoRegla)
    .forEach((t) => {
      porTipoRegla[t.tipoRegla!] += t.monto;
    });

  const gastoTotal = Object.values(porTipoRegla).reduce((s, v) => s + v, 0);
  const restante = ingreso - gastoTotal;

  const distribucion = [
    { name: "Necesidades", value: regla.necesidades, color: "hsl(221 83% 53%)" },
    { name: "Deseos", value: regla.deseos, color: "hsl(271 70% 58%)" },
    { name: "Ahorros", value: regla.ahorros, color: "hsl(152 72% 45%)" },
  ].filter((d) => d.value > 0);

  const comparativa = [
    { categoria: "Necesidades", presupuesto: regla.necesidades, actual: porTipoRegla.necesidades },
    { categoria: "Deseos", presupuesto: regla.deseos, actual: porTipoRegla.deseos },
    { categoria: "Ahorros", presupuesto: regla.ahorros, actual: porTipoRegla.ahorros },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Presupuesto</h1>
        <p className="text-muted-foreground mt-1">
          Regla 50/30/20 · {MESES_ES[mes - 1]} {anio}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Ingreso del mes" value={ingreso} icon={Wallet} tone="income" />
        <KPICard label="Gastado" value={gastoTotal} icon={TrendingDown} tone="expense" />
        <KPICard label="Presupuesto total" value={ingreso} icon={Target} tone="default" />
        <KPICard label="Restante" value={restante} icon={PieChart} tone={restante >= 0 ? "savings" : "expense"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Distribución ideal (50/30/20)</h3>
          {distribucion.length > 0 ? (
            <DistribucionChart data={distribucion} />
          ) : (
            <div className="text-center py-16 text-sm text-muted-foreground">
              Necesitas registrar ingreso para ver distribución.
            </div>
          )}
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Presupuesto vs Actual</h3>
          <BarComparativa data={comparativa} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            label: "Necesidades (50%)",
            budget: regla.necesidades,
            spent: porTipoRegla.necesidades,
            color: "bg-blue-500",
            desc: "Arriendo, servicios, alimentación, transporte",
          },
          {
            label: "Deseos (30%)",
            budget: regla.deseos,
            spent: porTipoRegla.deseos,
            color: "bg-violet-500",
            desc: "Entretenimiento, restaurantes, hobbies",
          },
          {
            label: "Ahorros e Inversión (20%)",
            budget: regla.ahorros,
            spent: porTipoRegla.ahorros,
            color: "bg-emerald-500",
            desc: "Metas, APV, fondos, emergencias",
          },
        ].map((c) => {
          const pct = c.budget > 0 ? (c.spent / c.budget) * 100 : 0;
          return (
            <div key={c.label} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">{c.label}</div>
                <div className="text-xs font-medium tabular-nums">
                  {pct.toFixed(0)}%
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-3">{c.desc}</div>
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
                <div
                  className={`h-full ${c.color} transition-all`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-muted-foreground">{formatCLP(c.spent)}</span>
                <span>de {formatCLP(c.budget)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
