"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface RightPanelCampaign {
  id: string
  title: string
  company: string
  location: string
  contractType: string
  skills: string[]
  salary: string
  created: string
  updated: string
}

interface RightPanelCandidate {
  id: string
  name: string
  email: string
  phone?: string
  title?: string
  company?: string
  location?: string
  skills?: string[]
  linkedinUrl?: string
  campaignId: string
  campaignTitle: string
}

interface AIPanelContextType {
  isRightPanelCollapsed: boolean
  setIsRightPanelCollapsed: (collapsed: boolean) => void
  selectedContextCandidate: string | null
  setSelectedContextCandidate: (id: string | null) => void
  selectedContextCampaign: string | null
  setSelectedContextCampaign: (id: string | null) => void
  selectedProfileView: string | null
  setSelectedProfileView: (id: string | null) => void
  selectedCampaignView: string | null
  setSelectedCampaignView: (id: string | null) => void
  campaigns: RightPanelCampaign[]
  setCampaigns: (campaigns: RightPanelCampaign[]) => void
  candidates: RightPanelCandidate[]
  setCandidates: (candidates: RightPanelCandidate[]) => void
}

const AIPanelContext = createContext<AIPanelContextType | undefined>(undefined)

// Mock data - this will be shared across all components
const mockCampaigns: RightPanelCampaign[] = [
  {
    id: "1",
    title: "Machine Learning Engineer",
    company: "Outgoing",
    location: "Paris",
    contractType: "Full-time",
    skills: ["Python", "TensorFlow", "ML"],
    salary: "€80,000",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Principal Engineer",
    company: "Jobgether",
    location: "France",
    contractType: "Full-time",
    skills: ["React", "Node.js", "AWS"],
    salary: "€90,000",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: "3",
    title: "CTO - Data & Tech",
    company: "Leopa",
    location: "Paris",
    contractType: "Full-time",
    skills: ["Leadership", "Strategy", "Tech"],
    salary: "€120,000",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
]

const mockCandidates: RightPanelCandidate[] = [
  {
    id: "c1",
    name: "Alice Martin",
    email: "alice.martin@email.com",
    title: "ML Engineer",
    company: "DataCorp",
    location: "Paris",
    skills: ["Python", "TensorFlow", "PyTorch"],
    linkedinUrl: "https://linkedin.com/in/alice-martin",
    campaignId: "1",
    campaignTitle: "Machine Learning Engineer",
  },
  {
    id: "c2",
    name: "Bob Dubois",
    email: "bob.dubois@email.com",
    title: "Senior Developer",
    company: "TechStart",
    location: "Lyon",
    skills: ["React", "Node.js", "Python"],
    linkedinUrl: "https://linkedin.com/in/bob-dubois",
    campaignId: "1",
    campaignTitle: "Machine Learning Engineer",
  },
  {
    id: "c3",
    name: "Claire Rousseau",
    email: "claire.rousseau@email.com",
    title: "Principal Engineer",
    company: "BigTech",
    location: "Marseille",
    skills: ["AWS", "Kubernetes", "React"],
    linkedinUrl: "https://linkedin.com/in/claire-rousseau",
    campaignId: "2",
    campaignTitle: "Principal Engineer",
  },
  {
    id: "c4",
    name: "David Leroy",
    email: "david.leroy@email.com",
    title: "Tech Lead",
    company: "Innovation Labs",
    location: "Nice",
    skills: ["Leadership", "Architecture", "Cloud"],
    linkedinUrl: "https://linkedin.com/in/david-leroy",
    campaignId: "3",
    campaignTitle: "CTO - Data & Tech",
  },
]

export function AIPanelProvider({ children }: { children: ReactNode }) {
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [selectedContextCandidate, setSelectedContextCandidate] = useState<string | null>(null)
  const [selectedContextCampaign, setSelectedContextCampaign] = useState<string | null>(null)
  const [selectedProfileView, setSelectedProfileView] = useState<string | null>(null)
  const [selectedCampaignView, setSelectedCampaignView] = useState<string | null>(null)
  const [campaigns, setCampaigns] = useState<RightPanelCampaign[]>(mockCampaigns)
  const [candidates, setCandidates] = useState<RightPanelCandidate[]>(mockCandidates)

  return (
    <AIPanelContext.Provider
      value={{
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
        campaigns,
        setCampaigns,
        candidates,
        setCandidates,
      }}
    >
      {children}
    </AIPanelContext.Provider>
  )
}

export function useAIPanel() {
  const context = useContext(AIPanelContext)
  if (context === undefined) {
    throw new Error("useAIPanel must be used within an AIPanelProvider")
  }
  return context
}

export type { RightPanelCampaign, RightPanelCandidate }

