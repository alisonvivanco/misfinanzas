"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CATEGORIAS_GASTO,
  CATEGORIA_TIPO_DEFAULT,
  TIPO_LABEL,
  type Tipo50_30_20,
} from "@/lib/categorias";
import { SUBSCRIBE_URL, MANAGE_SUBSCRIPTION_URL } from "@/lib/subscription";
import { Loader2, Save, ExternalLink, Sparkles } from "lucide-react";

type Initial = {
  nombre?: string;
  apellido?: string;
  rut?: string;
  telefono?: string;
  email: string;
  tipoIngreso?: string;
  plan: string;
  trialEndsAtISO?: string;
  retencionHonorariosPct: number;
  afpComisionPct: number;
  planSalud: "fonasa" | "isapre";
  porcentajeSaludPct: number;
  sisPorcentajePct: number;
  accTrabajoPorcentajePct: number;
  topeImponibleUF: number;
  donacionesBucket: Tipo50_30_20;
  categoriasOverride: Record<string, Tipo50_30_20>;
};

export function ConfiguracionForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Cada sección guarda solo sus campos.
  async function save(section: string, payload: Record<string, unknown>) {
    setSavingSection(section);
    try {
      const res = await fetch("/api/configuracion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo guardar");
      toast.success("Cambios guardados");
      start(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSavingSection(null);
    }
  }

  return (
    <div className="space-y-6">
      <PerfilCard
        initial={initial}
        onSave={(p) => save("perfil", p)}
        saving={savingSection === "perfil"}
      />
      <TasasCard
        initial={initial}
        onSave={(p) => save("tasas", p)}
        saving={savingSection === "tasas"}
      />
      <CategoriasCard
        initial={initial}
        onSave={(p) => save("categorias", p)}
        saving={savingSection === "categorias"}
      />
      <SuscripcionCard initial={initial} />
    </div>
  );
}

