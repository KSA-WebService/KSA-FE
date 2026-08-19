import { Suspense } from "react";
import { TokenEventsPageContent } from "./token-events-page-content";

export default function AdminTokenEventsPage() {
  return (
    <Suspense fallback={null}>
      <TokenEventsPageContent />
    </Suspense>
  );
}
