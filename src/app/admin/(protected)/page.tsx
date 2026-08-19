"use client";

import { useNewOrdersCount, useTotalPostsCount, useTotalUsersCount } from "@/hooks/use-dashboard-counts";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "./dashboard-summary-card";

// docs/admin/admin-ui.md §2. New Orders (/admin/orders) and Total Posts
// (/admin/posts) still show their live counts, but aren't clickable -- and
// New Post / New Product stay disabled -- because those routes don't exist
// in this phase yet (see nav-items.ts for the same rule in the sidebar).
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
            <Button disabled title="Posts are implemented in a later phase">
              New Post
            </Button>
            <Button disabled title="Products are implemented in a later phase">
              New Product
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
