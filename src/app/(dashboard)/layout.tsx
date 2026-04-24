import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { SessionProvider } from "next-auth/react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.profileComplete === false) redirect("/completar-perfil");

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-background">
        <Sidebar user={{ name: session.user.name, email: session.user.email }} />
        <main className="flex-1 overflow-y-auto">
          <div className="container py-8 max-w-7xl">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}
