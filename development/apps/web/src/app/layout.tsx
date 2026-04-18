import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { FirebaseProvider } from "@/components/providers/FirebaseProvider";
import "./globals.css";

// ─── Font Loading ───────────────────────────────────────────────
// Plus Jakarta Sans is the primary typeface for all UI (see docs/brand/typography.md).
// IBM Plex Mono is used for code, transaction IDs, and timestamps.
// We use Next.js font optimization to self-host and preload these.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-jakarta",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-mono",
});

// ─── Metadata ───────────────────────────────────────────────────
// SEO-optimized metadata for the entire application.
// Icons reference the real brand favicons from /public/assets/logos/.
export const metadata: Metadata = {
  title: {
    default: "U-Shop — Ghana's Trusted Student Tech Marketplace",
    template: "%s | U-Shop",
  },
  description:
    "Buy and sell laptops, phones, and accessories with escrow protection. Verified student-to-student trading across Ghanaian university campuses.",
  keywords: [
    "buy laptops ghana",
    "sell phone ghana",
    "student marketplace",
    "campus tech deals",
    "escrow payment ghana",
    "verified sellers",
    "UG",
    "KNUST",
    "Ashesi",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/assets/logos/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/logos/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", url: "/assets/logos/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/assets/logos/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${plexMono.variable} dark`}
    >
      <head>
        {/* Material Symbols for icons used throughout the design.
            eslint-disable-next-line: This rule is a Pages Router rule.
            In App Router, layout.tsx IS the global document — this font
            loads on every page, which is the correct behavior. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <FirebaseProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </FirebaseProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
