/**
 * Full auth config — usa MongoDB adapter y bcryptjs.
 * IMPORTANTE: solo se importa en contextos Node.js runtime (nunca en middleware).
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import clientPromise, { dbConnect } from "./mongodb";
import { User } from "@/models/User";
import { z } from "zod";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB || "misfinanzas",
  }),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        await dbConnect();
        const user = await User.findOne({ email: parsed.data.email })
          .select("+password")
          .lean();
        if (!user || !user.password) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.password);
        if (!ok) return null;
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }
        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.nombre} ${user.apellido}`,
          rut: user.rut,
          plan: user.plan,
        };
      },
    }),
  ],
});
