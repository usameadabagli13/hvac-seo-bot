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
  metadataBase: new URL("https://www.heatrankai.com"),
  title: "HeatRank AI — Show Up First When Locals Google 'HVAC Near Me'",
  description:
    "AI-powered local SEO built for HVAC contractors who want the phone to ring. Rank higher on Google, manage reviews, and track your local rankings — no agency, no contracts, no $2,000/mo bills. 14-day free trial, 30-day money-back guarantee.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Show up first when locals Google 'HVAC near me' | HeatRank AI",
    description:
      "AI-powered local SEO built for HVAC contractors who want the phone to ring. No agency, no contracts, no $2,000/mo bills.",
    type: "website",
    url: "/",
    siteName: "HeatRank AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Show up first when locals Google 'HVAC near me'",
    description:
      "AI-powered local SEO for HVAC contractors. Rank higher on Google — no agency, no contracts, no $2,000/mo bills.",
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
        "alternateName": "HeatRank",
        "url": "https://www.heatrankai.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.heatrankai.com/heatrank-logo.png",
          "width": 512,
          "height": 512,
        },
        "description": "AI-powered local SEO tools built exclusively for HVAC contractors. Rank higher on Google, manage reviews, and track keywords — without an agency.",
        "foundingDate": "2025",
        "knowsAbout": [
          "HVAC SEO",
          "Local SEO",
          "HVAC Marketing",
          "Google Business Profile Optimization",
          "HVAC Keyword Research",
          "Review Management",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://www.heatrankai.com/#website",
        "url": "https://www.heatrankai.com",
        "name": "HeatRank AI",
        "description": "Local SEO Tools for HVAC Contractors",
        "publisher": { "@id": "https://www.heatrankai.com/#organization" },
        "inLanguage": "en-US",
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://www.heatrankai.com/#software",
        "name": "HeatRank AI",
        "alternateName": ["HeatRank", "HVAC SEO Tool", "HVAC SEO Software"],
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "SEO Software",
        "operatingSystem": "Web",
        "url": "https://www.heatrankai.com",
        "keywords": "HVAC SEO, HVAC local SEO, HVAC keyword research, HVAC review management, HVAC Google rankings, HVAC contractor marketing, local SEO for HVAC, HVAC rank tracking, HVAC SEO audit",
        "featureList": [
          "HVAC Local Keyword Research",
          "AI-Powered Review Reply Generation",
          "Google Business Profile Rank Tracking",
          "Local SEO Audit",
          "Competitor Tracking",
          "Schema Markup Generation",
          "Weekly PDF Reports",
          "White-Label Reports",
          "Multi-Location Business Support",
        ],
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "39",
          "highPrice": "199",
          "priceCurrency": "USD",
          "offerCount": "3",
          "offers": [
            {
              "@type": "Offer",
              "name": "Starter",
              "price": "39",
              "priceCurrency": "USD",
              "description": "For solo HVAC contractors exploring local SEO. 1 business, AI keyword generation, review replies.",
            },
            {
              "@type": "Offer",
              "name": "Pro",
              "price": "69",
              "priceCurrency": "USD",
              "description": "Everything HVAC contractors need to dominate local search. 5 businesses, unlimited AI features, rank tracking, competitor analysis.",
            },
            {
              "@type": "Offer",
              "name": "Agency",
              "price": "199",
              "priceCurrency": "USD",
              "description": "For agencies managing multiple HVAC clients. Unlimited businesses, white-label reports, sub-account management.",
            },
          ],
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "24",
          "bestRating": "5",
          "worstRating": "1",
        },
        "description": "HeatRank AI is the only local SEO platform built exclusively for HVAC contractors. Rank higher on Google with AI-powered keyword research, automated review replies, rank tracking, and SEO audits — without hiring an SEO agency.",
        "publisher": { "@id": "https://www.heatrankai.com/#organization" },
        "isAccessibleForFree": false,
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is HeatRank AI?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "HeatRank AI is an AI-powered local SEO platform built exclusively for HVAC contractors. It helps heating and cooling businesses rank higher on Google with tools for keyword research, review management, rank tracking, SEO audits, and competitor analysis — all without needing an SEO agency.",
            },
          },
          {
            "@type": "Question",
            "name": "How much does HeatRank AI cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "HeatRank AI offers three plans: Starter at $39/month, Pro at $69/month, and Agency at $199/month. Annual billing saves approximately 20%. All plans start with a 14-day free trial — no credit card required.",
            },
          },
          {
            "@type": "Question",
            "name": "Do I need any SEO or technical knowledge to use HeatRank AI?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Not at all. HeatRank AI is built for HVAC contractors, not marketers. Everything is explained in plain English, and the AI does the heavy lifting — you just review and approve.",
            },
          },
          {
            "@type": "Question",
            "name": "Will HeatRank AI work for my city?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. The AI generates location-specific keywords for any US city. Whether you're in Dallas or Boise, your HVAC keywords will be tailored to your exact service area and local competition.",
            },
          },
          {
            "@type": "Question",
            "name": "Can I cancel my HeatRank AI subscription anytime?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. All plans are month-to-month with no long-term contracts. You can cancel with one click from your account settings — no phone calls, no cancellation fees.",
            },
          },
          {
            "@type": "Question",
            "name": "Does HeatRank AI manage Google reviews automatically?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. HeatRank AI generates AI-powered reply variants for every Google review your HVAC business receives. You pick the best reply and post it — the whole process takes seconds.",
            },
          },
        ],
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
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-zinc-950 focus:text-sm focus:font-semibold focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
