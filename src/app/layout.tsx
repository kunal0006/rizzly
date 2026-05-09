import { Press_Start_2P, Space_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const pixelFont = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

const monoFont = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Rizzly | Your Retro AI Wingman",
  description: "Level up your texting game.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rizzly",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${pixelFont.variable} ${monoFont.variable} antialiased bg-white text-black selection:bg-primary selection:text-black min-h-screen`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
