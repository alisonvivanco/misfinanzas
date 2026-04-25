"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, Clock, XCircle, Sparkles, Loader2 } from "lucide-react";

interface UserRow {
  _id: string;
  email: string;
  nombre: string | null;
  apellido: string | null;
  plan: string;
  status: "trial" | "free" | "paid" | "expired";
  active: boolean;
  daysLeft: number | null;
  expiresAt: string | null;
  createdAt: string;
}

const STATUS_BADGE: Record<UserRow["status"], { Icon: typeof CheckCircle2; cls: string; label: string }> = {
  free: { Icon: Sparkles, cls: "bg-violet-500/10 text-violet-700 dark:text-violet-400", label: "Free" },
  paid: { Icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", label: "Pagando" },
  trial: { Icon: Clock, cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400", label: "Prueba" },
  expired: { Icon: XCircle, cls: "bg-rose-500/10 text-rose-700 dark:text-rose-400", label: "Expiró" },
};

export function AdminClient({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  async function grant(userId: string, action: "free" | "extend30" | "trial") {
    setBusyId(userId);
    try {
      const res = await fetch("/api/admin/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
      toast.success("Cuenta actualizada");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = users.filter((u) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.nombre || "").toLowerCase().includes(q) ||
      (u.apellido || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
            <p className="text-xs text-muted-foreground">
              Activá usuarios gratis o extiendé suscripciones manualmente
            </p>
          </div>
        </div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar por email o nombre…"
          className="h-9 rounded-xl border bg-card px-3 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-ring transition"
        />
      </motion.header>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-[11px] text-muted-foreground bg-muted/20 uppercase tracking-wider font-medium">
              <tr>
                <th className="px-4 py-2.5 text-left">Usuario</th>
                <th className="px-4 py-2.5 text-left">Estado</th>
                <th className="px-4 py-2.5 text-left">Vence</th>
                <th className="px-4 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const badge = STATUS_BADGE[u.status];
                  const expiresOn = u.expiresAt
                    ? new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" }).format(
                        new Date(u.expiresAt)
                      )
                    : "—";
                  return (
                    <tr key={u._id} className="border-t hover:bg-muted/30 transition">
                      <td className="px-4 py-2.5">
                        <div className="font-medium">
                          {[u.nombre, u.apellido].filter(Boolean).join(" ") || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                          <badge.Icon className="h-3 w-3" />
                          {badge.label}
                        </span>
                        {u.daysLeft !== null && u.active && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {u.daysLeft}d restantes
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{expiresOn}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <ActionBtn
                            label="Free"
                            onClick={() => grant(u._id, "free")}
                            disabled={busyId !== null}
                            loading={busyId === u._id}
                            tone="violet"
                          />
                          <ActionBtn
                            label="+30 días"
                            onClick={() => grant(u._id, "extend30")}
                            disabled={busyId !== null}
                            loading={busyId === u._id}
                            tone="emerald"
                          />
                          <ActionBtn
                            label="Reset trial"
                            onClick={() => grant(u._id, "trial")}
                            disabled={busyId !== null}
                            loading={busyId === u._id}
                            tone="muted"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  label, onClick, disabled, loading, tone,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone: "violet" | "emerald" | "muted";
}) {
  const tones: Record<string, string> = {
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-400 hover:bg-violet-500/20",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20",
    muted: "bg-muted text-muted-foreground hover:bg-muted/80",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-1 rounded-md text-xs font-medium transition disabled:opacity-50 ${tones[tone]}`}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin inline" /> : label}
    </button>
  );
}
