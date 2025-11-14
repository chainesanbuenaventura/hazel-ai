"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import type { SupabaseClient } from "@supabase/supabase-js"

type SupabaseContext = {
  supabase: SupabaseClient | null
}

const Context = createContext<SupabaseContext>({ supabase: null })

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createSupabaseClient())

  return (
    <Context.Provider value={{ supabase }}>
      <div>{children}</div>
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
