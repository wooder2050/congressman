"use client";

const REGISTRATION_START = new Date(2026, 4, 14); // 5/14
const REGISTRATION_END = new Date(2026, 4, 15); // 5/15
const CAMPAIGN_START = new Date(2026, 4, 21); // 5/21 공식 선거운동 개시
const ANNOUNCE_END = new Date(2026, 4, 28); // 5/28 (사전투표 전날까지 안내 노출)
const ELECTION_DAY = new Date(2026, 5, 3); // 6/3

function getStage(): "before" | "open" | "closed" | "campaign" | "after" {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (now < REGISTRATION_START) return "before";
  if (now <= REGISTRATION_END) return "open";
  if (now < CAMPAIGN_START) return "closed";
  if (now <= ANNOUNCE_END) return "campaign";
  return "after";
}

function daysUntil(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RegistrationDeadlineBanner() {
  const stage = getStage();

  if (stage === "after") return null;

  const daysToReg = daysUntil(REGISTRATION_START);
  const daysToElection = daysUntil(ELECTION_DAY);

  return (
    <section className="rounded-xl border border-(--color-primary) bg-blue-50 p-4 sm:p-5 dark:bg-blue-950/30">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-(--color-primary) px-2 py-0.5 text-xs font-bold text-white">
          {stage === "open"
            ? "후보등록 진행 중"
            : stage === "campaign"
              ? "공식 선거운동 진행 중"
              : stage === "closed"
                ? "후보자 정보 반영 완료"
                : `후보등록 D-${daysToReg}`}
        </span>
        <span className="text-xs font-semibold text-(--color-text-secondary)">
          본투표 D-{daysToElection}
        </span>
      </div>

      <h3 className="mt-2.5 text-base font-bold text-(--color-text-primary) sm:text-lg">
        {stage === "open"
          ? "📋 5/14~15 후보등록 진행 중 — 등록 마감 후 전체 후보 정보 갱신"
          : stage === "campaign"
            ? "📋 공식 선거운동 진행 중(5/21~6/2) · 14개 재보궐 선거구 후보 정보 반영 완료"
            : stage === "closed"
              ? "📋 14개 재보궐 선거구 · 후보자 정보 반영 완료"
              : daysToReg <= 1
                ? "📋 내일(5/14)부터 후보등록 개시 — 마감(5/15) 후 전체 후보 정보 자동 갱신"
                : "📋 5/14~15 후보등록 마감 임박 — 등록 후 전체 후보 정보 자동 갱신"}
      </h3>

      <p className="mt-1.5 text-sm leading-relaxed text-(--color-text-secondary)">
        {stage === "campaign"
          ? "5월 21일 0시 공식 선거운동이 시작돼 6월 2일까지 13일간 진행됩니다. 중앙선관위 공식 데이터 기준 14개 재보궐 선거구 후보자 명단·경력·공약·재산이 표시됩니다. 5/18 투표용지 인쇄 시한이 지나, 이후 사퇴해도 인쇄된 후보 이름은 그대로 표시됩니다(사표 위험). 부산 북갑 보수 단일화 등 사퇴 변수는 사전투표 전날(5/28)이 마지노선입니다."
          : stage === "closed"
            ? "중앙선관위 공식 데이터 기준 14개 재보궐 선거구 후보자 명단·경력·공약·재산이 표시됩니다. 5/18 투표용지 인쇄 시한이 지나, 이후 사퇴해도 인쇄된 후보 이름은 그대로 표시됩니다(사표 위험). 부산 북갑 보수 단일화 등 사퇴 변수는 사전투표 전날(5/28)이 마지노선입니다."
            : "후보자 등록(5/14~15)이 마감되면 중앙선관위 데이터를 통해 전체 선거구의 후보자 명단·경력·공약·재산 정보가 자동으로 업데이트됩니다. 그 전까지는 주요 격전지의 출마선언·예비후보 정보를 우선 제공합니다."}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-lg bg-(--color-bg-primary) px-3 py-2">
          <p className="font-semibold text-(--color-text-tertiary)">후보등록</p>
          <p className="mt-0.5 font-bold text-(--color-text-primary)">5/14(목)~15(금)</p>
        </div>
        <div className="rounded-lg bg-(--color-bg-primary) px-3 py-2">
          <p className="font-semibold text-(--color-text-tertiary)">선거운동</p>
          <p className="mt-0.5 font-bold text-(--color-text-primary)">5/21~6/2</p>
        </div>
        <div className="rounded-lg bg-(--color-bg-primary) px-3 py-2">
          <p className="font-semibold text-(--color-text-tertiary)">사전투표</p>
          <p className="mt-0.5 font-bold text-(--color-text-primary)">5/29(금)~30(토)</p>
        </div>
        <div className="rounded-lg bg-(--color-bg-primary) px-3 py-2">
          <p className="font-semibold text-(--color-text-tertiary)">본투표</p>
          <p className="mt-0.5 font-bold text-(--color-text-primary)">6/3(수)</p>
        </div>
      </div>
    </section>
  );
}
