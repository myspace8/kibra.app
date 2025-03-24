// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl

  // Skip API, static files, and auth routes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Check for the NextAuth session token
  const isAuthenticated = !!req.cookies.get("__Secure-next-auth.session-token") || !!req.cookies.get("next-auth.session-token")
console.log(isAuthenticated);

  // Protect /home
  if (pathname === "/home" && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", origin))
  }

  // Redirect authenticated users from public routes
  if (
    (pathname === "/" || pathname === "/login" || pathname === "/signup") &&
    isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/home", origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
}