# Rate Limiting Implementation Guide

**Date**: 2026-05-10  
**Status**: ✅ Fully Implemented

---

## Overview

Rate limiting has been implemented across all API endpoints to protect against abuse, brute force attacks, and excessive API usage. The implementation uses an in-memory store with automatic cleanup.

---

## Rate Limit Configuration

### 1. **Authentication Endpoints** (Strictest)
- **Endpoints**: `/api/v1/auth/signup`, `/api/v1/auth/login`
- **Limit**: 5 requests per 15 minutes per IP
- **Purpose**: Prevent brute force attacks on authentication
- **Key**: IP address only (not user-based)
- **Middleware**: `authRateLimit`

### 2. **Chat Endpoints** (AI Chatbot)
- **Endpoints**: `/api/v1/chat`, `/api/v1/chat/non-stream`
- **Limit**: 10 requests per minute per user/IP
- **Purpose**: Prevent AI API abuse and control costs
- **Key**: User ID (if authenticated) or IP address
- **Middleware**: `chatRateLimit`

### 3. **Payment Endpoints**
- **Endpoints**: `/api/v1/payments/create-checkout-session`, `/api/v1/payments/verify`
- **Limit**: 10 requests per minute per user/IP
- **Purpose**: Prevent payment fraud and excessive checkout attempts
- **Key**: User ID (if authenticated) or IP address
- **Middleware**: `paymentRateLimit`
- **Note**: Payment callbacks from providers are NOT rate limited

### 4. **Booking Endpoints**
- **Endpoints**: `/api/v1/bookings/*`
- **Limit**: 20 requests per minute per user/IP
- **Purpose**: Prevent booking spam
- **Key**: User ID (if authenticated) or IP address
- **Middleware**: `bookingRateLimit`

### 5. **Admin Endpoints** (Most Lenient)
- **Endpoints**: `/api/v1/admin/*`
- **Limit**: 100 requests per minute per admin user
- **Purpose**: Allow admins to work efficiently while preventing abuse
- **Key**: User ID (if authenticated) or IP address
- **Middleware**: `adminRateLimit`

### 6. **Public API Endpoints**
- **Endpoints**: `/api/v1/plans`, `/api/v1/trainers`, `/api/v1/testimonials`
- **Limit**: 60 requests per minute per IP
- **Purpose**: Prevent scraping and excessive public API usage
- **Key**: IP address only
- **Middleware**: `publicApiRateLimit`

---

## Implementation Details

### Middleware Location
`backend/src/middleware/rateLimit.middleware.ts`

### Key Features
- ✅ In-memory storage (no external dependencies)
- ✅ Automatic cleanup of expired entries (every 5 minutes)
- ✅ Configurable time windows and request limits
- ✅ Custom key generators (user ID or IP based)
- ✅ Standard HTTP headers (X-RateLimit-*)
- ✅ 429 status code with retry-after header
- ✅ User-friendly error messages

### Response Headers
When rate limit is active, the following headers are sent:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1715356800000
Retry-After: 45 (only when limit exceeded)
```

### Error Response (429 Too Many Requests)
```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 45
}
```

---

## Testing Rate Limits

### Test Authentication Rate Limit (5 req/15min)
```bash
# Try 6 login attempts in quick succession
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done

# Expected: First 5 succeed (or fail with 401), 6th returns 429
```

### Test Chat Rate Limit (10 req/min)
```bash
# Try 11 chat requests in quick succession
for i in {1..11}; do
  curl -X POST http://localhost:5000/api/v1/chat/non-stream \
    -H "Content-Type: application/json" \
    -d '{"message":"Hello"}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done

# Expected: First 10 succeed, 11th returns 429
```

### Test Public API Rate Limit (60 req/min)
```bash
# Try 61 requests to public endpoint
for i in {1..61}; do
  curl http://localhost:5000/api/v1/plans \
    -w "\nStatus: %{http_code}\n\n"
done

# Expected: First 60 succeed, 61st returns 429
```

---

## Monitoring & Metrics

### Current Limitations
- In-memory storage (resets on server restart)
- No distributed rate limiting (single server only)
- No persistent rate limit history

### Recommended Improvements for Production
1. **Redis-based rate limiting** for distributed systems
2. **Persistent storage** for rate limit history
3. **Monitoring dashboard** to track rate limit hits
4. **Alerts** when rate limits are frequently exceeded
5. **IP whitelist** for trusted services
6. **Dynamic rate limits** based on user tier/subscription

---

## Configuration Options

### Adjusting Rate Limits
Edit `backend/src/middleware/rateLimit.middleware.ts`:

```typescript
// Example: Increase auth rate limit to 10 requests per 15 minutes
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // Changed from 5 to 10
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `auth:${ip}`;
  },
});
```

### Custom Rate Limiters
Create custom rate limiters for specific use cases:

```typescript
// Example: Strict rate limit for sensitive operations
export const sensitiveOperationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // Only 3 requests per hour
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return `sensitive:${user?.userId || req.ip}`;
  },
});
```

---

## Security Considerations

### Bypass Prevention
- ✅ Rate limits applied before authentication (for auth endpoints)
- ✅ IP-based tracking for unauthenticated requests
- ✅ User-based tracking for authenticated requests
- ✅ Separate keys for different endpoint types

### Known Limitations
- ⚠️ IP-based rate limiting can be bypassed with VPNs/proxies
- ⚠️ In-memory storage doesn't work across multiple servers
- ⚠️ No protection against distributed attacks (DDoS)

### Recommendations
- Use Cloudflare or similar CDN for DDoS protection
- Implement Redis-based rate limiting for production
- Add IP reputation checking
- Monitor for suspicious patterns

---

## Troubleshooting

### Issue: Rate limit hit too quickly
**Solution**: Increase `maxRequests` or `windowMs` for the specific endpoint

### Issue: Rate limit not working
**Solution**: Check middleware order - rate limit should be before authentication for auth endpoints

### Issue: Rate limit persists after server restart
**Solution**: This is expected with in-memory storage. Use Redis for persistent rate limiting.

### Issue: Different users sharing same rate limit
**Solution**: Check if authentication middleware is running before rate limit middleware

---

## Summary

✅ **All API endpoints are now protected with appropriate rate limits**

| Endpoint Type | Limit | Window | Key |
|--------------|-------|--------|-----|
| Auth | 5 | 15 min | IP |
| Chat | 10 | 1 min | User/IP |
| Payment | 10 | 1 min | User/IP |
| Booking | 20 | 1 min | User/IP |
| Admin | 100 | 1 min | User/IP |
| Public API | 60 | 1 min | IP |

**Next Steps**:
1. Monitor rate limit hits in production
2. Adjust limits based on actual usage patterns
3. Consider Redis implementation for scaling
4. Add rate limit metrics to admin dashboard
