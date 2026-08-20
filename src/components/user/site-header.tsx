"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserSession } from "@/providers/user-session-provider";
import { useCurrentUserQuery } from "@/hooks/use-current-user-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// The id Hero puts on its <section>, so the Header can observe the Hero's
// own geometry -- rather than a brittle 1px edge sentinel -- to know when
// the user has scrolled past it (docs/user/user-ui.md "Hero Header Style").
// Home is the only page that renders it.
export const HERO_SECTION_ID = "home-hero";

interface SiteHeaderProps {
  // Only true on Home, where the Header overlays the Hero video and starts
  // transparent. Every other page renders the light Header directly
  // (docs/user/user-ui.md "Other pages may use the light Header directly").
  overHero?: boolean;
}

// Shared user-facing Header (docs/user/user-ui.md "Shared Header") --
// implemented independently of AdminHeader/AdminShell, which are
// admin-console-only and authorize very differently (a server-verified
// `/admin/me` profile vs. this Header's reactive Supabase session state).
//
// Positioned `fixed` so it can float transparently over the full-bleed Home
// Hero; pages added in later phases without a Hero must add top padding
// (e.g. `pt-16`) to their content to avoid sitting underneath it.
export function SiteHeader({ overHero = false }: SiteHeaderProps) {
  const [pastHero, setPastHero] = useState(!overHero);
  const { session, isLoading, signOut } = useUserSession();
  const { data: currentUser } = useCurrentUserQuery();
  const router = useRouter();

  useEffect(() => {
    if (!overHero) return;

    // No Hero section means Home hasn't rendered it (yet, or at all) --
    // nothing to observe, so leave the initial transparent state as-is
    // rather than setState synchronously from within the effect body.
    const heroSection = document.getElementById(HERO_SECTION_ID);
    if (!heroSection) return;

    // Observing the Hero's own (tall) geometry instead of a 1px sentinel at
    // its exact bottom edge avoids the ambiguous boundary case where the
    // sentinel sits right at the viewport edge on initial load and browsers
    // can report it as not-yet-intersecting. Shrinking the root by the
    // fixed Header's 64px height means "past the Hero" is defined as: no
    // part of the Hero remains below the Header anymore -- i.e. the Hero
    // has fully scrolled above the Header's bottom edge. This fires in both
    // directions, so scrolling back up into the Hero restores transparency.
    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(heroSection);
    return () => observer.disconnect();
  }, [overHero]);

  const transparent = overHero && !pastHero;
  const isAuthenticated = !isLoading && Boolean(session);
  const displayName = currentUser?.name ?? session?.user.email ?? "";

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border bg-surface shadow-sm",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center" aria-label="KSA Home">
          <Image src="/user/ksa-logo.png" alt="KSA" width={993} height={943} className="h-9 w-auto" priority />
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/news"
            className={cn(
              "text-body font-medium transition-colors",
              transparent ? "text-white hover:text-white/80" : "text-text-primary hover:text-brand-800",
            )}
          >
            News
          </Link>
          <Link
            href="/store"
            className={cn(
              "text-body font-medium transition-colors",
              transparent ? "text-white hover:text-white/80" : "text-text-primary hover:text-brand-800",
            )}
          >
            Store
          </Link>

          {isLoading ? (
            // Reserve space instead of guessing a logged-out state while the
            // Supabase session is still resolving, to avoid a login-link
            // flash for an already-authenticated visitor.
            <span className="h-5 w-16" aria-hidden="true" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-2 rounded-control py-1.5 pr-1 pl-2 text-body font-medium outline-none transition-colors",
                    transparent
                      ? "text-white hover:bg-white/10"
                      : "text-text-primary hover:bg-surface-muted",
                  )}
                >
                  <User className="h-4 w-4" />
                  <span>{displayName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/mypage">마이페이지</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleSignOut}>로그아웃</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className={cn(
                "text-body font-medium transition-colors",
                transparent ? "text-white hover:text-white/80" : "text-text-primary hover:text-brand-800",
              )}
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
