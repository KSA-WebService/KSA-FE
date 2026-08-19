import {
  Coins,
  FileText,
  History,
  Home,
  Package,
  ShoppingBag,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
}

// Icons per docs/admin/product.md §7. `enabled: false` items render in the
// sidebar but are not links -- their routes don't exist until a later
// phase, and this app must never send anyone to a 404 (see also
// dashboard-summary-card.tsx and the Dashboard quick actions, which follow
// the same rule).
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: Home, enabled: true },
  { label: "Users", href: "/admin/users", icon: Users, enabled: true },
  { label: "Posts", href: "/admin/posts", icon: FileText, enabled: true },
  { label: "Token", href: "/admin/token", icon: Coins, enabled: false },
  { label: "Whitelist", href: "/admin/whitelist", icon: UserCheck, enabled: true },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, enabled: false },
  { label: "Products", href: "/admin/products", icon: Package, enabled: false },
  { label: "Logs", href: "/admin/logs", icon: History, enabled: false },
];
