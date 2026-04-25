import type { Bucket } from "./types";

const STYLES: Record<Bucket, { bg: string; text: string; ring: string; label: string }> = {
  necesidades: {
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    ring: "ring-blue-500/20",
    label: "Necesidad",
  },
  deseos: {
    bg: "bg-pink-500/10",
    text: "text-pink-700 dark:text-pink-400",
    ring: "ring-pink-500/20",
    label: "Deseo",
  },
  ahorros: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
    label: "Ahorro",
  },
};

export function BucketBadge({ tipo, size = "default" }: { tipo: Bucket; size?: "default" | "sm" }) {
  const s = STYLES[tipo];
  const px = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ring-1 ring-inset ${px} ${s.bg} ${s.text} ${s.ring}`}
    >
      {s.label}
    </span>
  );
}

export function bucketColor(tipo: Bucket): string {
  return tipo === "necesidades" ? "#3b82f6" : tipo === "deseos" ? "#ec4899" : "#10b981";
}
