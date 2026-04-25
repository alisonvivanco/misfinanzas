import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, BarChart3, Calendar, PieChart, Target, Wallet, Heart } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition">Características</Link>
            <Link href="#como-funciona" className="text-muted-foreground hover:text-foreground transition">Cómo funciona</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
            <Link href="/signup"><Button variant="gradient" size="sm">Empezar</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="container py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-income animate-pulse" />
              El presupuesto personal que sí vas a usar
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Tu plata,{" "}
              <span className="bg-gradient-to-r from-primary via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                bajo control
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Anota tus ingresos, gastos, deudas y ahorros. Te calculamos solo cuánto te queda,
              cómo distribuirlo (50/30/20) y cómo vas mes a mes. Sin Excel, sin fórmulas, sin lío.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <Link href="/signup">
                <Button variant="gradient" size="lg" className="gap-2">
                  Empezar gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button variant="outline" size="lg">Ver cómo funciona</Button>
              </Link>
            </div>
            <div className="pt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-income" />Sin tarjeta</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-income" />Solo RUT y celular</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-income" />Datos en Chile</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-24">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="text-sm font-semibold text-primary">CARACTERÍSTICAS</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Una sola pantalla, todo lo que necesitas
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 card-hover">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <f.Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="bg-muted/30 py-24">
        <div className="container max-w-4xl">
          <div className="text-center mb-16 space-y-3">
            <div className="text-sm font-semibold text-primary">EN 3 PASOS</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Tan simple como una planilla — pero hecho por ti
            </h2>
          </div>
          <ol className="space-y-8">
            {STEPS.map((s, i) => (
              <li key={i} className="flex gap-5">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <div className="rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600 p-12 md:p-16 text-white text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Empieza a controlar tu plata hoy</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Gratis · Solo RUT y celular · Datos privados, en Chile
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Crear cuenta <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © 2026 MisFinanzas · Hecho con cariño en Chile 🇨🇱
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    Icon: BarChart3,
    title: "Vista mensual completa",
    desc: "Ingresos, gastos fijos, gastos variables, ahorros, deudas y donaciones — todo en una pantalla con gráficos.",
  },
  {
    Icon: PieChart,
    title: "Regla 50/30/20 automática",
    desc: "Te decimos cuánto deberías destinar a necesidades, deseos y ahorros, y cómo vas comparado con tu real.",
  },
  {
    Icon: Target,
    title: "Metas de ahorro",
    desc: "Define tus metas (vacaciones, emergencia, casa) y mira cuánto te falta para llegar.",
  },
  {
    Icon: Wallet,
    title: "Control de deudas",
    desc: "Anota cada deuda, cuánto pagaste y cuánto te queda. Tachá las saldadas con un click.",
  },
  {
    Icon: Heart,
    title: "Donaciones",
    desc: "Llevá un registro de lo que donas. Cuenta como gasto en tu balance mensual.",
  },
  {
    Icon: Calendar,
    title: "Resumen anual",
    desc: "Vista consolidada de los 12 meses con totales por categoría y balance del año.",
  },
];

const STEPS = [
  {
    title: "Crea tu cuenta en 30 segundos",
    desc: "Solo te pedimos email, RUT y teléfono. Nada de \"tipo de ingreso\" ni configuraciones complicadas.",
  },
  {
    title: "Anota lo que entra y lo que sale",
    desc: "Tus ingresos del mes, tus gastos fijos (arriendo, internet) y los variables (mercado, transporte). Tarda menos que abrir un Excel.",
  },
  {
    title: "Mirá los números — calculados solos",
    desc: "Ves tu 50/30/20, cuánto te queda, en qué te estás pasando, y cómo va el año. Tomas mejores decisiones, automáticamente.",
  },
];
