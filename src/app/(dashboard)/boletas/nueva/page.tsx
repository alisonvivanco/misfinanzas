"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tasaRetencionHonorarios, formatCLP, formatPct } from "@/lib/chile-tax";
import { ArrowLeft, Loader2 } from "lucide-react";

const schema = z.object({
  numeroBoleta: z.string().optional(),
  fechaEmision: z.string().min(1, "Requerido"),
  cliente: z.string().min(2, "Requerido"),
  rutCliente: z.string().optional(),
  descripcion: z.string().min(3, "Muy corto"),
  montoBruto: z.coerce.number().positive("Debe ser mayor a 0"),
  estado: z.enum(["emitida", "pagada", "pendiente", "anulada"]),
  notas: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NuevaBoletaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fechaEmision: new Date().toISOString().split("T")[0],
      estado: "emitida",
      montoBruto: 0,
    },
  });

  const montoBruto = watch("montoBruto") || 0;
  const fechaStr = watch("fechaEmision");
  const anio = fechaStr ? new Date(fechaStr).getFullYear() : new Date().getFullYear();
  const tasa = tasaRetencionHonorarios(anio);
  const retencion = Math.round(montoBruto * tasa);
  const liquido = montoBruto - retencion;

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/boletas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, fechaEmision: data.fechaEmision }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al crear");
      router.push("/boletas");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/boletas"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva boleta</h1>
        <p className="text-muted-foreground mt-1">
          Retención automática según año fiscal
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5 rounded-2xl border bg-card p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="numeroBoleta">N° Boleta (opcional)</Label>
              <Input id="numeroBoleta" {...register("numeroBoleta")} placeholder="001" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fechaEmision">Fecha de emisión</Label>
              <Input id="fechaEmision" type="date" {...register("fechaEmision")} />
              {errors.fechaEmision && (
                <p className="text-xs text-destructive">{errors.fechaEmision.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cliente">Cliente</Label>
            <Input id="cliente" {...register("cliente")} placeholder="Empresa S.A." />
            {errors.cliente && (
              <p className="text-xs text-destructive">{errors.cliente.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rutCliente">RUT cliente (opcional)</Label>
            <Input id="rutCliente" {...register("rutCliente")} placeholder="76.123.456-7" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcion">Descripción del servicio</Label>
            <textarea
              id="descripcion"
              {...register("descripcion")}
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm shadow-sm"
              placeholder="Consultoría en ..."
            />
            {errors.descripcion && (
              <p className="text-xs text-destructive">{errors.descripcion.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="montoBruto">Monto bruto (CLP)</Label>
              <Input
                id="montoBruto"
                type="number"
                min={0}
                step={1000}
                {...register("montoBruto", { valueAsNumber: true })}
              />
              {errors.montoBruto && (
                <p className="text-xs text-destructive">{errors.montoBruto.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estado">Estado</Label>
              <select
                id="estado"
                {...register("estado")}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm shadow-sm"
              >
                <option value="emitida">Emitida</option>
                <option value="pendiente">Pendiente de pago</option>
                <option value="pagada">Pagada</option>
                <option value="anulada">Anulada</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <textarea
              id="notas"
              {...register("notas")}
              rows={2}
              className="flex w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm shadow-sm"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" variant="gradient" disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear boleta"}
          </Button>
        </div>

        {/* Vista previa cálculos */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-violet-500/5 p-5 space-y-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground">VISTA PREVIA</div>
              <div className="text-lg font-semibold mt-1">Cálculo automático</div>
            </div>
            <div className="space-y-3 tabular-nums text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto bruto</span>
                <span className="font-medium">{formatCLP(montoBruto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Retención {anio} ({formatPct(tasa)})
                </span>
                <span className="font-medium text-expense">−{formatCLP(retencion)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="font-semibold">Líquido a recibir</span>
                <span className="font-bold text-lg text-income">{formatCLP(liquido)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 text-xs text-amber-900 dark:text-amber-200">
            <div className="font-medium mb-1">💡 Sobre la retención</div>
            <p className="leading-relaxed">
              La retención se provisiona para tu impuesto anual.
              Recuerda: las cotizaciones previsionales se calculan sobre el 80%
              del bruto (Ley 21.133) y se pagan mensualmente en Previred.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
