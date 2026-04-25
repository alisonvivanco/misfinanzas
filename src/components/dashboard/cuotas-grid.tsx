"use client";
import { useMemo, useState } from "react";
import { Plus, Loader2, Check, MinusCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatCLP } from "@/lib/utils";
import { apiCall } from "./api-call";
import { MoneyInput, parseMontoInput } from "./money-input";
import type { Debt } from "./types";

type Estado = "pagada" | "parcial" | "pendiente" | "saltada";

const ESTADO_STYLE: Record<Estado, { label: string; cls: string; dot: string }> = {
  pagada: {
    label: "Pagada",
    cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20",
    dot: "bg-emerald-500",
  },
  parcial: {
    label: "Parcial",
    cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20",
    dot: "bg-amber-500",
  },
  pendiente: {
    label: "Pendiente",
    cls: "bg-muted text-muted-foreground ring-border",
    dot: "bg-muted-foreground/40",
  },
  saltada: {
    label: "No pagada",
    cls: "bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-rose-500/20",
    dot: "bg-rose-500",
  },
};

export function CuotasGrid({ debt, onChange }: { debt: Debt; onChange: () => void }) {
  const [openCuota, setOpenCuota] = useState<number | null>(null);

  const cuotas = useMemo(() => {
    const total = debt.cuotasTotales ?? 0;
    if (!total) return [];
    const expectedBase = Math.round(debt.monto / total);
    const skipSet = new Set(debt.cuotasSaltadas ?? []);
    return Array.from({ length: total }, (_, idx) => {
      const numero = idx + 1;
      const pagosCuota = (debt.pagos ?? []).filter((p) => p.cuotaNumero === numero);
      const pagado = pagosCuota.reduce((s, p) => s + p.monto, 0);
      // Last cuota absorbs the rounding remainder so totals match.
      const esperado = numero === total
        ? Math.max(0, debt.monto - expectedBase * (total - 1))
        : expectedBase;
      const isSkipped = skipSet.has(numero);
      let estado: Estado;
      if (isSkipped) estado = "saltada";
      else if (pagado >= esperado && esperado > 0) estado = "pagada";
      else if (pagado > 0) estado = "parcial";
      else estado = "pendiente";
      return { numero, esperado, pagado, pagosCuota, estado };
    });
  }, [debt]);

  if (!debt.cuotasTotales) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Cuotas ({debt.cuotasTotales})
        </div>
        <Summary cuotas={cuotas} />
      </div>

      <div className="space-y-1.5 max-h-72 overflow-auto scrollbar-thin">
        {cuotas.map((c) => {
          const open = openCuota === c.numero;
          const style = ESTADO_STYLE[c.estado];
          return (
            <motion.div
              key={c.numero}
              layout
              className="rounded-lg border bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenCuota(open ? null : c.numero)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/30 transition"
              >
                <span className="font-mono text-xs text-muted-foreground tabular-nums w-8 shrink-0">
                  #{String(c.numero).padStart(2, "0")}
                </span>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ring-1 ring-inset ${style.cls}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {style.label}
                </span>
                <div className="flex-1" />
                <span className="text-xs tabular-nums">
                  <span className={c.pagado > 0 ? "font-semibold" : "text-muted-foreground"}>
                    {formatCLP(c.pagado)}
                  </span>
                  <span className="text-muted-foreground"> / {formatCLP(c.esperado)}</span>
                </span>
                {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t"
                  >
                    <CuotaActions
                      debtId={debt._id}
                      saldada={debt.saldada}
                      cuota={c}
                      onChange={onChange}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Summary({ cuotas }: { cuotas: { estado: Estado }[] }) {
  const counts = cuotas.reduce(
    (acc, c) => {
      acc[c.estado]++;
      return acc;
    },
    { pagada: 0, parcial: 0, pendiente: 0, saltada: 0 } as Record<Estado, number>
  );
  return (
    <div className="flex items-center gap-2 text-[10px]">
      {counts.pagada > 0 && <span className="text-emerald-700 dark:text-emerald-400">{counts.pagada} pagadas</span>}
      {counts.parcial > 0 && <span className="text-amber-700 dark:text-amber-400">{counts.parcial} parciales</span>}
      {counts.saltada > 0 && <span className="text-rose-700 dark:text-rose-400">{counts.saltada} no pagadas</span>}
    </div>
  );
}

function CuotaActions({
  debtId, saldada, cuota, onChange,
}: {
  debtId: string;
  saldada: boolean;
  cuota: { numero: number; esperado: number; pagado: number; pagosCuota: Debt["pagos"]; estado: Estado };
  onChange: () => void;
}) {
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const falta = Math.max(0, cuota.esperado - cuota.pagado);

  async function pay(montoFinal: number, notaFinal?: string) {
    setLoading(true);
    const ok = await apiCall(`/api/debts/pay?id=${debtId}`, {
      method: "POST",
      body: {
        monto: montoFinal,
        fecha,
        cuotaNumero: cuota.numero,
        notas: notaFinal,
      },
    });
    setLoading(false);
    if (ok) {
      setMonto(""); setNotas("");
      toast.success("Pago registrado");
      onChange();
    }
  }

  async function payCustom() {
    const m = parseMontoInput(monto);
    if (!m || m <= 0) { toast.error("Monto inválido"); return; }
    await pay(m, notas.trim() || undefined);
  }

  async function payFull() {
    if (falta <= 0) { toast.error("Esta cuota ya está cubierta"); return; }
    await pay(falta);
  }

  async function toggleSkip() {
    const isSaltada = cuota.estado === "saltada";
    setLoading(true);
    const ok = isSaltada
      ? await apiCall(`/api/debts/skip-cuota?id=${debtId}&cuotaNumero=${cuota.numero}`, { method: "DELETE" })
      : await apiCall(`/api/debts/skip-cuota?id=${debtId}`, {
          method: "POST",
          body: { cuotaNumero: cuota.numero },
        });
    setLoading(false);
    if (ok) {
      toast.success(isSaltada ? "Cuota desmarcada" : "Cuota marcada como no pagada");
      onChange();
    }
  }

  async function removePayment(pagoId: string) {
    const ok = await apiCall(`/api/debts/pay?id=${debtId}&pagoId=${pagoId}`, { method: "DELETE" });
    if (ok) {
      toast.success("Pago eliminado");
      onChange();
    }
  }

  return (
    <div className="bg-muted/20 px-3 py-3 space-y-3">
      {/* Quick info */}
      <div className="text-xs text-muted-foreground">
        {cuota.estado === "saltada" ? (
          <span>Marcada como no pagada. Podés desmarcarla abajo.</span>
        ) : falta > 0 ? (
          <span>Faltan <span className="font-semibold text-foreground tabular-nums">{formatCLP(falta)}</span> para cubrir esta cuota.</span>
        ) : (
          <span>Cuota cubierta. Podés registrar pagos extra (queda como sobre-abono en esta cuota).</span>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {falta > 0 && cuota.estado !== "saltada" && !saldada && (
          <button
            onClick={payFull}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50 transition"
          >
            <Check className="h-3 w-3" />
            Pagar completa ({formatCLP(falta)})
          </button>
        )}
        <button
          onClick={toggleSkip}
          disabled={loading || saldada}
          className={
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition disabled:opacity-50 " +
            (cuota.estado === "saltada"
              ? "bg-muted text-foreground hover:bg-muted/80"
              : "bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20")
          }
        >
          <MinusCircle className="h-3 w-3" />
          {cuota.estado === "saltada" ? "Desmarcar" : "Marcar no pagada"}
        </button>
      </div>

      {/* Custom payment form */}
      {!saldada && cuota.estado !== "saltada" && (
        <div className="flex flex-wrap gap-2 pt-1">
          <MoneyInput
            value={monto}
            onValueChange={setMonto}
            onKeyDown={(e) => e.key === "Enter" && payCustom()}
            placeholder="Pago parcial"
            className="flex-1 min-w-[100px] h-8 rounded-md border bg-background px-2 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
          <input
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && payCustom()}
            placeholder="Nota"
            className="flex-1 min-w-[100px] h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
          <button
            onClick={payCustom}
            disabled={loading}
            className="h-8 px-2.5 rounded-md bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1 transition shrink-0"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Abonar
          </button>
        </div>
      )}

      {/* Payments for this cuota */}
      {cuota.pagosCuota.length > 0 && (
        <div className="space-y-1 pt-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Pagos a esta cuota
          </div>
          {cuota.pagosCuota.map((p) => (
            <div key={p._id} className="flex items-center justify-between gap-2 py-1 px-2 rounded bg-card text-xs">
              <span className="text-muted-foreground tabular-nums shrink-0">
                {new Date(p.fecha).toLocaleDateString("es-CL", {
                  day: "2-digit", month: "short", year: "2-digit",
                })}
              </span>
              <span className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                −{formatCLP(p.monto)}
              </span>
              {p.notas && <span className="text-muted-foreground italic truncate flex-1">{p.notas}</span>}
              <button
                onClick={() => removePayment(p._id)}
                className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition shrink-0"
                aria-label="Eliminar pago"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
