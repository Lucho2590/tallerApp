import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FirebaseProviders } from "@/components/providers/firebase-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Taller App",
  description: "Sistema de gestión para talleres",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <FirebaseProviders>{children}</FirebaseProviders>
      </body>
    </html>
  );
}
