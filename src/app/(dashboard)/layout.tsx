import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSubscriptionStatus } from "@/lib/subscription";
import { isAdminEmail } from "@/lib/subscription-server";
import { TrialBanner } from "@/components/layout/trial-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.profileComplete === false) redirect("/completar-perfil");

  // Check subscription on every dashboard nav so expiry blocks immediately.
  await dbConnect();
  let dbUser = await User.findById(session.user.id)
    .select("email plan trialEndsAt subscribedUntil createdAt")
    .lean();

  // Self-heal: legacy accounts created before the paywall existed have no
  // trialEndsAt. Granting them the default trial window once means they don't
  // get accidentally locked out on first visit.
  if (dbUser && dbUser.plan === "trial" && !dbUser.trialEndsAt) {
    const days = Number(process.env.FREE_TRIAL_DAYS || 1);
    const newTrialEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await User.updateOne({ _id: dbUser._id }, { $set: { trialEndsAt: newTrialEnd } });
    dbUser = { ...dbUser, trialEndsAt: newTrialEnd };
  }

  const isAdmin = isAdminEmail(dbUser?.email ?? session.user.email);
  const status = getSubscriptionStatus({
    plan: dbUser?.plan,
    trialEndsAt: dbUser?.trialEndsAt,
    subscribedUntil: dbUser?.subscribedUntil,
    isAdmin,
  });
  if (!status.active) redirect("/paywall");

  // Show banner when ≤3 days left, on trial OR paid (warns of upcoming expiry).
  const showBanner = (status.kind === "trial" || status.kind === "paid")
    && (status.daysLeft ?? 999) <= 3;

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-background gradient-mesh-soft">
        <Sidebar
          user={{ name: session.user.name, email: session.user.email }}
          isAdmin={isAdmin}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="container py-8 max-w-7xl space-y-4">
            {showBanner && (
              <TrialBanner
                kind={status.kind === "paid" ? "paid" : "trial"}
                daysLeft={status.daysLeft ?? 0}
                expiresAt={status.expiresAt}
              />
            )}
            {children}
          </div>
        </main>
      </div>
      <Toaster richColors closeButton position="top-right" theme="system" />
    </SessionProvider>
  );
}
