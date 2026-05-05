import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeatRank AI — Rank Higher, Get More HVAC Calls",
  description:
    "AI-powered local SEO tools built for HVAC contractors. Generate keywords, manage Google reviews, and track your local rankings — without an agency.",
  icons: {
    icon: "/heatrank-logo.png",
    apple: "/heatrank-logo.png",
  },
  openGraph: {
    title: "HeatRank AI — Rank Higher, Get More HVAC Calls",
    description:
      "AI-powered local SEO tools built for HVAC contractors. Generate keywords, manage Google reviews, and track your local rankings.",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
