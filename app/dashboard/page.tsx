"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Briefcase, TrendingUp } from "lucide-react"
import SharedAIPanel from "@/components/shared-ai-panel"
import { useAIPanel } from "@/components/ai-panel-context"

export default function DashboardPage() {
  // AI Panel context
  const {
    isRightPanelCollapsed,
    setIsRightPanelCollapsed,
    selectedContextCandidate,
    setSelectedContextCandidate,
    selectedContextCampaign,
    setSelectedContextCampaign,
    selectedProfileView,
    setSelectedProfileView,
    selectedCampaignView,
    setSelectedCampaignView,
    campaigns: rightPanelCampaigns,
    candidates: rightPanelCandidates,
  } = useAIPanel()
  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4">
      <div className="flex-1 overflow-auto pl-6 pr-6">
        <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-600">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Recruitment Copilot dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden transition-all duration-300 border-2 border-border rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 50%, #ffffff 100%)' }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(230,240,255,0.3) 50%, rgba(255,255,255,0.7) 100%)' }} />
          <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}></div>
          <div className="relative z-10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Candidates</CardTitle>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.1) 0%, rgba(122, 196, 255, 0.1) 100%)' }}>
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700">1,234</div>
            <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
          </CardContent>
          </div>
        </Card>

        <Card className="group relative overflow-hidden transition-all duration-300 border-2 border-border rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 50%, #ffffff 100%)' }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(230,240,255,0.3) 50%, rgba(255,255,255,0.7) 100%)' }} />
          <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}></div>
          <div className="relative z-10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Conversations</CardTitle>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.1) 0%, rgba(122, 196, 255, 0.1) 100%)' }}>
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700">89</div>
            <p className="text-xs text-muted-foreground mt-1">+12.5% from last month</p>
          </CardContent>
          </div>
        </Card>

        <Card className="group relative overflow-hidden transition-all duration-300 border-2 border-border rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 50%, #ffffff 100%)' }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(230,240,255,0.3) 50%, rgba(255,255,255,0.7) 100%)' }} />
          <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}></div>
          <div className="relative z-10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Open Positions</CardTitle>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.1) 0%, rgba(122, 196, 255, 0.1) 100%)' }}>
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700">23</div>
            <p className="text-xs text-muted-foreground mt-1">+3 new this week</p>
          </CardContent>
          </div>
        </Card>

        <Card className="group relative overflow-hidden transition-all duration-300 border-2 border-border rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 50%, #ffffff 100%)' }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(230,240,255,0.3) 50%, rgba(255,255,255,0.7) 100%)' }} />
          <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}></div>
          <div className="relative z-10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Hire Rate</CardTitle>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.1) 0%, rgba(122, 196, 255, 0.1) 100%)' }}>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700">12.5%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.1% from last month</p>
          </CardContent>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="group relative overflow-hidden transition-all duration-300 border-2 border-border rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 50%, #ffffff 100%)' }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(230,240,255,0.3) 50%, rgba(255,255,255,0.7) 100%)' }} />
          <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}></div>
          <div className="relative z-10">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-700">Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                name: "Sarah Johnson",
                message: "Thank you for the interview opportunity",
                time: "2 min ago",
                status: "active",
              },
              {
                name: "Michael Chen",
                message: "When can we schedule the next round?",
                time: "15 min ago",
                status: "pending",
              },
              {
                name: "Emily Rodriguez",
                message: "I have some questions about the role",
                time: "1 hour ago",
                status: "active",
              },
              { name: "David Kim", message: "Looking forward to hearing back", time: "3 hours ago", status: "waiting" },
            ].map((conversation, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #4DA3FF 0%, #7AC4FF 100%)' }}>
                  {conversation.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-700">{conversation.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{conversation.message}</p>
                </div>
                <div className="text-xs text-muted-foreground">{conversation.time}</div>
              </div>
            ))}
          </CardContent>
          </div>
        </Card>

        <Card className="group relative overflow-hidden transition-all duration-300 border-2 border-border rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 50%, #ffffff 100%)' }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(230,240,255,0.3) 50%, rgba(255,255,255,0.7) 100%)' }} />
          <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}></div>
          <div className="relative z-10">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-700">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Alex Thompson", position: "Frontend Developer", time: "1 hour ago", status: "new" },
              { name: "Maria Garcia", position: "UX Designer", time: "3 hours ago", status: "reviewed" },
              { name: "James Wilson", position: "Backend Developer", time: "5 hours ago", status: "interview" },
              { name: "Lisa Chang", position: "Product Manager", time: "1 day ago", status: "hired" },
            ].map((application, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #4DA3FF 0%, #7AC4FF 100%)' }}>
                    {application.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{application.name}</p>
                    <p className="text-xs text-muted-foreground">{application.position}</p>
                  </div>
                </div>
                <div className="text-right">
                    <Badge 
                    variant={application.status === "hired" ? "default" : "secondary"}
                    className={application.status === "hired" ? "border-0 shadow-sm" : ""}
                    style={application.status === "hired" ? { backgroundColor: '#f0f8e8', color: '#7a8b5a' } : {}}
                  >
                    {application.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{application.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
          </div>
        </Card>
      </div>
        </div>
      </div>

      {/* AI Panel - fixed with spacer */}
      <div className={`hidden md:block flex-shrink-0 ${isRightPanelCollapsed ? 'w-12' : 'w-96'}`}></div>
      <div className="hidden md:block fixed right-0 top-0 h-screen z-30">
        <SharedAIPanel
          isCollapsed={isRightPanelCollapsed}
          onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          selectedContextCandidate={selectedContextCandidate}
          setSelectedContextCandidate={setSelectedContextCandidate}
          selectedContextCampaign={selectedContextCampaign}
          setSelectedContextCampaign={setSelectedContextCampaign}
          selectedProfileView={selectedProfileView}
          setSelectedProfileView={setSelectedProfileView}
          selectedCampaignView={selectedCampaignView}
          setSelectedCampaignView={setSelectedCampaignView}
          campaigns={rightPanelCampaigns}
          candidates={rightPanelCandidates}
        />
      </div>
    </div>
  )
}
