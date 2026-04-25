"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Loader2, Wrench, RefreshCw, Zap } from "lucide-react";

interface Status {
  configured: boolean;
  reason?: string;
  planId?: string | null;
  desiredUrl?: string;
  currentNotificationUrl?: string | null;
  planStatus?: string;
  message?: string;
}

export function MpWebhookCard() {
  const [data, setData] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mp-configure");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
      setData(json);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function configure() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/mp-configure", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
      toast.success("Webhook configurado en MercadoPago");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error configurando");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="rounded-2xl border bg-card shadow-sm p-5">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Verificando webhook MP…</span>
        </div>
      </div>
    );
  }

  const ok = data.configured;
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  const tone = ok
    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";

  const reasonHelp = data.reason === "missing-access-token"
    ? "Agregá MERCADOPAGO_ACCESS_TOKEN en Vercel → Settings → Environment Variables, y redeployá."
    : data.reason === "missing-plan-id"
    ? "El URL de suscripción no contiene preapproval_plan_id."
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border bg-card shadow-sm p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm tracking-tight">Webhook MercadoPago</h3>
            <p className="text-xs text-muted-foreground">
              Auto-activa suscripciones cuando alguien paga
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition shrink-0"
          aria-label="Refrescar"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className={"flex items-start gap-3 rounded-xl border p-3 " + tone}>
        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="text-sm space-y-1 min-w-0 flex-1">
          <div className="font-medium">
            {ok ? "Configurado correctamente" : reasonHelp ? "Falta configurar" : "Sin webhook"}
          </div>
          {data.message && <div className="text-xs opacity-90">{data.message}</div>}
          {reasonHelp && <div className="text-xs opacity-90 italic">{reasonHelp}</div>}
          {data.desiredUrl && (
            <div className="text-[11px] font-mono opacity-80 break-all">
              URL: {data.desiredUrl}
            </div>
          )}
          {data.currentNotificationUrl && data.currentNotificationUrl !== data.desiredUrl && (
            <div className="text-[11px] font-mono opacity-70 break-all">
              Actual en MP: {data.currentNotificationUrl}
            </div>
          )}
          {data.planId && (
            <div className="text-[11px] opacity-70">Plan ID: {data.planId}</div>
          )}
        </div>
      </div>

      {!ok && !reasonHelp && (
        <button
          onClick={configure}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:shadow-md hover:shadow-blue-500/20 disabled:opacity-50 transition"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
          Configurar webhook en mi plan
        </button>
      )}
    </motion.div>
  );
}
