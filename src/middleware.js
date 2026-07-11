import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

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
  // Check exact matches
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return true;
  }
  // Check static routes
  if (STATIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return true;
  }
  return false;
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // Allow public routes without auth check
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookie or authorization header
  const token = request.cookies.get("token")?.value;

  // If no token, redirect to auth
  if (!token) {
    const redirectUrl = new URL("/auth", request.url);
    const fullPath = pathname + search;
    if (fullPath !== "/auth" && !fullPath.startsWith("/auth")) {
      redirectUrl.searchParams.set("redirect", fullPath);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // ── Validate JWT Token ──
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "spendwise",
      audience: "spendwise-client",
      clockTolerance: 60, // 60 seconds tolerance for clock skew
    });

    // Check token type
    if (payload.type !== "access") {
      throw new Error("Invalid token type");
    }

    // Token is valid - attach user info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.id);
    requestHeaders.set("x-auth-valid", "true");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    // Token is invalid or expired - redirect to login
    const redirectUrl = new URL("/auth", request.url);
    const fullPath = pathname + search;
    if (fullPath !== "/auth" && !fullPath.startsWith("/auth")) {
      redirectUrl.searchParams.set("redirect", fullPath);
    }
    // Add session_expired flag
    redirectUrl.searchParams.set("session_expired", "true");

    // Clear the invalid cookie
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  }
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
