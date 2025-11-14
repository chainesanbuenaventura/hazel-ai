import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || ""
const DEFAULT_LOGIN_REDIRECT = process.env.NEXT_PUBLIC_DEFAULT_LOGIN_REDIRECT || "/dashboard"
const DEFAULT_LOGOUT_REDIRECT = process.env.NEXT_PUBLIC_DEFAULT_LOGOUT_REDIRECT || "/"

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl

  console.log("[Middleware] Processing path:", pathname)

  // Redirect /login and /en/login to PropelAuth hosted login
  // PropelAuth will callback to /api/auth/callback and postLoginRedirectPathFn will handle the redirect
  if (pathname === "/login" || pathname === "/en/login") {
    console.log("[Middleware] Redirecting to PropelAuth login")
    return NextResponse.redirect(`${AUTH_URL}/login`)
  }

  // Redirect /signup and /en/signup to PropelAuth hosted signup
  // PropelAuth will callback to /api/auth/callback and postLoginRedirectPathFn will handle the redirect
  if (pathname === "/signup" || pathname === "/en/signup") {
    console.log("[Middleware] Redirecting to PropelAuth signup")
    return NextResponse.redirect(`${AUTH_URL}/signup`)
  }

  // For logout, we need to specify where to redirect after logout
  if (pathname === "/logout") {
    const redirectUrl = `${origin}${DEFAULT_LOGOUT_REDIRECT}`
    console.log("[Middleware] Redirecting to logout with redirect_to:", redirectUrl)
    return NextResponse.redirect(
      `${AUTH_URL}/logout?redirect_to=${encodeURIComponent(redirectUrl)}`
    )
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
    "/login",
    "/en/login",
    "/signup",
    "/en/signup",
    "/logout",
  ],
}
