"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter } from "lucide-react"

const candidates = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", stage: "Contacted", score: 92, tags: ["ML", "Python"] },
  { id: 2, name: "Bob Chen", email: "bob@example.com", stage: "Screened", score: 88, tags: ["ML", "TensorFlow"] },
  { id: 3, name: "Carol Davis", email: "carol@example.com", stage: "Sourced", score: 85, tags: ["ML", "PyTorch"] },
  { id: 4, name: "David Wilson", email: "david@example.com", stage: "Interview", score: 79, tags: ["ML", "AWS"] },
]

export function CandidatesView() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Candidates</CardTitle>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search candidates..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{candidate.stage}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{candidate.score}%</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {candidate.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
