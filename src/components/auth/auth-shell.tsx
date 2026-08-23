import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthBackdrop } from "./auth-backdrop";

// Shared full-page layout for Login and Account Activation
// (docs/user/user-ui.md "Shared Auth Visual Direction"): campus background,
// with the KSA logo and auth card centered as one group so the composition
// stays balanced and doesn't crowd the central red sculpture off to one
// side. Desktop-first; the same centered layout holds at every width.
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <AuthBackdrop />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center">
        <Link href="/" className="mb-10 inline-flex" aria-label="KSA Home">
          <Image src="/user/ksa-logo.png" alt="KSA" width={993} height={943} className="h-16 w-auto" priority />
        </Link>

        <div className="w-full">{children}</div>
      </div>
    </main>
  );
}
