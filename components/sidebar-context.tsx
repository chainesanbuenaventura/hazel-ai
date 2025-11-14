"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarContextProvider({ children }: { children: ReactNode }) {
  // Read from localStorage on mount
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar:collapsed")
      return stored === "true"
    }
    return false
  })

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", String(isCollapsed))
  }, [isCollapsed])

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev)
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarContext() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebarContext must be used within a SidebarContextProvider")
  }
  return context
}



