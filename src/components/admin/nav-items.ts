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

// Icons per docs/admin/product.md §7. As of Phase 4, every admin route in
// the approved specification exists, so every item is enabled.
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: Home, enabled: true },
  { label: "Users", href: "/admin/users", icon: Users, enabled: true },
  { label: "Posts", href: "/admin/posts", icon: FileText, enabled: true },
  { label: "Token", href: "/admin/token", icon: Coins, enabled: true },
  { label: "Whitelist", href: "/admin/whitelist", icon: UserCheck, enabled: true },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, enabled: true },
  { label: "Products", href: "/admin/products", icon: Package, enabled: true },
  { label: "Logs", href: "/admin/logs", icon: History, enabled: true },
];
