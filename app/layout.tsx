import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PGL Club",
  description: "La comunidad oficial de PGL Electrónica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
