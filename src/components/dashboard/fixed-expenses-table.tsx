"use client";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { formatCLP } from "@/lib/utils";
import { TIPO_LABEL } from "@/lib/categorias";
import { TableShell, DeleteBtn } from "./table-shell";
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
    const m = parseInt(monto.replace(/\D/g, ""), 10);
    if (!descripcion.trim() || !m || m <= 0) return;
    setLoading(true);
    await fetch("/api/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion: descripcion.trim(), monto: m, tipo }),
    });
    setDescripcion(""); setMonto("");
    setLoading(false);
    onChange();
  }

  async function remove(id: string) {
    await fetch(`/api/recurring?id=${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <TableShell
      title="Gastos fijos"
      total={formatCLP(total)}
      headers={["Descripción", "Monto", "Tipo", ""]}
      rowCount={items.length}
      addRow={
        <div className="flex gap-2">
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Arriendo"
            className="flex-1 h-8 rounded border bg-background px-2 text-sm"
          />
          <input
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Monto"
            inputMode="numeric"
            className="w-24 h-8 rounded border bg-background px-2 text-sm text-right"
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
          <td className="px-3 py-2">{i.descripcion}</td>
          <td className="px-3 py-2 text-right">{formatCLP(i.monto)}</td>
          <td className="px-3 py-2 text-right text-xs text-muted-foreground">{TIPO_LABEL[i.tipo]}</td>
          <td className="px-3 py-2 text-right"><DeleteBtn onClick={() => remove(i._id)} /></td>
        </tr>
      ))}
    </TableShell>
  );
}
