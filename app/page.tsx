import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { AgentIntro } from "@/components/agent-intro"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Roles } from "@/components/roles"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen snap-y snap-mandatory">
      <Header />
      <div className="snap-start snap-always">
        <Hero />
      </div>
      <div className="snap-start snap-always">
        <AgentIntro />
      </div>
      <div className="snap-start snap-always">
        <Features />
      </div>
      <div className="snap-start snap-always">
        <HowItWorks />
      </div>
      <div className="snap-start snap-always">
        <Roles />
      </div>
      <div className="snap-start snap-always">
        <CTA />
      </div>
      <div className="snap-start snap-always">
        <Footer />
      </div>
    </main>
  )
}
