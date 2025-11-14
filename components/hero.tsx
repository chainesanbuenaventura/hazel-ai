"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useAuthInfo } from "@propelauth/react"
import { buildSignupUrl } from "@/lib/auth-utils"

const FULL_TEXT = "Find your next hire in days, not months"

export function Hero() {
  const { isLoggedIn } = useAuthInfo()
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  
  useEffect(() => {
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex < FULL_TEXT.length) {
        setDisplayedText(FULL_TEXT.substring(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, 50) // Adjust speed here (lower = faster)
    
    return () => clearInterval(typingInterval)
  }, [])

  const handleHireTalent = () => {
    console.log("[Hero] Hire talent button clicked, isLoggedIn:", isLoggedIn)
    if (isLoggedIn) {
      window.location.href = "/dashboard"
    } else {
      window.location.href = buildSignupUrl("/dashboard")
    }
  }

  const handleFindOpportunities = () => {
    console.log("[Hero] Find opportunities button clicked")
    window.location.href = buildSignupUrl("/dashboard")
  }

  return (
    <section className="relative border-b border-border py-20 sm:py-32 bg-background">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-10">
          <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-blue-400 to-cyan-400" />
        </div>
      </div>

      {/* Doodle Arrow pointing to "Hire talent" button */}
      <div className="absolute inset-0 -z-10 overflow-visible pointer-events-none">
        <div className="absolute left-[5%] top-[65%] md:left-[8%] lg:left-[12%] opacity-90">
          <svg
            width="200"
            height="140"
            viewBox="0 0 200 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 120 Q40 95, 70 85 Q100 75, 130 70 Q150 68, 170 65"
              stroke="#111827"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: "8,6",
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"
              }}
            />
            <path
              d="M165 60 L178 65 L170 70 Z"
              fill="#111827"
              style={{
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"
              }}
            />
          </svg>
          <div className="absolute -left-4 top-28 text-sm font-semibold whitespace-nowrap transform -rotate-12" style={{ color: '#111827' }}>
            Hire talent →
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl text-gray-700 min-h-[1.2em]">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Connect with pre-vetted tech talent ready to join your startup. Engineers, AI specialists, and sales
            professionals who understand the startup journey.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
              style={{ background: 'linear-gradient(90deg, #4DA3FF 0%, #7AC4FF 100%)' }}
              onClick={handleHireTalent}
            >
              Hire talent
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-lg" onClick={handleFindOpportunities}>
              Find opportunities
            </Button>
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground">
            <span className="text-primary font-semibold">Trusted by 500+ startups</span> • <span className="text-primary font-semibold">10,000+ qualified candidates</span>
          </p>
        </div>
      </div>
    </section>
  )
}
