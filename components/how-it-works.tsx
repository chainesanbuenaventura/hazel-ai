import { Card } from "@/components/ui/card"

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description: "Tell us about your startup or your skills. Takes less than 5 minutes.",
    audience: "Both",
  },
  {
    number: "02",
    title: "Get matched",
    description: "Our AI finds the perfect matches based on skills, culture, and goals.",
    audience: "Both",
  },
  {
    number: "03",
    title: "Connect & interview",
    description: "Schedule interviews directly through our platform. No back-and-forth emails.",
    audience: "Both",
  },
  {
    number: "04",
    title: "Make it official",
    description: "Found the right fit? We help with offers, contracts, and onboarding.",
    audience: "Both",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl text-gray-700">How it works</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            A simple, transparent process for both startups and talent.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step.number} className="group relative overflow-hidden transition-all duration-500 border-2 border-border rounded-2xl bg-card cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30 p-6">
              {/* Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}></div>
              
              <div className="relative text-6xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors duration-300">{step.number}</div>
              <h3 className="relative mt-4 text-lg font-bold text-gray-700 group-hover:text-primary transition-colors duration-300">{step.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
