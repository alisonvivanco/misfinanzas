"use client";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCLP } from "@/lib/utils";
import { CATEGORIAS_GASTO, CATEGORIA_TIPO_DEFAULT, TIPO_LABEL } from "@/lib/categorias";
import { TableShell, DeleteBtn } from "./table-shell";
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
      total={formatCLP(total)}
      headers={["Categoría", "Monto", "Tipo", "Fecha", ""]}
      rowCount={items.length}
      addRow={
        <div className="flex flex-wrap gap-2">
          <select
            value={categoria}
            onChange={(e) => onCategoriaChange(e.target.value)}
            className="h-8 rounded border bg-background px-2 text-sm flex-1 min-w-[140px]"
          >
            {CATEGORIAS_GASTO.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Monto"
            inputMode="numeric"
            className="w-28 h-8 rounded border bg-background px-2 text-sm text-right"
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Bucket)}
            className="h-8 rounded border bg-background px-2 text-xs"
          >
            <option value="necesidades">Necesidades</option>
            <option value="deseos">Deseos</option>
            <option value="ahorros">Ahorros</option>
          </select>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="h-8 rounded border bg-background px-2 text-xs"
          />
          <button
            onClick={add}
            disabled={loading}
            className="h-8 px-3 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Agregar
          </button>
        </div>
      }
    >
      {items.map((i) => (
        <tr key={i._id} className="border-t">
          <td className="px-3 py-2">{i.categoria}</td>
          <td className="px-3 py-2 text-right">{formatCLP(i.monto)}</td>
          <td className="px-3 py-2 text-right text-xs text-muted-foreground">{TIPO_LABEL[i.tipo]}</td>
          <td className="px-3 py-2 text-right text-xs text-muted-foreground">
            {i.fecha ? new Date(i.fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short" }) : "—"}
          </td>
          <td className="px-3 py-2 text-right"><DeleteBtn onClick={() => remove(i._id)} /></td>
        </tr>
      ))}
    </TableShell>
  );
}
