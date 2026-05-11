"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/components/auth/auth-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
