"use client";
import { useState } from "react";
import { Plus, Loader2, PiggyBank, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatCLP } from "@/lib/utils";
import { TableShell, DeleteBtn, Row } from "./table-shell";
import { apiCall } from "./api-call";
import { MoneyInput, parseMontoInput } from "./money-input";
import type { Saving } from "./types";

export function SavingsTable({
  items, onChange,
}: { items: Saving[]; onChange: () => void }) {
  const [descripcion, setDescripcion] = useState("");
  const [meta, setMeta] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const total = items.reduce((s, i) => s + i.montoAhorrado, 0);

  async function add() {
    const m = parseMontoInput(meta);
    if (!descripcion.trim()) { toast.error("Falta la descripción"); return; }
    if (!m || m <= 0) { toast.error("Meta inválida"); return; }
    setLoading(true);
    const ok = await apiCall("/api/savings", {
      method: "POST",
      body: { descripcion: descripcion.trim(), meta: m },
    });
    setLoading(false);
    if (ok) {
      setDescripcion(""); setMeta("");
      toast.success("Meta creada");
      onChange();
    }
  }

  async function remove(id: string) {
    const ok = await apiCall(`/api/savings?id=${id}`, { method: "DELETE" });
    if (ok) onChange();
  }

  return (
    <TableShell
      title="Ahorros"
      Icon={PiggyBank}
      iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      total={formatCLP(total)}
      totalLabel="Ahorrado"
      headers={["Meta", "Progreso", ""]}
      rowCount={items.length}
      emptyEmoji="🎯"
      emptyMsg="Sin metas de ahorro"
      emptyHint="Vacaciones, emergencia, casa…"
      addRow={
        <div className="space-y-2">
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Ej: Vacaciones"
            className="w-full h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
          <div className="flex gap-2">
            <MoneyInput
              value={meta}
              onValueChange={setMeta}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Meta"
              className="flex-1 h-9 rounded-lg border bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={add}
              disabled={loading}
              className="h-9 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium hover:shadow-md hover:shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all shrink-0"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Agregar
            </motion.button>
          </div>
        </div>
      }
    >
      {items.map((i) => {
        const pct = i.meta > 0 ? Math.min(100, (i.montoAhorrado / i.meta) * 100) : 0;
        const done = i.montoAhorrado >= i.meta && i.meta > 0;
        const expanded = expandedId === i._id;
        return (
          <SavingRow
            key={i._id}
            saving={i}
            pct={pct}
            done={done}
            expanded={expanded}
            onToggle={() => setExpandedId(expanded ? null : i._id)}
            onChange={onChange}
            onRemove={() => remove(i._id)}
          />
        );
      })}
    </TableShell>
  );
}

function SavingRow({
  saving: i, pct, done, expanded, onToggle, onChange, onRemove,
}: {
  saving: Saving;
  pct: number;
  done: boolean;
  expanded: boolean;
  onToggle: () => void;
  onChange: () => void;
  onRemove: () => void;
}) {
  return (
    <>
      <Row>
        <td className="px-4 py-3" colSpan={2}>
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={onToggle}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-muted transition shrink-0"
                aria-label={expanded ? "Cerrar" : "Ver aportes"}
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              <span className="font-medium truncate">{i.descripcion}</span>
              {done && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                  ¡Cumplida!
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground tabular-nums shrink-0">
              {formatCLP(i.montoAhorrado)} / {formatCLP(i.meta)}
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">{pct.toFixed(0)}%</span>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {done ? "" : `Faltan ${formatCLP(Math.max(i.meta - i.montoAhorrado, 0))}`}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-right align-top">
          <DeleteBtn onClick={onRemove} />
        </td>
      </Row>
      {expanded && (
        <tr>
          <td colSpan={3} className="bg-muted/20 px-4 py-3">
            <ContributionsPanel saving={i} onChange={onChange} />
          </td>
        </tr>
      )}
    </>
  );
}

function ContributionsPanel({ saving, onChange }: { saving: Saving; onChange: () => void }) {
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);

  async function add() {
    const m = parseMontoInput(monto);
    if (!m || m <= 0) { toast.error("Monto inválido"); return; }
    setLoading(true);
    const ok = await apiCall(`/api/savings/contribute?id=${saving._id}`, {
      method: "POST",
      body: { monto: m, fecha, notas: notas.trim() || undefined },
    });
    setLoading(false);
    if (ok) {
      setMonto(""); setNotas("");
      toast.success("Aporte agregado");
      onChange();
    }
  }

  async function removeContribution(contribId: string) {
    const ok = await apiCall(`/api/savings/contribute?id=${saving._id}&contribId=${contribId}`, {
      method: "DELETE",
    });
    if (ok) {
      toast.success("Aporte eliminado");
      onChange();
    }
  }

  const sorted = [...(saving.contribuciones || [])].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Agregar aporte
      </div>
      <div className="flex flex-wrap gap-2">
        <MoneyInput
          value={monto}
          onValueChange={setMonto}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Monto"
          className="flex-1 min-w-[100px] h-8 rounded-md border bg-background px-2 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring transition"
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="h-8 rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring transition"
        />
        <input
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Nota (opcional)"
          className="flex-1 min-w-[120px] h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
        />
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={add}
          disabled={loading}
          className="h-8 px-3 rounded-md bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1 transition shrink-0"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Abonar
        </motion.button>
      </div>

      {sorted.length > 0 && (
        <>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">
            Historial ({sorted.length})
          </div>
          <div className="space-y-1 max-h-44 overflow-auto scrollbar-thin">
            <AnimatePresence>
              {sorted.map((c) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md bg-card text-xs"
                >
                  <span className="text-muted-foreground tabular-nums shrink-0">
                    {new Date(c.fecha).toLocaleDateString("es-CL", {
                      day: "2-digit", month: "short", year: "2-digit",
                    })}
                  </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    +{formatCLP(c.monto)}
                  </span>
                  {c.notas && (
                    <span className="text-muted-foreground italic truncate flex-1">{c.notas}</span>
                  )}
                  <button
                    onClick={() => removeContribution(c._id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition shrink-0"
                    aria-label="Eliminar aporte"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
