"use client";
import { useState } from "react";
import { Plus, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCLP } from "@/lib/utils";
import { TableShell, DeleteBtn, Row } from "./table-shell";
import { apiCall, parseMonto } from "./api-call";
import type { Debt } from "./types";

export function DebtsTable({
  items, onChange,
}: { items: Debt[]; onChange: () => void }) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const totalPagado = items.reduce((s, i) => s + i.pagado, 0);

  async function add() {
    const m = parseMonto(monto);
    if (!descripcion.trim()) { toast.error("Falta la descripción"); return; }
    if (!m || m <= 0) { toast.error("Monto inválido"); return; }
    setLoading(true);
    const ok = await apiCall("/api/debts", {
      method: "POST",
      body: { descripcion: descripcion.trim(), monto: m },
    });
    setLoading(false);
    if (ok) {
      setDescripcion(""); setMonto("");
      toast.success("Deuda agregada");
      onChange();
    }
  }

  async function updatePagado(id: string, v: string, monto: number, current: number) {
    const m = parseMonto(v);
    const safe = isNaN(m) ? 0 : m;
    if (safe === current) return;
    const saldada = safe >= monto;
    const ok = await apiCall(`/api/debts?id=${id}`, {
      method: "PATCH",
      body: { pagado: safe, saldada },
    });
    if (ok) onChange();
  }

  async function toggleSaldada(id: string, current: boolean, monto: number) {
    const ok = await apiCall(`/api/debts?id=${id}`, {
      method: "PATCH",
      body: { saldada: !current, ...(!current ? { pagado: monto } : {}) },
    });
    if (ok) onChange();
  }

  async function remove(id: string) {
    const ok = await apiCall(`/api/debts?id=${id}`, { method: "DELETE" });
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
            <input
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Monto"
              inputMode="numeric"
              className="flex-1 h-9 rounded-lg border bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
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
        const cls = i.saldada ? "line-through text-muted-foreground" : "";
        return (
          <Row key={i._id}>
            <td className="px-4 py-3" colSpan={2}>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={i.saldada}
                    onChange={() => toggleSaldada(i._id, i.saldada, i.monto)}
                    className="rounded border-input accent-emerald-500"
                  />
                  <span className={"font-medium truncate " + cls}>{i.descripcion}</span>
                  {i.saldada && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                      Saldada
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    key={i.pagado}
                    defaultValue={i.pagado}
                    onBlur={(e) => updatePagado(i._id, e.target.value, i.monto, i.pagado)}
                    inputMode="numeric"
                    disabled={i.saldada}
                    className="w-24 h-7 rounded-md border bg-background px-2 text-xs text-right tabular-nums disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring transition"
                  />
                  <span className="text-xs text-muted-foreground tabular-nums">/ {formatCLP(i.monto)}</span>
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
              <DeleteBtn onClick={() => remove(i._id)} />
            </td>
          </Row>
        );
      })}
    </TableShell>
  );
}
