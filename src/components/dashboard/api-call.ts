"use client";
import { toast } from "sonner";

export interface ApiOptions {
  method?: "POST" | "PATCH" | "DELETE" | "GET";
  body?: unknown;
}

/**
 * Wrapper for dashboard API calls with built-in error toasts.
 * Returns parsed JSON on success, null on failure.
 */
export async function apiCall<T = unknown>(url: string, opts: ApiOptions = {}): Promise<T | null> {
  const method = opts.method || "GET";
  try {
    const res = await fetch(url, {
      method,
      headers: opts.body ? { "Content-Type": "application/json" } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    let json: any = null;
    try { json = await res.json(); } catch { /* empty body */ }
    if (res.status === 402 || json?.requiresSubscription) {
      if (typeof window !== "undefined") window.location.href = "/paywall";
      return null;
    }
    if (!res.ok) {
      const msg = json?.error || `Error ${res.status}`;
      toast.error(msg);
      return null;
    }
    return json as T;
  } catch (e) {
    console.error("[apiCall]", url, e);
    toast.error(e instanceof Error ? e.message : "Error de red");
    return null;
  }
}

export function parseMonto(v: string): number {
  return parseInt(v.replace(/\D/g, ""), 10);
}
