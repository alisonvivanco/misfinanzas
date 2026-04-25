import Image from "next/image";
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
    <Image
      src="/logo.png"
      alt="AlisonVivanco.cl"
      width={px}
      height={px}
      priority
      className={cn("rounded-xl shrink-0", className)}
    />
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
