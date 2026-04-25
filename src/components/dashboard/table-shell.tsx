"use client";
import { ReactNode } from "react";
import { Trash2 } from "lucide-react";

export function TableShell({
  title,
  total,
  headers,
  children,
  addRow,
  emptyMsg = "Sin registros",
  rowCount,
}: {
  title: string;
  total?: string;
  headers: string[];
  children: ReactNode;
  addRow?: ReactNode;
  emptyMsg?: string;
  rowCount: number;
}) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b flex items-center justify-between bg-muted/30">
        <h3 className="font-semibold text-sm uppercase tracking-wide">{title}</h3>
        {total !== undefined && <span className="text-sm font-semibold">{total}</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/10">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className={"px-3 py-2 " + (i === 0 ? "text-left" : "text-right") + (i === headers.length - 1 ? " w-10" : "")}>
                  {i === headers.length - 1 && h === "" ? "" : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowCount === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-3 py-6 text-center text-muted-foreground text-xs">
                  {emptyMsg}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
      {addRow && <div className="border-t bg-muted/10 px-3 py-2">{addRow}</div>}
    </div>
  );
}

export function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-muted-foreground hover:text-destructive transition p-1"
      aria-label="Eliminar"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
