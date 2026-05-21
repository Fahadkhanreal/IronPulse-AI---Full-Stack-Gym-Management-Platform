import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import ChatWidget from "@/components/chat/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
const ogImageUrl = new URL('/og-image.jpg', siteUrl).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "IronPulse Gym - Transform Your Body, Forge Your Strength",
    template: "%s | IronPulse Gym"
  },
  description: "IronPulse Gym offers state-of-the-art fitness facilities, expert trainers, and flexible membership plans. Join us for 24/7 access, personalized training programs, and a supportive fitness community.",
  keywords: ["gym", "fitness", "workout", "personal training", "membership", "health", "strength training", "cardio", "wellness", "IronPulse", "gym membership", "fitness center"],
  authors: [{ name: "IronPulse Gym" }],
  creator: "IronPulse Gym",
  publisher: "IronPulse Gym",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "IronPulse Gym",
    title: "IronPulse Gym - Transform Your Body, Forge Your Strength",
    description: "State-of-the-art fitness facilities with expert trainers, flexible membership plans, and 24/7 access. Start your fitness journey today.",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "IronPulse Gym - Modern Fitness Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IronPulse Gym - Transform Your Body, Forge Your Strength",
    description: "State-of-the-art fitness facilities with expert trainers and flexible membership plans.",
    images: [ogImageUrl],
    creator: "@ironpulsegym",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndFitnessClub',
    name: 'IronPulse Gym',
    description: 'State-of-the-art fitness facility with expert trainers and flexible membership plans',
    url: siteUrl,
    telephone: '+1-555-123-4567',
    email: 'info@ironpulse.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Fitness Street',
      addressLocality: 'Gym City',
      addressRegion: 'GC',
      postalCode: '12345',
      addressCountry: 'US',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '05:00',
        closes: '23:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '06:00',
        closes: '22:00',
      },
    ],
    priceRange: '$$',
    sameAs: [
      'https://facebook.com/ironpulsegym',
      'https://twitter.com/ironpulsegym',
      'https://instagram.com/ironpulsegym',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className} style={{ overflowX: 'hidden', maxWidth: '100vw', boxSizing: 'border-box' }}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <ConditionalNavbar />
            <main className="flex-1">{children}</main>
            <ConditionalFooter />
          </div>
        </Providers>
        <ChatWidget />
      </body>
    </html>
  );
}
