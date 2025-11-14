"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AuthModal } from "./auth-modal"

interface AuthContextType {
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

const CORRECT_ACCESS_KEY = "ZepHRbeta"
const AUTH_SESSION_KEY = "hr_copilot_auth"

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  // Check if current path requires authentication
  const requiresAuth = pathname?.startsWith("/dashboard")

  // Check session storage on mount
  useEffect(() => {
    const storedAuth = sessionStorage.getItem(AUTH_SESSION_KEY)
    if (storedAuth === "true") {
      setIsAuthenticated(true)
    }
    setIsInitialized(true)
  }, [])

  // Show auth modal when accessing protected routes without authentication
  useEffect(() => {
    if (isInitialized && requiresAuth && !isAuthenticated) {
      setShowAuthModal(true)
    } else {
      setShowAuthModal(false)
    }
  }, [isInitialized, requiresAuth, isAuthenticated])

  const handleAuthenticate = async (accessKey: string) => {
    setIsLoading(true)
    setError(null)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (accessKey === CORRECT_ACCESS_KEY) {
      setIsAuthenticated(true)
      setShowAuthModal(false)
      sessionStorage.setItem(AUTH_SESSION_KEY, "true")
    } else {
      setError("Invalid access key. Please try again.")
    }

    setIsLoading(false)
  }

  const logout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    router.push("/landing-page")
  }

  // Don't render children for protected routes until authentication is checked
  if (!isInitialized) {
    return <div>Loading...</div>
  }

  if (requiresAuth && !isAuthenticated) {
    return (
      <>
        <AuthModal isOpen={showAuthModal} onAuthenticate={handleAuthenticate} isLoading={isLoading} error={error} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please authenticate to access this page.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
      <AuthModal isOpen={showAuthModal} onAuthenticate={handleAuthenticate} isLoading={isLoading} error={error} />
    </AuthContext.Provider>
  )
}
