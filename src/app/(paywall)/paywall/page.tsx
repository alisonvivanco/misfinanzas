import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSubscriptionStatus, SUBSCRIBE_URL } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, ArrowRight, Heart } from "lucide-react";

export default async function PaywallPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const dbUser = await User.findById(session.user.id)
    .select("email nombre plan trialEndsAt subscribedUntil")
    .lean();
  const status = getSubscriptionStatus({
    email: dbUser?.email ?? session.user.email,
    plan: dbUser?.plan,
    trialEndsAt: dbUser?.trialEndsAt,
    subscribedUntil: dbUser?.subscribedUntil,
  });

  // If somehow active, send them back to the app.
  if (status.active) redirect("/dashboard");

  const expiredOn = status.expiresAt
    ? new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "long", year: "numeric" }).format(
        new Date(status.expiresAt)
      )
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background gradient-mesh">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-baseline gap-1 mb-4">
            <span className="font-bold text-xl tracking-tight">AlisonVivanco</span>
            <span className="font-bold text-xl tracking-tight gradient-text">.cl</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card text-xs font-medium">
            <Sparkles className="h-3 w-3 text-amber-500" />
            {dbUser?.nombre ? `Hola ${dbUser.nombre} — ` : ""}tu prueba terminó
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Seguí controlando tu plata.
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Tu prueba de 1 día {expiredOn ? `terminó el ${expiredOn}` : "expiró"}. Suscribite por
            menos que un café al mes y mantené todo lo que registraste.
          </p>
        </div>

        <div className="rounded-3xl border bg-card shadow-xl p-8 space-y-6 gradient-border">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Suscripción mensual
            </div>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold gradient-text">$2.990</span>
              <span className="text-muted-foreground">/ mes</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">CLP · cancela cuando quieras</div>
          </div>

          <ul className="space-y-3 text-sm">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <Link href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="gradient" size="lg" className="w-full gap-2">
              Suscribirme con MercadoPago
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <p className="text-[11px] text-center text-muted-foreground">
            Tus datos quedan guardados — al volver, todo lo que registraste sigue ahí.
          </p>
        </div>

        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            <Heart className="h-3 w-3 inline mb-0.5 mr-1 text-rose-500" />
            ¿Pagaste y todavía aparece esto? Avisanos a soporte y te activamos en minutos.
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  "Dashboard mensual con todos tus ingresos y gastos",
  "Regla 50/30/20 calculada automáticamente",
  "Metas de ahorro con progreso visual",
  "Control de deudas con seguimiento de pagos",
  "Resumen anual de los 12 meses",
  "Sin límite de registros, sin anuncios",
];
