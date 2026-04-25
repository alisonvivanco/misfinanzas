"use client";
import { useState } from "react";
import { Plus, Loader2, CreditCard, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatCLP } from "@/lib/utils";
import { TableShell, DeleteBtn, Row } from "./table-shell";
import { apiCall } from "./api-call";
import { MoneyInput, parseMontoInput } from "./money-input";
import type { Debt } from "./types";

export function DebtsTable({
  items, onChange,
}: { items: Debt[]; onChange: () => void }) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [cuotas, setCuotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const totalPagado = items.reduce((s, i) => s + i.pagado, 0);

  async function add() {
    const m = parseMontoInput(monto);
    if (!descripcion.trim()) { toast.error("Falta la descripción"); return; }
    if (!m || m <= 0) { toast.error("Monto inválido"); return; }
    const c = parseInt(cuotas, 10);
    setLoading(true);
    const ok = await apiCall("/api/debts", {
      method: "POST",
      body: {
        descripcion: descripcion.trim(),
        monto: m,
        ...(Number.isFinite(c) && c > 0 ? { cuotasTotales: c } : {}),
      },
    });
    setLoading(false);
    if (ok) {
      setDescripcion(""); setMonto(""); setCuotas("");
      toast.success("Deuda agregada");
      onChange();
    }
  }

  async function remove(id: string) {
    const ok = await apiCall(`/api/debts?id=${id}`, { method: "DELETE" });
    if (ok) onChange();
  }

  async function toggleSaldada(id: string, current: boolean, monto: number) {
    const ok = await apiCall(`/api/debts?id=${id}`, {
      method: "PATCH",
      body: { saldada: !current, ...(!current ? { pagado: monto } : {}) },
    });
    if (ok) onChange();
  }

  return (
    <TableShell
      title="Deudas"
      Icon={CreditCard}
      iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      total={formatCLP(totalPagado)}
      totalLabel="Pagado"
      headers={["Deuda", "Progreso", ""]}
      rowCount={items.length}
      emptyEmoji="💳"
      emptyMsg="Sin deudas registradas"
      emptyHint="Crédito de auto, tarjeta, lo que sea…"
      addRow={
        <div className="space-y-2">
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Ej: Auto"
            className="w-full h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
          <div className="flex gap-2">
            <MoneyInput
              value={monto}
              onValueChange={setMonto}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Monto total"
              className="flex-1 h-9 rounded-lg border bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
            <input
              value={cuotas}
              onChange={(e) => setCuotas(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Cuotas"
              inputMode="numeric"
              className="w-20 h-9 rounded-lg border bg-background px-3 text-sm text-right focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={add}
              disabled={loading}
              className="h-9 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium hover:shadow-md hover:shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all shrink-0"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Agregar
            </motion.button>
          </div>
        </div>
      }
    >
      {items.map((i) => {
        const pct = i.monto > 0 ? Math.min(100, (i.pagado / i.monto) * 100) : 0;
        const expanded = expandedId === i._id;
        return (
          <DebtRow
            key={i._id}
            debt={i}
            pct={pct}
            expanded={expanded}
            onToggle={() => setExpandedId(expanded ? null : i._id)}
            onChange={onChange}
            onRemove={() => remove(i._id)}
            onToggleSaldada={() => toggleSaldada(i._id, i.saldada, i.monto)}
          />
        );
      })}
    </TableShell>
  );
}

function DebtRow({
  debt: i, pct, expanded, onToggle, onChange, onRemove, onToggleSaldada,
}: {
  debt: Debt;
  pct: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: () => void;
  onRemove: () => void;
  onToggleSaldada: () => void;
}) {
  const cls = i.saldada ? "line-through text-muted-foreground" : "";
  const cuotasPagadas = i.pagos?.length ?? 0;
  return (
    <>
      <Row>
        <td className="px-4 py-3" colSpan={2}>
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={onToggle}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-muted transition shrink-0"
                aria-label={expanded ? "Cerrar" : "Ver pagos"}
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              <input
                type="checkbox"
                checked={i.saldada}
                onChange={onToggleSaldada}
                className="rounded border-input accent-emerald-500"
              />
              <span className={"font-medium truncate " + cls}>{i.descripcion}</span>
              {i.saldada && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                  Saldada
                </span>
              )}
              {i.cuotasTotales && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium shrink-0">
                  {cuotasPagadas} / {i.cuotasTotales} cuotas
                </span>
              )}
            </div>
            <div className={"text-xs tabular-nums shrink-0 " + (cls || "text-muted-foreground")}>
              {formatCLP(i.pagado)} / {formatCLP(i.monto)}
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">{pct.toFixed(0)}% pagado</span>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {i.saldada ? "" : `Quedan ${formatCLP(Math.max(i.monto - i.pagado, 0))}`}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-right align-top">
          <DeleteBtn onClick={onRemove} />
        </td>
      </Row>
      {expanded && (
        <tr>
          <td colSpan={3} className="bg-muted/20 px-4 py-3">
            <PaymentsPanel debt={i} onChange={onChange} />
          </td>
        </tr>
      )}
    </>
  );
}

function PaymentsPanel({ debt, onChange }: { debt: Debt; onChange: () => void }) {
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);

  async function add() {
    const m = parseMontoInput(monto);
    if (!m || m <= 0) { toast.error("Monto inválido"); return; }
    if (debt.saldada) { toast.error("La deuda ya está saldada"); return; }
    setLoading(true);
    const ok = await apiCall(`/api/debts/pay?id=${debt._id}`, {
      method: "POST",
      body: { monto: m, fecha, notas: notas.trim() || undefined },
    });
    setLoading(false);
    if (ok) {
      setMonto(""); setNotas("");
      toast.success("Abono registrado");
      onChange();
    }
  }

  async function removePayment(pagoId: string) {
    const ok = await apiCall(`/api/debts/pay?id=${debt._id}&pagoId=${pagoId}`, {
      method: "DELETE",
    });
    if (ok) {
      toast.success("Abono eliminado");
      onChange();
    }
  }

  const sorted = [...(debt.pagos || [])].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Registrar abono
      </div>
      <div className="flex flex-wrap gap-2">
        <MoneyInput
          value={monto}
          onValueChange={setMonto}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Monto"
          disabled={debt.saldada}
          className="flex-1 min-w-[100px] h-8 rounded-md border bg-background px-2 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          disabled={debt.saldada}
          className="h-8 rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
        />
        <input
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Nota (opcional)"
          disabled={debt.saldada}
          className="flex-1 min-w-[120px] h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50"
        />
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={add}
          disabled={loading || debt.saldada}
          className="h-8 px-3 rounded-md bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1 transition shrink-0"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Abonar
        </motion.button>
      </div>

      {sorted.length > 0 && (
        <>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">
            Historial de abonos ({sorted.length})
          </div>
          <div className="space-y-1 max-h-44 overflow-auto scrollbar-thin">
            <AnimatePresence>
              {sorted.map((p) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md bg-card text-xs"
                >
                  <span className="text-muted-foreground tabular-nums shrink-0">
                    {new Date(p.fecha).toLocaleDateString("es-CL", {
                      day: "2-digit", month: "short", year: "2-digit",
                    })}
                  </span>
                  <span className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                    −{formatCLP(p.monto)}
                  </span>
                  {p.notas && (
                    <span className="text-muted-foreground italic truncate flex-1">{p.notas}</span>
                  )}
                  <button
                    onClick={() => removePayment(p._id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition shrink-0"
                    aria-label="Eliminar abono"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
