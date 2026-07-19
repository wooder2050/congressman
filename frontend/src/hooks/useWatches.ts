"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWatches, createWatch, deleteWatch, type WatchItem } from "@/lib/api-auth";
import { useAuth } from "@/lib/auth-context";

const WATCHES_KEY = ["watches"] as const;

/** 로그인 사용자의 법안 알림 목록. 비로그인 시 비활성. */
export function useWatches() {
  const { user } = useAuth();
  return useQuery<WatchItem[]>({
    queryKey: WATCHES_KEY,
    queryFn: getWatches,
    enabled: !!user,
    staleTime: 60_000,
  });
}

/** 법안 알림 생성(멱등). 성공 시 목록 캐시 무효화. */
export function useCreateWatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billId: string) => createWatch(billId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WATCHES_KEY }),
  });
}

/** 법안 알림 해제. 성공 시 목록 캐시 무효화. */
export function useDeleteWatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (watchId: string) => deleteWatch(watchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WATCHES_KEY }),
  });
}
