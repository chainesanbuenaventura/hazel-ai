"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AuthCheckPage() {
  const [result, setResult] = useState<{ status: number; data: any } | null>(null)
  const [loading, setLoading] = useState(false)

  const checkAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/userinfo")
      const data = await response.json().catch(() => response.text())
      setResult({ status: response.status, data })
    } catch (error: any) {
      setResult({ status: 0, data: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">PropelAuth Check</h1>
        
        <div className="space-y-4">
          <Button onClick={checkAuth} disabled={loading} className="w-full">
            {loading ? "Checking..." : "Check /api/auth/userinfo"}
          </Button>

          {result && (
            <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className="mb-2">
                <span className="font-semibold">Status: </span>
                <span className={result.status === 200 ? "text-green-600" : result.status === 401 ? "text-yellow-600" : "text-red-600"}>
                  {result.status}
                </span>
              </div>
              <div>
                <span className="font-semibold">Response:</span>
                <pre className="mt-2 overflow-auto text-xs">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
              <div className="mt-4 text-sm">
                <p className="font-semibold">Expected:</p>
                <ul className="list-disc ml-6 mt-1">
                  <li>Logged out → 401</li>
                  <li>Logged in → 200 with user data</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>This page tests the PropelAuth integration.</p>
          <p className="mt-2">Navigate to: <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">/auth-check</code></p>
        </div>
      </Card>
    </div>
  )
}

