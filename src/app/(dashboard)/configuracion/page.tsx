import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getIndicadores } from "@/lib/uf";
import { formatPct, tasaRetencionHonorarios } from "@/lib/chile-tax";
import { SUBSCRIBE_URL, MANAGE_SUBSCRIPTION_URL } from "@/lib/subscription";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { DollarSign, Shield, Calendar, Sparkles, ExternalLink } from "lucide-react";

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
          <Info label="RUT" value={user.rut || "—"} />
          <Info label="Email" value={user.email} />
          <Info label="Teléfono" value={user.telefono || "—"} />
          <Info
            label="Tipo de ingreso"
            value={
              user.tipoIngreso
                ? {
                    honorarios: "Honorarios Independiente",
                    dependiente: "Sueldo Dependiente",
                    mixto: "Mixto",
                    negocio: "Negocio propio",
                  }[user.tipoIngreso] || user.tipoIngreso
                : "—"
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

      {/* Suscripción */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Suscripción
          </h3>
          <p className="text-xs text-muted-foreground">
            {user.plan === "trial"
              ? `Estás en periodo de prueba${user.trialEndsAt ? ` hasta el ${new Date(user.trialEndsAt).toLocaleDateString("es-CL")}` : ""}.`
              : `Plan actual: ${user.plan}`}
          </p>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Suscríbete para mantener todas tus funcionalidades activas.
            Pago mensual vía MercadoPago. Puedes cancelar cuando quieras.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
              <Button variant="gradient" className="gap-2">
                Suscribirse
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <a href={MANAGE_SUBSCRIPTION_URL} target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                Cancelar / gestionar
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
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
