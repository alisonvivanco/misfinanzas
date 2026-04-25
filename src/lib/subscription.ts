// MercadoPago subscription endpoints. The plan ID lives on MercadoPago;
// users can cancel their subscription at any time from the manage URL.
const FALLBACK_SUBSCRIBE_URL =
  "https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=50b7a4d225194f30a3a03b1e4c09bea9";
const FALLBACK_MANAGE_URL = "https://www.mercadopago.cl/subscriptions";

export const SUBSCRIBE_URL =
  process.env.NEXT_PUBLIC_SUBSCRIBE_URL || FALLBACK_SUBSCRIBE_URL;

export const MANAGE_SUBSCRIPTION_URL =
  process.env.NEXT_PUBLIC_MANAGE_SUBSCRIPTION_URL || FALLBACK_MANAGE_URL;
