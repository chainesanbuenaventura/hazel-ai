"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Settings, Bell, Shield, Database } from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    applications: true,
    interviews: true,
    system: true,
  })

  return (
    <div className="space-y-6 pl-6 pr-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-600">Settings</h1>
        <p className="text-muted-foreground">Manage your Hazel AI Copilot preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Applications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new job applications</p>
                </div>
                <Switch
                  checked={notifications.applications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, applications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Interview Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive reminders for upcoming interviews</p>
                </div>
                <Switch
                  checked={notifications.interviews}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, interviews: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about system updates and maintenance
                  </p>
                </div>
                <Switch
                  checked={notifications.system}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, system: checked })}
                />
              </div>
            </div>

            <Button>Save Notification Settings</Button>
          </CardContent>
        </Card>

        {/* AI Copilot Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Copilot Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ai-prompt">Custom AI Prompt</Label>
              <Textarea
                id="ai-prompt"
                placeholder="Enter custom instructions for the AI copilot..."
                className="mt-1"
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">Customize how the AI analyzes candidates and jobs</p>
            </div>

            <div>
              <Label>AI Response Tone</Label>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">Professional</Badge>
                <Badge variant="outline">Friendly</Badge>
                <Badge variant="outline">Casual</Badge>
                <Badge>Formal</Badge>
              </div>
            </div>

            <Button>Save AI Settings</Button>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Data Retention</Label>
                <p className="text-sm text-muted-foreground">Candidate data is retained for 12 months</p>
              </div>

              <div>
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">Download all your candidate and campaign data</p>
                <Button variant="outline" className="mt-2 bg-transparent">
                  <Database className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
