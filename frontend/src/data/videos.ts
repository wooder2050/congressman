/**
 * lawmake 롱폼 영상(가로 16:9) 편집 데이터.
 *
 * 쇼츠(국감 오늘의 장면)는 DB(YouTubeShort)로 노출하지만, 롱폼은 편수가 적고 자리가 정해져 있어
 * 정적 데이터로 둔다. 새 영상을 올리면 맨 앞에 추가하고, 홈에서 내릴 때는 showOnHome을 false로 바꾼다.
 */
export interface LongformVideo {
  videoId: string;
  title: string;
  /** 사이트 표시용 한두 문장 요약 */
  summary: string;
  /** YYYY-MM-DD(KST) */
  publishedAt: string;
  durationLabel: string;
  /** 본편으로 보내는 쇼츠 */
  shortsId?: string;
  showOnHome: boolean;
  /** 영상과 이어지는 사이트 페이지 */
  related?: { label: string; href: string };
}

export const LONGFORM_VIDEOS: LongformVideo[] = [
  {
    videoId: "d9xsGLE3FLM",
    title: "국회의원 재산 6만 4천 건을 다 뒤져봤다",
    summary:
      "2016~2026년 국회의원 재산 신고 6만 4천 건으로 본 1,257억 원부터 마이너스 10억 원까지 — 강남 3구 주택, 코인, 빚, 그리고 10년 사이 재산 변화를 데이터로 정리했습니다.",
    publishedAt: "2026-10-19",
    durationLabel: "4:35",
    shortsId: "02OoZAaa-W4",
    showOnHome: true,
    related: { label: "의원별 부동산·재산 현황 보기", href: "/members/property" },
  },
];

export function getHomeVideo(): LongformVideo | undefined {
  return LONGFORM_VIDEOS.find((v) => v.showOnHome);
}
