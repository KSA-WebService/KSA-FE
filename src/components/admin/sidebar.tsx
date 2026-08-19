"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "./nav-items";

// Sidebar per docs/admin/product.md §7: logo top, minimal nav (icon + text,
// no boxed buttons), slim left active indicator, subtle horizontal hover
// lift -- not a large animation.
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center px-6 py-6">
        <Image
          src="/brand/ksa-logo.png"
          alt="KSA"
          width={993}
          height={943}
          className="h-8 w-auto"
          priority
        />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

          if (!item.enabled) {
            return (
              <span
                key={item.href}
                aria-disabled="true"
                className="flex select-none items-center gap-3 rounded-control border-l-2 border-transparent py-2 pr-3 pl-[10px] text-body text-text-muted opacity-60"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-control border-l-2 py-2 pr-3 pl-[10px] text-body transition-all duration-150 ease-out hover:translate-x-1",
                isActive
                  ? "border-brand-800 font-semibold text-brand-800"
                  : "border-transparent text-text-secondary hover:text-brand-800",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors duration-150",
                  isActive ? "text-brand-500" : "text-text-muted group-hover:text-brand-500",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
