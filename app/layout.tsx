import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { PropelAuthProvider } from "@/lib/propelauth-client"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HireFirst - Find Your Next Hire",
  description: "Connect startups with top tech, AI, sales, and engineering talent",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PropelAuthProvider>
            {children}
            <Toaster />
          </PropelAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
