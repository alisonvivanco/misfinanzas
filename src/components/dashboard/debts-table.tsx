"use client";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { formatCLP } from "@/lib/utils";
import { TableShell, DeleteBtn } from "./table-shell";
import type { Debt } from "./types";

export function DebtsTable({
  items, onChange,
}: { items: Debt[]; onChange: () => void }) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const totalPagado = items.reduce((s, i) => s + i.pagado, 0);

  async function add() {
    const m = parseInt(monto.replace(/\D/g, ""), 10);
    if (!descripcion.trim() || !m || m <= 0) return;
    setLoading(true);
    await fetch("/api/debts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion: descripcion.trim(), monto: m }),
    });
    setDescripcion(""); setMonto("");
    setLoading(false);
    onChange();
  }

  async function updatePagado(id: string, v: string, monto: number) {
    const m = parseInt(v.replace(/\D/g, ""), 10) || 0;
    const saldada = m >= monto;
    await fetch(`/api/debts?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pagado: m, saldada }),
    });
    onChange();
  }

  async function toggleSaldada(id: string, current: boolean, monto: number) {
    await fetch(`/api/debts?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ saldada: !current, ...((!current) ? { pagado: monto } : {}) }),
    });
    onChange();
  }

  async function remove(id: string) {
    await fetch(`/api/debts?id=${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <TableShell
      title="Deudas"
      total={formatCLP(totalPagado)}
      headers=  {["✓", "Deuda", "Monto", "Pagado", "Pendiente", ""]}
      rowCount={items.length}
      addRow={
        <div className="flex gap-2">
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Auto"
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
      {items.map((i) => {
        const pendiente = Math.max(i.monto - i.pagado, 0);
        const cls = i.saldada ? "line-through text-muted-foreground" : "";
        return (
          <tr key={i._id} className="border-t">
            <td className="px-3 py-2 text-center">
              <input
                type="checkbox"
                checked={i.saldada}
                onChange={() => toggleSaldada(i._id, i.saldada, i.monto)}
                className="rounded"
              />
            </td>
            <td className={"px-3 py-2 " + cls}>{i.descripcion}</td>
            <td className={"px-3 py-2 text-right " + cls}>{formatCLP(i.monto)}</td>
            <td className="px-3 py-2 text-right">
              <input
                defaultValue={i.pagado}
                onBlur={(e) => {
                  if (Number(e.target.value) !== i.pagado) updatePagado(i._id, e.target.value, i.monto);
                }}
                inputMode="numeric"
                disabled={i.saldada}
                className="w-24 h-7 rounded border bg-background px-2 text-sm text-right disabled:opacity-50"
              />
            </td>
            <td className={"px-3 py-2 text-right text-xs " + (cls || "text-muted-foreground")}>{formatCLP(pendiente)}</td>
            <td className="px-3 py-2 text-right"><DeleteBtn onClick={() => remove(i._id)} /></td>
          </tr>
        );
      })}
    </TableShell>
  );
}
