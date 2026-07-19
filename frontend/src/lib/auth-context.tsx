"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (returnTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // supabase는 이 시점에서 non-null (위에서 null 체크 완료)
    const sb = supabase!;
    sb.auth
      .getUser()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signInWithGoogle = useCallback(
    async (returnTo?: string) => {
      if (!supabase) return;
      // 로그인 후 원래 페이지로 복귀(auth/callback이 next 파라미터를 open-redirect 방어와 함께 처리).
      // 같은 origin의 상대 경로만 전달.
      const safeReturn =
        returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : null;
      const callback = safeReturn
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeReturn)}`
        : `${window.location.origin}/auth/callback`;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback },
      });
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    try {
      if (supabase) await supabase.auth.signOut();
    } finally {
      setUser(null);
      queryClient.removeQueries({ queryKey: ["userPreferences"] });
    }
  }, [supabase, queryClient]);

  const value = useMemo(
    () => ({ user, loading, signInWithGoogle, signOut }),
    [user, loading, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
