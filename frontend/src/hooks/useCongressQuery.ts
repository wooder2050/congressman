"use client";

import {
  useQuery,
  useSuspenseQuery,
  useInfiniteQuery,
  type UseQueryOptions,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query";

type QueryKeyedFn<TParams, TResult> = {
  (...args: TParams[]): Promise<TResult>;
  queryKey?: string;
};

function getQueryKey<TParams>(fn: QueryKeyedFn<TParams, unknown>, params?: TParams): unknown[] {
  const safeName = fn.queryKey ?? fn.name ?? "unknown";
  return params !== undefined ? [safeName, JSON.stringify(params)] : [safeName];
}

export function useCongressQuery<TResult, TParams = void>(
  fn: QueryKeyedFn<TParams, TResult>,
  params?: TParams,
  options?: Omit<UseQueryOptions<TResult>, "queryKey" | "queryFn">,
) {
  return useQuery<TResult>({
    queryKey: getQueryKey(fn, params),
    queryFn: () => (params !== undefined ? fn(params) : fn()),
    ...options,
  });
}

export function useCongressSuspenseQuery<TResult, TParams = void>(
  fn: QueryKeyedFn<TParams, TResult>,
  params?: TParams,
  options?: Omit<UseSuspenseQueryOptions<TResult>, "queryKey" | "queryFn">,
) {
  return useSuspenseQuery<TResult>({
    queryKey: getQueryKey(fn, params),
    queryFn: () => (params !== undefined ? fn(params) : fn()),
    ...options,
  });
}

export function useCongressInfiniteQuery<
  TResult extends { total: number },
  TParams extends Record<string, unknown>,
>(
  fn: QueryKeyedFn<TParams & { page?: number; limit?: number }, TResult>,
  params: TParams,
  options: {
    limit?: number;
    getItemCount: (data: TResult) => number;
  },
) {
  const limit = options.limit ?? 30;
  const safeName = fn.queryKey ?? fn.name ?? "unknown";

  return useInfiniteQuery<
    TResult,
    Error,
    { pages: TResult[]; pageParams: number[] },
    unknown[],
    number
  >({
    queryKey: [safeName, JSON.stringify(params), "infinite"],
    queryFn: ({ pageParam }) =>
      fn({ ...params, page: pageParam, limit } as TParams & { page: number; limit: number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + options.getItemCount(page), 0);
      if (loadedCount >= lastPage.total) return undefined;
      return allPages.length + 1;
    },
  });
}
