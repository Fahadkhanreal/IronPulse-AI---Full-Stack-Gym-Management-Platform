import { Metadata } from 'next';

export const siteConfig = {
  name: "IronPulse Gym",
  description: "Transform your body, forge your strength with state-of-the-art facilities and expert trainers",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/ironpulsegym",
    facebook: "https://facebook.com/ironpulsegym",
    instagram: "https://instagram.com/ironpulsegym",
  },
};

export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  noIndex = false,
  ...props
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
} & Metadata = {}): Metadata {
  return {
    title,
    description,
    keywords: ["gym", "fitness", "workout", "personal training", "membership", "health", "strength training"],
    authors: [{ name: "IronPulse Gym" }],
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@ironpulsegym",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    ...props,
  };
}
