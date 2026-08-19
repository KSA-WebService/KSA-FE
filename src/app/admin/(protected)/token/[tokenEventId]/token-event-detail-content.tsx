"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTokenEventDetailQuery } from "@/hooks/use-token-event-detail-query";
import { ErrorState } from "@/components/admin/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenEventDetailLoaded } from "./token-event-detail-loaded";
import type { TokenEventDetailParams } from "@/types/api";

const PAGE_SIZE = 20;
const GENERIC_LOAD_ERROR = "토큰 이벤트 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";

export function TokenEventDetailContent({ tokenEventId }: { tokenEventId: string }) {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const keyword = searchParams.get("keyword") ?? "";
  const grantStatus = searchParams.get("grantStatus") ?? "";

  const queryParams: TokenEventDetailParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      keyword: keyword || undefined,
      grantStatus: (grantStatus as TokenEventDetailParams["grantStatus"]) || undefined,
    }),
    [page, keyword, grantStatus],
  );

  const {
    data: detail,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useTokenEventDetailQuery(tokenEventId, queryParams);

  // True first load only (no data at all yet) -- with keepPreviousData,
  // subsequent page/keyword/grantStatus changes keep `detail` populated
  // (the previous result) and only flip isFetching, not isLoading, so the
  // header/search/filter/actions below stay mounted and only the table
  // shows a subtle in-progress indication.
  if (isLoading) {
    return (
      <div className="px-8 pt-8 pb-8">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-9 w-96" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="px-8 pt-8 pb-8">
        <ErrorState message={GENERIC_LOAD_ERROR} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <TokenEventDetailLoaded
      tokenEventId={tokenEventId}
      detail={detail}
      queryParams={queryParams}
      isFetching={isFetching}
    />
  );
}
