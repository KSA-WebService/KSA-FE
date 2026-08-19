import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { AdminHeader } from "./admin-header";

// Full-width content per docs/admin/product.md §26 -- no narrow centered
// container around table-heavy pages. Only <main> scrolls, so the header
// stays fixed and sticky table headers inside <main> stick relative to it.
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-page-bg">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
