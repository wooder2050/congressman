"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWatches, createWatch, deleteWatch, type WatchItem } from "@/lib/api-auth";
import { useAuth } from "@/lib/auth-context";
import { RADAR_ENABLED } from "@/lib/radar-analytics";

// 캐시 키에 userId를 포함해 계정 전환 시 이전 사용자 데이터가 재사용되지 않게 한다.
const watchesKey = (userId: string | undefined) => ["watches", userId ?? "anon"] as const;

/** 로그인 사용자의 법안 알림 목록. 비로그인·flag OFF 시 비활성. */
export function useWatches() {
  const { user } = useAuth();
  return useQuery<WatchItem[]>({
    queryKey: watchesKey(user?.id),
    queryFn: getWatches,
    enabled: RADAR_ENABLED && !!user,
    staleTime: 60_000,
  });
}

/** 법안 알림 생성(멱등). 성공 시 해당 사용자 목록 캐시 무효화. */
export function useCreateWatch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (billId: string) => createWatch(billId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: watchesKey(user?.id) }),
  });
}

/** 법안 알림 해제. 성공 시 해당 사용자 목록 캐시 무효화. */
export function useDeleteWatch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (watchId: string) => deleteWatch(watchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: watchesKey(user?.id) }),
  });
}