/* ---------- Perfil ---------- */
function PerfilCard({
  initial,
  onSave,
  saving,
}: {
  initial: Initial;
  onSave: (p: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [nombre, setNombre] = useState(initial.nombre || "");
  const [apellido, setApellido] = useState(initial.apellido || "");
  const [telefono, setTelefono] = useState(initial.telefono || "");
  const [tipoIngreso, setTipoIngreso] = useState(initial.tipoIngreso || "honorarios");

  return (
    <Section
      title="Perfil"
      desc="Tus datos personales. El email no se puede cambiar."
      footer={
        <Button
          variant="gradient"
          onClick={() => onSave({ nombre, apellido, telefono, tipoIngreso })}
          disabled={saving}
          className="gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar perfil
        </Button>
      }
    >
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Nombre">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Field>
        <Field label="Apellido">
          <Input value={apellido} onChange={(e) => setApellido(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input value={initial.email} disabled />
        </Field>
        <Field label="RUT">
          <Input value={initial.rut || "—"} disabled />
        </Field>
        <Field label="Teléfono">
          <Input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+56 9 1234 5678"
            inputMode="tel"
          />
        </Field>
        <Field label="Tipo de ingreso principal">
          <select
            value={tipoIngreso}
            onChange={(e) => setTipoIngreso(e.target.value)}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm shadow-sm"
          >
            <option value="honorarios">Honorarios independiente</option>
            <option value="dependiente">Sueldo dependiente</option>
            <option value="mixto">Mixto</option>
            <option value="negocio">Negocio / emprendimiento</option>
          </select>
        </Field>
      </div>
    </Section>
  );
}

/* ---------- Tasas tributarias ---------- */
function TasasCard({
  initial,
  onSave,
  saving,
}: {
  initial: Initial;
  onSave: (p: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [retencion, setRetencion] = useState(initial.retencionHonorariosPct);
  const [afpComision, setAfpComision] = useState(initial.afpComisionPct);
  const [planSalud, setPlanSalud] = useState<"fonasa" | "isapre">(initial.planSalud);
  const [salud, setSalud] = useState(initial.porcentajeSaludPct);
  const [sis, setSis] = useState(initial.sisPorcentajePct);
  const [accTrab, setAccTrab] = useState(initial.accTrabajoPorcentajePct);
  const [tope, setTope] = useState(initial.topeImponibleUF);

  return (
    <Section
      title="Tasas tributarias Chile"
      desc="Valores oficiales SII y Ley 21.133. Ajusta solo si tu situación lo requiere (ej: Isapre con plan distinto a 7%)."
      footer={
        <Button
          variant="gradient"
          onClick={() =>
            onSave({
              retencionHonorariosPct: retencion,
              afpComisionPct: afpComision,
              planSalud,
              porcentajeSaludPct: salud,
              sisPorcentajePct: sis,
              accTrabajoPorcentajePct: accTrab,
              topeImponibleUF: tope,
            })
          }
          disabled={saving}
          className="gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar tasas
        </Button>
      }
    >
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Retención honorarios actual (%)" hint="Ley 21.133: 15,25% (2026) · 17% (2027+)">
          <PctInput value={retencion} onChange={setRetencion} />
        </Field>
        <Field label="Comisión AFP (%)" hint="Promedio del mercado ~1,16%. Tu AFP exacta puede variar.">
          <PctInput value={afpComision} onChange={setAfpComision} />
        </Field>
        <Field label="Plan de salud">
          <select
            value={planSalud}
            onChange={(e) => setPlanSalud(e.target.value as "fonasa" | "isapre")}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm shadow-sm"
          >
            <option value="fonasa">Fonasa</option>
            <option value="isapre">Isapre</option>
          </select>
        </Field>
        <Field label="% Salud" hint="Fonasa = 7%. Isapre puede ser superior según plan UF.">
          <PctInput value={salud} onChange={setSalud} />
        </Field>
        <Field label="% SIS" hint="Seguro Invalidez y Sobrevivencia. Mujer ~1,54%, hombre puede variar.">
          <PctInput value={sis} onChange={setSis} />
        </Field>
        <Field label="% Accidentes del Trabajo" hint="Mutual de Seguridad / ACHS / IST. ~0,95%.">
          <PctInput value={accTrab} onChange={setAccTrab} />
        </Field>
        <Field label="Tope imponible (UF)" hint="Ajustado anualmente por SII. Hoy: 87,8 UF.">
          <Input
            type="number"
            step="0.1"
            value={tope}
            onChange={(e) => setTope(Number(e.target.value))}
          />
        </Field>
      </div>
    </Section>
  );
}

/* ---------- 50/30/20 ---------- */
function CategoriasCard({
  initial,
  onSave,
  saving,
}: {
  initial: Initial;
  onSave: (p: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [donaciones, setDonaciones] = useState<Tipo50_30_20>(initial.donacionesBucket);
  const [overrides, setOverrides] = useState<Record<string, Tipo50_30_20>>(
    initial.categoriasOverride || {}
  );

  function setCategoria(cat: string, tipo: Tipo50_30_20) {
    setOverrides((prev) => {
      const next = { ...prev };
      const isDefault = CATEGORIA_TIPO_DEFAULT[cat as keyof typeof CATEGORIA_TIPO_DEFAULT] === tipo;
      if (isDefault) delete next[cat];
      else next[cat] = tipo;
      return next;
    });
  }

  return (
    <Section
      title="Regla 50/30/20"
      desc="Define en qué bucket cae cada categoría. Necesidades 50% · Deseos 30% · Ahorros 20%."
      footer={
        <Button
          variant="gradient"
          onClick={() =>
            onSave({ donacionesBucket: donaciones, categoriasOverride: overrides })
          }
          disabled={saving}
          className="gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar regla
        </Button>
      }
    >
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
          <div>
            <div className="text-sm font-medium">Donaciones</div>
            <div className="text-xs text-muted-foreground">
              Aunque cuentan como gasto, decides en qué bucket caen.
            </div>
          </div>
          <BucketSelect value={donaciones} onChange={setDonaciones} />
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="bg-muted/30 px-4 py-2.5 border-b text-xs font-medium uppercase tracking-wider text-muted-foreground grid grid-cols-[1fr_auto] gap-4 items-center">
          <span>Categoría</span>
          <span>Bucket 50/30/20</span>
        </div>
        <div className="divide-y">
          {CATEGORIAS_GASTO.filter((c) => c !== "Donaciones").map((cat) => {
            const current =
              overrides[cat] ?? CATEGORIA_TIPO_DEFAULT[cat as keyof typeof CATEGORIA_TIPO_DEFAULT];
            return (
              <div
                key={cat}
                className="px-4 py-2.5 grid grid-cols-[1fr_auto] gap-4 items-center text-sm"
              >
                <span>{cat}</span>
                <BucketSelect value={current} onChange={(v) => setCategoria(cat, v)} />
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

function BucketSelect({
  value,
  onChange,
}: {
  value: Tipo50_30_20;
  onChange: (v: Tipo50_30_20) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border bg-background p-1 text-xs">
      {(["necesidades", "deseos", "ahorros"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={
            "px-2.5 py-1 rounded-md transition " +
            (value === t
              ? "bg-primary text-primary-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          {TIPO_LABEL[t]}
        </button>
      ))}
    </div>
  );
}

/* ---------- Suscripción ---------- */
function SuscripcionCard({ initial }: { initial: Initial }) {
  const trialActive = initial.plan === "trial";
  const trialDate = initial.trialEndsAtISO
    ? new Date(initial.trialEndsAtISO).toLocaleDateString("es-CL")
    : null;

  return (
    <Section
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Suscripción
        </span>
      }
      desc={
        trialActive
          ? `Estás en periodo de prueba${trialDate ? ` hasta el ${trialDate}` : ""}.`
          : `Plan actual: ${initial.plan}`
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Suscríbete para mantener la app activa después del período de prueba. Pago mensual
        vía MercadoPago. Puedes cancelar cuando quieras.
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
    </Section>
  );
}

/* ---------- Primitivas locales ---------- */
function Section({
  title,
  desc,
  children,
  footer,
}: {
  title: React.ReactNode;
  desc?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="p-5 border-b">
        <h3 className="font-semibold">{title}</h3>
        {desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}
      </div>
      <div className="p-5">{children}</div>
      {footer && <div className="px-5 py-4 border-t bg-muted/20 flex justify-end">{footer}</div>}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PctInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="relative">
      <Input
        type="number"
        step="0.01"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="pr-8"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        %
      </span>
    </div>
  );
}
