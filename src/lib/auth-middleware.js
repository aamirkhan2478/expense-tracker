import { NextResponse as res } from "next/server";
import User from "@/models/user";
import { verifyToken } from "@/lib/auth-service";

/**
 * Extract a bearer token or auth cookie from the request.
 * Checks the Authorization header first, then falls back to cookies.
 * @param {Request} request
 * @returns {string|null}
 */
function extractTokenFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return request.cookies.get("token")?.value || request.cookies.get("_token")?.value;
}

/**
 * Verify that the request carries a valid, non-revoked access token belonging to
 * an existing user.
 *
 * The role is read from the database rather than from the JWT payload so that
 * role changes and account deletions take effect immediately instead of at token
 * expiry. The user ID returned here is the only trustworthy identity for the
 * request — never read a user ID from the body or query string.
 *
 * Returns { user: { id, role } } on success.
 * Returns { error: NextResponse } on failure — the caller must return early.
 *
 * @param {Request} request
 * @returns {Promise<{user?: {id: string, role: string}, error?: import('next/server').NextResponse}>}
 */
export async function requireUser(request) {
  const token = extractTokenFromRequest(request);

  if (!token) {
    return {
      error: res.json({ success: false, error: "Authentication required" }, { status: 401 }),
    };
  }

  const { valid, payload, error } = await verifyToken(token, { requiredType: "access" });

  if (!valid || !payload?.id) {
    return {
      error: res.json(
        { success: false, error: error || "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  const user = await User.findById(payload.id).select("role").lean();

  if (!user) {
    return {
      error: res.json({ success: false, error: "Authentication required" }, { status: 401 }),
    };
  }

  return { user: { id: user._id.toString(), role: user.role } };
}

/**
 * Verify that the request has a valid admin JWT.
 * Checks Authorization header first, then falls back to cookies.
 * Returns { user: { id, role } } on success.
 * Returns a NextResponse error on failure — the caller should return early.
 *
 * @param {Request} request
 * @returns {Promise<{user?: {id: string, role: string}, error?: import('next/server').NextResponse}>}
 */
export async function requireAdmin(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth;

  if (auth.user.role !== "admin") {
    return {
      error: res.json({ success: false, error: "Admin access required" }, { status: 403 }),
    };
  }

  return { user: auth.user };
}
