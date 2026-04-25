"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Database, CheckCircle2, AlertTriangle, XCircle, Loader2, Wrench, RefreshCw,
} from "lucide-react";

interface IndexInfo {
  name: string;
  key: Record<string, number>;
  unique?: boolean;
  partial?: Record<string, unknown> | null;
}

interface AuditResponse {
  totalUsers: number;
  usersWithRut: number;
  usersNoRut: number;
  duplicateRuts: number;
  allIndexes: IndexInfo[];
  rut: {
    status: "ok" | "missing" | "stale" | "duplicate-rut-keys";
    message: string;
    recommendation?: string;
  };
}

export function DbHealthCard() {
  const router = useRouter();
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [showIndexes, setShowIndexes] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/db-audit");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
      setData(json);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error cargando audit");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function applyFix() {
    setFixing(true);
    try {
      const res = await fetch("/api/admin/db-fix-rut-index", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
      toast.success(
        json.dropped?.length > 0
          ? `Drop de ${json.dropped.join(", ")} + recreado partial`
          : "Índice partial creado"
      );
      await load();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error aplicando fix");
    } finally {
      setFixing(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="rounded-2xl border bg-card shadow-sm p-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
          <div>
            <div className="font-semibold text-sm">Cargando estado de la DB…</div>
          </div>
        </div>
      </div>
    );
  }

  const ok = data.rut.status === "ok";
  const Icon = ok ? CheckCircle2 : data.rut.status === "duplicate-rut-keys" ? XCircle : AlertTriangle;
  const tone = ok
    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
    : data.rut.status === "duplicate-rut-keys"
    ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border bg-card shadow-sm p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Database className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm tracking-tight">Estado de MongoDB</h3>
            <p className="text-xs text-muted-foreground">
              {data.totalUsers} usuarios · {data.usersWithRut} con RUT · {data.usersNoRut} sin RUT
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition shrink-0"
          aria-label="Refrescar"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className={"flex items-start gap-3 rounded-xl border p-3 " + tone}>
        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="text-sm space-y-1 min-w-0">
          <div className="font-medium">Índice de RUT — {STATUS_LABEL[data.rut.status]}</div>
          <div className="text-xs opacity-90">{data.rut.message}</div>
          {data.rut.recommendation && (
            <div className="text-xs opacity-80 italic">{data.rut.recommendation}</div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowIndexes((s) => !s)}
          className="text-xs text-muted-foreground hover:text-foreground transition"
        >
          {showIndexes ? "Ocultar" : "Ver"} todos los índices ({data.allIndexes.length})
        </button>
        {(data.rut.status === "stale" || data.rut.status === "missing") && (
          <button
            onClick={applyFix}
            disabled={fixing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium hover:shadow-md disabled:opacity-50 transition"
          >
            {fixing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wrench className="h-3 w-3" />}
            Arreglar índice
          </button>
        )}
      </div>

      {showIndexes && (
        <div className="rounded-xl border bg-muted/30 p-3 space-y-1.5 max-h-60 overflow-auto scrollbar-thin">
          {data.allIndexes.map((i) => (
            <div key={i.name} className="text-xs font-mono">
              <span className="font-semibold">{i.name}</span>
              <span className="text-muted-foreground"> · key={JSON.stringify(i.key)}</span>
              {i.unique && <span className="ml-1 px-1 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">unique</span>}
              {i.partial && <span className="ml-1 px-1 rounded bg-blue-500/20 text-blue-700 dark:text-blue-400">partial</span>}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

const STATUS_LABEL: Record<AuditResponse["rut"]["status"], string> = {
  ok: "OK",
  missing: "Falta",
  stale: "Desactualizado",
  "duplicate-rut-keys": "Duplicados",
};
