import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getIndicadores } from "@/lib/uf";
import { tasaRetencionHonorarios, formatPct } from "@/lib/chile-tax";
import { KPICard } from "@/components/dashboard/kpi-card";
import { ConfiguracionForm } from "./configuracion-form";
import type { Tipo50_30_20 } from "@/lib/categorias";
import { DollarSign, Shield, Calendar } from "lucide-react";

export default async function ConfiguracionPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  await dbConnect();

  const [user, indicadores] = await Promise.all([
    User.findById(session.user.id).lean(),
    getIndicadores(),
  ]);

  if (!user) return null;
  const anio = new Date().getFullYear();
  const cfg = user.configuracion ?? {};

  const initial = {
    nombre: user.nombre,
    apellido: user.apellido,
    rut: user.rut,
    telefono: user.telefono,
    email: user.email,
    tipoIngreso: user.tipoIngreso,
    plan: user.plan,
    trialEndsAtISO: user.trialEndsAt ? new Date(user.trialEndsAt).toISOString() : undefined,
    retencionHonorariosPct: round2((cfg.retencionHonorarios ?? 0.1525) * 100),
    afpComisionPct: round2((cfg.afpComision ?? 0.0116) * 100),
    planSalud: (cfg.planSalud ?? "fonasa") as "fonasa" | "isapre",
    porcentajeSaludPct: round2((cfg.porcentajeSalud ?? 0.07) * 100),
    sisPorcentajePct: round2((cfg.sisPorcentaje ?? 0.0154) * 100),
    accTrabajoPorcentajePct: round2((cfg.accTrabajoPorcentaje ?? 0.0095) * 100),
    topeImponibleUF: cfg.topeImponibleUF ?? 87.8,
    donacionesBucket: (cfg.donacionesBucket ?? "deseos") as Tipo50_30_20,
    categoriasOverride: (cfg.categoriasOverride ?? {}) as Record<string, Tipo50_30_20>,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1">Tu perfil, tasas SII y reglas 50/30/20</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Indicadores vigentes
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="UF" value={indicadores.uf} icon={DollarSign} tone="default" />
          <KPICard label="UTM" value={indicadores.utm} icon={Calendar} tone="default" />
          <KPICard label="USD" value={indicadores.dolar} icon={DollarSign} tone="default" />
          <KPICard
            label={`Retención ${anio}`}
            value={tasaRetencionHonorarios(anio)}
            icon={Shield}
            tone="debt"
            format="percent"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Fuente: mindicador.cl (Banco Central · SII) · actualización automática cada hora.
          Retención según calendario Ley 21.133: {formatPct(tasaRetencionHonorarios(anio))} en {anio}.
        </p>
      </div>

      <ConfiguracionForm initial={initial} />
    </div>
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
