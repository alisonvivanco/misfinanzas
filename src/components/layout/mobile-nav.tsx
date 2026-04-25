"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { SidebarContent, type SidebarUser } from "./sidebar";

export function MobileNav({
  user,
  isAdmin,
}: {
  user: SidebarUser;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer when navigating to a new page (in case Link click doesn't trigger onNavigate).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-2 px-4 h-14 border-b bg-background/85 backdrop-blur-xl">
        <Link href="/dashboard" className="inline-flex">
          <Logo size="sm" />
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 -mr-2 rounded-lg hover:bg-accent transition"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-background border-r shadow-2xl"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 p-2 rounded-lg hover:bg-accent transition z-10"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent
                user={user}
                isAdmin={isAdmin}
                onNavigate={() => setOpen(false)}
                layoutIdSuffix="-mobile"
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
