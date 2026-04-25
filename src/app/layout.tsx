import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MisFinanzas · Tu plata, bajo control",
    template: "%s · MisFinanzas",
  },
  description:
    "El presupuesto personal que sí vas a usar. Anota ingresos, gastos, deudas y ahorros — calculamos solos cuánto te queda y cómo distribuirlo (regla 50/30/20).",
  keywords: [
    "presupuesto personal Chile",
    "regla 50/30/20",
    "control de gastos",
    "ahorro personal",
    "control de deudas",
  ],
  authors: [{ name: "Alison Vivanco" }],
  openGraph: {
    title: "MisFinanzas",
    description: "Tu plata, bajo control — presupuesto personal simple para Chile.",
    type: "website",
    locale: "es_CL",
    url: "https://misfinanzas.alisonvivanco.cl",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CL" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
