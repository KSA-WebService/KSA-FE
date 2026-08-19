import { Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { LogsPageContent } from "./logs-page-content";

export default function AdminLogsPage() {
  return (
    <>
      <PageHeader title="Logs" />
      <Suspense fallback={null}>
        <LogsPageContent />
      </Suspense>
    </>
  );
}
