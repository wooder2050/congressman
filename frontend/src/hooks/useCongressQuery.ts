"use client";

import {
  useQuery,
  useSuspenseQuery,
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
