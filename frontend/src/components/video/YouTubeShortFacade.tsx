"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { trackEvent } from "@/lib/analytics";
import { useImpression } from "@/lib/use-impression";

interface YouTubeShortFacadeProps {
  videoId: string;
  title: string;
  /** GA 자리 구분 — audit_hub · audit_committee */
  component: string;
  position: number;
}

/**
 * 유튜브 쇼츠 지연 임베드. 처음엔 썸네일만 그리고 누르면 그 자리에서 플레이어를 띄운다
 * — 플레이어 스크립트(수백 KB)와 유튜브 쿠키를 클릭 전까지 싣지 않는다.
 * 썸네일 hqdefault(4:3)는 세로 영상 좌우에 검은 띠가 있어 9:16 상자에 cover로 맞추면 영상 부분만 남는다.
 */
export default function YouTubeShortFacade({
  videoId,
  title,
  component,
  position,
}: YouTubeShortFacadeProps) {
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // 누른 버튼이 플레이어로 바뀌며 사라지므로 키보드 포커스를 플레이어로 옮긴다
  useEffect(() => {
    if (playing) iframeRef.current?.focus();
  }, [playing]);
  const impressionRef = useImpression({ component, article_id: videoId, position });
  const params = { component, video_id: videoId, position };

  return (
    <div ref={impressionRef} className="w-full">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black">
        {playing ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setPlaying(true);
              trackEvent("shorts_embed_open", params);
            }}
            className="group absolute inset-0 h-full w-full cursor-pointer"
            aria-label={`${title} 재생`}
          >
            <Image
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, 220px"
              className="object-cover"
            />
            <span className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 transition group-hover:bg-black/85">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-0.5 h-6 w-6 fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <a
        href={`https://www.youtube.com/shorts/${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("shorts_youtube_click", params)}
        className="mt-2 block text-sm leading-snug font-medium text-(--color-text-primary) no-underline hover:underline"
      >
        {title}
        <span className="mt-0.5 block text-xs font-normal text-(--color-text-tertiary)">
          유튜브에서 보기 ↗
        </span>
      </a>
    </div>
  );
}
