"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import LoginModal from "./LoginModal";
import UserMenu from "./UserMenu";

export default function AuthButton() {
  const { user, loading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  if (loading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-(--color-bg-tertiary)" />;
  }

  if (user) {
    return <UserMenu />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setLoginOpen(true)}
        className="rounded-lg bg-(--color-text-primary) px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90"
      >
        로그인
      </button>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
