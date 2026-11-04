import type { Metadata, Viewport } from "next";
import "@fontsource/orbitron/700.css";
import "@fontsource/orbitron/900.css";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

import { ArcadeProvider } from "@/components/shell/ArcadeProvider";
import { BackgroundFX } from "@/components/shell/BackgroundFX";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { Footer } from "@/components/shell/Footer";
import { MobileDock } from "@/components/shell/MobileDock";
import { NavBar } from "@/components/shell/NavBar";
import { PageShell } from "@/components/shell/PageShell";
import { ProfilePanel } from "@/components/shell/ProfilePanel";

const SITE_DESCRIPTION =
  "YOUR WORLD. YOUR GAMES. YOUR ARCADE. Eleven playable cabinets, four original games written from scratch, an educational Study Zone and a sensory room — all in one neon arcade.";

export const metadata: Metadata = {
  title: {
    default: "WOW GAMES — The Infinite Arcade",
    template: "%s · WOW GAMES",
  },
  description: SITE_DESCRIPTION,
  applicationName: "WOW GAMES",
  keywords: [
    "wow games",
    "browser games",
    "free online arcade",
    "geometry rush",
    "flappy chaos",
    "brain blast",
    "study games",
    "html5 games",
    "no download games",
  ],
  authors: [{ name: "Pratham Pandey" }],
  creator: "Pratham Pandey",
  category: "games",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "WOW GAMES",
    title: "WOW GAMES — The Infinite Arcade",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "WOW GAMES — The Infinite Arcade",
    description: SITE_DESCRIPTION,
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#05060f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-motion="on" suppressHydrationWarning>
      <body className="antialiased">
        <ArcadeProvider>
          <BackgroundFX />
          <NavBar />
          <main id="main" className="relative z-10 pt-[var(--nav-h)]">
            <PageShell>{children}</PageShell>
          </main>
          <Footer />
          <MobileDock />
          <CommandPalette />
          <ProfilePanel />
        </ArcadeProvider>
      </body>
    </html>
  );
}
