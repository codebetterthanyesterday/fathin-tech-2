import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Space_Grotesk, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getProfile } from "./actions/profile";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { generateThemeColorTokens } from "@/lib/theme/colors";
import PreviewSyncListener from "@/components/public/preview-sync-listener";
import { FontAwesomeLoader } from "@/components/public/layout/font-awesome-loader";
import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  preload: false,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    template: '%s | Portfolio',
    default: 'Portfolio',
  },
  description: 'Personal Portfolio',
  openGraph: {
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getProfile();
  
  const FONT_VARIABLES: Record<string, string> = {
    'Geist': 'var(--font-geist-sans)',
    'Inter': 'var(--font-inter)',
    'Space Grotesk': 'var(--font-space-grotesk)',
    'Playfair Display': 'var(--font-playfair)',
    'JetBrains Mono': 'var(--font-jetbrains-mono)',
  };

  const fontVar = FONT_VARIABLES[profile?.themeFont || 'Geist'] || 'var(--font-geist-sans)';

  // Calculate guaranteed contrast tokens for both modes
  const themeTokens = generateThemeColorTokens(profile?.themeAccentColor || '#ffffff');

  // Define custom CSS variables to be injected into the root
  const customStyles = {
    ...themeTokens,
    '--theme-font': fontVar,
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${spaceGrotesk.variable} ${playfair.variable} ${jetbrainsMono.variable} h-full antialiased`}
      style={customStyles}
    >
      <head>
        <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" as="style" />
        <FontAwesomeLoader />
        <noscript>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        </noscript>
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-300">
        <ThemeProvider>
          <Suspense fallback={null}>
            <PreviewSyncListener />
          </Suspense>
          {children}
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
