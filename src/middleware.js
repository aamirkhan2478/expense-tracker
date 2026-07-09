import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname, search } = request.nextUrl;

  // If no token, redirect to auth with the intended destination preserved
  if (!token) {
    const redirectUrl = new URL("/auth", request.url);
    const fullPath = pathname + search;
    if (fullPath !== "/auth" && !fullPath.startsWith("/auth")) {
      redirectUrl.searchParams.set("redirect", fullPath);
    }
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/income", "/expense", "/category", "/settings", "/reports"],
};
