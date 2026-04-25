import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex items-center justify-center bg-background gradient-mesh p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-baseline gap-1.5 mb-8">
              <span className="font-bold text-2xl tracking-tight">AlisonVivanco</span>
              <span className="font-bold text-2xl tracking-tight text-primary">.cl</span>
            </Link>
          </div>
          <div className="rounded-3xl border bg-card p-8 shadow-xl">{children}</div>
        </div>
      </div>
    </SessionProvider>
  );
}
