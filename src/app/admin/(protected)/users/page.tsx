import { Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { UsersPageContent } from "./users-page-content";

// UsersPageContent reads useSearchParams (URL is the source of truth for
// pagination/filter/sort/search), which Next.js requires a Suspense
// boundary for.
export default function AdminUsersPage() {
  return (
    <>
      <PageHeader title="Users" />
      <Suspense fallback={null}>
        <UsersPageContent />
      </Suspense>
    </>
  );
}
