import jwt from "jsonwebtoken";
import TokenBlacklist from "@/models/token-blacklist";
import User from "@/models/user";

/**
 * Verify a JWT token and check if it's blacklisted.
 * @param {string} token
 * @returns {Promise<{valid: boolean, payload: object|null, error: string|null}>}
 */
export async function verifyToken(token) {
  try {
    if (!token) {
      return { valid: false, payload: null, error: "No token provided" };
    }

    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      return { valid: false, payload: null, error: "Token has been revoked" };
    }

    // Verify JWT signature and expiry
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(payload.id);
    if (!user) {
      return { valid: false, payload: null, error: "User no longer exists" };
    }

    return { valid: true, payload, error: null };
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return { valid: false, payload: null, error: "Token expired" };
    }
    if (err.name === "JsonWebTokenError") {
      return { valid: false, payload: null, error: "Invalid token" };
    }
    return { valid: false, payload: null, error: "Token verification failed" };
  }
}

/**
 * Blacklist a token (logout/revocation).
 * @param {string} token
 * @param {string} userId
 * @param {string} reason
 * @returns {Promise<boolean>}
 */
export async function blacklistToken(token, userId, reason = "logout") {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return false;

    await TokenBlacklist.create({
      token,
      userId,
      expiresAt: new Date(decoded.exp * 1000),
      type: "access",
      reason,
    });

    return true;
  } catch (err) {
    console.error("[AuthService] Failed to blacklist token:", err.message);
    return false;
  }
}

/**
 * Sanitize and normalize user input.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeInput(str) {
  if (typeof str !== "string") return "";
  return str.trim().replace(/[<>]/g, "");
}

/**
 * Normalize email address.
 * @param {string} email
 * @returns {string}
 */
export function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

/**
 * Create a standardized error response.
 * @param {string} message
 * @param {number} status
 * @returns {Response}
 */
export function authError(message, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Create a standardized success response.
 * @param {object} data
 * @param {number} status
 * @returns {Response}
 */
export function authSuccess(data, status = 200) {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Extract token from request headers.
 * @param {Request} req
 * @returns {string|null}
 */
export function extractToken(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Extract and securely verify the authenticated user ID from request headers or cookies.
 * Does not trust any client-supplied userId in body or query parameters.
 * @param {Request} req
 * @returns {Promise<{ userId: string|null, error: string|null, status: number }>}
 */
export async function getAuthenticatedUserId(req) {
  let token = extractToken(req);

  if (!token && req.cookies) {
    token = req.cookies.get("token")?.value || req.cookies.get("_token")?.value;
  }

  if (!token && req.headers) {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)(?:token|_token)=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    return { userId: null, error: "Unauthorized: Authentication token is missing", status: 401 };
  }

  const { valid, payload, error } = await verifyToken(token);
  if (!valid || !payload?.id) {
    return { userId: null, error: error || "Unauthorized: Invalid or expired token", status: 401 };
  }

  return { userId: payload.id.toString(), error: null, status: 200 };
}

