import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rut?: string;
      plan?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    rut?: string;
    plan?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    rut?: string;
    plan?: string;
  }
}
