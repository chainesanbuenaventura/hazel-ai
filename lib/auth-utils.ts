/**
 * Utility functions for PropelAuth redirect URLs
 */

export function getAuthUrl(): string {
  return process.env.NEXT_PUBLIC_AUTH_URL || ""
}

export function getOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  // Fallback for server-side
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export function getDefaultLoginRedirect(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_LOGIN_REDIRECT || "/dashboard"
}

export function getDefaultLogoutRedirect(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_LOGOUT_REDIRECT || "/"
}

/**
 * Builds a login URL - PropelAuth will callback to our app,
 * and postLoginRedirectPathFn will handle the redirect
 */
export function buildLoginUrl(redirectPath?: string): string {
  const authUrl = getAuthUrl()
  console.log("[Auth] Building login URL to:", `${authUrl}/login`)
  return `${authUrl}/login`
}

/**
 * Builds a signup URL - PropelAuth will callback to our app,
 * and postLoginRedirectPathFn will handle the redirect
 */
export function buildSignupUrl(redirectPath?: string): string {
  const authUrl = getAuthUrl()
  console.log("[Auth] Building signup URL to:", `${authUrl}/signup`)
  return `${authUrl}/signup`
}

/**
 * Builds a logout URL with redirect_to parameter (for manual redirects)
 * Note: When using useLogoutFunction() from @propelauth/react, 
 * you don't need this - it handles the logout automatically
 */
export function buildLogoutUrl(redirectPath?: string): string {
  const authUrl = getAuthUrl()
  const origin = getOrigin()
  const redirect = redirectPath || "/"
  const redirectUrl = `${origin}${redirect}`
  
  console.log("[Auth] Building logout URL with redirect_to:", redirectUrl)
  return `${authUrl}/logout?redirect_to=${encodeURIComponent(redirectUrl)}`
}

