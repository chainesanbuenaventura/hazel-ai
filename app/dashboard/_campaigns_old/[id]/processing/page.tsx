"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Sparkles, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProcessingStep {
  id: string
  title: string
  description: string
  status: "pending" | "processing" | "completed"
  progress: number
}

export default function ProcessingPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: "analyzing",
      title: "Analyzing Job Description",
      description: "AI is extracting key requirements and skills",
      status: "processing",
      progress: 0,
    },
    {
      id: "requirements",
      title: "Processing Requirements",
      description: "Identifying technical and soft skills needed",
      status: "pending",
      progress: 0,
    },
    {
      id: "matching",
      title: "Preparing Candidate Matching",
      description: "Setting up matching algorithms",
      status: "pending",
      progress: 0,
    },
  ])

  const [overallProgress, setOverallProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const processSteps = async () => {
      // Step 1: Analyzing Job Description
      await simulateStep("analyzing", 3000)

      // Step 2: Processing Requirements
      await simulateStep("requirements", 2500)

      // Step 3: Preparing Candidate Matching
      await simulateStep("matching", 2000)

      // Mark as complete
      setIsComplete(true)
      setOverallProgress(100)

      // Auto-redirect to results page after completion
      setTimeout(() => {
        router.push(`/dashboard/campaigns/${campaignId}/results`)
      }, 1500)
    }

    processSteps()
  }, [campaignId, router])

  const simulateStep = (stepId: string, duration: number) => {
    return new Promise<void>((resolve) => {
      const startTime = Date.now()
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min((elapsed / duration) * 100, 100)

        setSteps((prev) =>
          prev.map((step) => (step.id === stepId ? { ...step, status: "processing", progress } : step)),
        )

        // Update overall progress
        const currentStepIndex = steps.findIndex((s) => s.id === stepId)
        const baseProgress = (currentStepIndex / steps.length) * 100
        const stepProgress = (progress / 100) * (100 / steps.length)
        setOverallProgress(baseProgress + stepProgress)

        if (progress >= 100) {
          clearInterval(interval)
          setSteps((prev) =>
            prev.map((step) => (step.id === stepId ? { ...step, status: "completed", progress: 100 } : step)),
          )

          // Start next step
          const nextStepIndex = currentStepIndex + 1
          if (nextStepIndex < steps.length) {
            setSteps((prev) =>
              prev.map((step, index) => (index === nextStepIndex ? { ...step, status: "processing" } : step)),
            )
          }

          resolve()
        }
      }, 50)
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Processing Campaign</h1>
        <p className="text-gray-600 mt-2">AI is analyzing your job description and preparing candidate matching</p>
      </div>

      <div className="space-y-8">
        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl">AI Processing Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-gray-600">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>

            {isComplete && (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="h-5 w-5" />
                Processing Complete!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card key={step.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {step.status === "completed" ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : step.status === "processing" ? (
                      <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Clock className="h-6 w-6 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>

                      <Badge
                        variant={
                          step.status === "completed"
                            ? "default"
                            : step.status === "processing"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          step.status === "completed"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : step.status === "processing"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : ""
                        }
                      >
                        {step.status === "completed"
                          ? "Complete"
                          : step.status === "processing"
                            ? "Processing"
                            : "Pending"}
                      </Badge>
                    </div>

                    {step.status !== "pending" && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{Math.round(step.progress)}%</span>
                        </div>
                        <Progress value={step.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
