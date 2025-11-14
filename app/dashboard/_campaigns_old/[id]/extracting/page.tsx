"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Loader2 } from "lucide-react"

const steps = [
  { id: 1, name: "Analyzing Job Description", duration: 2000 },
  { id: 2, name: "Extracting Requirements", duration: 3000 },
  { id: 3, name: "Processing Skills", duration: 2000 },
]

export default function ExtractingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    let totalDuration = 0
    let currentDuration = 0

    // Calculate total duration
    steps.forEach((step) => {
      totalDuration += step.duration
    })

    const runSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i)

        // Animate progress for current step
        const stepDuration = steps[i].duration
        const startTime = Date.now()

        const animateProgress = () => {
          const elapsed = Date.now() - startTime
          const stepProgress = Math.min(elapsed / stepDuration, 1)
          const totalProgress = ((currentDuration + stepProgress * stepDuration) / totalDuration) * 100

          setProgress(totalProgress)

          if (stepProgress < 1) {
            requestAnimationFrame(animateProgress)
          }
        }

        animateProgress()
        await new Promise((resolve) => setTimeout(resolve, stepDuration))
        currentDuration += stepDuration
      }

      // Complete and redirect
      setProgress(100)
      setTimeout(() => {
        router.push(`/dashboard/campaigns/${params.id}/requirements`)
      }, 500)
    }

    runSteps()
  }, [router, params.id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Extracting Requirements</h1>
            <p className="text-gray-600">Our AI is analyzing your job description to extract key requirements</p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3">
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : index === currentStep ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                  <span className={`text-sm ${index <= currentStep ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
