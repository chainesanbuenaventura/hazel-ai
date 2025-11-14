import { getRouteHandlers, getUserOrRedirect } from "@propelauth/nextjs/server/app-router"

export const routeHandlers = getRouteHandlers({
  postLoginRedirectPathFn: () => {
    // Always redirect to /dashboard after successful login
    console.log("[PropelAuth] Redirecting to /dashboard")
    return "/dashboard"
  },
})

export { getUserOrRedirect }
