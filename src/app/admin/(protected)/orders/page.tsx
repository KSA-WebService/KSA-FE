import { Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { OrdersPageContent } from "./orders-page-content";

export default function AdminOrdersPage() {
  return (
    <>
      <PageHeader title="Orders" />
      <Suspense fallback={null}>
        <OrdersPageContent />
      </Suspense>
    </>
  );
}
