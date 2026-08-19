"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AdminProfile } from "@/types/api";

interface AdminAuthContextValue {
  profile: AdminProfile;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

interface AdminAuthProviderProps {
  initialProfile: AdminProfile;
  children: ReactNode;
}

// Receives the already-verified admin profile from the protected server
// layout (which called GET /api/v1/admin/me before rendering anything).
// This provider does NOT perform its own first authorization check -- it
// only holds the verified profile and exposes signOut() for the header's
// `Log Out` control.
export function AdminAuthProvider({ initialProfile, children }: AdminAuthProviderProps) {
  const router = useRouter();

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      profile: initialProfile,
      async signOut() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
      },
    }),
    [initialProfile, router],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
