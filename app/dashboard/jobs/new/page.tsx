"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"

export default function NewJobPage() {
  const [jobData, setJobData] = useState({
    title: "",
    department: "",
    location: "",
    type: "",
    salary: "",
    description: "",
    requirements: "",
    benefits: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setJobData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating job:", jobData)
    // Handle job creation
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-600">Post New Job</h1>
            <p className="text-muted-foreground">Create a new job posting</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Post Job
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={jobData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select onValueChange={(value) => handleInputChange("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={jobData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Employment Type</Label>
                <Select onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                value={jobData.salary}
                onChange={(e) => handleInputChange("salary", e.target.value)}
                placeholder="e.g. $120k - $160k"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={jobData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                rows={6}
                required
              />
            </div>

            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={jobData.requirements}
                onChange={(e) => handleInputChange("requirements", e.target.value)}
                placeholder="List the required skills, experience, and qualifications..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="benefits">Benefits & Perks</Label>
              <Textarea
                id="benefits"
                value={jobData.benefits}
                onChange={(e) => handleInputChange("benefits", e.target.value)}
                placeholder="Describe the benefits, perks, and what makes your company great..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Link href="/dashboard/jobs">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Post Job
          </Button>
        </div>
      </form>
    </div>
  )
}
