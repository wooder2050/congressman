"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  getUserPreferences,
  updateUserPreferences,
  addBillBookmark,
  removeBillBookmark,
  addMemberBookmark,
  removeMemberBookmark,
} from "@/lib/api-auth";

function prefsKey(userId: string) {
  return ["userPreferences", userId];
}

export function useUserPreferences() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  return useQuery({
    queryKey: prefsKey(userId),
    queryFn: getUserPreferences,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: prefsKey(user.id) });
    },
  });
}

export function useToggleBillBookmark() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ billId, bookmarked }: { billId: string; bookmarked: boolean }) =>
      bookmarked ? removeBillBookmark(billId) : addBillBookmark(billId),
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: prefsKey(user.id) });
    },
  });
}

export function useToggleMemberBookmark() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ memberId, bookmarked }: { memberId: string; bookmarked: boolean }) =>
      bookmarked ? removeMemberBookmark(memberId) : addMemberBookmark(memberId),
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: prefsKey(user.id) });
    },
  });
}
