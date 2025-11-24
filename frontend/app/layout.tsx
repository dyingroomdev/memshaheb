import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Jost } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import ScreenLoader from "@/components/screen-loader";
import Footer from "@/components/layout/Footer";

const display = Jost({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Memshaheb Magazine — Stories for Women by Women",
  description: "Memshaheb is a night-mode magazine featuring essays, art, and culture through the lens of women creators.",
  icons: undefined
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${display.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400..700;1,400..700&family=Hind+Siliguri:wght@300;400;500;600;700&family=Momo+Trust+Sans:wght@200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-ink antialiased">
        <ScreenLoader />
        <AppShell>
          {children}
          <Footer />
        </AppShell>
      </body>
    </html>
  );
}
