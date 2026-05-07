import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with IronPulse Gym. Visit us at 123 Fitness Street, call +1 (555) 123-4567, or send us a message. We're here to answer your questions about memberships, training programs, and facilities.",
  keywords: ["contact gym", "gym location", "gym phone number", "gym address", "fitness center contact"],
  openGraph: {
    title: "Contact Us | IronPulse Gym",
    description: "Get in touch with IronPulse Gym. We're here to answer your questions about memberships and training programs.",
    type: "website",
    images: [
      {
        url: "/og-contact.jpg",
        width: 1200,
        height: 630,
        alt: "Contact IronPulse Gym",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | IronPulse Gym",
    description: "Get in touch with IronPulse Gym. We're here to answer your questions.",
    images: ["/og-contact.jpg"],
  },
};
