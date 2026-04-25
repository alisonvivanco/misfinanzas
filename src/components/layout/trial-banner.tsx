import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { buildSubscribeUrl, MANAGE_SUBSCRIPTION_URL } from "@/lib/subscription";

export function TrialBanner({
  kind = "trial",
  daysLeft,
  expiresAt,
  userId,
}: {
  kind?: "trial" | "paid";
  daysLeft: number;
  expiresAt: Date | null;
  userId?: string;
}) {
  const expira = expiresAt
    ? new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "long" }).format(new Date(expiresAt))
    : null;

  const isPaid = kind === "paid";
  const msg = isPaid
    ? daysLeft <= 0
      ? "Tu suscripción se renueva hoy"
      : daysLeft === 1
      ? "Tu suscripción se renueva mañana"
      : `Tu suscripción se renueva en ${daysLeft} días`
    : daysLeft <= 0
    ? "Tu prueba expira hoy"
    : daysLeft === 1
    ? "Tu prueba expira mañana"
    : `Tu prueba expira en ${daysLeft} días`;

  const href = isPaid ? MANAGE_SUBSCRIPTION_URL : buildSubscribeUrl(userId);
  const cta = isPaid ? "Gestionar" : "Suscribirme";

  return (
    <div className="rounded-2xl border bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">{msg}</div>
          {expira && <div className="text-xs text-muted-foreground">{isPaid ? `Próximo cargo el ${expira}` : `Termina el ${expira}`}</div>}
        </div>
      </div>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium hover:shadow-md transition shrink-0"
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
