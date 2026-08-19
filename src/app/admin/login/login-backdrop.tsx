import Image from "next/image";

// Static poster for now (do not implement video yet, per this checkpoint).
// A future admin-campus-intro.mp4 will render here instead -- muted,
// autoplay, plays once, then freezes on this same image as its poster/
// fallback frame (docs/admin/product.md §4 "Optional 2-4 Second Motion
// Intro" and §24 "Admin Login", including prefers-reduced-motion falling
// back to the static image). Swapping in the <video> only touches this
// file; the page layout around it does not change.
export function LoginBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Image
        src="/brand/admin-campus.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-text-primary/70 via-text-primary/40 to-text-primary/80" />
    </div>
  );
}
