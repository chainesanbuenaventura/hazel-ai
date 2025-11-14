"use client";

import Image from "next/image";

import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { AgentIntro } from "@/components/agent-intro"
import { Features } from "@/components/features"
import { AIAgents } from "@/components/ai-agents"
import { Screenshots } from "@/components/screenshots"
import { HowItWorks } from "@/components/how-it-works"
import { Roles } from "@/components/roles"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <AgentIntro />
      <AIAgents />
      <Screenshots />
      <Features />
      <HowItWorks />
      <Roles />
      <CTA />
      <Footer />
    </main>
  )
}
