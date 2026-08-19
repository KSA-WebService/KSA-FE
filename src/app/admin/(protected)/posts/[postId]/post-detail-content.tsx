"use client";

import { ApiError } from "@/lib/api/client";
import { usePostDetailQuery } from "@/hooks/use-post-detail-query";
import { ErrorState } from "@/components/admin/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PostDetailLoaded } from "./post-detail-loaded";

const NOT_FOUND_MESSAGE = "게시글을 찾을 수 없습니다.";
const GENERIC_LOAD_ERROR = "게시글 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";

// Loading/error gate. PostDetailLoaded only mounts once `detail` is real,
// so usePostImages/form state inside it always start from correct data --
// and it's remounted (via key={detail.updatedAt}) after every successful
// save, which is exactly the spec's "replace page state with the
// refreshed full detail" + "exit edit mode" behavior for free.
export function PostDetailContent({ postId }: { postId: string }) {
  const { data: detail, isLoading, isError, error, refetch } = usePostDetailQuery(postId);

  if (isLoading) {
    return (
      <div className="px-8 pt-8 pb-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-9 w-96" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (isError || !detail) {
    const isNotFound = error instanceof ApiError && error.errorCode === "C404_CONTENT_POST_NOT_FOUND";

    return (
      <div className="px-8 pt-8 pb-8">
        <ErrorState
          message={isNotFound ? NOT_FOUND_MESSAGE : GENERIC_LOAD_ERROR}
          onRetry={isNotFound ? undefined : () => refetch()}
        />
      </div>
    );
  }

  return <PostDetailLoaded key={detail.updatedAt} postId={postId} detail={detail} />;
}
