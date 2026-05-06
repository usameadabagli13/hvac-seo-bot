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
  title: "HeatRank AI: Local SEO Tools for HVAC Contractors",
  description:
    "Boost your HVAC business rankings with HeatRank AI. Access local keyword research, automated review management, and SEO audits. Start your 14-day free trial today!",
  icons: {
    icon: "/heatrank-logo.png",
    apple: "/heatrank-logo.png",
  },
  openGraph: {
    title: "HeatRank AI: Local SEO Tools for HVAC Contractors",
    description:
      "Boost your HVAC business rankings with HeatRank AI. Access local keyword research, automated review management, and SEO audits.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.heatrankai.com/#organization",
        "name": "HeatRank AI",
        "url": "https://www.heatrankai.com",
        "logo": "https://www.heatrankai.com/heatrank-logo.png",
        "description": "AI-powered local SEO tools built exclusively for HVAC contractors.",
      },
      {
        "@type": "SoftwareApplication",
        "name": "HeatRank AI",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "url": "https://www.heatrankai.com",
        "offers": {
          "@type": "Offer",
          "price": "39",
          "priceCurrency": "USD",
        },
        "description": "Local SEO tools for HVAC contractors. Keyword research, review management, rank tracking, and SEO audits.",
        "publisher": { "@id": "https://www.heatrankai.com/#organization" },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
