import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Space_Grotesk, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getProfile } from "./actions/profile";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { generateThemeColorTokens } from "@/lib/theme/colors";

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
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
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
  
  // Format the font string to match the variable name (e.g. "Space Grotesk" -> "--font-space-grotesk")
  let fontVar = 'var(--font-geist-sans)';
  if (profile?.themeFont) {
    const formattedFontName = profile.themeFont.toLowerCase().replace(/ /g, '-');
    fontVar = `var(--font-${formattedFontName})`;
  }

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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
