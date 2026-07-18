import { NextResponse as res } from "next/server";
import jwt from "jsonwebtoken";

/**
 * Verify that the request has a valid admin JWT.
 * Checks Authorization header first, then falls back to cookies.
 * Returns { user: { id, role } } on success.
 * Returns a NextResponse error on failure — the caller should return early.
 */
export async function requireAdmin(request) {
  let token = null;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token) {
    token = request.cookies.get("token")?.value || request.cookies.get("_token")?.value;
  }

  if (!token) {
    return {
      error: res.json({ success: false, error: "Authentication required" }, { status: 401 }),
    };
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "spendwise",
      audience: "spendwise-client",
    });
  } catch {
    return {
      error: res.json({ success: false, error: "Invalid or expired token" }, { status: 401 }),
    };
  }

  if (payload.role !== "admin") {
    return {
      error: res.json({ success: false, error: "Admin access required" }, { status: 403 }),
    };
  }

  return {
    user: { id: payload.id, role: payload.role },
  };
}
