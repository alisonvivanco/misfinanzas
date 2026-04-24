"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validarRut, formatearRut } from "@/lib/rut";
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { GoogleButton } from "@/components/auth/google-button";

const schema = z.object({
  nombre: z.string().min(2, "Muy corto"),
  apellido: z.string().min(2, "Muy corto"),
  rut: z.string().refine(validarRut, { message: "RUT inválido" }),
  telefono: z
    .string()
    .regex(/^(\+?56)?\s?9?\s?\d{4}\s?\d{4}$/, "Formato: +56 9 1234 5678"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Al menos 1 mayúscula")
    .regex(/[0-9]/, "Al menos 1 número"),
  tipoIngreso: z.enum(["dependiente", "honorarios", "mixto", "negocio"]),
  acepta: z.literal(true, { errorMap: () => ({ message: "Debes aceptar los términos" }) }),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipoIngreso: "honorarios" },
  });

  const rut = watch("rut");

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al crear cuenta");
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-income/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-income" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">¡Revisa tu email!</h1>
          <p className="text-muted-foreground">
            Te enviamos un enlace de verificación. Haz click y vuelve a iniciar sesión.
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="w-full">Ir a iniciar sesión</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">
          14 días de prueba gratis. Sin tarjeta.
        </p>
      </div>

      <GoogleButton label="Registrarse con Google" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">o con email</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" {...register("nombre")} placeholder="María" />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="apellido">Apellido</Label>
          <Input id="apellido" {...register("apellido")} placeholder="González" />
          {errors.apellido && <p className="text-xs text-destructive">{errors.apellido.message}</p>}
        </div>
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
          Usamos tu RUT para integrarnos con el SII vía Clave Única (próximamente).
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
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} placeholder="tu@ejemplo.cl" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPw ? "text" : "password"}
            {...register("password")}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
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
        </select>
      </div>

      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" {...register("acepta")} className="mt-1 rounded" />
        <span>
          Acepto los{" "}
          <Link href="/terminos" className="text-primary hover:underline">términos</Link>
          {" "}y la{" "}
          <Link href="/privacidad" className="text-primary hover:underline">política de privacidad</Link>.
        </span>
      </label>
      {errors.acepta && <p className="text-xs text-destructive">{errors.acepta.message}</p>}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
