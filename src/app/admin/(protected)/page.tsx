"use client";

import Link from "next/link";
import { useNewOrdersCount, useTotalPostsCount, useTotalUsersCount } from "@/hooks/use-dashboard-counts";
import { PageHeader } from "@/components/admin/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { SummaryCard } from "./dashboard-summary-card";

// docs/admin/admin-ui.md §2. New Orders (/admin/orders) still shows its
// live count but isn't clickable, and New Product stays disabled --
// because those routes don't exist yet (see nav-items.ts for the same rule
// in the sidebar). Total Posts and New Post are enabled now that
// /admin/posts and /admin/posts/new exist.
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
            <Button disabled title="Products are implemented in a later phase">
              New Product
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
