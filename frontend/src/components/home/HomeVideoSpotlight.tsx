"use client";

import TrackedLink from "@/components/analytics/TrackedLink";
import { trackEvent } from "@/lib/analytics";
import YouTubeVideoFacade from "@/components/video/YouTubeVideoFacade";
import { getHomeVideo, type LongformVideo } from "@/data/videos";

interface HomeVideoSpotlightProps {
  /** 지정하지 않으면 홈 노출용(showOnHome) 영상 */
  video?: LongformVideo;
  /** GA 자리 구분 */
  component?: string;
  /** 재산 페이지처럼 영상 주제 페이지 안에서는 '관련 페이지' 링크를 숨긴다 */
  hideRelated?: boolean;
}

/**
 * lawmake 롱폼 영상 카드 — 홈(속보 아래)과 영상 주제 페이지에서 쓴다.
 * 클릭 이벤트는 GTM 트리거 정규식에 이미 있는 이름(shorts_youtube_click·audit_related_click)을 쓰고 component·format으로 구분한다.
 */
export default function HomeVideoSpotlight({
  video = getHomeVideo(),
  component = "home_video",
  hideRelated = false,
}: HomeVideoSpotlightProps) {
  if (!video) return null;
  const params = { component, video_id: video.videoId, format: "long" };

  return (
    <section
      aria-labelledby={`video-${video.videoId}-title`}
      className="grid gap-4 rounded-xl border border-(--color-border-primary) p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center"
    >
      <YouTubeVideoFacade videoId={video.videoId} title={video.title} component={component} />
      <div className="space-y-2">
        <p className="text-xs font-semibold text-(--color-text-tertiary)">
          lawmake 데이터 영상 · {video.durationLabel}
        </p>
        <h2 id={`video-${video.videoId}-title`} className="text-xl leading-snug font-bold">
          {video.title}
        </h2>
        <p className="text-sm text-(--color-text-secondary)">{video.summary}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("shorts_youtube_click", params)}
            className="rounded-full border border-(--color-border-primary) px-3 py-1.5 text-sm font-medium no-underline hover:bg-(--color-bg-secondary)"
          >
            유튜브에서 보기 ↗
          </a>
          {!hideRelated && video.related && (
            <TrackedLink
              href={video.related.href}
              eventName="audit_related_click"
              eventParams={params}
              className="rounded-full border border-(--color-border-primary) px-3 py-1.5 text-sm font-medium no-underline hover:bg-(--color-bg-secondary)"
            >
              {video.related.label} →
            </TrackedLink>
          )}
        </div>
      </div>
    </section>
  );
}
