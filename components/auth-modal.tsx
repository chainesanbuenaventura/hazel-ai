"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onAuthenticate: (accessKey: string) => void
  isLoading: boolean
  error: string | null
}

export function AuthModal({ isOpen, onAuthenticate, isLoading, error }: AuthModalProps) {
  const [accessKey, setAccessKey] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (accessKey.trim()) {
      onAuthenticate(accessKey.trim())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Access Required
          </DialogTitle>
          <DialogDescription>Please enter the access key to continue to the Recruitment Copilot dashboard.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessKey">Access Key</Label>
            <Input
              id="accessKey"
              type="password"
              placeholder="Enter access key"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading || !accessKey.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
