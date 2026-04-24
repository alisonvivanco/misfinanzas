"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "success" | "error" | "idle">(
    token ? "loading" : "idle"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/verify?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setState("success");
          setMessage(d.message);
        } else {
          setState("error");
          setMessage(d.error || "Error al verificar");
        }
      })
      .catch(() => {
        setState("error");
        setMessage("Error de conexión");
      });
  }, [token]);

  if (state === "idle") {
    return (
      <div className="space-y-6 text-center">
        <Mail className="h-16 w-16 mx-auto text-primary" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Verifica tu email</h1>
          <p className="text-muted-foreground">
            Te enviamos un enlace a tu correo. Haz click para activar tu cuenta.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          ¿No llegó? Revisa spam o{" "}
          <Link href="/forgot" className="text-primary hover:underline">
            solicita uno nuevo
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      {state === "loading" && (
        <>
          <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
          <p>Verificando tu email...</p>
        </>
      )}
      {state === "success" && (
        <>
          <div className="mx-auto h-16 w-16 rounded-full bg-income/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-income" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Email verificado</h1>
            <p className="text-muted-foreground">{message}</p>
          </div>
          <Link href="/login">
            <Button variant="gradient" className="w-full">Iniciar sesión</Button>
          </Link>
        </>
      )}
      {state === "error" && (
        <>
          <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">No se pudo verificar</h1>
            <p className="text-muted-foreground">{message}</p>
          </div>
          <Link href="/forgot">
            <Button variant="outline" className="w-full">Solicitar nuevo enlace</Button>
          </Link>
        </>
      )}
    </div>
  );
}
