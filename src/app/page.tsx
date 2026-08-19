import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-page-title font-bold text-text-primary">KSA</h1>
      <p className="text-body text-text-secondary">
        Frontend foundation checkpoint. The admin console lives under{" "}
        <Link href="/admin/login" className="text-brand-500 underline">
          /admin/login
        </Link>
        .
      </p>
    </main>
  );
}
