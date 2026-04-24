import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MisFinanzas · Tu contador personal digital",
    template: "%s · MisFinanzas",
  },
  description:
    "Gestión financiera personal para Chile. Boletas de honorarios, cotizaciones previsionales, presupuesto 50/30/20, deudas, ahorros e inversiones. Diseñado por y para profesionales.",
  keywords: [
    "finanzas personales Chile",
    "boletas honorarios",
    "cotizaciones AFP",
    "presupuesto 50/30/20",
    "APV",
  ],
  authors: [{ name: "Alison Vivanco" }],
  openGraph: {
    title: "MisFinanzas",
    description: "Tu contador personal digital — diseñado para Chile.",
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
