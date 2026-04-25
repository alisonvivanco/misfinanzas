import "server-only";

/**
 * Server-only helper. ADMIN_EMAILS is NOT a NEXT_PUBLIC_ var so it would be
 * `undefined` on the client anyway — but this module is gated to prevent the
 * function from ever being imported from a client component (would silently
 * always return false).
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS || "";
  const list = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
