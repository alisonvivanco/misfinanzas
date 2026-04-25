import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Boleta } from "@/models/Boleta";
import { Transaction } from "@/models/Transaction";
import { Debt } from "@/models/Debt";
import { Saving } from "@/models/Saving";
import { Investment } from "@/models/Investment";
import { KPICard } from "@/components/dashboard/kpi-card";
import {
  IngresoVsGastoChart,
  DistribucionChart,
  BarComparativa,
} from "@/components/charts/monthly-chart";
import { getIndicadores } from "@/lib/uf";
import { calcularRegla503020, formatCLP } from "@/lib/chile-tax";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  FileText,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  await dbConnect();
  const now = new Date();
  const anio = now.getFullYear();
  const mes = now.getMonth() + 1;

  const [boletas, transacciones, deudas, ahorros, inversiones, indicadores] =
    await Promise.all([
      Boleta.find({ userId, anio }).lean(),
      Transaction.find({ userId, anio }).lean(),
      Debt.find({ userId, saldada: false }).lean(),
      Saving.find({ userId, cumplida: false }).lean(),
      Investment.find({ userId, activa: true }).lean(),
      getIndicadores(),
    ]);

  const ingresoAnio = boletas.reduce((s, b) => s + (b.montoLiquido || 0), 0);
  const gastoAnio = transacciones
    .filter((t) => t.tipo === "gasto")
    .reduce((s, t) => s + (t.monto || 0), 0);
  const ahorroTotal = ahorros.reduce((s, a) => s + (a.montoActual || 0), 0);
  const deudaTotal = deudas.reduce((s, d) => s + (d.saldoActual || 0), 0);
  const inversionTotal = inversiones.reduce((s, i) => s + (i.valorActual || 0), 0);

  const boletasMes = boletas.filter((b) => b.mes === mes);
  const ingresoMes = boletasMes.reduce((s, b) => s + (b.montoLiquido || 0), 0);

  // Data para gráficos
  const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const trendData = MESES_CORTOS.map((nombre, i) => {
    const m = i + 1;
    const ing = boletas
      .filter((b) => b.mes === m)
      .reduce((s, b) => s + (b.montoLiquido || 0), 0);
    const gas = transacciones
      .filter((t) => t.mes === m && t.tipo === "gasto")
      .reduce((s, t) => s + (t.monto || 0), 0);
    return { mes: nombre, ingreso: ing, gasto: gas };
  });

  const regla = calcularRegla503020(ingresoMes);
  const distribucionData = [
    { name: "Necesidades (50%)", value: regla.necesidades, color: "hsl(221 83% 53%)" },
    { name: "Deseos (30%)", value: regla.deseos, color: "hsl(271 70% 58%)" },
    { name: "Ahorros (20%)", value: regla.ahorros, color: "hsl(152 72% 45%)" },
  ].filter((d) => d.value > 0);

  // Presupuesto vs actual por categoría
  const categoriasMap = new Map<string, { presupuesto: number; actual: number }>();
  transacciones
    .filter((t) => t.mes === mes && t.tipo === "gasto")
    .forEach((t) => {
      const cat = t.categoria;
      const cur = categoriasMap.get(cat) || { presupuesto: 0, actual: 0 };
      cur.actual += t.monto;
      if (t.esPresupuestado && t.presupuesto) cur.presupuesto += t.presupuesto;
      categoriasMap.set(cat, cur);
    });
  const presupuestoData = Array.from(categoriasMap.entries())
    .map(([categoria, v]) => ({ categoria, ...v }))
    .slice(0, 7);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hola, {session.user.name?.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground mt-1">
            Resumen de {MESES_CORTOS[mes - 1]} {anio}
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <div className="rounded-lg border bg-card px-3 py-1.5">
            <span className="text-muted-foreground">UF</span>{" "}
            <span className="font-semibold tabular-nums">{formatCLP(indicadores.uf)}</span>
          </div>
          <div className="rounded-lg border bg-card px-3 py-1.5">
            <span className="text-muted-foreground">UTM</span>{" "}
            <span className="font-semibold tabular-nums">{formatCLP(indicadores.utm)}</span>
          </div>
          <div className="rounded-lg border bg-card px-3 py-1.5">
            <span className="text-muted-foreground">USD</span>{" "}
            <span className="font-semibold tabular-nums">{formatCLP(indicadores.dolar)}</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Ingreso del mes"
          value={ingresoMes}
          icon={Wallet}
          tone="income"
          trendLabel={`${boletasMes.length} boletas`}
        />
        <KPICard
          label="Ahorros totales"
          value={ahorroTotal}
          icon={PiggyBank}
          tone="savings"
          trendLabel={`${ahorros.length} metas activas`}
        />
        <KPICard
          label="Inversiones"
          value={inversionTotal}
          icon={TrendingUp}
          tone="investment"
          trendLabel={`${inversiones.length} instrumentos`}
        />
        <KPICard
          label="Deudas pendientes"
          value={deudaTotal}
          icon={CreditCard}
          tone="debt"
          trendLabel={`${deudas.length} activas`}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Ingresos vs Gastos</h3>
              <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
            </div>
          </div>
          <IngresoVsGastoChart data={trendData} />
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-4">
            <h3 className="font-semibold">Regla 50/30/20</h3>
            <p className="text-xs text-muted-foreground">Distribución ideal</p>
          </div>
          {distribucionData.length > 0 ? (
            <DistribucionChart data={distribucionData} />
          ) : (
            <div className="text-center py-16 text-sm text-muted-foreground">
              Aún no hay ingreso este mes.
              <Link href="/boletas" className="block mt-2 text-primary hover:underline">
                Registra tu primera boleta →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Presupuesto vs Actual */}
      {presupuestoData.length > 0 && (
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Presupuesto vs Actual</h3>
              <p className="text-xs text-muted-foreground">{MESES_CORTOS[mes - 1]} {anio}</p>
            </div>
          </div>
          <BarComparativa data={presupuestoData} />
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: "/boletas/nueva", label: "Nueva boleta", Icon: FileText, tone: "from-emerald-500" },
          { href: "/inversiones", label: "Inversiones", Icon: TrendingUp, tone: "from-violet-500" },
          { href: "/deudas", label: "Deudas", Icon: CreditCard, tone: "from-blue-500" },
          { href: "/ahorros", label: "Metas de ahorro", Icon: PiggyBank, tone: "from-amber-500" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group relative overflow-hidden rounded-2xl border bg-card p-5 card-hover"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${a.tone} to-transparent opacity-0 group-hover:opacity-10 transition-opacity`} />
            <a.Icon className="h-5 w-5 text-muted-foreground mb-3" />
            <div className="font-medium text-sm">{a.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
