/**
 * SEO Utilities for IronPulse Gym
 * Helper functions for SEO optimization
 */

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate page title with template
 */
export function generatePageTitle(title: string, includeTemplate = true): string {
  if (!includeTemplate) return title;
  return `${title} | IronPulse Gym`;
}

/**
 * Truncate text for meta descriptions
 */
export function truncateDescription(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate keywords array
 */
export function generateKeywords(baseKeywords: string[], pageKeywords: string[]): string[] {
  const defaultKeywords = ['gym', 'fitness', 'workout', 'IronPulse'];
  return [...new Set([...defaultKeywords, ...baseKeywords, ...pageKeywords])];
}

/**
 * Format phone number for schema
 */
export function formatPhoneForSchema(phone: string): string {
  return phone.replace(/\s+/g, '-');
}

/**
 * Generate Open Graph image URL
 */
export function getOgImageUrl(imagePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}${imagePath}`;
}

/**
 * Check if page should be indexed
 */
export function shouldIndexPage(path: string): boolean {
  const noIndexPaths = ['/dashboard', '/admin', '/login', '/signup', '/payment', '/debug'];
  return !noIndexPaths.some(noIndexPath => path.startsWith(noIndexPath));
}

/**
 * Generate breadcrumb items from path
 */
export function generateBreadcrumbs(path: string): Array<{ name: string; url: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const segments = path.split('/').filter(Boolean);

  const breadcrumbs = [{ name: 'Home', url: baseUrl }];

  let currentPath = '';
  segments.forEach(segment => {
    currentPath += `/${segment}`;
    const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    breadcrumbs.push({
      name,
      url: `${baseUrl}${currentPath}`,
    });
  });

  return breadcrumbs;
}

/**
 * SEO-friendly slug generator
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Extract excerpt from content
 */
export function extractExcerpt(content: string, maxLength = 160): string {
  const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return truncateDescription(cleanContent, maxLength);
}

/**
 * Validate metadata completeness
 */
export function validateMetadata(metadata: {
  title?: string;
  description?: string;
  keywords?: string[];
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!metadata.title) {
    errors.push('Title is required');
  } else if (metadata.title.length > 60) {
    errors.push('Title should be under 60 characters');
  }

  if (!metadata.description) {
    errors.push('Description is required');
  } else if (metadata.description.length < 120 || metadata.description.length > 160) {
    errors.push('Description should be between 120-160 characters');
  }

  if (!metadata.keywords || metadata.keywords.length === 0) {
    errors.push('Keywords are recommended');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate social sharing URLs
 */
export function generateSocialShareUrls(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  };
}
