import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: 28,
  md: 36,
  lg: 44,
  xl: 56,
} as const;

export function LogoMark({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const px = SIZES[size];
  return (
    <Image
      src="/logo.png"
      alt="MisFinanzas"
      width={px}
      height={px}
      priority
      className={cn("rounded-xl shrink-0", className)}
    />
  );
}

/** Backwards-compatible alias — only renders the mark, no wordmark text. */
export function Logo({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZES;
  /** Kept for backwards compat but ignored — wordmark removed. */
  showWordmark?: boolean;
  className?: string;
}) {
  return <LogoMark size={size} className={className} />;
}
