"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { trackEvent } from "@/lib/analytics";
import { useImpression } from "@/lib/use-impression";

interface YouTubeVideoFacadeProps {
  videoId: string;
  title: string;
  /** GA 자리 구분 — home_video · property_video */
  component: string;
}

/**
 * 가로(16:9) 롱폼 영상 지연 임베드. YouTubeShortFacade와 같은 방식으로 클릭 전까지 플레이어를 싣지 않는다.
 * 이벤트 이름은 GTM 트리거 정규식에 이미 있는 shorts_embed_open·shorts_youtube_click을 재사용하고
 * format=long으로 구분한다(새 이벤트 이름은 GTM 게시가 따로 필요).
 */
export default function YouTubeVideoFacade({ videoId, title, component }: YouTubeVideoFacadeProps) {
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (playing) iframeRef.current?.focus();
  }, [playing]);
  const impressionRef = useImpression({ component, article_id: videoId, position: 0 });
  const params = { component, video_id: videoId, position: 0, format: "long" };

  return (
    <div
      ref={impressionRef}
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-black"
    >
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
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
          />
          <span className="absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 transition group-hover:bg-black/85">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-0.5 h-7 w-7 fill-white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
