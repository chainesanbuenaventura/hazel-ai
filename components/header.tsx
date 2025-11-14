"use client"

import { Button } from "@/components/ui/button"
import { useAuthInfo, useLogoutFunction } from "@propelauth/react"
import { buildLoginUrl, buildSignupUrl, getAuthUrl, buildLogoutUrl } from "@/lib/auth-utils"

export function Header() {
  const { loading, isLoggedIn } = useAuthInfo()
  const logoutFn = useLogoutFunction()

  const handleLogin = () => {
    console.log("[Header] Login button clicked")
    window.location.href = buildLoginUrl("/dashboard")
  }

  const handleSignup = () => {
    console.log("[Header] Signup button clicked")
    window.location.href = buildSignupUrl("/dashboard")
  }

  const handleLogout = async () => {
    console.log("[Header] Logout button clicked")
    await logoutFn(true) // true = redirect to PropelAuth logout page
    window.location.href = "/"
  }

  const handleAccount = () => {
    const authUrl = getAuthUrl()
    if (authUrl) {
      window.location.href = `${authUrl}/account`
    }
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}>
              <span className="text-lg font-bold text-white">H</span>
            </div>
            <span className="text-xl font-semibold text-gray-700">Hazel AI</span>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#roles"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Roles
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
            ) : isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/dashboard">Dashboard</a>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleAccount}>
                  Account
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleLogin}>
                  Sign in
                </Button>
                <Button 
                  size="sm" 
                  className="text-white border-0 shadow-md hover:shadow-lg transition-all" 
                  style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}
                  onClick={handleSignup}
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
