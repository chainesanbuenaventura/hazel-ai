"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, Link, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

interface AddCandidateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddCandidateModal({ isOpen, onClose, onSuccess }: AddCandidateModalProps) {
  const [method, setMethod] = useState<"linkedin" | "cv">("linkedin")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isActive, setIsActive] = useState(true)

  const resetForm = () => {
    setMethod("linkedin")
    setLinkedinUrl("")
    setPhone("")
    setEmail("")
    setNotes("")
    setFile(null)
    setIsSubmitting(false)
    setSubmitStatus("idle")
    setErrorMessage("")
    setIsActive(true)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]

      if (!allowedTypes.includes(selectedFile.type)) {
        setErrorMessage("Please select a PDF or Word document")
        setSubmitStatus("error")
        return
      }

      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMessage("File size must be less than 5MB")
        setSubmitStatus("error")
        return
      }

      setFile(selectedFile)
      setSubmitStatus("idle")
      setErrorMessage("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (method === "linkedin" && !linkedinUrl.trim()) {
      setErrorMessage("Please enter a LinkedIn URL")
      setSubmitStatus("error")
      return
    }

    if (method === "cv" && !file) {
      setErrorMessage("Please select a CV file")
      setSubmitStatus("error")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      let response: Response

      if (method === "linkedin") {
        const payload = {
          url: linkedinUrl.trim(),
          notes: notes.trim(),
          phone: phone.trim(),
          email: email.trim(),
          status: isActive ? "active" : "inactive",
          isActive: isActive,
        }

        console.log("📤 Sending LinkedIn payload:", payload)

        // Send LinkedIn URL as JSON
        response = await fetch("/api/webhook-proxy?type=linkedin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
      } else {
        // Send CV as FormData
        const formData = new FormData()
        formData.append("cv", file!)
        if (notes.trim()) {
          formData.append("notes", notes.trim())
        }
        if (email.trim()) {
          formData.append("email", email.trim())
        }
        formData.append("status", isActive ? "active" : "inactive")
        formData.append("isActive", isActive.toString())

        console.log("📤 Sending CV with status:", isActive ? "active" : "inactive")

        response = await fetch("/api/webhook-proxy?type=cv", {
          method: "POST",
          body: formData,
        })
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      console.log("✅ Submission successful:", result)
      setSubmitStatus("success")

      // Close modal after a short delay
      setTimeout(() => {
        handleClose()
        onSuccess()
      }, 1500)
    } catch (error) {
      console.error("❌ Submission error:", error)

      let message = "Failed to submit candidate"
      if (error instanceof Error) {
        if (error.message.includes("timeout") || error.message.includes("AbortError")) {
          message = "Request timeout - Please try again"
        } else if (error.message.includes("404")) {
          message = "Webhook endpoint not found - Please check configuration"
        } else if (error.message.includes("Failed to fetch")) {
          message = "Network error - Please check your connection"
        } else {
          message = error.message
        }
      }

      setErrorMessage(message)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Method Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">How would you like to add the candidate?</Label>
            <RadioGroup value={method} onValueChange={(value) => setMethod(value as "linkedin" | "cv")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="linkedin" id="linkedin" />
                <Label htmlFor="linkedin" className="flex items-center gap-2 cursor-pointer">
                  <Link className="h-4 w-4" />
                  LinkedIn URL
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cv" id="cv" />
                <Label htmlFor="cv" className="flex items-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Upload CV
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* LinkedIn URL Input */}
          {method === "linkedin" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                <Input
                  id="linkedin-url"
                  type="url"
                  placeholder="https://linkedin.com/in/candidate-name"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Provide a contact number if available</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="candidate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Provide an email address if available</p>
              </div>
            </div>
          )}

          {/* CV Upload */}
          {method === "cv" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cv-file">CV File</Label>
                <Input id="cv-file" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
                <p className="text-xs text-muted-foreground">Supported formats: PDF, DOC, DOCX (max 5MB)</p>
                {file && (
                  <p className="text-sm text-green-600">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-cv">Email Address (Optional)</Label>
                <Input
                  id="email-cv"
                  type="email"
                  placeholder="candidate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Provide an email address if available</p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about the candidate..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active-status">Candidate Status</Label>
              <p className="text-xs text-muted-foreground">Set whether this candidate is active or inactive</p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="active-status" className="text-sm">
                {isActive ? "Active" : "Inactive"}
              </Label>
              <Switch id="active-status" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {method === "linkedin" ? "LinkedIn URL submitted successfully!" : "CV uploaded successfully!"}
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === "error" && errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || submitStatus === "success"}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {method === "linkedin" ? "Submitting..." : "Uploading..."}
                </>
              ) : (
                <>{method === "linkedin" ? "Submit LinkedIn URL" : "Upload CV"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
