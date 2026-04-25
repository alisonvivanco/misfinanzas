"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, TrendingUp, PiggyBank, CreditCard, Heart, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCLP } from "@/lib/utils";

export function LandingHero() {
  return (
    <section className="relative flex-1 flex items-center justify-center overflow-hidden">
      {/* Animated gradient orbs */}
      <Orbs />

      {/* Mesh grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center py-16 md:py-24">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card/60 backdrop-blur text-xs font-medium shadow-sm"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            Tu plata, bajo control en 1 día
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-balance">
            Ordena tu plata{" "}
            <span className="relative inline-block">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #3b82f6, #8b5cf6, #c026d3, #ec4899)",
                  backgroundSize: "200% 200%",
                  animation: "gradientShift 8s ease infinite",
                }}
              >
                como nunca antes
              </span>
            </span>
            .
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 text-balance">
            Anota lo que entra y lo que sale. Te calculamos cuánto te queda,
            cómo distribuirlo, y cómo vas mes a mes. Sin Excel, sin fórmulas,
            sin lío.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
            <Link href="/signup">
              <Button variant="gradient" size="lg" className="gap-2 shadow-xl shadow-primary/20">
                Empezar gratis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">Ya tengo cuenta</Button>
            </Link>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground pt-2">
            <span>Sin tarjeta</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>Solo RUT y celular</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>Datos en Chile</span>
          </div>
        </motion.div>

        {/* Right: floating preview cards */}
        <FloatingPreview />
      </div>

      {/* Keyframes for the gradient shift in the headline */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
}

function Orbs() {
  return (
    <>
      <motion.div
        className="absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0], opacity: [0.18, 0.32, 0.22, 0.18] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 -right-20 w-[480px] h-[480px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #c026d3 0%, transparent 70%)" }}
        animate={{ x: [0, -30, 20, 0], y: [0, -40, 30, 0], opacity: [0.16, 0.30, 0.20, 0.16] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-[360px] h-[360px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }}
        animate={{ x: [0, 30, -10, 0], y: [0, 20, -30, 0], opacity: [0.14, 0.28, 0.18, 0.14] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function FloatingPreview() {
  // Three layered preview cards. Stagger entry, gentle bobbing on idle.
  return (
    <div className="relative h-[480px] lg:h-[520px]">
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -8 }}
        animate={{ opacity: 1, y: 0, rotate: -6 }}
        transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-4 left-2 lg:left-4 w-64"
      >
        <BobWrap delay={0}>
          <PreviewCard
            title="Ingreso del mes"
            Icon={TrendingUp}
            iconClass="bg-emerald-500/15 text-emerald-600"
            valueClass="text-emerald-600"
            value="+ $1.250.000"
            footer={
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sueldo · Honorarios
              </div>
            }
          />
        </BobWrap>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-24 right-2 lg:right-4 w-72"
      >
        <BobWrap delay={1.5}>
          <BudgetCard />
        </BobWrap>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24, rotate: 4 }}
        animate={{ opacity: 1, y: 0, rotate: 3 }}
        transition={{ delay: 0.65, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-12 left-8 lg:left-12 w-72"
      >
        <BobWrap delay={3}>
          <SavingCard />
        </BobWrap>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ delay: 0.85, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 right-2 lg:right-8 w-60"
      >
        <BobWrap delay={4.5}>
          <PreviewCard
            title="Te queda"
            Icon={Wallet}
            iconClass="bg-blue-500/15 text-blue-600"
            valueClass="text-blue-600"
            value={formatCLP(386500)}
            footer={
              <div className="text-[10px] text-muted-foreground">31% del ingreso</div>
            }
          />
        </BobWrap>
      </motion.div>
    </div>
  );
}

function BobWrap({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0, 6, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function PreviewCard({
  title, Icon, iconClass, value, valueClass, footer,
}: {
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  value: string;
  valueClass: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/5 p-4 space-y-3 hover:scale-[1.02] hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className={`h-7 w-7 rounded-xl flex items-center justify-center ${iconClass}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className={"text-2xl font-bold tabular-nums " + valueClass}>{value}</div>
      {footer}
    </div>
  );
}

function BudgetCard() {
  const buckets = [
    { label: "Necesidades", pct: 50, current: 48, color: "#3b82f6" },
    { label: "Deseos", pct: 30, current: 24, color: "#ec4899" },
    { label: "Ahorros", pct: 20, current: 22, color: "#10b981" },
  ];
  return (
    <div className="rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/5 p-4 space-y-4 hover:scale-[1.02] hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Regla 50/30/20
        </span>
        <div className="h-7 w-7 rounded-xl bg-violet-500/15 text-violet-600 flex items-center justify-center">
          <PiggyBank className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="space-y-2.5">
        {buckets.map((b, i) => (
          <div key={b.label}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: b.color }} />
                <span className="font-medium">{b.label}</span>
              </span>
              <span className="text-muted-foreground tabular-nums">{b.current}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${b.current}%` }}
                transition={{
                  duration: 1.2,
                  delay: 0.7 + i * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${b.color}, ${b.color}cc)` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SavingCard() {
  return (
    <div className="rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/5 p-4 space-y-3 hover:scale-[1.02] hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-rose-500" />
          <span className="text-sm font-semibold">Vacaciones</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-medium">
          70%
        </span>
      </div>
      <div className="text-xs text-muted-foreground tabular-nums">
        $1.400.000 <span className="text-muted-foreground/60">/ $2.000.000</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "70%" }}
          transition={{ duration: 1.4, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
        />
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <CreditCard className="h-3 w-3" />
        4 abonos · último hace 3 días
      </div>
    </div>
  );
}
