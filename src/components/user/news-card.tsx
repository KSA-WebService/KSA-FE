import Image from "next/image";
import Link from "next/link";
import { NEWS_CATEGORY_LABELS } from "@/lib/user/category-labels";
import { formatUserDate } from "@/lib/user/format-date";
import { ImagePlaceholder } from "@/components/user/image-placeholder";
import { Badge } from "@/components/ui/badge";
import type { PublicPostListItem } from "@/types/api";

// Shared News card -- used by both the Home News preview and the News List
// grid (docs/user/product.md Home "News Section" / docs/user/user-ui.md
// "News List" "News Cards"): identical image/badge/title/date presentation
// and hover language in both places. Only the surrounding grid/section
// differs per page.
//
// The card date is always `publishedAt` -- the list itself is ordered by
// publication time (newest first), so showing `eventStartAt` on some cards
// made the displayed date inconsistent with list order. Event date/time
// still has its own dedicated block on News Detail (eventStartAt/eventEndAt),
// which this component doesn't touch.
export function NewsCard({ post }: { post: PublicPostListItem }) {
  return (
    <Link href={`/news/${post.postId}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-surface">
        {post.representativeImage ? (
          <Image
            src={post.representativeImage.fileUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {post.categories.slice(0, 2).map((category) => (
          <Badge key={category} tone="neutral">
            {NEWS_CATEGORY_LABELS[category]}
          </Badge>
        ))}
        {post.membersOnly && <Badge tone="brand">Members Only</Badge>}
      </div>

      <h3 className="mt-2 line-clamp-2 text-body font-semibold text-text-primary transition-colors group-hover:text-brand-800">
        {post.title}
      </h3>
      <p className="mt-1 text-meta text-text-secondary">{formatUserDate(post.publishedAt)}</p>
    </Link>
  );
}
