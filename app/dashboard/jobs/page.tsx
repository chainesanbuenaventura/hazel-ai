"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Users, Calendar, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"

const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $160k",
    status: "active",
    applicants: 24,
    posted: "2024-01-10",
    description: "We're looking for a senior frontend developer to join our team...",
  },
  {
    id: "2",
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    type: "Full-time",
    salary: "$130k - $170k",
    status: "active",
    applicants: 18,
    posted: "2024-01-08",
    description: "Lead product strategy and development for our core platform...",
  },
  {
    id: "3",
    title: "UX Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    salary: "$90k - $120k",
    status: "paused",
    applicants: 31,
    posted: "2024-01-05",
    description: "Create beautiful and intuitive user experiences...",
  },
  {
    id: "4",
    title: "Backend Engineer",
    department: "Engineering",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$110k - $150k",
    status: "active",
    applicants: 15,
    posted: "2024-01-03",
    description: "Build scalable backend systems and APIs...",
  },
]

const statusColors = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  closed: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-800",
}

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || job.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 pl-6 pr-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-600">Jobs</h1>
          <p className="text-muted-foreground">Manage your job postings and track applications</p>
        </div>
        <Link href="/dashboard/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Status: {statusFilter === "all" ? "All" : statusFilter}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("paused")}>Paused</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("closed")}>Closed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("draft")}>Draft</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{job.department}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link href={`/dashboard/jobs/${job.id}`}>View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={`/dashboard/jobs/${job.id}/candidates`}>View Candidates</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Edit Job</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete Job</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={statusColors[job.status as keyof typeof statusColors]}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
                <span className="text-sm font-medium">{job.type}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{job.applicants} applicants</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {job.posted}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

              <div className="flex gap-2 pt-2">
                <Link href={`/dashboard/jobs/${job.id}/candidates`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    View Candidates
                  </Button>
                </Link>
                <Link href={`/dashboard/jobs/${job.id}`} className="flex-1">
                  <Button className="w-full">View Details</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Plus className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No jobs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by posting your first job."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <div className="mt-6">
              <Link href="/dashboard/jobs/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
