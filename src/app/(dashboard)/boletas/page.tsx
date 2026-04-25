import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Boleta } from "@/models/Boleta";
import { Button } from "@/components/ui/button";
import { formatCLP, formatPct, tasaRetencionHonorarios, provisionImpuestoAnual } from "@/lib/chile-tax";
import { getUTMActual } from "@/lib/uf";
import { FileText, Plus, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { KPICard } from "@/components/dashboard/kpi-card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function BoletasPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await dbConnect();
  const anio = new Date().getFullYear();
  const [boletasAnio, valorUTM] = await Promise.all([
    Boleta.find({ userId: session.user.id, anio }).sort({ fechaEmision: -1 }).lean(),
    getUTMActual(),
  ]);

  const totalBruto = boletasAnio.reduce((s, b) => s + b.montoBruto, 0);
  const totalRetencion = boletasAnio.reduce((s, b) => s + b.montoRetencion, 0);
  const totalLiquido = boletasAnio.reduce((s, b) => s + b.montoLiquido, 0);
  const { provisionRecomendada, impuestoEstimado } = provisionImpuestoAnual(
    totalBruto,
    valorUTM,
    0
  );
  const tasaActual = tasaRetencionHonorarios(anio);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Boletas de Honorarios</h1>
          <p className="text-muted-foreground mt-1">
            Retención {anio}: <span className="font-medium">{formatPct(tasaActual)}</span>{" "}
            (Ley 21.133 · SII)
          </p>
        </div>
        <Link href="/boletas/nueva">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Emitir boleta
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={`Bruto ${anio}`}
          value={totalBruto}
          icon={FileText}
          tone="income"
          trendLabel={`${boletasAnio.length} boletas`}
        />
        <KPICard
          label={`Retención ${anio}`}
          value={totalRetencion}
          icon={TrendingUp}
          tone="debt"
          trendLabel={formatPct(tasaActual)}
        />
        <KPICard
          label={`Líquido recibido`}
          value={totalLiquido}
          icon={TrendingUp}
          tone="default"
        />
        <KPICard
          label="Provisión impuesto anual"
          value={provisionRecomendada}
          icon={AlertCircle}
          tone="expense"
          trendLabel={`Est. impuesto: ${formatCLP(impuestoEstimado)}`}
        />
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Historial</h3>
            <p className="text-xs text-muted-foreground">
              {boletasAnio.length} boletas emitidas en {anio}
            </p>
          </div>
        </div>
        {boletasAnio.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">Aún no hay boletas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Emite tu primera boleta para empezar a provisionar tu impuesto anual.
            </p>
            <Link href="/boletas/nueva">
              <Button variant="gradient">Emitir mi primera boleta</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium text-right">Bruto</th>
                  <th className="px-5 py-3 font-medium text-right">Retención</th>
                  <th className="px-5 py-3 font-medium text-right">Líquido</th>
                  <th className="px-5 py-3 font-medium text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {boletasAnio.map((b) => (
                  <tr key={b._id.toString()} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="px-5 py-3 tabular-nums text-xs">
                      {format(new Date(b.fechaEmision), "dd MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-5 py-3 max-w-xs truncate">
                      <div className="font-medium">{b.cliente}</div>
                      <div className="text-xs text-muted-foreground truncate">{b.descripcion}</div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatCLP(b.montoBruto)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-expense">
                      -{formatCLP(b.montoRetencion)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold">
                      {formatCLP(b.montoLiquido)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.estado === "pagada"
                            ? "bg-income/10 text-income"
                            : b.estado === "pendiente"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : b.estado === "anulada"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted"
                        }`}
                      >
                        {b.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
