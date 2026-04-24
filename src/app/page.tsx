import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, FileText, PieChart, Shield, TrendingUp, Wallet, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="h-8 w-8 rounded-lg" />
            <div className="flex items-baseline gap-1 leading-none">
              <span className="font-bold text-lg tracking-tight">AlisonVivanco</span>
              <span className="font-bold text-lg tracking-tight text-primary">.cl</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition">Características</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition">Precios</Link>
            <Link href="#faq" className="text-muted-foreground hover:text-foreground transition">FAQ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
            <Link href="/signup"><Button variant="gradient" size="sm">Empezar gratis</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="container py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-income animate-pulse" />
              Optimizado para la tributación chilena 2026
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Tu <span className="bg-gradient-to-r from-primary via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">contador personal</span> digital
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Boletas de honorarios, cotizaciones AFP, presupuesto 50/30/20,
              deudas, ahorros e inversiones — todo en un solo lugar,
              con estándares de auditor profesional.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <Link href="/signup">
                <Button variant="gradient" size="lg" className="gap-2">
                  Comenzar prueba de 14 días
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">Ver características</Button>
              </Link>
            </div>
            <div className="pt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-income" />Sin tarjeta</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-income" />Datos en Chile</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-income" />Cancela cuando quieras</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-24">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="text-sm font-semibold text-primary">CARACTERÍSTICAS</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Todo lo que un auditor personal haría por ti
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

      {/* CTA */}
      <section className="container py-24">
        <div className="rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600 p-12 md:p-16 text-white text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Empieza a controlar tu dinero hoy</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            14 días gratis · Sin compromisos · Soporte en español
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Crear cuenta gratis <ArrowRight className="h-4 w-4" />
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
    Icon: FileText,
    title: "Boletas de honorarios",
    desc: "Emite, organiza y provisiona la retención 2026 (15,25%) automáticamente. Reporte listo para Operación Renta.",
  },
  {
    Icon: Shield,
    title: "Cotizaciones previsionales",
    desc: "AFP, Fonasa/Isapre, SIS y Accidentes del Trabajo calculados sobre base imponible del 80% según Ley 21.133.",
  },
  {
    Icon: PieChart,
    title: "Presupuesto 50/30/20",
    desc: "Regla probada para distribuir tu ingreso. Visualización en tiempo real con gráficos interactivos.",
  },
  {
    Icon: Wallet,
    title: "Pago de deudas",
    desc: "Método Bola de Nieve y Avalancha. Ve exactamente cuándo quedarás libre de deuda.",
  },
  {
    Icon: TrendingUp,
    title: "Ahorros e inversiones",
    desc: "Metas de ahorro en CLP y UF. Portafolio APV (Ley 19.768), fondos mutuos, acciones, ETF y cripto.",
  },
  {
    Icon: Zap,
    title: "Impuesto Único al día",
    desc: "Cálculo automático de IU 2da Categoría con tramos SII actualizados. Proyección de Operación Renta.",
  },
];
