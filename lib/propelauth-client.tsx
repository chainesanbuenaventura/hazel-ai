"use client";
import { AuthProvider } from "@propelauth/react";

export function PropelAuthProvider({ children }: { children: React.ReactNode }) {
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;
  
  if (!authUrl) {
    console.error("[PropelAuth] NEXT_PUBLIC_AUTH_URL is not set! Please add it to your environment variables.");
    // Return children without auth provider in development, but this should be fixed in production
    if (process.env.NODE_ENV === "development") {
      return <>{children}</>;
    }
    // In production, we should fail fast
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
          <p className="text-muted-foreground">
            NEXT_PUBLIC_AUTH_URL environment variable is not set.
            <br />
            Please configure it in your Vercel project settings.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <AuthProvider
      authUrl={authUrl}
      apiBaseUrlOverride="/api/auth"   // because your route is /api/auth/[...propelauth]
    >
      {children}
    </AuthProvider>
  );
}
