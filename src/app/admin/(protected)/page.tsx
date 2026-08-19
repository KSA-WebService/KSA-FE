"use client";

import Link from "next/link";
import { useNewOrdersCount, useTotalPostsCount, useTotalUsersCount } from "@/hooks/use-dashboard-counts";
import { PageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { SummaryCard } from "./dashboard-summary-card";

// docs/admin/admin-ui.md §2. All summary cards and quick actions are now
// enabled: /admin/orders, /admin/posts, /admin/products, and /admin/users
// all exist as of Phase 4.
export default function AdminDashboardPage() {
  const newOrders = useNewOrdersCount();
  const totalPosts = useTotalPostsCount();
  const totalUsers = useTotalUsersCount();

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="New Orders"
            value={newOrders.data}
            isLoading={newOrders.isLoading}
            isError={newOrders.isError}
            // admin-ui.md's Dashboard section literally says
            // "?status=ordered", but the confirmed Orders query param
            // (both api-contract.md and the Orders page itself) is
            // `orderStatus`, not `status` -- using the doc's literal
            // string would silently fail to select the Ordered tab. Using
            // the confirmed param name here instead; see the Phase 4
            // summary's "ambiguities" section.
            href="/admin/orders?orderStatus=ordered"
          />
          <SummaryCard
            label="Total Posts"
            value={totalPosts.data}
            isLoading={totalPosts.isLoading}
            isError={totalPosts.isError}
            href="/admin/posts"
          />
          <SummaryCard
            label="Total Users"
            value={totalUsers.data}
            isLoading={totalUsers.isLoading}
            isError={totalUsers.isError}
            href="/admin/users"
          />
        </div>

        <div className="mt-10">
          <h2 className="text-section-heading font-semibold text-text-primary">Quick Actions</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/admin/posts/new" className={buttonVariants("primary")}>
              New Post
            </Link>
            <Link href="/admin/products/new" className={buttonVariants("primary")}>
              New Product
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
