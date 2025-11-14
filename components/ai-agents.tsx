import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Search, FileText, Users, Sparkles, MessageSquare, Zap } from "lucide-react"

const agents = [
  {
    icon: Search,
    name: "Match Agent",
    description: "Finds the perfect candidates based on your requirements. Analyzes skills, experience, and cultural fit.",
    capabilities: [
      "Semantic skill matching",
      "Location-based filtering",
      "Salary range analysis",
      "Experience level matching"
    ],
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: FileText,
    name: "JD Generator",
    description: "Creates comprehensive job descriptions from simple conversations. Enriches with requirements, benefits, and details.",
    capabilities: [
      "Natural language to JD",
      "Auto-enrichment",
      "Template generation",
      "Multi-language support"
    ],
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Users,
    name: "Pipeline Manager",
    description: "Manages your candidate pipeline, tracks progress, and suggests next actions for each candidate.",
    capabilities: [
      "Pipeline automation",
      "Progress tracking",
      "Action recommendations",
      "Status updates"
    ],
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: MessageSquare,
    name: "Outreach Agent",
    description: "Drafts personalized outreach messages, manages conversations, and schedules interviews automatically.",
    capabilities: [
      "Personalized messaging",
      "Conversation management",
      "Interview scheduling",
      "Follow-up automation"
    ],
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Sparkles,
    name: "Analytics Agent",
    description: "Provides insights on your hiring process, candidate quality, and market trends.",
    capabilities: [
      "Hiring analytics",
      "Market insights",
      "Quality metrics",
      "Trend analysis"
    ],
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: Zap,
    name: "Screening Agent",
    description: "Conducts initial candidate screening, asks pre-qualifying questions, and scores candidates.",
    capabilities: [
      "Automated screening",
      "Pre-qualification",
      "Candidate scoring",
      "Quick filtering"
    ],
    color: "from-yellow-500 to-amber-500"
  }
]

export function AIAgents() {
  return (
    <section id="agents" className="border-b border-border py-20 sm:py-32 bg-gradient-to-b from-muted/30 via-muted/20 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-40">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      {/* Section separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI Agents</span>
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl text-gray-700">
            Meet your AI hiring team
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Each agent specializes in a different aspect of hiring, working together to streamline your process.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card 
              key={agent.name} 
              className="group relative overflow-hidden transition-all duration-500 border-2 border-border rounded-2xl bg-card cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/30"
            >
              {/* Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${agent.color}`}></div>
              
              <CardHeader>
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300 bg-gradient-to-br ${agent.color} bg-opacity-10`}>
                  <agent.icon className={`h-7 w-7 bg-gradient-to-br ${agent.color} bg-clip-text text-transparent`} />
                </div>
                <CardTitle className="mt-4 text-xl font-bold text-gray-700 group-hover:text-primary transition-colors duration-300">
                  {agent.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                  {agent.description}
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Capabilities:</p>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((capability) => (
                      <Badge 
                        key={capability} 
                        variant="secondary" 
                        className="bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-[10px] font-semibold hover:bg-primary/20 transition-colors"
                      >
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

