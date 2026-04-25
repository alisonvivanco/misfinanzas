// Pure subscription helpers — safe for both server and client.
// Server-only utilities (admin email check) live in `subscription-server.ts`.

const FALLBACK_SUBSCRIBE_URL =
  "https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=50b7a4d225194f30a3a03b1e4c09bea9";
const FALLBACK_MANAGE_URL = "https://www.mercadopago.cl/subscriptions";

export const SUBSCRIBE_URL =
  process.env.NEXT_PUBLIC_SUBSCRIBE_URL || FALLBACK_SUBSCRIBE_URL;

export const MANAGE_SUBSCRIPTION_URL =
  process.env.NEXT_PUBLIC_MANAGE_SUBSCRIPTION_URL || FALLBACK_MANAGE_URL;

export const TRIAL_DAYS = (() => {
  const n = Number(process.env.FREE_TRIAL_DAYS);
  return Number.isFinite(n) && n > 0 ? n : 1;
})();

export interface SubscriptionInput {
  plan?: "trial" | "free" | "premium" | "pro";
  trialEndsAt?: Date | string | null;
  subscribedUntil?: Date | string | null;
  /** Set by callers via `isAdminEmail` (server-only). */
  isAdmin?: boolean;
}

export type SubscriptionKind = "trial" | "free" | "paid" | "expired";

export interface SubscriptionStatus {
  active: boolean;
  kind: SubscriptionKind;
  daysLeft: number | null;
  expiresAt: Date | null;
}

function toDate(d: Date | string | null | undefined): Date | null {
  if (!d) return null;
  return d instanceof Date ? d : new Date(d);
}

/** Pure, isomorphic. Caller decides admin status. */
export function getSubscriptionStatus(
  user: SubscriptionInput,
  now: Date = new Date()
): SubscriptionStatus {
  if (user.isAdmin || user.plan === "free") {
    return { active: true, kind: "free", daysLeft: null, expiresAt: null };
  }
  const trialEndsAt = toDate(user.trialEndsAt);
  const subUntil = toDate(user.subscribedUntil);

  if (subUntil && subUntil.getTime() > now.getTime()) {
    return {
      active: true,
      kind: "paid",
      daysLeft: Math.ceil((subUntil.getTime() - now.getTime()) / 86400000),
      expiresAt: subUntil,
    };
  }
  // Premium/Pro plan with no subscribedUntil yet (e.g. webhook race) — treat as
  // active rather than locking the user out. Webhook is expected to set both
  // fields atomically, but we err on the user's side here.
  if ((user.plan === "premium" || user.plan === "pro") && !subUntil) {
    return { active: true, kind: "paid", daysLeft: null, expiresAt: null };
  }
  if (user.plan === "trial" && trialEndsAt && trialEndsAt.getTime() > now.getTime()) {
    return {
      active: true,
      kind: "trial",
      daysLeft: Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86400000),
      expiresAt: trialEndsAt,
    };
  }
  return { active: false, kind: "expired", daysLeft: 0, expiresAt: trialEndsAt || subUntil };
}
