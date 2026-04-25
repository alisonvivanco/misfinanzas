"use client";
import { forwardRef } from "react";

/** Strips non-digits and returns the integer (or NaN if empty/invalid). */
export function parseMontoInput(v: string): number {
  const digits = (v ?? "").replace(/\D/g, "");
  if (!digits) return NaN;
  return parseInt(digits, 10);
}

/** Formats a digit string or number as Chilean thousand-separated (1.234.567). */
export function formatMontoInput(v: string | number): string {
  const digits = String(v ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CL");
}

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: string;
  onValueChange: (raw: string) => void;
}

/**
 * Numeric input that auto-inserts thousand separators ("." in es-CL) as the
 * user types. Stores the formatted string in `value`; use `parseMontoInput`
 * to extract the integer for API calls.
 */
export const MoneyInput = forwardRef<HTMLInputElement, Props>(function MoneyInput(
  { value, onValueChange, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(e) => onValueChange(formatMontoInput(e.target.value))}
      {...rest}
    />
  );
});
