"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

const defaultQuestions = [
  {
    id: 1,
    question: "How many years of ML experience do you have?",
    source: "auto",
  },
  {
    id: 2,
    question: "Which ML frameworks have you worked with?",
    source: "auto",
  },
  {
    id: 3,
    question: "Tell us about your most impactful ML project",
    source: "auto",
  },
]

export function PreQuestionsTab() {
  const [customQuestions, setCustomQuestions] = useState<Array<{ id: number; question: string }>>([])
  const [newQuestion, setNewQuestion] = useState("")

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setCustomQuestions([...customQuestions, { id: Date.now(), question: newQuestion }])
      setNewQuestion("")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Pre-qualifying Questions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Auto-generated from job description. Add custom questions below.
        </p>
      </div>

      {/* Auto-generated Questions */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Auto-generated Questions</h3>
        <div className="space-y-2">
          {defaultQuestions.map((q) => (
            <Card key={q.id} className="p-4">
              <p className="text-sm">{q.question}</p>
              <p className="text-xs text-muted-foreground mt-2">From job description</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Questions */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Custom Questions</h3>
        <div className="space-y-3">
          {customQuestions.map((q) => (
            <Card key={q.id} className="p-4 flex items-start justify-between">
              <p className="text-sm flex-1">{q.question}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCustomQuestions(customQuestions.filter((x) => x.id !== q.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>

        {/* Add New Question */}
        <div className="mt-4 p-4 border rounded-lg space-y-3">
          <Textarea
            placeholder="Enter a custom pre-qualifying question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="min-h-20"
          />
          <Button onClick={handleAddQuestion} disabled={!newQuestion.trim()} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>
    </div>
  )
}
