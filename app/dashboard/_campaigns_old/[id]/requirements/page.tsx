"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Briefcase, GraduationCap, MapPin, DollarSign, Heart } from "lucide-react"

interface CampaignData {
  id: string
  name: string
  jobDescription: string
}

export default function RequirementsPage() {
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Get campaign data from sessionStorage
    const storedData = sessionStorage.getItem("campaignData")
    if (storedData) {
      setCampaignData(JSON.parse(storedData))
    }
  }, [])

  const handleMatchCandidates = () => {
    router.push(`/dashboard/campaigns/${params.id}`)
  }

  // Mock extracted requirements (replace with real data from webhook response)
  const requirements = {
    technicalSkills: ["React", "TypeScript", "Node.js", "Next.js", "GraphQL", "PostgreSQL", "AWS", "Docker"],
    softSkills: ["Team Leadership", "Communication", "Problem Solving", "Agile Methodology"],
    experience: {
      years: "5+ years",
      level: "Senior Level",
      industry: "Technology/SaaS",
    },
    education: ["Bachelor's in Computer Science", "Engineering degree", "Equivalent experience"],
    location: {
      type: "Hybrid",
      locations: ["San Francisco", "Remote US"],
    },
    benefits: [
      "Competitive salary ($120k-$180k)",
      "Equity package",
      "Health insurance",
      "401k matching",
      "Flexible PTO",
    ],
  }

  if (!campaignData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading campaign data...</h2>
          <p className="text-gray-600">Please wait while we retrieve your campaign information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Extracted Requirements</h1>
            <p className="text-gray-600 mb-4">
              Campaign: <span className="font-medium">{campaignData.name}</span>
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-800 font-medium">Requirements successfully extracted</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Technical Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                Technical Skills
              </CardTitle>
              <CardDescription>Required technical competencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {requirements.technicalSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Soft Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-pink-600" />
                Soft Skills
              </CardTitle>
              <CardDescription>Interpersonal and leadership abilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {requirements.softSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Experience
              </CardTitle>
              <CardDescription>Required experience level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Years:</span>
                <span className="font-medium">{requirements.experience.years}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Level:</span>
                <span className="font-medium">{requirements.experience.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Industry:</span>
                <span className="font-medium">{requirements.experience.industry}</span>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-purple-600" />
                Education
              </CardTitle>
              <CardDescription>Educational requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {requirements.education.map((edu, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{edu}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                Location
              </CardTitle>
              <CardDescription>Work location preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <Badge variant="outline" className="border-orange-200 text-orange-800">
                  {requirements.location.type}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600 block mb-2">Locations:</span>
                <div className="flex flex-wrap gap-2">
                  {requirements.location.locations.map((location, index) => (
                    <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
                Benefits & Compensation
              </CardTitle>
              <CardDescription>Offered benefits and salary range</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {requirements.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Match Candidates Button */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Find Perfect Candidates?</h3>
              <p className="text-blue-100 mb-6">
                Our AI will now match these requirements with candidates in your database
              </p>
              <Button
                size="lg"
                onClick={handleMatchCandidates}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
              >
                <Users className="w-5 h-5 mr-2" />
                Match Candidates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
