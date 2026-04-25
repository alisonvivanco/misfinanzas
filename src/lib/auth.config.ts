/**
 * Edge-compatible auth config — sin MongoDB adapter ni bcryptjs.
 * Esta config se importa en middleware.ts (Edge Runtime).
 * La config completa con adapter está en auth.ts (Node runtime).
 */
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

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
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const PROTECTED = [
        "/dashboard",
        "/anual",
        "/completar-perfil",
      ];
      const isProtected = PROTECTED.some((p) => nextUrl.pathname.startsWith(p));
      if (isProtected && !isLoggedIn) return false;
      if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup")) {
        const target = auth?.user?.profileComplete === false ? "/completar-perfil" : "/dashboard";
        return Response.redirect(new URL(target, nextUrl));
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.rut = (user as { rut?: string }).rut;
        token.plan = (user as { plan?: string }).plan;
        token.profileComplete = (user as { profileComplete?: boolean }).profileComplete;
      }
      // Allow client-side `useSession().update({...})` after profile completion
      // without forcing the user to sign out and back in.
      if (trigger === "update" && session) {
        if (typeof session.profileComplete === "boolean") {
          token.profileComplete = session.profileComplete;
        }
        if (typeof session.rut === "string") token.rut = session.rut;
        if (typeof session.plan === "string") token.plan = session.plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rut = token.rut as string | undefined;
        session.user.plan = token.plan as string | undefined;
        session.user.profileComplete = token.profileComplete as boolean | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
