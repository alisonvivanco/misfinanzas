"use client";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { formatCLP } from "@/lib/utils";
import { TableShell, DeleteBtn } from "./table-shell";
import type { Income } from "./types";

export function IncomesTable({
  items, mes, anio, onChange,
}: { items: Income[]; mes: number; anio: number; onChange: () => void }) {
  const [fuente, setFuente] = useState("");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const total = items.reduce((s, i) => s + i.monto, 0);

  async function add() {
    const m = parseInt(monto.replace(/\D/g, ""), 10);
    if (!fuente.trim() || !m || m <= 0) return;
    setLoading(true);
    await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fuente: fuente.trim(), monto: m, mes, anio }),
    });
    setFuente(""); setMonto("");
    setLoading(false);
    onChange();
  }

  async function remove(id: string) {
    await fetch(`/api/income?id=${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <TableShell
      title="Ingresos"
      total={formatCLP(total)}
      headers={["Fuente", "Monto", ""]}
      rowCount={items.length}
      addRow={
        <div className="flex gap-2">
          <input
            value={fuente}
            onChange={(e) => setFuente(e.target.value)}
            placeholder="Fuente (ej: Trabajo)"
            className="flex-1 h-8 rounded border bg-background px-2 text-sm"
          />
          <input
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Monto"
            inputMode="numeric"
            className="w-28 h-8 rounded border bg-background px-2 text-sm text-right"
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
          <td className="px-3 py-2">{i.fuente}</td>
          <td className="px-3 py-2 text-right text-income font-medium">{formatCLP(i.monto)}</td>
          <td className="px-3 py-2 text-right"><DeleteBtn onClick={() => remove(i._id)} /></td>
        </tr>
      ))}
    </TableShell>
  );
}
