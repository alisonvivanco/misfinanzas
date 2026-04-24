"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Shield,
  PieChart,
  Wallet,
  PiggyBank,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/boletas", label: "Boletas", Icon: FileText },
  { href: "/cotizaciones", label: "Cotizaciones", Icon: Shield },
  { href: "/presupuesto", label: "Presupuesto", Icon: PieChart },
  { href: "/deudas", label: "Deudas", Icon: Wallet },
  { href: "/ahorros", label: "Ahorros", Icon: PiggyBank },
  { href: "/inversiones", label: "Inversiones", Icon: TrendingUp },
];

export function Sidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r bg-card/50 backdrop-blur-sm">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600" />
          <span className="font-bold text-lg">MisFinanzas</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t space-y-1">
        <Link
          href="/configuracion"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition"
        >
          <Settings className="h-4 w-4" />
          Configuración
        </Link>
        <div className="px-3 py-3 rounded-lg bg-accent/50 space-y-1">
          <div className="text-xs font-medium truncate">{user.name}</div>
          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
