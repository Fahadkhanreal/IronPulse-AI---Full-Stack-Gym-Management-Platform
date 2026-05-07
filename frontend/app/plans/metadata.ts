import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Membership Plans & Pricing",
  description: "Flexible gym membership plans at IronPulse Gym. Choose from monthly, quarterly, or annual memberships with 24/7 access, personal training sessions, and premium facilities. Find the perfect plan for your fitness journey.",
  keywords: ["gym membership", "fitness plans", "gym pricing", "membership packages", "gym subscription", "fitness membership"],
  openGraph: {
    title: "Membership Plans & Pricing | IronPulse Gym",
    description: "Flexible gym membership plans with 24/7 access, personal training, and premium facilities.",
    type: "website",
    images: [
      {
        url: "/og-plans.jpg",
        width: 1200,
        height: 630,
        alt: "IronPulse Gym Membership Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Membership Plans & Pricing | IronPulse Gym",
    description: "Flexible gym membership plans with 24/7 access, personal training, and premium facilities.",
    images: ["/og-plans.jpg"],
  },
};
