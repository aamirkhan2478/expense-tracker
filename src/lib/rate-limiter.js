/**
 * Simple in-memory rate limiter for Next.js API routes.
 * NOTE: On serverless platforms (Vercel, Netlify), memory is NOT shared
 * between invocations, so this only provides limited protection per
 * function instance. For production, use Redis-based rate limiting.
 */

const rateLimitMap = new Map();

/**
 * Rate limit a request.
 * @param {Request} req - The Next.js request object
 * @param {Object} options
 * @param {number} options.maxRequests - Max requests allowed
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {string} options.keyPrefix - Prefix for the rate limit key
 * @param {string} [options.key] - Optional custom key (e.g., user email for per-user limiting)
 * @returns {{success: boolean, limit: number, remaining: number, resetTime: number}|null}
 *   Returns null if allowed, or an object with rate limit info if blocked.
 */
export function rateLimit(req, options = {}) {
  const {
    maxRequests = 5,
    windowMs = 15 * 60 * 1000, // 15 minutes
    keyPrefix = "",
    key: customKey,
  } = options;

  // Get client IP — try multiple headers for different platforms
  let ip = customKey;
  if (!ip) {
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const vercelForwarded = req.headers.get("x-vercel-forwarded-for");
    ip = vercelForwarded || forwarded || realIp || "unknown";
    if (ip && ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }
  }

  const key = `${keyPrefix}:${ip}`;

  const now = Date.now();

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
