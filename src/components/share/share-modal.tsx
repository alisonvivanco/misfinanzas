"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Loader2, Gift, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ReferralData {
  code: string;
  link: string;
  referredCount: number;
  paidCount: number;
  monthsEarned: number;
}

export function ShareModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/me/referrals")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => toast.error("No se pudo cargar tu link"))
      .finally(() => setLoading(false));
  }, [open]);

  async function copyLink() {
    if (!data?.link) return;
    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
      toast.success("Link copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  async function nativeShare() {
    if (!data?.link) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "MisFinanzas",
          text: "Te recomiendo MisFinanzas — ordena tu plata sin Excel ni fórmulas. Únete con mi link:",
          url: data.link,
        });
      } catch {
        // user cancelled, ignore
      }
    } else {
      copyLink();
    }
  }

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

            <div className="p-7 space-y-5">
              <div className="text-center space-y-2.5">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
                  <Gift className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Comparte y gana 💸
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Invita a tus amigos a esta herramienta secreta. <br />
                  <strong className="text-foreground">Por cada amigo que pague, te regalo un mes gratis.</strong>{" "}
                  Sin límite.
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : data ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tu link único
                    </label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={data.link}
                        onClick={(e) => e.currentTarget.select()}
                        className="flex-1 h-10 rounded-lg border bg-muted/40 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        onClick={copyLink}
                        className="h-10 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition flex items-center gap-1.5"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copiado" : "Copiar"}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={nativeShare}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartir
                  </button>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <Stat label="Invitados" value={data.referredCount} />
                    <Stat label="Pagando" value={data.paidCount} />
                    <Stat label="Meses ganados" value={data.monthsEarned} />
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No se pudo cargar tu link. Cierra y vuelve a intentar.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-muted/30 px-3 py-2.5 text-center">
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}
