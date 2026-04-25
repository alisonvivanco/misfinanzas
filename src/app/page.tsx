import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { LandingHero } from "@/components/landing/hero";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="inline-flex">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button variant="gradient" size="sm">Empezar</Button>
            </Link>
          </div>
        </div>
      </header>

      <LandingHero />

      <footer className="relative py-10 text-center text-sm text-muted-foreground border-t">
        Con amor, de Ali pa&apos; sus amigos 💖
      </footer>
    </div>
  );
}
