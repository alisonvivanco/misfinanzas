// MercadoPago subscription endpoints + status helpers.

const FALLBACK_SUBSCRIBE_URL =
  "https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=50b7a4d225194f30a3a03b1e4c09bea9";
const FALLBACK_MANAGE_URL = "https://www.mercadopago.cl/subscriptions";

export const SUBSCRIBE_URL =
  process.env.NEXT_PUBLIC_SUBSCRIBE_URL || FALLBACK_SUBSCRIBE_URL;

export const MANAGE_SUBSCRIPTION_URL =
  process.env.NEXT_PUBLIC_MANAGE_SUBSCRIPTION_URL || FALLBACK_MANAGE_URL;

export interface SubscriptionInput {
  email?: string | null;
  plan?: "trial" | "free" | "premium" | "pro";
  trialEndsAt?: Date | string | null;
  subscribedUntil?: Date | string | null;
}

export type SubscriptionKind = "trial" | "free" | "paid" | "expired";

export interface SubscriptionStatus {
  active: boolean;
  kind: SubscriptionKind;
  daysLeft: number | null;
  expiresAt: Date | null;
}

/** Server-only — reads ADMIN_EMAILS from env. Don't call from client bundles. */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS || "";
  const list = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

function toDate(d: Date | string | null | undefined): Date | null {
  if (!d) return null;
  return d instanceof Date ? d : new Date(d);
}

/** Returns the subscription state for a user. Pure — caller injects current time. */
export function getSubscriptionStatus(
  user: SubscriptionInput,
  now: Date = new Date()
): SubscriptionStatus {
  if (isAdminEmail(user.email)) {
    return { active: true, kind: "free", daysLeft: null, expiresAt: null };
  }
  if (user.plan === "free") {
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
