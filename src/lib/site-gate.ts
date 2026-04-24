// Edge-compatible site-wide password gate.
// Used by middleware to lock the entire app behind a shared password.
// Reads SITE_PASSWORD from env; falls back to "Deuditas!" for the
// initial soft-launch so the gate works out of the box on Vercel.
// Override by setting SITE_PASSWORD in the deployment environment.

export const GATE_COOKIE = "mf_site_gate";
export const GATE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const FALLBACK_PASSWORD = "Deuditas!";

export function getSitePassword(): string {
  return process.env.SITE_PASSWORD?.trim() || FALLBACK_PASSWORD;
}

export async function gateTokenFor(password: string): Promise<string> {
  const data = new TextEncoder().encode(`mf-site-gate:v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidGateToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await gateTokenFor(getSitePassword());
  return constantTimeEqual(token, expected);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
