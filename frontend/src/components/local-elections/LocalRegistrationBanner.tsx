"use client";

import Link from "next/link";

const REGISTRATION_START = new Date(2026, 4, 14); // 5/14
const REGISTRATION_END = new Date(2026, 4, 15); // 5/15
const ANNOUNCE_END = new Date(2026, 4, 28); // 5/28 (사전투표 전날까지 안내 노출)
const ELECTION_DAY = new Date(2026, 5, 3); // 6/3

function getStage(): "before" | "open" | "closed" | "after" {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (now < REGISTRATION_START) return "before";
  if (now <= REGISTRATION_END) return "open";
  if (now <= ANNOUNCE_END) return "closed";
  return "after";
}

function daysUntil(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function LocalRegistrationBanner() {
  const stage = getStage();

  if (stage === "after") return null;

  const daysToReg = daysUntil(REGISTRATION_START);
  const daysToElection = daysUntil(ELECTION_DAY);

  return (
    <section className="space-y-3 rounded-xl border border-(--color-primary) bg-blue-50 p-4 sm:p-5 dark:bg-blue-950/30">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-(--color-primary) px-2 py-0.5 text-xs font-bold text-white">
          {stage === "open"
            ? "후보등록 진행 중"
            : stage === "closed"
              ? "후보등록 마감 · 데이터 반영 대기"
              : `후보등록 D-${daysToReg}`}
        </span>
        <span className="text-xs font-semibold text-(--color-text-secondary)">
          본투표 D-{daysToElection}
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-(--color-text-primary) sm:text-lg">
          {stage === "open"
            ? "🗳️ 5/14~15 후보등록 진행 중 — 마감 후 17개 시·도 전체 후보 정보 자동 갱신"
            : stage === "closed"
              ? "🗳️ 5/15 후보등록 마감 — 중앙선관위 데이터 반영 후 17개 시·도 전체 후보 정보 표시"
              : daysToReg <= 1
                ? "🗳️ 내일(5/14)부터 후보등록 개시 — 17개 시·도 전체 후보 정보 자동 갱신"
                : "🗳️ 5/14~15 후보등록 마감 — 등록 후 17개 시·도 전체 후보 정보 자동 갱신"}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-(--color-text-secondary)">
          {stage === "closed"
            ? "후보자 등록이 5월 15일 마감됐습니다. 중앙선관위 공식 데이터 수신·검증이 완료되는 대로 광역단체장·기초단체장·광역의원·기초의원·교육감 전 선거구의 후보자 명단·경력·공약·재산이 표시됩니다. 그 사이 주요 격전지의 출마선언·예비후보 정보를 우선 제공합니다."
            : "후보자 등록(5/14~15)이 마감되면 중앙선관위 공식 데이터를 통해 광역단체장·기초단체장·광역의원·기초의원·교육감 전 선거구의 후보자 명단·경력·공약·재산이 자동으로 업데이트됩니다."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-lg bg-(--color-bg-primary) px-3 py-2">
          <p className="font-semibold text-(--color-text-tertiary)">후보등록</p>
          <p className="mt-0.5 font-bold text-(--color-text-primary)">5/14(목)~15(금)</p>
        </div>
        <div className="rounded-lg bg-(--color-bg-primary) px-3 py-2">
          <p className="font-semibold text-(--color-text-tertiary)">선거운동</p>
          <p className="mt-0.5 font-bold text-(--color-text-primary)">5/22~6/2</p>
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

      <p className="text-xs text-(--color-text-tertiary)">
        ※ 같은 날 치러지는{" "}
        <Link
          href="/elections/2026-06-03"
          className="font-medium text-(--color-primary) underline hover:no-underline"
        >
          국회의원 재보궐선거 14곳
        </Link>
        도 함께 확인하세요. 평택을 5파전, 부산 북갑(한동훈·박민식·하정우) 등 격전지가 주목됩니다.
      </p>
    </section>
  );
}
