"use client";

import { useAdminAuth } from "@/providers/admin-auth-provider";
import { Button } from "@/components/ui/button";

// docs/admin/admin-ui.md §2 "Admin Greeting" / "Log Out". Page-specific
// title/actions live in each page's own PageHeader, not here -- this bar is
// only the account controls shared across every protected page.
export function AdminHeader() {
  const { profile, signOut } = useAdminAuth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-end border-b border-border bg-surface px-8">
      <div className="flex items-center gap-4">
        <span className="text-body text-text-secondary">Hi, {profile.name}</span>
        <Button variant="secondary" onClick={() => signOut()}>
          Log Out
        </Button>
      </div>
    </header>
  );
}
