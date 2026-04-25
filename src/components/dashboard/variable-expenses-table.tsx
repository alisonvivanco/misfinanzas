"use client";
import { useMemo, useState } from "react";
import { Plus, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCLP } from "@/lib/utils";
import { CATEGORIAS_GASTO, CATEGORIA_TIPO_DEFAULT } from "@/lib/categorias";
import { TableShell, DeleteBtn, Row } from "./table-shell";
import { BucketBadge } from "./bucket-badge";
import { apiCall } from "./api-call";
import { MoneyInput, parseMontoInput } from "./money-input";
import type { Bucket, Expense } from "./types";

export function VariableExpensesTable({
  items, mes, anio, onChange,
}: { items: Expense[]; mes: number; anio: number; onChange: () => void }) {
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_GASTO[0]);
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState<Bucket>(CATEGORIA_TIPO_DEFAULT[CATEGORIAS_GASTO[0]]);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const total = items.reduce((s, i) => s + i.monto, 0);

  // Sugerencias para autocompletar: las predefinidas + categorías que el user
  // ya creó (custom). Sin duplicados, ordenadas alfabéticamente.
  const suggestions = useMemo(() => {
    const set = new Set<string>([...CATEGORIAS_GASTO]);
    for (const it of items) if (it.categoria) set.add(it.categoria);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [items]);

  function onCategoriaChange(c: string) {
    setCategoria(c);
    if (c in CATEGORIA_TIPO_DEFAULT) {
      setTipo(CATEGORIA_TIPO_DEFAULT[c as keyof typeof CATEGORIA_TIPO_DEFAULT]);
    }
  }

  async function add() {
    const m = parseMontoInput(monto);
    if (!categoria.trim()) { toast.error("Falta la categoría"); return; }
    if (!m || m <= 0) { toast.error("Monto inválido"); return; }
    setLoading(true);
    const ok = await apiCall("/api/expenses", {
      method: "POST",
      body: {
        categoria: categoria.trim(),
        descripcion: descripcion.trim() || undefined,
        monto: m,
        tipo,
        fecha,
        mes,
        anio,
      },
    });
    setLoading(false);
    if (ok) {
      setDescripcion("");
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
        <div className="space-y-2">
          {/* Fila 1: categoría + descripción */}
          <div className="flex flex-wrap gap-2">
            <input
              list="categorias-list"
              value={categoria}
              onChange={(e) => onCategoriaChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Categoría (escribe o elige)"
              className="flex-1 min-w-[160px] h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
            <datalist id="categorias-list">
              {suggestions.map((c) => <option key={c} value={c} />)}
            </datalist>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Descripción (opcional)"
              className="flex-1 min-w-[160px] h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              maxLength={200}
            />
          </div>
          {/* Fila 2: monto + tipo + fecha + agregar */}
          <div className="flex flex-wrap gap-2">
            <MoneyInput
              value={monto}
              onValueChange={setMonto}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Monto"
              className="flex-1 min-w-[120px] h-9 rounded-lg border bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Bucket)}
              className="select-styled h-9 rounded-lg border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring transition"
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
              className="h-9 px-4 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-medium hover:shadow-md hover:shadow-rose-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all shrink-0"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Agregar
            </motion.button>
          </div>
        </div>
      }
    >
      {items.map((i) => (
        <Row key={i._id}>
          <td className="px-4 py-2.5">
            <div className="font-medium">{i.categoria}</div>
            {i.descripcion && (
              <div className="text-xs text-muted-foreground mt-0.5">{i.descripcion}</div>
            )}
          </td>
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
