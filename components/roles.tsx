import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Brain, TrendingUp, Wrench } from "lucide-react"

const roles = [
  {
    icon: Code,
    title: "Software Engineers",
    description: "Full-stack, frontend, backend, and mobile developers ready to build your product.",
    tags: ["React", "Node.js", "Python", "TypeScript"],
  },
  {
    icon: Brain,
    title: "AI/ML Specialists",
    description: "Machine learning engineers and data scientists to power your AI features.",
    tags: ["TensorFlow", "PyTorch", "LLMs", "Computer Vision"],
  },
  {
    icon: TrendingUp,
    title: "Sales Professionals",
    description: "Growth-focused sales leaders who can take your product to market.",
    tags: ["B2B", "SaaS", "Enterprise", "Growth"],
  },
  {
    icon: Wrench,
    title: "Technical Leads",
    description: "Experienced engineering managers and CTOs to guide your technical vision.",
    tags: ["Architecture", "Team Building", "Strategy", "DevOps"],
  },
]

export function Roles() {
  return (
    <section id="roles" className="border-b border-border py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl text-gray-700">
            Find the right role for your startup
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            From technical founders to sales leaders, we have the talent you need.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:gap-8">
          {roles.map((role) => (
            <Card key={role.title} className="group relative overflow-hidden transition-all duration-500 border-2 border-border rounded-2xl bg-card cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30 p-6">
              {/* Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}></div>
              
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300" style={{ background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.1) 0%, rgba(122, 196, 255, 0.1) 100%)' }}>
                <role.icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="relative mt-6 text-xl font-bold text-gray-700 group-hover:text-primary transition-colors duration-300">{role.title}</h3>
              <p className="relative mt-3 leading-relaxed text-muted-foreground">{role.description}</p>
              <div className="relative mt-5 flex flex-wrap gap-2">
                {role.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-[11px] font-semibold hover:bg-primary/20 transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
