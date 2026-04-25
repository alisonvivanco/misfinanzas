"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validarRut, formatearRut } from "@/lib/rut";
import { Loader2 } from "lucide-react";

const schema = z.object({
  rut: z.string().refine(validarRut, { message: "RUT inválido" }),
  telefono: z
    .string()
    .regex(/^(\+?56)?\s?9?\s?\d{4}\s?\d{4}$/, "Formato: +56 9 1234 5678"),
  tipoIngreso: z.enum(["dependiente", "honorarios", "mixto", "negocio", "informal"]),
});

type FormData = z.infer<typeof schema>;

export default function CompletarPerfilPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipoIngreso: "honorarios" },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/completar-perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      await update({ profileComplete: true, rut: json.rut, plan: json.plan });
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold">Completa tu perfil</h1>
        <p className="text-sm text-muted-foreground">
          {session?.user?.name ? `Hola ${session.user.name.split(" ")[0]} — ` : ""}
          necesitamos un par de datos más para calcular tus impuestos correctamente.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rut">RUT</Label>
        <Input
          id="rut"
          {...register("rut")}
          placeholder="12.345.678-9"
          onBlur={(e) => {
            if (validarRut(e.target.value)) {
              setValue("rut", formatearRut(e.target.value));
            }
          }}
        />
        {errors.rut && <p className="text-xs text-destructive">{errors.rut.message}</p>}
        <p className="text-xs text-muted-foreground">
          Usamos tu RUT para identificarte y calcular correctamente tus impuestos.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          {...register("telefono")}
          placeholder="+56 9 1234 5678"
          inputMode="tel"
        />
        {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tipoIngreso">Tipo de ingreso principal</Label>
        <select
          id="tipoIngreso"
          {...register("tipoIngreso")}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm shadow-sm"
        >
          <option value="honorarios">Honorarios (independiente)</option>
          <option value="dependiente">Sueldo (dependiente)</option>
          <option value="mixto">Mixto</option>
          <option value="negocio">Negocio / emprendimiento</option>
          <option value="informal">Informal (sin boletas/facturas)</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar a MisFinanzas"}
      </Button>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
