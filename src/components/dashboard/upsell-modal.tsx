"use client";
import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { buildSubscribeUrl } from "@/lib/subscription";

export function UpsellModal({
  open,
  onClose,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
}) {
  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-md rounded-3xl bg-card shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 p-2 rounded-lg hover:bg-muted transition z-10"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="p-8 space-y-5">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600 shadow-lg shadow-primary/20">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  ¿Crees que MisFinanzas te sirve?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ya registraste 5 ítems, así que vas en serio. Si sigues así
                  tendrás una foto clarísima de tus finanzas mes a mes.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Regálame un café mensual por <strong>$5.000</strong> para
                  seguir usándolo, de lo contrario, solo podrás usarlo por
                  24 horas gratis 🤭
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl border bg-background hover:bg-accent text-sm font-medium transition"
                >
                  Lo haré más tarde
                </button>
                <Link
                  href={buildSubscribeUrl(userId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary via-violet-600 to-fuchsia-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition flex items-center justify-center gap-1.5"
                >
                  Suscribirme
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
