import { Suspense } from "react";
import { WhitelistPageContent } from "./whitelist-page-content";

export default function AdminWhitelistPage() {
  return (
    <Suspense fallback={null}>
      <WhitelistPageContent />
    </Suspense>
  );
}
