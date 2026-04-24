import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getIndicadores } from "@/lib/uf";
import { formatCLP, formatPct, tasaRetencionHonorarios } from "@/lib/chile-tax";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Settings, DollarSign, Shield, Calendar } from "lucide-react";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1">Tu perfil y parámetros tributarios</p>
      </div>

      {/* Indicadores vigentes */}
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
          Fuente: mindicador.cl · Actualización automática cada hora
        </p>
      </div>

      {/* Perfil */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Perfil</h3>
          <p className="text-xs text-muted-foreground">Tus datos personales</p>
        </div>
        <div className="p-5 grid md:grid-cols-2 gap-5">
          <Info label="Nombre" value={`${user.nombre} ${user.apellido}`} />
          <Info label="RUT" value={user.rut} />
          <Info label="Email" value={user.email} />
          <Info label="Teléfono" value={user.telefono} />
          <Info
            label="Tipo de ingreso"
            value={
              {
                honorarios: "Honorarios Independiente",
                dependiente: "Sueldo Dependiente",
                mixto: "Mixto",
                negocio: "Negocio propio",
              }[user.tipoIngreso] || user.tipoIngreso
            }
          />
          <Info
            label="Plan"
            value={
              user.plan === "trial"
                ? `Trial · termina ${user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString("es-CL") : ""}`
                : user.plan
            }
          />
        </div>
      </div>

      {/* Parámetros tributarios */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Parámetros tributarios</h3>
          <p className="text-xs text-muted-foreground">
            Se aplican a cálculos de cotizaciones y retenciones
          </p>
        </div>
        <div className="p-5 grid md:grid-cols-2 gap-5">
          <Info
            label="Retención honorarios"
            value={formatPct(user.configuracion?.retencionHonorarios || tasaRetencionHonorarios(anio))}
          />
          <Info
            label="Comisión AFP"
            value={formatPct(user.configuracion?.afpComision || 0.0116)}
          />
          <Info
            label="Plan de salud"
            value={
              user.configuracion?.planSalud === "isapre"
                ? "Isapre"
                : "Fonasa"
            }
          />
          <Info
            label="Porcentaje de salud"
            value={formatPct(user.configuracion?.porcentajeSalud || 0.07)}
          />
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 text-sm text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-2">
          <Settings className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium mb-1">Integración SII · Clave Única (próximamente)</div>
            <p className="text-xs leading-relaxed">
              Estamos trabajando en la integración OAuth con Clave Única del Estado
              para sincronizar automáticamente tus boletas desde el SII, generar tu
              Operación Renta pre-llenada y descargar certificados tributarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
