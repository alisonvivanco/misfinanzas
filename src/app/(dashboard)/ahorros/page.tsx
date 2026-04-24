import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Saving } from "@/models/Saving";
import { KPICard } from "@/components/dashboard/kpi-card";
import { getUFActual } from "@/lib/uf";
import { formatCLP, formatUF, clpAUf } from "@/lib/chile-tax";
import { PiggyBank, Plus, Target, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AhorrosPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  await dbConnect();

  const [ahorros, valorUF] = await Promise.all([
    Saving.find({ userId: session.user.id }).sort({ cumplida: 1, prioridad: 1 }).lean(),
    getUFActual(),
  ]);

  const activas = ahorros.filter((a) => !a.cumplida);
  const totalAhorrado = activas.reduce((s, a) => s + a.montoActual, 0);
  const totalMeta = activas.reduce((s, a) => s + a.metaMonto, 0);
  const contribucionMensual = activas.reduce((s, a) => s + a.contribucionMensual, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fondo de Ahorros</h1>
          <p className="text-muted-foreground mt-1">
            Metas en CLP y UF · UF actual: {formatCLP(valorUF)}
          </p>
        </div>
        <Link href="/ahorros/nueva">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" /> Nueva meta
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total ahorrado" value={totalAhorrado} icon={PiggyBank} tone="savings" />
        <KPICard label="Meta total" value={totalMeta} icon={Target} tone="default" />
        <KPICard label="Falta" value={Math.max(totalMeta - totalAhorrado, 0)} icon={Target} tone="debt" />
        <KPICard label="Aporte mensual" value={contribucionMensual} icon={PiggyBank} tone="income" trendLabel={`${activas.length} metas`} />
      </div>

      {ahorros.length === 0 ? (
        <div className="rounded-2xl border bg-card p-16 text-center">
          <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-1">Aún no hay metas</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crea metas como fondo de emergencia, viajes, pie de casa, etc.
          </p>
          <Link href="/ahorros/nueva"><Button variant="gradient">Crear primera meta</Button></Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ahorros.map((a) => {
            const pct = a.metaMonto > 0 ? (a.montoActual / a.metaMonto) * 100 : 0;
            const falta = Math.max(a.metaMonto - a.montoActual, 0);
            const mesesRestantes =
              a.contribucionMensual > 0
                ? Math.ceil(falta / a.contribucionMensual)
                : 0;
            return (
              <div
                key={a._id.toString()}
                className={`rounded-2xl border bg-card p-5 card-hover ${a.cumplida ? "ring-2 ring-income/30" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{a.nombre}</h3>
                      {a.cumplida && <CheckCircle2 className="h-4 w-4 text-income" />}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{a.categoria}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      a.prioridad === "alta"
                        ? "bg-destructive/10 text-destructive"
                        : a.prioridad === "media"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        : "bg-muted"
                    }`}
                  >
                    {a.prioridad}
                  </span>
                </div>
                <div className="text-2xl font-bold tabular-nums mb-1">
                  {formatCLP(a.montoActual)}
                </div>
                <div className="text-xs text-muted-foreground mb-3 tabular-nums">
                  de {formatCLP(a.metaMonto)} · {formatUF(clpAUf(a.metaMonto, valorUF))}
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="font-medium">{pct.toFixed(1)}%</span>
                  {!a.cumplida && a.contribucionMensual > 0 && (
                    <span className="text-muted-foreground">{mesesRestantes} meses</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
