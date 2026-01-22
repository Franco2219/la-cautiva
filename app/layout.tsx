import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
// Importamos la herramienta de analíticas
import { Analytics } from "@vercel/analytics/react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "La Cautiva Tennis Club - Cuadros de Torneos",
  description: "Visualiza en tiempo real los cuadros y rankings de los torneos del club",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
        {/* Componente de Analytics agregado al final del body */}
        <Analytics />
      </body>
    </html>
  );
}
