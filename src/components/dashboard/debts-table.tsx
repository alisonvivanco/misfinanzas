"use client";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCLP } from "@/lib/utils";
import { TableShell, DeleteBtn } from "./table-shell";
import { apiCall, parseMonto } from "./api-call";
import type { Debt } from "./types";

export function DebtsTable({
  items, onChange,
}: { items: Debt[]; onChange: () => void }) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const totalPagado = items.reduce((s, i) => s + i.pagado, 0);

  async function add() {
    const m = parseMonto(monto);
    if (!descripcion.trim()) { toast.error("Falta la descripción"); return; }
    if (!m || m <= 0) { toast.error("Monto inválido"); return; }
    setLoading(true);
    const ok = await apiCall("/api/debts", {
      method: "POST",
      body: { descripcion: descripcion.trim(), monto: m },
    });
    setLoading(false);
    if (ok) {
      setDescripcion(""); setMonto("");
      toast.success("Deuda agregada");
      onChange();
    }
  }

  async function updatePagado(id: string, v: string, monto: number, current: number) {
    const m = parseMonto(v);
    const safe = isNaN(m) ? 0 : m;
    if (safe === current) return;
    const saldada = safe >= monto;
    const ok = await apiCall(`/api/debts?id=${id}`, {
      method: "PATCH",
      body: { pagado: safe, saldada },
    });
    if (ok) onChange();
  }

  async function toggleSaldada(id: string, current: boolean, monto: number) {
    const ok = await apiCall(`/api/debts?id=${id}`, {
      method: "PATCH",
      body: { saldada: !current, ...((!current) ? { pagado: monto } : {}) },
    });
    if (ok) onChange();
  }

  async function remove(id: string) {
    const ok = await apiCall(`/api/debts?id=${id}`, { method: "DELETE" });
    if (ok) onChange();
  }

  return (
    <TableShell
      title="Deudas"
      total={formatCLP(totalPagado)}
      headers={["✓", "Deuda", "Monto", "Pagado", "Pendiente", ""]}
      rowCount={items.length}
      addRow={
        <div className="flex gap-2">
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Ej: Auto"
            className="flex-1 h-8 rounded border bg-background px-2 text-sm"
          />
          <input
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
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
                key={i.pagado}
                defaultValue={i.pagado}
                onBlur={(e) => updatePagado(i._id, e.target.value, i.monto, i.pagado)}
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
