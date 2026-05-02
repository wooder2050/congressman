"use client";

import { useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const { signInWithGoogle } = useAuth();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <>
      {/* 백드롭 */}
      <div className="fixed inset-0 z-70 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* 모달 */}
      <div
        className="fixed inset-0 z-80 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <div className="w-full max-w-sm rounded-2xl bg-(--color-bg-primary) p-6 shadow-xl">
          <div className="mb-1 flex items-center justify-between">
            <h2 id="login-modal-title" className="text-lg font-bold text-(--color-text-primary)">
              로그인
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-(--color-text-tertiary) hover:bg-(--color-bg-secondary)"
              aria-label="닫기"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <p className="mb-5 text-sm text-(--color-text-tertiary)">
            로그인하면 관심 법안 저장, 지역구 설정 등 맞춤 기능을 이용할 수 있습니다.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-(--color-border-primary) bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google로 시작하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
