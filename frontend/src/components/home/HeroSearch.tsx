"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SearchIcon, MapPinIcon, FileTextIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type SearchScope = "members" | "bills";

export default function HeroSearch() {
  const router = useRouter();
  const [scope, setScope] = useState<SearchScope>("members");
  const [query, setQuery] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const path = scope === "members" ? "/members" : "/bills";
    trackEvent("home_hero_action", { scope, query_length: q.length });
    router.push(`${path}?search=${encodeURIComponent(q)}`);
  };

  return (
    <section aria-labelledby="hero-search-title" className="space-y-3">
      <h1
        id="hero-search-title"
        className="text-2xl font-bold sm:text-3xl sm:font-extrabold sm:tracking-tight"
      >
        국회의원 의정활동 정보
      </h1>
      <p className="text-sm text-(--color-text-secondary)">
        국회의원·법안·표결을 객관적 데이터로 비교하세요.
      </p>

      <form onSubmit={onSubmit} role="search" className="space-y-2">
        <div
          role="tablist"
          aria-label="검색 대상"
          className="inline-flex rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) p-0.5 text-sm"
        >
          <button
            type="button"
            role="tab"
            aria-selected={scope === "members"}
            onClick={() => setScope("members")}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              scope === "members"
                ? "bg-(--color-bg-tertiary) text-(--color-text-primary)"
                : "text-(--color-text-secondary) hover:text-(--color-text-primary)"
            }`}
          >
            의원
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={scope === "bills"}
            onClick={() => setScope("bills")}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              scope === "bills"
                ? "bg-(--color-bg-tertiary) text-(--color-text-primary)"
                : "text-(--color-text-secondary) hover:text-(--color-text-primary)"
            }`}
          >
            법안
          </button>
        </div>

        <div className="relative flex items-center">
          <SearchIcon
            aria-hidden
            className="absolute left-3 h-4 w-4 text-(--color-text-tertiary)"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={scope === "members" ? "의원 이름·지역구 검색" : "법안 제목·키워드 검색"}
            aria-label={scope === "members" ? "의원 검색" : "법안 검색"}
            className="w-full rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) py-2.5 pr-24 pl-9 text-sm text-(--color-text-primary) outline-none focus:border-(--color-primary)"
          />
          <button
            type="submit"
            className="absolute right-1.5 rounded-md bg-(--color-primary) px-3 py-1.5 text-sm font-semibold text-white"
          >
            검색
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/my-district"
          onClick={() => trackEvent("home_hero_action", { scope: "district" })}
          className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border-primary) bg-(--color-bg-primary) px-3 py-1.5 text-xs font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-hover)"
        >
          <MapPinIcon aria-hidden className="h-3.5 w-3.5" />내 지역구 찾기
        </Link>
        <Link
          href="/bills"
          onClick={() => trackEvent("home_hero_action", { scope: "bills_browse" })}
          className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border-primary) bg-(--color-bg-primary) px-3 py-1.5 text-xs font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-hover)"
        >
          <FileTextIcon aria-hidden className="h-3.5 w-3.5" />
          법안 둘러보기
        </Link>
      </div>
    </section>
  );
}
