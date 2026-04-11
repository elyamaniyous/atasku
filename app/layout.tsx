import type { Metadata } from "next";
import { Sora, Manrope, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atasku — GMAO intelligente pour l'industrie",
  description: "La plateforme de gestion de maintenance assistée par IA. Mode hors-ligne, alertes WhatsApp, interface mobile. Essai gratuit 14 jours.",
  metadataBase: new URL("https://atasku.com"),
  openGraph: {
    title: "Atasku — GMAO intelligente pour l'industrie",
    description: "Gérez votre maintenance avec l'IA. Hors-ligne. Mobile. En français.",
    siteName: "Atasku",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F4F0] font-sans">
        {children}
        <Toaster position="bottom-right" richColors />
        <Script src="/sw-register.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
