import TrackedLink from "@/components/analytics/TrackedLink";
import { sidoToShort } from "@/constants/local-elections";
import { getMembers } from "@/lib/api";
import { matchRaceDistrictMembers } from "@/lib/race-district-members";
import type { LocalElectionRaceDetail, MemberWithTerm } from "@/types";

/** 처음부터 보이는 인원. 넘치면 나머지는 <details>로 접는다(시·도 단위는 수십 명) */
const VISIBLE = 8;

function MemberChip({
  m,
  position,
  scope,
}: {
  m: MemberWithTerm;
  position: number;
  scope: "sigungu" | "sido";
}) {
  return (
    <li>
      <TrackedLink
        href={`/members/${m.id}`}
        eventName="race_member_click"
        eventParams={{ component: "race_members", position, scope }}
        impressionParams={position === 0 ? { component: "race_members", scope } : undefined}
        className="flex items-center gap-2 rounded-lg border border-(--color-border-primary) px-3 py-2 text-sm hover:bg-(--color-bg-secondary)"
      >
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: m.term.party.color }}
        />
        <span className="font-semibold text-(--color-text-primary)">{m.name}</span>
        <span className="truncate text-xs text-(--color-text-tertiary)">
          {m.term.party.shortName} · {m.term.district}
        </span>
      </TrackedLink>
    </li>
  );
}

/**
 * 지방선거 선거구 페이지 하단 — 그 지역을 국회에서 대표하는 22대 지역구 의원.
 * 선거 아카이브에서 의원 의정활동 페이지로 이어지는 동선(광고는 이 페이지에 두지 않는다).
 * 매칭 규칙·표기 차이는 lib/race-district-members.ts.
 */
export default async function RaceDistrictMembers({
  race,
}: {
  race: Pick<LocalElectionRaceDetail, "sido" | "sigungu">;
}) {
  const all = await getMembers(22).catch(() => [] as MemberWithTerm[]);
  const { scope, members } = matchRaceDistrictMembers(race, all);
  if (members.length === 0) return null;

  const sorted = [...members].sort((a, b) => a.term.district.localeCompare(b.term.district, "ko"));
  const region =
    scope === "sigungu" && race.sigungu
      ? `${sidoToShort(race.sido)} ${race.sigungu}`
      : sidoToShort(race.sido);
  // 시·군·구 선거인데 그 단위로 맞는 현직 의원이 없어 시·도 전체로 넓힌 경우(예: 지역구 공석)
  const widened = scope === "sido" && !!race.sigungu && race.sigungu !== race.sido;

  const visible = sorted.slice(0, VISIBLE);
  const rest = sorted.slice(VISIBLE);

  return (
    <section
      aria-labelledby="race-district-members"
      className="rounded-xl border border-(--color-border-primary) p-4"
    >
      <h2 id="race-district-members" className="text-base font-bold text-(--color-text-primary)">
        {region} 지역구 국회의원 {members.length}명
      </h2>
      <p className="mt-1 text-sm text-(--color-text-secondary)">
        {widened
          ? `${race.sigungu}와 일치하는 현직 지역구 의원이 없어 ${sidoToShort(race.sido)} 지역구 의원 전체를 보여 드립니다. `
          : ""}
        이 지역을 국회에서 대표하는 22대 의원의 법안 발의·본회의 표결·출석 기록을 확인할 수
        있습니다.
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {visible.map((m, i) => (
          <MemberChip key={m.id} m={m} position={i} scope={scope} />
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-medium text-(--color-primary)">
            나머지 {rest.length}명 더 보기
          </summary>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {rest.map((m, i) => (
              <MemberChip key={m.id} m={m} position={VISIBLE + i} scope={scope} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
