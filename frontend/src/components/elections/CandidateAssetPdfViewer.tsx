"use client";

import Image from "next/image";
import { useId, useState } from "react";

interface Props {
  /** Supabase Storage에 미러링된 PNG URL (페이지순) */
  pageImageUrls: string[];
  /** NEC 원본 PDF URL (외부 링크용, 페이지순) */
  pdfUrls?: string[];
}

/**
 * NEC 재산신고서 PDF를 PNG로 변환해 인라인 미리보기.
 * 기본은 닫힌 상태, 사용자가 "재산신고서 펼쳐보기"를 누르면 모든 페이지를 세로로 표시.
 * 이미지가 크기 때문에 next/image의 lazy loading + unoptimized로 Storage URL 그대로 로드.
 */
export default function CandidateAssetPdfViewer({ pageImageUrls, pdfUrls }: Props) {
  const panelId = useId();
  const [open, setOpen] = useState(false);

  if (pageImageUrls.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-(--color-border-secondary) bg-(--color-bg-secondary)">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-(--color-bg-hover)"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="text-base leading-none" aria-hidden="true">
          📄
        </span>
        <span className="flex-1 text-xs font-bold text-(--color-text-primary)">
          재산신고서 원문 펼쳐보기
        </span>
        <span className="text-[10px] text-(--color-text-tertiary)">
          {pageImageUrls.length}쪽 · 중앙선관위 제출 서류
        </span>
        <span
          className={`text-[10px] text-(--color-text-tertiary) transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          className="border-t border-(--color-border-secondary) bg-(--color-bg-primary) px-3 py-3"
        >
          <p className="mb-2 text-[10px] leading-relaxed text-(--color-text-tertiary)">
            1쪽은 신고 항목 표지이며 2쪽부터 항목별 금액 내역입니다. 이미지가 흐릿하면 PDF 원문에서
            확인할 수 있습니다.
          </p>
          <ol className="space-y-3">
            {pageImageUrls.map((url, i) => {
              const pdfUrl = pdfUrls?.[i];
              return (
                <li key={url} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-(--color-text-tertiary)">
                    <span>{i + 1}쪽</span>
                    {pdfUrl && (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-(--color-primary) hover:underline"
                      >
                        원문 PDF →
                      </a>
                    )}
                  </div>
                  <div className="overflow-hidden rounded-md border border-(--color-border-secondary) bg-white">
                    <Image
                      src={url}
                      alt={`재산신고서 ${i + 1}쪽`}
                      width={1240}
                      height={1754}
                      unoptimized
                      loading="lazy"
                      className="h-auto w-full"
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
