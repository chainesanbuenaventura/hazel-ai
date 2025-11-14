"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

const conversations = [
  {
    id: 1,
    name: "Alice Johnson",
    type: "first_contact",
    lastMessage: "Thank you for reaching out!",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    name: "Bob Smith",
    type: "scheduling",
    lastMessage: "Does Tuesday at 10am work for you?",
    time: "1 day ago",
    unread: false,
  },
  {
    id: 3,
    name: "Carol White",
    type: "qualifying",
    lastMessage: "Can you tell me about your ML experience?",
    time: "3 days ago",
    unread: false,
  },
]

export function InboxTab() {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search conversations..." className="pl-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="first_contact">First Contact</SelectItem>
            <SelectItem value="scheduling">Scheduling</SelectItem>
            <SelectItem value="qualifying">Qualifying</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conversations List */}
      <div className="space-y-2">
        {conversations.map((conv) => (
          <Card key={conv.id} className="p-4 cursor-pointer hover:bg-muted transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{conv.name}</h3>
                  {conv.unread && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                </div>
                <p className="text-sm text-muted-foreground">{conv.lastMessage}</p>
              </div>
              <div className="text-xs text-muted-foreground text-right">{conv.time}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
