"use client";
import { useState } from "react";
import { Plus, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCLP } from "@/lib/utils";
import { CATEGORIAS_GASTO, CATEGORIA_TIPO_DEFAULT } from "@/lib/categorias";
import { TableShell, DeleteBtn, Row } from "./table-shell";
import { BucketBadge } from "./bucket-badge";
import { apiCall, parseMonto } from "./api-call";
import type { Bucket, Expense } from "./types";

export function VariableExpensesTable({
  items, mes, anio, onChange,
}: { items: Expense[]; mes: number; anio: number; onChange: () => void }) {
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_GASTO[0]);
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState<Bucket>(CATEGORIA_TIPO_DEFAULT[CATEGORIAS_GASTO[0]]);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const total = items.reduce((s, i) => s + i.monto, 0);

  function onCategoriaChange(c: string) {
    setCategoria(c);
    if (c in CATEGORIA_TIPO_DEFAULT) {
      setTipo(CATEGORIA_TIPO_DEFAULT[c as keyof typeof CATEGORIA_TIPO_DEFAULT]);
    }
  }

  async function add() {
    const m = parseMonto(monto);
    if (!categoria.trim()) { toast.error("Falta la categoría"); return; }
    if (!m || m <= 0) { toast.error("Monto inválido"); return; }
    setLoading(true);
    const ok = await apiCall("/api/expenses", {
      method: "POST",
      body: { categoria, monto: m, tipo, fecha, mes, anio },
    });
    setLoading(false);
    if (ok) {
      setMonto("");
      toast.success("Gasto agregado");
      onChange();
    }
  }

  async function remove(id: string) {
    const ok = await apiCall(`/api/expenses?id=${id}`, { method: "DELETE" });
    if (ok) onChange();
  }

  return (
    <TableShell
      title="Gastos variables"
      Icon={ShoppingBag}
      iconClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
      total={formatCLP(total)}
      headers={["Categoría", "Monto", "Tipo", "Fecha", ""]}
      rowCount={items.length}
      emptyEmoji="🛒"
      emptyMsg="Sin gastos variables este mes"
      emptyHint="Mercado, transporte, salidas…"
      addRow={
        <div className="flex flex-wrap gap-2">
          <select
            value={categoria}
            onChange={(e) => onCategoriaChange(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-sm flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-ring transition"
          >
            {CATEGORIAS_GASTO.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Monto"
            inputMode="numeric"
            className="w-28 h-9 rounded-lg border bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
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
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="h-9 rounded-lg border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={add}
            disabled={loading}
            className="h-9 px-4 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-medium hover:shadow-md hover:shadow-rose-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Agregar
          </motion.button>
        </div>
      }
    >
      {items.map((i) => (
        <Row key={i._id}>
          <td className="px-4 py-2.5 font-medium">{i.categoria}</td>
          <td className="px-4 py-2.5 text-right tabular-nums">{formatCLP(i.monto)}</td>
          <td className="px-4 py-2.5 text-right"><BucketBadge tipo={i.tipo} /></td>
          <td className="px-4 py-2.5 text-right text-xs text-muted-foreground tabular-nums">
            {i.fecha
              ? new Date(i.fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })
              : "—"}
          </td>
          <td className="px-4 py-2.5 text-right"><DeleteBtn onClick={() => remove(i._id)} /></td>
        </Row>
      ))}
    </TableShell>
  );
}
