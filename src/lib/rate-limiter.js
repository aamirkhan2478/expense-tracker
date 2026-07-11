/**
 * Simple in-memory rate limiter for Next.js API routes.
 * In production, replace with Redis-based rate limiting.
 */

const rateLimitMap = new Map();

/**
 * Rate limit a request.
 * @param {Request} req - The Next.js request object
 * @param {Object} options
 * @param {number} options.maxRequests - Max requests allowed
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {string} options.keyPrefix - Prefix for the rate limit key
 * @returns {{success: boolean, limit: number, remaining: number, resetTime: number}|null}
 *   Returns null if allowed, or an object with rate limit info if blocked.
 */
export function rateLimit(req, options = {}) {
  const {
    maxRequests = 5,
    windowMs = 15 * 60 * 1000, // 15 minutes
    keyPrefix = "",
  } = options;

  // Get client IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const key = `${keyPrefix}:${ip}`;

  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or create entry
  let entry = rateLimitMap.get(key);
  if (!entry) {
    entry = { count: 0, resetTime: now + windowMs };
    rateLimitMap.set(key, entry);
  }

  // Reset if window has passed
  if (entry.resetTime < now) {
    entry.count = 0;
    entry.resetTime = now + windowMs;
  }

  // Check limit
  if (entry.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  return null; // Allowed
}

/**
 * Clean up expired entries periodically to prevent memory leaks.
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

export default rateLimit;
