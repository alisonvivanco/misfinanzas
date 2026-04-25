import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSubscriptionStatus, isAdminEmail } from "@/lib/subscription";
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
  const dbUser = await User.findById(session.user.id)
    .select("email plan trialEndsAt subscribedUntil")
    .lean();
  const status = getSubscriptionStatus({
    email: dbUser?.email ?? session.user.email,
    plan: dbUser?.plan,
    trialEndsAt: dbUser?.trialEndsAt,
    subscribedUntil: dbUser?.subscribedUntil,
  });
  if (!status.active) redirect("/paywall");

  const showTrialBanner = status.kind === "trial" && (status.daysLeft ?? 0) <= 3;
  const isAdmin = isAdminEmail(session.user.email);

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-background gradient-mesh-soft">
        <Sidebar
          user={{ name: session.user.name, email: session.user.email }}
          isAdmin={isAdmin}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="container py-8 max-w-7xl space-y-4">
            {showTrialBanner && (
              <TrialBanner daysLeft={status.daysLeft ?? 0} expiresAt={status.expiresAt} />
            )}
            {children}
          </div>
        </main>
      </div>
      <Toaster richColors closeButton position="top-right" theme="system" />
    </SessionProvider>
  );
}
