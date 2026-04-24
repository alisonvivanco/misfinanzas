import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background gradient-mesh p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-3 mb-8">
            <img src="/logo.svg" alt="" className="h-14 w-14 rounded-xl shadow-md" />
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-bold text-2xl tracking-tight">AlisonVivanco</span>
              <span className="font-bold text-2xl tracking-tight text-primary">.cl</span>
            </div>
          </Link>
        </div>
        <div className="rounded-3xl border bg-card p-8 shadow-xl">{children}</div>
      </div>
    </div>
  );
}
