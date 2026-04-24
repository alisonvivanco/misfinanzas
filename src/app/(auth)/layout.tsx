import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background gradient-mesh p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600" />
            <span className="font-bold text-2xl">MisFinanzas</span>
          </Link>
        </div>
        <div className="rounded-3xl border bg-card p-8 shadow-xl">{children}</div>
      </div>
    </div>
  );
}
