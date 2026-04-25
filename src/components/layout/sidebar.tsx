"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard", label: "Mes actual", Icon: LayoutDashboard },
  { href: "/anual", label: "Resumen anual", Icon: CalendarDays },
];

export function Sidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();
  const initials = (user.name || user.email || "?")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r bg-card/30 backdrop-blur-xl">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-baseline gap-1 group">
          <span className="font-bold text-lg tracking-tight transition-transform group-hover:-translate-x-px">
            AlisonVivanco
          </span>
          <span className="font-bold text-lg tracking-tight gradient-text">.cl</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="relative block">
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-violet-600 shadow-lg shadow-primary/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.Icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t space-y-2">
        <div className="rounded-xl bg-gradient-to-br from-muted/60 to-muted/20 p-3 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold truncate">{user.name || "Usuario"}</div>
            <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
