"use client";
import { ReactNode } from "react";
import { Trash2, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  title: string;
  Icon?: LucideIcon;
  iconClass?: string; // tailwind classes for icon container
  total?: string;
  totalLabel?: string;
  headers: string[];
  children: ReactNode;
  addRow?: ReactNode;
  emptyMsg?: string;
  emptyHint?: string;
  emptyEmoji?: string;
  rowCount: number;
}

export function TableShell({
  title,
  Icon,
  iconClass = "bg-primary/10 text-primary",
  total,
  totalLabel = "Total",
  headers,
  children,
  addRow,
  emptyMsg = "Aún sin registros",
  emptyHint,
  emptyEmoji = "✨",
  rowCount,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="px-5 py-3.5 border-b flex items-center justify-between bg-gradient-to-r from-muted/40 via-card to-card">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${iconClass}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
          <h3 className="font-semibold text-sm tracking-tight">{title}</h3>
        </div>
        {total !== undefined && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">{totalLabel}</span>
            <span className="text-sm font-semibold tabular-nums">{total}</span>
          </div>
        )}
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="text-[11px] text-muted-foreground bg-muted/20 uppercase tracking-wider font-medium">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={
                    "px-4 py-2.5 " +
                    (i === 0 ? "text-left" : "text-right") +
                    (i === headers.length - 1 && h === "" ? " w-10" : "")
                  }
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rowCount === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-10 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl">{emptyEmoji}</div>
                      <div className="text-sm text-muted-foreground">{emptyMsg}</div>
                      {emptyHint && <div className="text-xs text-muted-foreground/70">{emptyHint}</div>}
                    </div>
                  </td>
                </tr>
              ) : (
                children
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {addRow && (
        <div className="border-t bg-muted/20 px-3 py-2.5">
          {addRow}
        </div>
      )}
    </motion.div>
  );
}

export function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      className="text-muted-foreground hover:text-destructive transition p-1.5 rounded-md hover:bg-destructive/10"
      aria-label="Eliminar"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </motion.button>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.18 }}
      className="border-t hover:bg-muted/30 transition-colors"
    >
      {children}
    </motion.tr>
  );
}
