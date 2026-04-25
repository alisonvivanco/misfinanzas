import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/brand/logo";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex items-center justify-center bg-background gradient-mesh p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block mb-8">
              <Logo size="lg" />
            </Link>
          </div>
          <div className="rounded-3xl border bg-card p-8 shadow-xl">{children}</div>
        </div>
      </div>
    </SessionProvider>
  );
}
