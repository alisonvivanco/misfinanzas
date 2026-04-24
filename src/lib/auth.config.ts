/**
 * Edge-compatible auth config — sin MongoDB adapter ni bcryptjs.
 * Esta config se importa en middleware.ts (Edge Runtime).
 * La config completa con adapter está en auth.ts (Node runtime).
 */
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    error: "/login",
  },
  providers: [
    // Placeholder — el provider real con lógica de DB está en auth.ts
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize() {
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const PROTECTED = [
        "/dashboard",
        "/boletas",
        "/cotizaciones",
        "/presupuesto",
        "/deudas",
        "/ahorros",
        "/inversiones",
        "/configuracion",
      ];
      const isProtected = PROTECTED.some((p) => nextUrl.pathname.startsWith(p));
      if (isProtected && !isLoggedIn) return false;
      if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rut = (user as { rut?: string }).rut;
        token.plan = (user as { plan?: string }).plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { rut?: string }).rut = token.rut as string;
        (session.user as { plan?: string }).plan = token.plan as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
