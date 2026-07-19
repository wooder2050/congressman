"use client";

import { Dialog } from "radix-ui";
import { useAuth } from "@/lib/auth-context";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  /** 로그인 후 복귀할 경로(같은 origin 상대 경로). 없으면 홈으로. */
  returnTo?: string;
}

export default function LoginModal({ open, onClose, returnTo }: LoginModalProps) {
  const { signInWithGoogle } = useAuth();

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-70 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-80 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-(--color-bg-primary) p-6 shadow-xl focus:outline-none">
          <div className="mb-1 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-(--color-text-primary)">
              로그인
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
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
            </Dialog.Close>
          </div>

          <Dialog.Description className="mb-5 text-sm text-(--color-text-tertiary)">
            로그인하면 관심 법안 저장, 지역구 설정 등 맞춤 기능을 이용할 수 있습니다.
          </Dialog.Description>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => signInWithGoogle(returnTo)}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
