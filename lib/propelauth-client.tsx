"use client";
import { AuthProvider } from "@propelauth/react";

export function PropelAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider
      authUrl={process.env.NEXT_PUBLIC_AUTH_URL!}
      apiBaseUrlOverride="/api/auth"   // because your route is /api/auth/[...propelauth]
    >
      {children}
    </AuthProvider>
  );
}
