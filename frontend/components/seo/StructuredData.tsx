import React from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'HealthAndFitnessClub',
  name: 'IronPulse Gym',
  description: 'State-of-the-art fitness facility with expert trainers and flexible membership plans',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`,
  image: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/og-image.jpg`,
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
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '40.7484',
    longitude: '-73.9875',
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

// Local Business Schema
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/#localbusiness`,
  name: 'IronPulse Gym',
  image: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/og-image.jpg`,
  telephone: '+1-555-123-4567',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Fitness Street',
    addressLocality: 'Gym City',
    addressRegion: 'GC',
    postalCode: '12345',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '40.7484',
    longitude: '-73.9875',
  },
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
};

// Website Schema
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'IronPulse Gym',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  description: 'Transform your body, forge your strength with state-of-the-art facilities and expert trainers',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Service Schema for Gym Plans
export function generateServiceSchema(plan: {
  title: string;
  description: string;
  price: number;
  duration: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Gym Membership',
    name: plan.title,
    description: plan.description,
    provider: {
      '@type': 'HealthAndFitnessClub',
      name: 'IronPulse Gym',
    },
    offers: {
      '@type': 'Offer',
      price: plan.price,
      priceCurrency: 'PKR',
      availability: 'https://schema.org/InStock',
    },
  };
}

// Person Schema for Trainers
export function generatePersonSchema(trainer: {
  name: string;
  specialization: string;
  experience: number;
  image: string;
  bio?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: trainer.name,
    jobTitle: `Fitness Trainer - ${trainer.specialization}`,
    description: trainer.bio || `${trainer.experience} years of experience in ${trainer.specialization}`,
    image: trainer.image,
    worksFor: {
      '@type': 'HealthAndFitnessClub',
      name: 'IronPulse Gym',
    },
  };
}
