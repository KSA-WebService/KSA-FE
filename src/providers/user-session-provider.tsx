"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface UserSessionContextValue {
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const UserSessionContext = createContext<UserSessionContextValue | null>(null);

// Public-site auth state (Header, and later Login/My Page/Order
// Confirmation) -- distinct from AdminAuthProvider, which is fed by a
// server-verified `/admin/me` profile check that only applies to the admin
// console. This provider only tracks the raw Supabase session via the
// official onAuthStateChange listener (docs/user/api-contract.md "Supabase
// is used for authentication only") so every consumer -- e.g. the Header --
// reacts immediately to sign-in/sign-out from anywhere in the app.
export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: UserSessionContextValue = {
    session,
    isLoading,
    async signOut() {
      const supabase = createClient();
      await supabase.auth.signOut();
    },
  };

  return <UserSessionContext.Provider value={value}>{children}</UserSessionContext.Provider>;
}

export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error("useUserSession must be used within a UserSessionProvider");
  }
  return context;
}
