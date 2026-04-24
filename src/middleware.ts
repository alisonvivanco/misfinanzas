/**
 * Middleware Edge Runtime
 *
 * Two stages:
 *  1. Site-wide password gate (cookie-based). Anyone visiting any
 *     page must first pass the shared password at /acceso.
 *  2. NextAuth session check for the protected dashboard routes
 *     (handled by the wrapped auth() callback).
 */
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { GATE_COOKIE, isValidGateToken } from "@/lib/site-gate";

const { auth } = NextAuth(authConfig);

const GATE_BYPASS_PREFIXES = ["/acceso", "/api/acceso", "/api/health"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (!GATE_BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const token = req.cookies.get(GATE_COOKIE)?.value;
    if (!(await isValidGateToken(token))) {
      const url = req.nextUrl.clone();
      url.pathname = "/acceso";
      if (pathname !== "/") url.searchParams.set("from", pathname + req.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
