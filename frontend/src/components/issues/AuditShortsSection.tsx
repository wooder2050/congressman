import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import YouTubeShortFacade from "@/components/video/YouTubeShortFacade";
import { AUDIT_2026 } from "@/data/audit-2026";
import { getYouTubeShorts } from "@/lib/api";

interface AuditShortsSectionProps {
  /** today = /today(오늘의 국회) 상단. 국감 기간엔 국감 쇼츠가 그날의 국회 영상 역할을 한다 */
  placement: "hub" | "committee" | "today";
  committee?: string;
  /** 위원회 페이지에서 보여줄 위원회 약칭(제목용) */
  committeeShort?: string;
}

/**
 * 국감 쇼츠 묶음. 영상은 backend `pnpm shorts:add`로 DB에 등록하면 배포 없이 나타난다.
 * 등록된 영상이 없거나 API가 실패하면 섹션 자체를 그리지 않는다(빈 상자·오류 문구를 띄우지 않음).
 */
export default async function AuditShortsSection({
  placement,
  committee,
  committeeShort,
}: AuditShortsSectionProps) {
  const shorts = await getYouTubeShorts({
    issueSlug: "audit-2026",
    placement: placement === "today" ? "hub" : placement,
    committee,
    limit: placement === "hub" ? 6 : 3,
  });
  if (!shorts || shorts.length === 0) return null;

  const component = {
    hub: "audit_hub_shorts",
    committee: "audit_committee_shorts",
    today: "today_shorts",
  }[placement];

  return (
    <section id="shorts" aria-labelledby="shorts-title" className="scroll-mt-32 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="shorts-title" className="text-xl font-bold">
          {committeeShort ? `${committeeShort} 국감 장면` : "국감 오늘의 장면"}
        </h2>
        {placement === "today" ? (
          <Link href={AUDIT_2026.path} className="text-xs text-(--color-text-tertiary)">
            국감 일정 전체 보기 →
          </Link>
        ) : (
          <a
            href="https://www.youtube.com/channel/UCzvkP0-7B6H-FnXD4m7xCMw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-(--color-text-tertiary)"
          >
            로메이크 유튜브 ↗
          </a>
        )}
      </div>
      <ul
        className={
          // /today는 max-w-7xl이라 4열이면 카드가 커져 속보를 밀어낸다 — 열을 늘려 카드 폭을 허브와 맞춘다
          placement === "today"
            ? "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6"
            : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        }
      >
        {shorts.map((s, i) => (
          <li key={s.videoId}>
            <YouTubeShortFacade
              videoId={s.videoId}
              title={s.title}
              component={component}
              position={i + 1}
            />
          </li>
        ))}
      </ul>
      <p className="text-xs text-(--color-text-tertiary)">
        보도·회의 기록을 바탕으로 로메이크가 만든 1분 안팎 요약 영상입니다. 내레이션은 AI
        음성(TTS)이며, 출처는 각 영상 설명에 적었습니다.
      </p>
      {shorts.map((s) => (
        <JsonLd
          key={`ld-${s.videoId}`}
          data={{
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: s.title,
            description: s.description || s.title,
            thumbnailUrl: `https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg`,
            uploadDate: s.publishedAt,
            ...(s.durationSeconds ? { duration: `PT${s.durationSeconds}S` } : {}),
            embedUrl: `https://www.youtube.com/embed/${s.videoId}`,
            contentUrl: `https://www.youtube.com/shorts/${s.videoId}`,
            publisher: { "@type": "Organization", name: "로메이크", url: "https://www.lawmake.kr" },
          }}
        />
      ))}
    </section>
  );
}
