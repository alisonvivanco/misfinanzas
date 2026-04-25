import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: 28, text: "text-base" },
  md: { box: 36, text: "text-lg" },
  lg: { box: 44, text: "text-xl" },
  xl: { box: 56, text: "text-2xl" },
} as const;

export function LogoMark({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const px = SIZES[size].box;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="av-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
        <linearGradient id="av-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#av-grad)" />
      <rect width="64" height="64" rx="14" fill="url(#av-shine)" />
      <path
        d="M22.5 46 L29.5 18 H34.5 L41.5 46 H36.7 L35.4 40.5 H28.6 L27.3 46 H22.5 Z M29.6 36.3 H34.4 L32 26 L29.6 36.3 Z"
        fill="white"
      />
      <path
        d="M40 22 L46 22 L42 30 Z"
        fill="white"
        opacity="0.85"
      />
    </svg>
  );
}

export function Logo({
  size = "md",
  showWordmark = true,
  className,
}: {
  size?: keyof typeof SIZES;
  showWordmark?: boolean;
  className?: string;
}) {
  const text = SIZES[size].text;
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className={cn("font-bold tracking-tight", text)}>
          AlisonVivanco<span className="gradient-text">.cl</span>
        </span>
      )}
    </div>
  );
}
