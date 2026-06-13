import type { Metadata } from "next";
import { Inter, Rokkitt, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Closest free stand-in for the brand's Recoleta headings (the logo itself uses
// the exact wordmark image). Friendly, rounded, full weight range.
const rokkitt = Rokkitt({
  variable: "--font-rokkitt",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nudgeinvoicing.pro"),
  title: "Nudge — free invoicing, 1% when you're paid",
  description:
    "Send invoices free. Nudge chases them until you're paid — and takes 1% only when the money lands.",
  openGraph: {
    title: "Nudge — friendly invoice follow-up for busy tradies",
    description:
      "Send invoices free. Nudge chases them until you're paid — 1% only when the money lands.",
    url: "https://nudgeinvoicing.pro",
    siteName: "Nudge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nudge — friendly invoice follow-up for busy tradies",
    description:
      "Send invoices free. Nudge chases them until you're paid — 1% only when the money lands.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${rokkitt.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
