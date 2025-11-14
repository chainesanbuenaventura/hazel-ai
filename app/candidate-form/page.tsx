"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Upload,
  FileText,
  X,
  Phone,
  CheckCircle,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Linkedin,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

export default function CandidateFormPage() {
  // Form state
  const [formData, setFormData] = useState({
    // Professional fields (now first)
    cv: null as File | null,
    linkedinUrl: "",

    // Contact fields
    whatsappNumber: "",
    email: "",
    location: "",

    // Optional preference fields
    availability: "",
    workPreference: "",
    workAuthorization: "",
    salaryRange: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file only")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }
      setFormData((prev) => ({ ...prev, cv: file }))
      toast.success("CV uploaded successfully!")
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file only")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }
      setFormData((prev) => ({ ...prev, cv: file }))
      toast.success("CV uploaded successfully!")
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const formatFrenchPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Format as French phone number: 06 12 34 56 78
    if (digits.length <= 2) {
      return digits
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)} ${digits.slice(2)}`
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`
    } else if (digits.length <= 8) {
      return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`
    } else {
      return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`
    }
  }

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatFrenchPhoneNumber(event.target.value)
    setFormData((prev) => ({ ...prev, whatsappNumber: formatted }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.whatsappNumber || formData.whatsappNumber.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid WhatsApp phone number")
      return false
    }
    if (!formData.linkedinUrl || !formData.linkedinUrl.includes("linkedin.com")) {
      toast.error("Please enter a valid LinkedIn profile URL")
      return false
    }
    return true
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const submitData = new FormData()

      // Add all form fields
      if (formData.cv) submitData.append("cv", formData.cv)
      submitData.append("whatsapp", formData.whatsappNumber)
      submitData.append("email", formData.email)
      submitData.append("linkedinUrl", formData.linkedinUrl)
      submitData.append("availability", formData.availability)
      submitData.append("workPreference", formData.workPreference)
      submitData.append("workAuthorization", formData.workAuthorization)
      submitData.append("salaryRange", formData.salaryRange)
      submitData.append("location", formData.location)
      submitData.append("timestamp", new Date().toISOString())

      const response = await fetch("https://chainesanb9.app.n8n.cloud/webhook/480a1ef7-de09-45d9-8913-7a53470f1617", {
        method: "POST",
        body: submitData,
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast.success("Profile created successfully!")
      } else {
        throw new Error(`Submission failed: ${response.status}`)
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Failed to create profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      cv: null,
      linkedinUrl: "",
      email: "",
      whatsappNumber: "",
      availability: "",
      workPreference: "",
      workAuthorization: "",
      salaryRange: "",
      location: "",
    })
    setIsSubmitted(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-emerald-500" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Welcome to Our Talent Network!
            </h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Your profile has been created successfully. We'll start matching you with top opportunities and contact
              you on WhatsApp when we find great fits!
            </p>
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full bg-gradient-to-r from-violet-500 to-blue-500 text-white border-0 hover:from-violet-600 hover:to-blue-600 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Create Another Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-4xl font-bold flex items-center justify-center gap-3">
              <div className="relative">
                <Briefcase className="h-10 w-10" />
                <Sparkles className="h-4 w-4 absolute -top-1 -right-1 animate-pulse" />
              </div>
              Join Our Talent Network
            </CardTitle>
            <p className="text-blue-100 mt-3 text-xl">
              Get matched with top job opportunities that fit your profile and preferences
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Professional Profile Section - Now First */}
              <div className="group">
                <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl p-8 border border-violet-100 hover:border-violet-300 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-violet-500 to-blue-500 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                      Professional Profile
                    </h3>
                  </div>

                  <div className="space-y-8">
                    {/* CV Upload */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                        <FileText className="h-5 w-5 text-violet-600" />
                        Upload Your CV (Optional)
                      </Label>
                      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-xl border border-emerald-200">
                        <p className="text-emerald-700 font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Uploading your CV increases your chances of getting matched with better opportunities!
                        </p>
                      </div>

                      <div
                        className="border-2 border-dashed border-violet-300 rounded-xl p-8 text-center hover:border-violet-500 hover:bg-violet-50 transition-all duration-300 cursor-pointer group-hover:shadow-inner"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={isSubmitting}
                        />

                        {formData.cv ? (
                          <div className="flex items-center justify-center gap-4">
                            <div className="p-3 bg-violet-100 rounded-full">
                              <FileText className="h-12 w-12 text-violet-600" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-gray-900 text-lg">{formData.cv.name}</p>
                              <p className="text-violet-600">{(formData.cv.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setFormData((prev) => ({ ...prev, cv: null }))
                              }}
                              disabled={isSubmitting}
                              className="ml-auto hover:bg-red-100 hover:text-red-600"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <div className="p-4 bg-violet-100 rounded-full w-fit mx-auto mb-4">
                              <Upload className="h-16 w-16 text-violet-600" />
                            </div>
                            <p className="text-xl font-semibold text-gray-700 mb-2">
                              Drop your CV here or click to browse
                            </p>
                            <p className="text-violet-600">PDF files only, max 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* LinkedIn - Now Required */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="linkedin"
                          className="text-lg font-semibold flex items-center gap-2 text-gray-800"
                        >
                          <Linkedin className="h-5 w-5 text-blue-600" />
                          LinkedIn Profile URL
                        </Label>
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                          Required
                        </span>
                      </div>
                      <Input
                        id="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={formData.linkedinUrl}
                        onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                        className="text-lg py-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                        disabled={isSubmitting}
                      />
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-blue-700 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          We use your LinkedIn profile to better understand your professional background
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section - Now Second */}
              <div className="group">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Contact Information
                    </h3>
                  </div>

                  <div className="space-y-8">
                    {/* WhatsApp Number - Required - French Format */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="whatsapp" className="text-lg font-semibold text-gray-800">
                          WhatsApp Phone Number
                        </Label>
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                          Required
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🇫🇷</span>
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <Input
                          id="whatsapp"
                          type="tel"
                          placeholder="06 12 34 56 78"
                          value={formData.whatsappNumber}
                          onChange={handlePhoneChange}
                          className="pl-24 text-lg py-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                          disabled={isSubmitting}
                          maxLength={14}
                        />
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-blue-700 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          We'll contact you on WhatsApp when we find matching opportunities
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                        <Mail className="h-5 w-5 text-blue-600" />
                        Email Address (Optional)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="text-lg py-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        Current Location (Optional)
                      </Label>
                      <Input
                        id="location"
                        type="text"
                        placeholder="Paris, France"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="text-lg py-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Preferences Section */}
              <div className="group">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Job Preferences (Optional)
                    </h3>
                  </div>

                  <div className="space-y-8">
                    {/* Availability */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold text-gray-800">How soon can you start a new role?</Label>
                      <RadioGroup
                        value={formData.availability}
                        onValueChange={(value) => handleInputChange("availability", value)}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {[
                          { value: "immediately", label: "Immediately" },
                          { value: "1-2-weeks", label: "1-2 weeks" },
                          { value: "1-month", label: "1 month" },
                          { value: "2-3-months", label: "2-3 months" },
                          { value: "3-months", label: "3+ months" },
                          { value: "not-looking", label: "Not actively looking" },
                        ].map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 cursor-pointer"
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={`availability-${option.value}`}
                              className="text-emerald-600"
                            />
                            <Label
                              htmlFor={`availability-${option.value}`}
                              className="cursor-pointer flex-1 font-medium"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Work Preference */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold text-gray-800">Work Preference</Label>
                      <RadioGroup
                        value={formData.workPreference}
                        onValueChange={(value) => handleInputChange("workPreference", value)}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {[
                          { value: "fully-remote", label: "Fully remote" },
                          { value: "hybrid", label: "Hybrid (2-3 days office)" },
                          { value: "office-based", label: "Primarily office-based" },
                          { value: "flexible", label: "Flexible/open to discuss" },
                        ].map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 cursor-pointer"
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={`work-${option.value}`}
                              className="text-emerald-600"
                            />
                            <Label htmlFor={`work-${option.value}`} className="cursor-pointer flex-1 font-medium">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Work Authorization */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold text-gray-800">
                        Are you authorized to work in your country?
                      </Label>
                      <RadioGroup
                        value={formData.workAuthorization}
                        onValueChange={(value) => handleInputChange("workAuthorization", value)}
                        className="space-y-4"
                      >
                        {[
                          { value: "citizen", label: "Yes, citizen/permanent resident" },
                          { value: "work-permit", label: "Yes, have work permit" },
                          { value: "need-sponsorship", label: "No, would need sponsorship" },
                        ].map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 cursor-pointer"
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={`auth-${option.value}`}
                              className="text-emerald-600"
                            />
                            <Label htmlFor={`auth-${option.value}`} className="cursor-pointer flex-1 font-medium">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Salary Range */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold text-gray-800">
                        What's your salary expectation range?
                      </Label>
                      <RadioGroup
                        value={formData.salaryRange}
                        onValueChange={(value) => handleInputChange("salaryRange", value)}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {[
                          { value: "under-30k", label: "Under €30k" },
                          { value: "30k-45k", label: "€30k - €45k" },
                          { value: "45k-60k", label: "€45k - €60k" },
                          { value: "60k-80k", label: "€60k - €80k" },
                          { value: "80k-100k", label: "€80k - €100k" },
                          { value: "100k-120k", label: "€100k - €120k" },
                          { value: "120k-plus", label: "€120k+" },
                          { value: "prefer-not-say", label: "Prefer not to say" },
                        ].map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 cursor-pointer"
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={`salary-${option.value}`}
                              className="text-emerald-600"
                            />
                            <Label htmlFor={`salary-${option.value}`} className="cursor-pointer flex-1 font-medium">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.whatsappNumber || !formData.linkedinUrl}
                  className="w-full py-6 text-xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 hover:from-violet-700 hover:via-blue-700 hover:to-cyan-700 disabled:opacity-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {isSubmitting ? (
                    <>
                      <Upload className="h-6 w-6 mr-3 animate-spin" />
                      Creating Your Profile...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6 mr-3" />
                      Join Talent Network & Get Matched
                    </>
                  )}
                </Button>

                <p className="text-center text-gray-600 mt-6 text-lg">
                  WhatsApp number and LinkedIn profile are required. All other fields are optional but help us find
                  better matches for you.
                </p>
              </div>

              {/* Benefits Note */}
              <div className="bg-gradient-to-r from-violet-50 via-blue-50 to-cyan-50 border-2 border-violet-200 rounded-2xl p-8 shadow-lg">
                <h4 className="font-bold text-xl bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                  What happens next?
                </h4>
                <ul className="text-gray-700 space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-violet-500 rounded-full mt-3 flex-shrink-0"></div>
                    We'll analyze your profile and match you with relevant opportunities
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                    You'll receive WhatsApp messages when we find great job matches
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-3 flex-shrink-0"></div>
                    No spam - only quality opportunities that fit your preferences
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-3 flex-shrink-0"></div>
                    You can update your preferences anytime
                  </li>
                </ul>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
