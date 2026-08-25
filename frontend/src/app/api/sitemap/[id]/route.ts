import { NextRequest } from "next/server";
import {
  getIndexableBillIds,
  getCuratedBillIds,
  getVoteIds,
  getElections,
  getElection,
  getLocalElections,
  getIndexableLocalElectionRaces,
} from "@/lib/api";
import { getAllWeeklyArticles } from "@/data/weekly";
import { getAllTermSlugs } from "@/lib/glossary";
import { CURATION_MODE } from "@/lib/curation-mode";
import { BASE, BILLS_PER_SITEMAP, xmlResponse, urlEntry, urlset } from "../route";

export const revalidate = 86400;

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/** scorecard-ranking 응답에서 sitemap 필터에 필요한 최소 필드 */
interface MemberScore {
  memberId: string;
  voteParticipation: { rate: number };
  billProposal: { representativeCount: number };
}

async function buildSitemap(id: number) {
  // Sitemap 0: static pages + members
  if (id === 0) {
    const entries = [
      urlEntry(BASE, { changefreq: "daily", priority: 1.0 }),
      urlEntry(`${BASE}/members`, { changefreq: "weekly", priority: 0.9 }),
      urlEntry(`${BASE}/bills`, { changefreq: "daily", priority: 0.8 }),
      urlEntry(`${BASE}/votes`, { changefreq: "daily", priority: 0.8 }),
      urlEntry(`${BASE}/schedule`, { changefreq: "daily", priority: 0.7 }),
      urlEntry(`${BASE}/map`, { changefreq: "monthly", priority: 0.6 }),
      urlEntry(`${BASE}/compare`, { changefreq: "monthly", priority: 0.5 }),
      urlEntry(`${BASE}/committees`, { changefreq: "weekly", priority: 0.7 }),
      urlEntry(`${BASE}/guide`, { changefreq: "monthly", priority: 0.6 }),
      urlEntry(`${BASE}/guide/roles`, { changefreq: "monthly", priority: 0.5 }),
      urlEntry(`${BASE}/guide/budget`, { changefreq: "monthly", priority: 0.5 }),
      urlEntry(`${BASE}/guide/topics`, { changefreq: "monthly", priority: 0.6 }),
      urlEntry(`${BASE}/glossary`, { changefreq: "monthly", priority: 0.5 }),
      ...getAllTermSlugs().map(({ slug }) =>
        urlEntry(`${BASE}/glossary/${encodeURIComponent(slug)}`, {
          changefreq: "monthly",
          priority: 0.5,
        }),
      ),
      urlEntry(`${BASE}/about`, { changefreq: "monthly", priority: 0.5 }),
      urlEntry(`${BASE}/about/methodology`, { changefreq: "monthly", priority: 0.5 }),
      urlEntry(`${BASE}/members/property`, { changefreq: "weekly", priority: 0.7 }),
      urlEntry(`${BASE}/members/scorecard`, { changefreq: "daily", priority: 0.7 }),
      urlEntry(`${BASE}/weekly`, { changefreq: "weekly", priority: 0.8 }),
    ];

    // 주간뉴스 + 기사 상세 페이지
    const weeklyArticles = getAllWeeklyArticles();
    for (const article of weeklyArticles) {
      entries.push(
        urlEntry(`${BASE}/weekly/${article.id}`, {
          lastmod: article.publishedDate,
          changefreq: "monthly",
          priority: 0.7,
        }),
      );
      for (const bill of article.featuredBills) {
        if (bill.slug && bill.article) {
          entries.push(
            urlEntry(`${BASE}/weekly/${article.id}/${encodeURIComponent(bill.slug)}`, {
              lastmod: article.publishedDate,
              changefreq: "monthly",
              priority: 0.6,
            }),
          );
        }
      }
      for (const hl of article.highlights) {
        if (hl.slug && hl.article) {
          entries.push(
            urlEntry(`${BASE}/weekly/${article.id}/${encodeURIComponent(hl.slug)}`, {
              lastmod: article.publishedDate,
              changefreq: "monthly",
              priority: 0.5,
            }),
          );
        }
      }
    }

    if (API_BASE) {
      try {
        // scorecard-ranking으로 memberId + 활동 지표를 한 번에 받아,
        // members/[id] 페이지의 noindex 기준(표결 참여 0% AND 대표발의 0건)과 동일하게
        // 무활동 의원을 sitemap에서 제외한다(색인 신호 정합성).
        const [rankingRes, committeesRes] = await Promise.all([
          fetch(`${API_BASE}/api/stats/scorecard-ranking?termId=22`),
          fetch(`${API_BASE}/api/committees?termId=22`),
        ]);
        if (rankingRes.ok) {
          const { rankings }: { rankings: MemberScore[] } = await rankingRes.json();
          const indexableMembers = rankings.filter(
            (m) => !(m.voteParticipation.rate === 0 && m.billProposal.representativeCount === 0),
          );
          for (const m of indexableMembers) {
            entries.push(
              urlEntry(`${BASE}/members/${m.memberId}`, {
                changefreq: "weekly",
                priority: 0.7,
              }),
            );
            entries.push(
              urlEntry(`${BASE}/members/${m.memberId}/attendance`, {
                changefreq: "weekly",
                priority: 0.6,
              }),
            );
            entries.push(
              urlEntry(`${BASE}/members/${m.memberId}/history`, {
                changefreq: "monthly",
                priority: 0.5,
              }),
            );
          }
        }
        if (committeesRes.ok) {
          const committees: { name: string }[] = await committeesRes.json();
          for (const c of committees) {
            entries.push(
              urlEntry(`${BASE}/committees/${encodeURIComponent(c.name)}`, {
                changefreq: "weekly",
                priority: 0.6,
              }),
            );
          }
        }

        const elections = await getElections();
        if (elections) {
          for (const e of elections) {
            entries.push(
              urlEntry(`${BASE}/elections/${e.id}`, {
                changefreq: "weekly",
                priority: 0.7,
              }),
            );
            // 재보궐 district 페이지 — 후보 1명 이상인 곳만
            try {
              const detail = await getElection(e.id);
              if (detail?.districts) {
                for (const d of detail.districts) {
                  if (d.candidates && d.candidates.length > 0) {
                    entries.push(
                      urlEntry(`${BASE}/elections/${e.id}/races/${d.id}`, {
                        changefreq: "weekly",
                        priority: 0.6,
                      }),
                    );
                  }
                }
              }
            } catch {
              // election detail fail — skip
            }
          }
        }

        // 지방선거 race 페이지 — 후보 1명 이상인 곳만
        try {
          const localElections = await getLocalElections();
          if (localElections) {
            for (const le of localElections) {
              entries.push(
                urlEntry(`${BASE}/local-elections/${le.id.replace(/^local-/, "")}`, {
                  changefreq: "weekly",
                  priority: 0.7,
                }),
              );
              const races = await getIndexableLocalElectionRaces(le.id);
              const year = le.id.replace(/^local-/, "");
              for (const r of races) {
                entries.push(
                  urlEntry(`${BASE}/local-elections/${year}/races/${r.raceId}`, {
                    changefreq: "weekly",
                    priority: 0.6,
                  }),
                );
              }
            }
          }
        } catch {
          // local elections fail — skip
        }
      } catch {
        // API fail — return static pages only
      }
    }

    return urlset(entries);
  }

  if (!API_BASE) return urlset([]);

  try {
    // 큐레이션 모드에서는 법안은 회의록 인용 보유분만, 표결 상세는 통째로 제외한다
    // (자동 집계 성격이라 심사 표면에서 빼는 것이 목적).
    const [billIds, voteIds] = await Promise.all([
      CURATION_MODE ? getCuratedBillIds() : getIndexableBillIds(),
      CURATION_MODE ? Promise.resolve([]) : getVoteIds(),
    ]);
    const billSitemapCount = Math.max(1, Math.ceil(billIds.length / BILLS_PER_SITEMAP));

    // Bill sitemaps: id 1 ~ billSitemapCount
    if (id >= 1 && id <= billSitemapCount) {
      const start = (id - 1) * BILLS_PER_SITEMAP;
      const slice = billIds.slice(start, start + BILLS_PER_SITEMAP);
      const entries = slice.map((b) =>
        urlEntry(`${BASE}/bills/${b.id}`, {
          lastmod: b.proposedDate || undefined,
          changefreq: "monthly",
          priority: 0.5,
        }),
      );
      return urlset(entries);
    }

    // Vote sitemap: id = billSitemapCount + 1
    if (id === billSitemapCount + 1) {
      const entries = voteIds.map((v) =>
        urlEntry(`${BASE}/votes/${v.id}`, {
          lastmod: v.procDate || undefined,
          changefreq: "monthly",
          priority: 0.5,
        }),
      );
      return urlset(entries);
    }
  } catch {
    // API fail
  }

  return urlset([]);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);

  if (isNaN(id) || id < 0) {
    return new Response("Invalid sitemap id", { status: 400 });
  }

  const xml = await buildSitemap(id);
  return xmlResponse(xml);
}
