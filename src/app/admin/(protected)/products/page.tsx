import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { ProductsPageContent } from "./products-page-content";

export default function AdminProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        actions={
          <Link href="/admin/products/new" className={buttonVariants("primary")}>
            New Product
          </Link>
        }
      />
      <Suspense fallback={null}>
        <ProductsPageContent />
      </Suspense>
    </>
  );
}
