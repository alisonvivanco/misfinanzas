"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";

export default function ResetPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "No se pudo cambiar la contraseña");
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Enlace inválido</h1>
        <p className="text-sm text-muted-foreground">
          El enlace de recuperación está incompleto.
        </p>
        <Link href="/forgot">
          <Button variant="outline" className="w-full">Pedir un enlace nuevo</Button>
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Listo ✨</h1>
          <p className="text-muted-foreground">
            Cambiamos tu contraseña. Te llevamos al login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold">Crear nueva contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Mínimo 8 caracteres, 1 mayúscula y 1 número.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Nueva contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoFocus
            autoComplete="new-password"
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
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cambiar contraseña"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          ← Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
