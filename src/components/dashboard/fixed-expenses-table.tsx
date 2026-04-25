"use client";
import { useState } from "react";
import { Plus, Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCLP } from "@/lib/utils";
import { TableShell, DeleteBtn, Row } from "./table-shell";
import { BucketBadge } from "./bucket-badge";
import { apiCall, parseMonto } from "./api-call";
import type { Bucket, Recurring } from "./types";

export function FixedExpensesTable({
  items, onChange,
}: { items: Recurring[]; onChange: () => void }) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState<Bucket>("necesidades");
  const [loading, setLoading] = useState(false);
  const total = items.reduce((s, i) => s + i.monto, 0);

  async function add() {
    const m = parseMonto(monto);
    if (!descripcion.trim()) { toast.error("Falta la descripción"); return; }
    if (!m || m <= 0) { toast.error("Monto inválido"); return; }
    setLoading(true);
    const ok = await apiCall("/api/recurring", {
      method: "POST",
      body: { descripcion: descripcion.trim(), monto: m, tipo },
    });
    setLoading(false);
    if (ok) {
      setDescripcion(""); setMonto("");
      toast.success("Gasto fijo agregado");
      onChange();
    }
  }

  async function remove(id: string) {
    const ok = await apiCall(`/api/recurring?id=${id}`, { method: "DELETE" });
    if (ok) onChange();
  }

  return (
    <TableShell
      title="Gastos fijos"
      Icon={Receipt}
      iconClass="bg-orange-500/10 text-orange-600 dark:text-orange-400"
      total={formatCLP(total)}
      headers={["Descripción", "Monto", "Tipo", ""]}
      rowCount={items.length}
      emptyEmoji="🏠"
      emptyMsg="No hay gastos fijos"
      emptyHint="Arriendo, Internet, Netflix, plan móvil…"
      addRow={
        <div className="flex flex-wrap gap-2">
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Ej: Arriendo"
            className="flex-1 min-w-[120px] h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
          <input
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Monto"
            inputMode="numeric"
            className="w-24 h-9 rounded-lg border bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Bucket)}
            className="h-9 rounded-lg border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring transition"
          >
            <option value="necesidades">Necesidad</option>
            <option value="deseos">Deseo</option>
            <option value="ahorros">Ahorro</option>
          </select>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={add}
            disabled={loading}
            className="h-9 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-medium hover:shadow-md hover:shadow-orange-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Agregar
          </motion.button>
        </div>
      }
    >
      {items.map((i) => (
        <Row key={i._id}>
          <td className="px-4 py-2.5 font-medium">{i.descripcion}</td>
          <td className="px-4 py-2.5 text-right tabular-nums">{formatCLP(i.monto)}</td>
          <td className="px-4 py-2.5 text-right"><BucketBadge tipo={i.tipo} /></td>
          <td className="px-4 py-2.5 text-right"><DeleteBtn onClick={() => remove(i._id)} /></td>
        </Row>
      ))}
    </TableShell>
  );
}
