import { Request, Response, NextFunction } from 'express';
import { buildRateLimitMessage } from '../utils/prompt.utils';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Key format: "userId:{id}" or "ip:{ip}"
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Max requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
}

/**
 * Rate limiting middleware
 * Default: 10 requests per minute per user/IP
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    maxRequests = 10,
    keyGenerator = defaultKeyGenerator,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    // Create new entry if doesn't exist or window expired
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());

      return res.status(429).json({
        success: false,
        error: buildRateLimitMessage(),
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
      });
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());

    next();
  };
}

/**
 * Default key generator
 * Uses userId if authenticated, otherwise uses IP address
 */
function defaultKeyGenerator(req: Request): string {
  const user = (req as any).user;

  if (user?.userId) {
    return `userId:${user.userId}`;
  }

  // Fallback to IP address for guest users
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `ip:${ip}`;
}

/**
 * Chat-specific rate limiter
 * 10 requests per minute per user/IP
 */
export const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
});

/**
 * Auth rate limiter (signup/login)
 * Stricter limit to prevent brute force attacks
 * 15 requests per 5 minutes per IP (more lenient for legitimate users)
 */
export const authRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (reduced from 15)
  maxRequests: 15, // Increased from 5 to 15
  keyGenerator: (req: Request) => {
    // Always use IP for auth endpoints (even if authenticated)
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `auth:${ip}`;
  },
});

/**
 * Payment rate limiter
 * Moderate limit for payment operations
 * 10 requests per minute per user
 */
export const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
});

/**
 * Booking rate limiter
 * 20 requests per minute per user
 */
export const bookingRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
});

/**
 * Admin rate limiter
 * More lenient for admin operations
 * 100 requests per minute per admin user
 */
export const adminRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
});

/**
 * Public API rate limiter
 * For public endpoints like plans, trainers, testimonials
 * 60 requests per minute per IP
 */
export const publicApiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `public:${ip}`;
  },
});
