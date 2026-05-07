import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Expert Personal Trainers",
  description: "Meet our certified fitness trainers at IronPulse Gym. Our experienced professionals specialize in strength training, cardio, nutrition, and personalized workout programs to help you achieve your fitness goals.",
  keywords: ["personal trainers", "fitness coaches", "certified trainers", "gym trainers", "workout experts", "fitness professionals"],
  openGraph: {
    title: "Expert Personal Trainers | IronPulse Gym",
    description: "Meet our certified fitness trainers specializing in strength training, cardio, and personalized programs.",
    type: "website",
    images: [
      {
        url: "/og-trainers.jpg",
        width: 1200,
        height: 630,
        alt: "IronPulse Gym Professional Trainers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Expert Personal Trainers | IronPulse Gym",
    description: "Meet our certified fitness trainers specializing in strength training, cardio, and personalized programs.",
    images: ["/og-trainers.jpg"],
  },
};
