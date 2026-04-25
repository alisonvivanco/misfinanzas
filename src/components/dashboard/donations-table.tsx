"use client";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { formatCLP } from "@/lib/utils";
import { TableShell, DeleteBtn } from "./table-shell";
import type { Donation } from "./types";

export function DonationsTable({
  items, mes, anio, onChange,
}: { items: Donation[]; mes: number; anio: number; onChange: () => void }) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const total = items.reduce((s, i) => s + i.monto, 0);

  async function add() {
    const m = parseInt(monto.replace(/\D/g, ""), 10);
    if (!descripcion.trim() || !m || m <= 0) return;
    setLoading(true);
    await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion: descripcion.trim(), monto: m, fecha, mes, anio }),
    });
    setDescripcion(""); setMonto("");
    setLoading(false);
    onChange();
  }

  async function remove(id: string) {
    await fetch(`/api/donations?id=${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <TableShell
      title="Donaciones"
      total={formatCLP(total)}
      headers={["Descripción", "Monto", "Fecha", ""]}
      rowCount={items.length}
      addRow={
        <div className="flex gap-2">
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Incendios"
            className="flex-1 h-8 rounded border bg-background px-2 text-sm"
          />
          <input
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Monto"
            inputMode="numeric"
            className="w-24 h-8 rounded border bg-background px-2 text-sm text-right"
          />
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
          <td className="px-3 py-2">{i.descripcion}</td>
          <td className="px-3 py-2 text-right">{formatCLP(i.monto)}</td>
          <td className="px-3 py-2 text-right text-xs text-muted-foreground">
            {i.fecha ? new Date(i.fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short" }) : "—"}
          </td>
          <td className="px-3 py-2 text-right"><DeleteBtn onClick={() => remove(i._id)} /></td>
        </tr>
      ))}
    </TableShell>
  );
}
