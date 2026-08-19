"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Shown when GET /api/v1/admin/me could not be completed for a reason that
// is NOT an authorization rejection -- network failure, HTTP 5xx, or a
// malformed response. The Supabase session may still be perfectly valid,
// so this deliberately does not sign the user out or send them back to
// /admin/login; it only offers a retry.
export function ProtectedAreaError() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-body text-text-secondary">
        관리자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <Button onClick={() => router.refresh()}>Retry</Button>
    </main>
  );
}
