"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await fetch("/api/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Revisá tu correo</h1>
          <p className="text-muted-foreground">
            Si <span className="font-medium">{email}</span> tiene una cuenta
            verificada, te enviamos un enlace para restablecer tu contraseña.
          </p>
          <p className="text-xs text-muted-foreground">
            El enlace expira en 1 hora.
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="w-full">Volver a iniciar sesión</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold">¿Olvidaste tu contraseña?</h1>
        <p className="text-sm text-muted-foreground">
          Ingresá tu email y te enviamos un enlace para crear una nueva.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="tu@ejemplo.cl"
            className="pl-9"
          />
        </div>
      </div>

      <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar enlace"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          ← Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
