import { Card } from "@/components/ui/card"
import { Zap, Shield, Users, Clock } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning fast matching",
    description: "Our AI-powered algorithm matches you with the perfect candidates in minutes, not weeks.",
  },
  {
    icon: Shield,
    title: "Pre-vetted talent",
    description: "Every candidate goes through rigorous technical and cultural fit assessments.",
  },
  {
    icon: Users,
    title: "Startup-ready professionals",
    description: "Connect with people who thrive in fast-paced, high-growth environments.",
  },
  {
    icon: Clock,
    title: "Hire in days",
    description: "From first contact to signed offer in as little as 5 days with our streamlined process.",
  },
]

export function Features() {
  return (
    <section id="features" className="border-b border-border py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl text-gray-700">
            Built for startups, by startup veterans
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            We understand the urgency of finding the right people to build your vision.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="group relative overflow-hidden transition-all duration-500 border-2 border-border rounded-2xl bg-card cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30 p-6">
              {/* Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}></div>
              
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300" style={{ background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.1) 0%, rgba(122, 196, 255, 0.1) 100%)' }}>
                <feature.icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="relative mt-6 text-xl font-bold text-gray-700 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
              <p className="relative mt-3 leading-relaxed text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
