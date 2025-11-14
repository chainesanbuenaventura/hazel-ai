"use client"

import {
  Briefcase,
  LayoutDashboard,
  Settings,
  UserCheck,
  TrendingUp,
  Bell,
  FolderKanban,
  LogOut,
  Send,
  ChevronLeft,
  ChevronRight,
  ClipboardPen,
  Search,
  Sparkles,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSidebarContext } from "./sidebar-context"
import { useAuthInfo, useLogoutFunction } from "@propelauth/react";
import { buildLogoutUrl } from "@/lib/auth-utils"
import { usePathname } from "next/navigation"

// Menu items
const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Message Copilot",
    url: "/dashboard/linkedin-outreach",
    icon: Send,
  },
  {
    title: "Brief->Job",
    url: "/dashboard/brief-to-job",
    icon: ClipboardPen,
  },
  {
    title: "Vibe Hiring",
    url: "/dashboard/vibe-hiring",
    icon: Sparkles,
  },
  {
    title: "Recruitment Campaigns",
    url: "/dashboard/campaigns",
    icon: FolderKanban,
  },
  {
    title: "Candidates",
    url: "/dashboard/candidates",
    icon: UserCheck,
  },
]

const managementItems = [
  {
    title: "Job Matching",
    url: "/dashboard/jobs",
    icon: Search,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: TrendingUp,
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: Bell,
  },
]

const settingsItems = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebarContext()
  const logoutFn = useLogoutFunction()
  const pathname = usePathname()

  const handleLogoClick = () => {
    setIsCollapsed(false)
  }

  const handleLogout = async () => {
    console.log("[Sidebar] Logout button clicked")
    await logoutFn(true) // true = redirect to PropelAuth logout page
    window.location.href = "/"
  }

  return (
    <Sidebar
      variant="inset"
      collapsible="none"
      className={`fixed inset-y-0 left-0 z-20 border-r transition-all duration-300 ${isCollapsed ? "w-16" : "w-60"} shadow-lg shadow-primary/5`}
      style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 25%, #f5f7fa 50%, #f0f4f8 75%, #ffffff 100%)' }}
    >
      <SidebarHeader className="border-b backdrop-blur-sm relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,251,252,0.7) 50%, rgba(245,247,250,0.8) 100%)' }}>
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(230,240,255,0.3) 50%, rgba(255,255,255,0.6) 100%)' }} />
        <div className="relative z-10">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-3`}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick} title="Expand sidebar">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg shadow-md shadow-primary/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/40" style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}>
              <span className="text-2xl font-bold text-white">H</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-sm font-semibold text-gray-700">Hazel AI</span>
                <span className="text-xs text-muted-foreground">Recruitment Copilot</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isCollapsed && (
          <div className="flex justify-center pb-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 rounded-md mx-2 mb-1">
              Main
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="w-full">
                      <Link
                        href={item.url}
                        className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                            : "hover:bg-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 hover:scale-[1.02] hover:translate-x-1 border border-transparent hover:border-primary/20"
                        }`}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span className="text-xs font-medium">{item.title}</span>}
                        </div>
                        {!isCollapsed && (item as any).badge && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                            {(item as any).badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 rounded-md mx-2 mb-1">
              Management
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {managementItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="w-full">
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isCollapsed ? "justify-center" : ""} ${
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                            : "hover:bg-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 hover:scale-[1.02] hover:translate-x-1 border border-transparent hover:border-primary/20"
                        }`}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span className="text-xs font-medium">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 rounded-md mx-2 mb-1">
              System
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="w-full">
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isCollapsed ? "justify-center" : ""} ${
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                            : "hover:bg-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 hover:scale-[1.02] hover:translate-x-1 border border-transparent hover:border-primary/20"
                        }`}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span className="text-xs font-medium">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t backdrop-blur-sm p-3 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,251,252,0.7) 50%, rgba(245,247,250,0.8) 100%)' }}>
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(230,240,255,0.3) 50%, rgba(255,255,255,0.6) 100%)' }} />
        <div className="relative z-10">
        <div className="space-y-2">
          {!isCollapsed && (
            <>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/30">
                <div className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: '#e8f5d9' }}></div>
                <span className="text-xs text-muted-foreground font-medium">System Online</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/30">
                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
                <span className="text-xs text-muted-foreground font-medium">AI Active</span>
              </div>
            </>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className={`text-red-600 hover:text-red-700 hover:bg-red-50 hover:shadow-md hover:shadow-red-200/50 w-full rounded-lg transition-all duration-200 ${isCollapsed ? "justify-center" : "justify-start"}`}
                title={isCollapsed ? "Logout" : undefined}
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span>Logout</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
