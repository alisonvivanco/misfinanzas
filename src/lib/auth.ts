/**
 * Full auth config — usa MongoDB adapter y bcryptjs.
 * IMPORTANTE: solo se importa en contextos Node.js runtime (nunca en middleware).
 */
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "EMAIL_NOT_VERIFIED";
}
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import clientPromise, { dbConnect } from "./mongodb";
import { User } from "@/models/User";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { sendWelcomeEmail } from "./email";

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
          // Auth.js v5 surfaces this code via signIn()'s response code field.
          throw new EmailNotVerifiedError();
        }
        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
        return {
          id: user._id.toString(),
          email: user.email,
          name: [user.nombre, user.apellido].filter(Boolean).join(" ") || user.email,
          rut: user.rut,
          plan: user.plan,
          profileComplete: user.profileComplete ?? Boolean(user.rut && user.telefono),
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  events: {
    // First-time OAuth signup: split Google's `name` into nombre/apellido and
    // set a 14-day trial. `profileComplete` stays false so the dashboard
    // layout redirects the user to /completar-perfil to capture RUT + phone.
    async createUser({ user }) {
      await dbConnect();
      const parts = (user.name || "").trim().split(/\s+/);
      const nombre = parts[0] || "";
      const apellido = parts.slice(1).join(" ") || "";
      const trialDays = Number(process.env.FREE_TRIAL_DAYS || 1);
      await User.updateOne(
        { _id: new ObjectId(user.id as string) },
        {
          $set: {
            nombre,
            apellido,
            profileComplete: false,
            plan: "trial",
            trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
          },
        }
      );

      // OAuth users skip the email-verification step, so send the welcome
      // here. Don't block sign-in on email failures.
      if (user.email) {
        sendWelcomeEmail(user.email, nombre)
          .then(() =>
            User.updateOne(
              { _id: new ObjectId(user.id as string) },
              { $set: { welcomeSentAt: new Date() } }
            )
          )
          .catch((e) => console.error("[oauth-welcome]", e));
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session, account }) {
      // Google OAuth: hydrate token from DB on first sign-in because the
      // adapter's `user` object only carries name/email/image.
      if (user && account?.provider === "google") {
        await dbConnect();
        const dbUser = await User.findById(user.id).lean();
        token.id = user.id;
        token.rut = dbUser?.rut;
        token.plan = dbUser?.plan ?? "trial";
        token.profileComplete = dbUser?.profileComplete ?? false;
        return token;
      }
      // Credentials sign-in: user object carries everything we need.
      if (user) {
        token.id = user.id;
        token.rut = (user as { rut?: string }).rut;
        token.plan = (user as { plan?: string }).plan;
        token.profileComplete = (user as { profileComplete?: boolean }).profileComplete;
      }
      if (trigger === "update" && session) {
        if (typeof session.profileComplete === "boolean") {
          token.profileComplete = session.profileComplete;
        }
        if (typeof session.rut === "string") token.rut = session.rut;
        if (typeof session.plan === "string") token.plan = session.plan;
      }
      return token;
    },
  },
});
