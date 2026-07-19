"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { isSafeInternalPath } from "@/lib/safe-redirect";

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
      // 로그인 후 원래 페이지로 복귀. 같은 origin의 단일 슬래시 절대경로만 허용해
      // open redirect(//host, /\host, scheme:...)를 차단한다. callback route도 next를 재검증.
      const safeReturn = isSafeInternalPath(returnTo) ? returnTo! : null;
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
