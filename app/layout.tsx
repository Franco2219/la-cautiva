import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
// IMPORTAMOS GOOGLE ANALYTICS
import { GoogleAnalytics } from '@next/third-parties/google';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  // --- AGREGADO: TU DOMINIO OFICIAL ---
  metadataBase: new URL('https://www.lacautivatenisypadel.com.ar'),
  // ------------------------------------
  title: "La Cautiva Tenis y Pádel - Cuadros y Ranking",
  description: "Sitio oficial de La Cautiva. Visualiza en tiempo real los cuadros, inscriptos y rankings de los torneos del club.",
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
        {/* TU CÓDIGO REAL DE GOOGLE ANALYTICS */}
        <GoogleAnalytics gaId="G-9Y933CE1PB" />
      </body>
    </html>
  );
}