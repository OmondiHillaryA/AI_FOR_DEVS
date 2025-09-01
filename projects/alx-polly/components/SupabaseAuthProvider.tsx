'''"use client";

import { AuthProvider } from "@/context/AuthProvider";

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
'''