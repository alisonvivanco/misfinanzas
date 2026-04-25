"use client";
import { useState } from "react";
import { Plus, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCLP } from "@/lib/utils";
import { TableShell, DeleteBtn, Row } from "./table-shell";
import { apiCall, parseMonto } from "./api-call";
import type { Income } from "./types";

export function IncomesTable({
  items, mes, anio, onChange,
}: { items: Income[]; mes: number; anio: number; onChange: () => void }) {
  const [fuente, setFuente] = useState("");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const total = items.reduce((s, i) => s + i.monto, 0);

  async function add() {
    const m = parseMonto(monto);
    if (!fuente.trim()) { toast.error("Falta la fuente"); return; }
    if (!m || m <= 0) { toast.error("Monto inválido"); return; }
    setLoading(true);
    const ok = await apiCall("/api/income", {
      method: "POST",
      body: { fuente: fuente.trim(), monto: m, mes, anio },
    });
    setLoading(false);
    if (ok) {
      setFuente(""); setMonto("");
      toast.success("Ingreso agregado");
      onChange();
    }
  }

  async function remove(id: string) {
    const ok = await apiCall(`/api/income?id=${id}`, { method: "DELETE" });
    if (ok) onChange();
  }

  return (
    <TableShell
      title="Ingresos"
      Icon={TrendingUp}
      iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      total={formatCLP(total)}
      headers={["Fuente", "Monto", ""]}
      rowCount={items.length}
      emptyEmoji="💰"
      emptyMsg="Aún no registraste ingresos"
      emptyHint="Agregá tu sueldo o cualquier ingreso del mes"
      addRow={
        <div className="flex gap-2">
          <input
            value={fuente}
            onChange={(e) => setFuente(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Fuente (ej: Trabajo)"
            className="flex-1 h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
          <input
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Monto"
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
      {items.map((i) => (
        <Row key={i._id}>
          <td className="px-4 py-2.5 font-medium">{i.fuente}</td>
          <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
            {formatCLP(i.monto)}
          </td>
          <td className="px-4 py-2.5 text-right">
            <DeleteBtn onClick={() => remove(i._id)} />
          </td>
        </Row>
      ))}
    </TableShell>
  );
}
