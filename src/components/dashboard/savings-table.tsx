"use client";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { formatCLP } from "@/lib/utils";
import { TableShell, DeleteBtn } from "./table-shell";
import type { Saving } from "./types";

export function SavingsTable({
  items, onChange,
}: { items: Saving[]; onChange: () => void }) {
  const [descripcion, setDescripcion] = useState("");
  const [meta, setMeta] = useState("");
  const [loading, setLoading] = useState(false);
  const total = items.reduce((s, i) => s + i.montoAhorrado, 0);

  async function add() {
    const m = parseInt(meta.replace(/\D/g, ""), 10);
    if (!descripcion.trim() || !m || m <= 0) return;
    setLoading(true);
    await fetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion: descripcion.trim(), meta: m }),
    });
    setDescripcion(""); setMeta("");
    setLoading(false);
    onChange();
  }

  async function updateAhorrado(id: string, v: string) {
    const m = parseInt(v.replace(/\D/g, ""), 10) || 0;
    await fetch(`/api/savings?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montoAhorrado: m }),
    });
    onChange();
  }

  async function remove(id: string) {
    await fetch(`/api/savings?id=${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <TableShell
      title="Ahorros"
      total={formatCLP(total)}
      headers={["Meta", "Objetivo", "Ahorrado", "Falta", ""]}
      rowCount={items.length}
      addRow={
        <div className="flex gap-2">
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Vacaciones"
            className="flex-1 h-8 rounded border bg-background px-2 text-sm"
          />
          <input
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            placeholder="Meta"
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
      {items.map((i) => {
        const falta = Math.max(i.meta - i.montoAhorrado, 0);
        return (
          <tr key={i._id} className="border-t">
            <td className="px-3 py-2">{i.descripcion}</td>
            <td className="px-3 py-2 text-right">{formatCLP(i.meta)}</td>
            <td className="px-3 py-2 text-right">
              <input
                defaultValue={i.montoAhorrado}
                onBlur={(e) => {
                  if (Number(e.target.value) !== i.montoAhorrado) updateAhorrado(i._id, e.target.value);
                }}
                inputMode="numeric"
                className="w-24 h-7 rounded border bg-background px-2 text-sm text-right"
              />
            </td>
            <td className="px-3 py-2 text-right text-xs text-muted-foreground">{formatCLP(falta)}</td>
            <td className="px-3 py-2 text-right"><DeleteBtn onClick={() => remove(i._id)} /></td>
          </tr>
        );
      })}
    </TableShell>
  );
}
