"use client";
import { useState } from "react";
import { Plus, Loader2, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCLP } from "@/lib/utils";
import { TableShell, DeleteBtn, Row } from "./table-shell";
import { apiCall, parseMonto } from "./api-call";
import type { Saving } from "./types";

export function SavingsTable({
  items, onChange,
}: { items: Saving[]; onChange: () => void }) {
  const [descripcion, setDescripcion] = useState("");
  const [meta, setMeta] = useState("");
  const [loading, setLoading] = useState(false);
  const total = items.reduce((s, i) => s + i.montoAhorrado, 0);

  async function add() {
    const m = parseMonto(meta);
    if (!descripcion.trim()) { toast.error("Falta la descripción"); return; }
    if (!m || m <= 0) { toast.error("Meta inválida"); return; }
    setLoading(true);
    const ok = await apiCall("/api/savings", {
      method: "POST",
      body: { descripcion: descripcion.trim(), meta: m },
    });
    setLoading(false);
    if (ok) {
      setDescripcion(""); setMeta("");
      toast.success("Meta creada");
      onChange();
    }
  }

  async function updateAhorrado(id: string, v: string, current: number) {
    const m = parseMonto(v);
    const safe = isNaN(m) ? 0 : m;
    if (safe === current) return;
    const ok = await apiCall(`/api/savings?id=${id}`, {
      method: "PATCH",
      body: { montoAhorrado: safe },
    });
    if (ok) onChange();
  }

  async function remove(id: string) {
    const ok = await apiCall(`/api/savings?id=${id}`, { method: "DELETE" });
    if (ok) onChange();
  }

  return (
    <TableShell
      title="Ahorros"
      Icon={PiggyBank}
      iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      total={formatCLP(total)}
      totalLabel="Ahorrado"
      headers={["Meta", "Progreso", ""]}
      rowCount={items.length}
      emptyEmoji="🎯"
      emptyMsg="Sin metas de ahorro"
      emptyHint="Vacaciones, emergencia, casa…"
      addRow={
        <div className="flex gap-2">
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Ej: Vacaciones"
            className="flex-1 h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
          <input
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Meta"
            inputMode="numeric"
            className="w-28 h-9 rounded-lg border bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={add}
            disabled={loading}
            className="h-9 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium hover:shadow-md hover:shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Agregar
          </motion.button>
        </div>
      }
    >
      {items.map((i) => {
        const pct = i.meta > 0 ? Math.min(100, (i.montoAhorrado / i.meta) * 100) : 0;
        const done = i.montoAhorrado >= i.meta && i.meta > 0;
        return (
          <Row key={i._id}>
            <td className="px-4 py-3" colSpan={2}>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium truncate">{i.descripcion}</span>
                  {done && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">¡Cumplida!</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    key={i.montoAhorrado}
                    defaultValue={i.montoAhorrado}
                    onBlur={(e) => updateAhorrado(i._id, e.target.value, i.montoAhorrado)}
                    inputMode="numeric"
                    className="w-24 h-7 rounded-md border bg-background px-2 text-xs text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring transition"
                  />
                  <span className="text-xs text-muted-foreground tabular-nums">/ {formatCLP(i.meta)}</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">{pct.toFixed(0)}%</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {done ? "" : `Faltan ${formatCLP(Math.max(i.meta - i.montoAhorrado, 0))}`}
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
