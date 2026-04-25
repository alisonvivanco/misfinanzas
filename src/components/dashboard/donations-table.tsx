"use client";
import { useState } from "react";
import { Plus, Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCLP } from "@/lib/utils";
import { TableShell, DeleteBtn, Row } from "./table-shell";
import { apiCall, parseMonto } from "./api-call";
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
    const m = parseMonto(monto);
    if (!descripcion.trim()) { toast.error("Falta la descripción"); return; }
    if (!m || m <= 0) { toast.error("Monto inválido"); return; }
    setLoading(true);
    const ok = await apiCall("/api/donations", {
      method: "POST",
      body: { descripcion: descripcion.trim(), monto: m, fecha, mes, anio },
    });
    setLoading(false);
    if (ok) {
      setDescripcion(""); setMonto("");
      toast.success("Donación agregada");
      onChange();
    }
  }

  async function remove(id: string) {
    const ok = await apiCall(`/api/donations?id=${id}`, { method: "DELETE" });
    if (ok) onChange();
  }

  return (
    <TableShell
      title="Donaciones"
      Icon={Heart}
      iconClass="bg-pink-500/10 text-pink-600 dark:text-pink-400"
      total={formatCLP(total)}
      headers={["Descripción", "Monto", "Fecha", ""]}
      rowCount={items.length}
      emptyEmoji="❤️"
      emptyMsg="Sin donaciones este mes"
      emptyHint="Causas que apoyaste"
      addRow={
        <div className="space-y-2">
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Ej: Incendios"
            className="w-full h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
          <div className="flex gap-2">
            <input
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Monto"
              inputMode="numeric"
              className="flex-1 h-9 rounded-lg border bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="h-9 rounded-lg border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring transition shrink-0"
            />
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={add}
              disabled={loading}
              className="h-9 px-4 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-medium hover:shadow-md hover:shadow-pink-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all shrink-0"
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
          <td className="px-4 py-2.5 font-medium">{i.descripcion}</td>
          <td className="px-4 py-2.5 text-right tabular-nums">{formatCLP(i.monto)}</td>
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
