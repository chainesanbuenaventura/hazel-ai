"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { useAuthInfo } from "@propelauth/react"
import { buildSignupUrl } from "@/lib/auth-utils"

export function CTA() {
  const { isLoggedIn } = useAuthInfo()

  const handleGetStarted = () => {
    console.log("[CTA] Get started button clicked, isLoggedIn:", isLoggedIn)
    if (isLoggedIn) {
      window.location.href = "/dashboard"
    } else {
      window.location.href = buildSignupUrl("/dashboard")
    }
  }

  const handleScheduleDemo = () => {
    console.log("[CTA] Schedule demo button clicked")
    window.location.href = buildSignupUrl("/dashboard")
  }

  return (
    <section className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="group relative overflow-hidden rounded-3xl text-white shadow-2xl shadow-primary/20 transition-all duration-500 hover:shadow-3xl hover:shadow-primary/30 hover:scale-[1.01] border-0" style={{ background: 'linear-gradient(135deg, #4DA3FF 0%, #7AC4FF 100%)' }}>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Accent elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32 group-hover:scale-150 transition-transform duration-500"></div>
          
          <div className="relative px-6 py-16 sm:px-12 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl drop-shadow-lg">
                Ready to build your dream team?
              </h2>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-white/95 drop-shadow">
                Join thousands of startups and professionals who have found their perfect match.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold" onClick={handleGetStarted}>
                  Get started for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/60 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  onClick={handleScheduleDemo}
                >
                  Schedule a demo
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
