"use client";

import { useState } from "react";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 미지원 또는 권한 없음 — 무시
    }
  };

  const handleShare = async () => {
    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    const content = text ? `${text}\n${shareUrl}` : shareUrl;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (e) {
        // 사용자 취소가 아닌 에러면 클립보드 fallback
        if (e instanceof Error && e.name === "AbortError") return;
      }
    }

    await copyToClipboard(content);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-(--color-bg-secondary)"
      aria-label="공유하기"
      title="공유하기"
    >
      {copied ? (
        <span className="text-xs font-medium text-(--color-primary)" role="status" aria-live="polite">
          복사됨!
        </span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-(--color-text-tertiary)"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
    </button>
  );
}
