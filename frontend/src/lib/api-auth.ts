import { createClient } from "@/lib/supabase/client";
import type { UserPreference } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchAuthApi<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.");

  const supabase = createClient();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const text = await res.text();
  if (!text) return null as T;
  return JSON.parse(text);
}

export async function getUserPreferences(): Promise<UserPreference> {
  return fetchAuthApi("/api/user/preferences");
}

export async function updateUserPreferences(
  data: Partial<Pick<UserPreference, "displayName" | "district" | "interests">>,
): Promise<UserPreference> {
  return fetchAuthApi("/api/user/preferences", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function addBillBookmark(billId: string): Promise<UserPreference> {
  return fetchAuthApi(`/api/user/preferences/bookmarks/bills/${billId}`, {
    method: "POST",
  });
}

export async function removeBillBookmark(billId: string): Promise<UserPreference> {
  return fetchAuthApi(`/api/user/preferences/bookmarks/bills/${billId}`, {
    method: "DELETE",
  });
}

export async function addMemberBookmark(memberId: string): Promise<UserPreference> {
  return fetchAuthApi(`/api/user/preferences/bookmarks/members/${memberId}`, {
    method: "POST",
  });
}

export async function removeMemberBookmark(memberId: string): Promise<UserPreference> {
  return fetchAuthApi(`/api/user/preferences/bookmarks/members/${memberId}`, {
    method: "DELETE",
  });
}
