"use client"

import type React from "react"
import { useEffect } from "react"
import { useAuthInfo } from "@propelauth/react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AIPanelProvider } from "@/components/ai-panel-context"
import { SidebarContextProvider, useSidebarContext } from "@/components/sidebar-context"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarContext()
  
  return (
    <>
      <AppSidebar />
      <SidebarInset className="!m-0 md:!m-0 md:rounded-none md:shadow-none">
        <main className={`flex-1 min-h-screen overflow-auto pr-0 pt-6 pb-0 text-[12px] leading-tight [&_*]:text-[12px] [&_*]:leading-tight [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg transition-all duration-300 ${isCollapsed ? 'pl-16' : 'pl-60'} relative`} style={{ background: 'linear-gradient(135deg, #fafbfc 0%, #f5f7fa 25%, #f0f4f8 50%, #eef2f6 75%, #fafbfc 100%)' }}>
          {/* Pearly shimmer overlay */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(230,240,255,0.4) 25%, rgba(255,245,250,0.5) 50%, rgba(240,248,255,0.4) 75%, rgba(255,255,255,0.8) 100%)' }} />
          {/* Iridescent overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'linear-gradient(45deg, rgba(138,180,248,0.1) 0%, rgba(221,160,221,0.1) 25%, rgba(173,216,230,0.1) 50%, rgba(255,182,193,0.1) 75%, rgba(138,180,248,0.1) 100%)' }} />
          {/* Subtle pearl texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.4)_1px,transparent_0)] [background-size:32px_32px] opacity-30 pointer-events-none" />
          {/* Content */}
          <div className="relative z-10">{children}</div>
        </main>
      </SidebarInset>
    </>
  )
}

export function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading, isLoggedIn, user, accessToken } = useAuthInfo()

  console.log("[Dashboard] Auth state:", { loading, isLoggedIn, hasUser: !!user, hasAccessToken: !!accessToken })

  // Fire-and-forget redirect if not logged in (only after loading completes)
  // Allow vibe-hiring page to be accessed without authentication
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      const currentPath = window.location.pathname
      // Allow access to vibe-hiring without authentication
      if (currentPath === "/dashboard/vibe-hiring" || currentPath.startsWith("/dashboard/vibe-hiring/")) {
        console.log("[Dashboard] Allowing access to vibe-hiring without authentication")
        return
      }
      console.log("[Dashboard] Not logged in, redirecting to home")
      window.location.href = "/"
    }
  }, [loading, isLoggedIn])

  // Fire-and-forget user sync
  useEffect(() => {
    if (!accessToken) return

    (async () => {
      try {
        await fetch("/api/sync-user", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      } catch (e) {
        console.error("User sync failed:", e)
      }
    })()
  }, [accessToken])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  // Redirect happening, show nothing (unless it's vibe-hiring which we allow)
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  const isVibeHiring = currentPath === "/dashboard/vibe-hiring" || currentPath.startsWith("/dashboard/vibe-hiring/")
  
  if (!isLoggedIn && !isVibeHiring) {
    return null
  }

  // Render dashboard
  return (
    <AIPanelProvider>
      <SidebarContextProvider>
        <SidebarProvider>
          <DashboardContent>{children}</DashboardContent>
        </SidebarProvider>
      </SidebarContextProvider>
    </AIPanelProvider>
  )
}
