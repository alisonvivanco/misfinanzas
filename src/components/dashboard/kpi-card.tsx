import { cn } from "@/lib/utils";
import { formatCLP } from "@/lib/chile-tax";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "income" | "expense" | "savings" | "investment" | "debt" | "default";
  trend?: number;
  trendLabel?: string;
  format?: "clp" | "number" | "percent";
}

const TONE_STYLES = {
  income: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-600",
  expense: "from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-600",
  savings: "from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-600",
  investment: "from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-600",
  debt: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-600",
  default: "from-slate-500/5 to-slate-500/0 border-border text-foreground",
};

export function KPICard({
  label,
  value,
  icon: Icon,
  tone = "default",
  trend,
  trendLabel,
  format = "clp",
}: KPICardProps) {
  const formatted =
    format === "clp"
      ? formatCLP(value)
      : format === "percent"
      ? `${(value * 100).toFixed(1)}%`
      : value.toLocaleString("es-CL");

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-5 card-hover",
        TONE_STYLES[tone]
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="h-9 w-9 rounded-lg bg-card flex items-center justify-center shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend > 0
                ? "bg-income/10 text-income"
                : trend < 0
                ? "bg-expense/10 text-expense"
                : "bg-muted text-muted-foreground"
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold tabular-nums tracking-tight">{formatted}</div>
      {trendLabel && (
        <div className="text-xs text-muted-foreground mt-1">{trendLabel}</div>
      )}
    </div>
  );
}
