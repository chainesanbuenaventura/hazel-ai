"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal, ArrowLeft, Mail, Phone, Calendar, FileText } from "lucide-react"
import Link from "next/link"

interface JobCandidatesProps {
  params: {
    id: string
  }
}

const mockCandidates = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    status: "interviewing",
    appliedDate: "2024-01-15",
    experience: "5 years",
    skills: ["React", "TypeScript", "Next.js"],
    avatar: "/placeholder.svg?height=40&width=40",
    matchScore: 95,
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1 (555) 234-5678",
    status: "pending",
    appliedDate: "2024-01-12",
    experience: "3 years",
    skills: ["React", "JavaScript", "CSS"],
    avatar: "/placeholder.svg?height=40&width=40",
    matchScore: 87,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "+1 (555) 345-6789",
    status: "rejected",
    appliedDate: "2024-01-10",
    experience: "2 years",
    skills: ["Vue.js", "JavaScript", "HTML"],
    avatar: "/placeholder.svg?height=40&width=40",
    matchScore: 72,
  },
]

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  interviewing: "bg-blue-100 text-blue-800",
  hired: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

export default function JobCandidatesPage({ params }: JobCandidatesProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredCandidates = mockCandidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
            <h1 className="text-3xl font-bold tracking-tight text-gray-600">Frontend Developer Candidates</h1>
            <p className="text-muted-foreground">{mockCandidates.length} candidates applied</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Status: {statusFilter === "all" ? "All" : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("interviewing")}>Interviewing</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("hired")}>Hired</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>Rejected</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={candidate.avatar || "/placeholder.svg"} alt={candidate.name} />
                  <AvatarFallback>
                    {candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">{candidate.experience} experience</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                  <DropdownMenuItem>Send Message</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Reject</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={statusColors[candidate.status as keyof typeof statusColors]}>
                  {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                </Badge>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">{candidate.matchScore}% match</div>
                  <div className="text-xs text-muted-foreground">AI Score</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{candidate.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Applied {candidate.appliedDate}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <FileText className="h-4 w-4 mr-1" />
                  View CV
                </Button>
                <Button size="sm" className="flex-1">
                  Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No candidates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "No candidates have applied for this position yet."}
          </p>
        </div>
      )}
    </div>
  )
}
