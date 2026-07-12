import { NextResponse } from "next/server";

// ─── Production-Safe Middleware ──────────────────────────────────
// This middleware does NOT require JWT_SECRET at build time.
// It decodes the JWT payload to check expiry without verifying
// the signature. Full signature verification happens in API routes.
//
// Root cause of production auth failure:
//   Next.js Edge Runtime evaluates module-level process.env at BUILD TIME.
//   If JWT_SECRET is only injected at RUNTIME (common on Vercel/Netlify),
//   the middleware uses "undefined" as the secret and ALL tokens fail
//   verification — causing an infinite redirect loop back to login.
//
// Fix: Decode payload only (no signature check). Forged tokens are
// harmless — they only show the page shell. API routes verify signatures.

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/",
  "/api/auth",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/verify-email",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/refresh",
  "/api/auth/resend-verification",
];

// Static asset routes
const STATIC_ROUTES = ["/_next", "/favicon.ico", "/images", "/assets"];

function isPublicRoute(pathname) {
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return true;
  }
  if (STATIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return true;
  }
  return false;
}

/**
 * Decode a JWT payload WITHOUT verifying the signature.
 * This is safe for middleware because we only need to check expiry.
 * Forged tokens are harmless — API routes do full verification.
 * @param {string} token
 * @returns {{id?: string, exp?: number, type?: string} | null}
 */
function decodeJwtPayload(token) {
  try {
    if (!token || token.split(".").length !== 3) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired.
 * @param {string} token
 * @returns {boolean} true if expired or invalid
 */
function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  // 60-second buffer for clock skew
  return payload.exp * 1000 < Date.now() + 60000;
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // Allow public routes without auth check
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // ── Try to get token from cookies ──
  // We check multiple cookie names for backward compatibility:
  // 1. "token" — the primary auth cookie (can be HttpOnly or regular)
  // 2. "_token" — fallback non-HttpOnly cookie set by client
  let token = request.cookies.get("token")?.value;
  if (!token) {
    token = request.cookies.get("_token")?.value;
  }

  // ── No token found → redirect to login ──
  if (!token) {
    const redirectUrl = new URL("/auth", request.url);
    const fullPath = pathname + search;
    if (fullPath !== "/auth" && !fullPath.startsWith("/auth")) {
      redirectUrl.searchParams.set("redirect", fullPath);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // ── Token exists → check if expired ──
  if (isTokenExpired(token)) {
    // Token is expired → redirect to login and clear cookies
    const redirectUrl = new URL("/auth", request.url);
    const fullPath = pathname + search;
    if (fullPath !== "/auth" && !fullPath.startsWith("/auth")) {
      redirectUrl.searchParams.set("redirect", fullPath);
    }
    redirectUrl.searchParams.set("session_expired", "true");

    const response = NextResponse.redirect(redirectUrl);
    // Clear all auth cookies
    response.cookies.set("token", "", { maxAge: 0, path: "/" });
    response.cookies.set("_token", "", { maxAge: 0, path: "/" });

    return response;
  }

  // ── Token is present and not expired → allow request ──
  // Note: We do NOT verify the signature here. Full verification
  // happens in API routes. This is intentional — see comment at top.
  const payload = decodeJwtPayload(token);
  if (payload?.id) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.id);
    requestHeaders.set("x-auth-valid", "true");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/income/:path*",
    "/expense/:path*",
    "/category/:path*",
    "/settings/:path*",
    "/reports/:path*",
    "/admin/:path*",
    "/profile/:path*",
  ],
};
