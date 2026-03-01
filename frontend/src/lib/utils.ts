import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR");
}

export function getElectedLabel(count: number | null | undefined): string {
  if (!count || count === 1) return "초선";
  if (count === 2) return "재선";
  if (count === 3) return "3선";
  return `${count}선`;
}

/**
 * 국회 API 지역구 문자열을 읽기 좋게 포맷팅.
 * "전북 남원시장수군임실군순창군" → "전북 남원시·장수군·임실군·순창군"
 * "경기 성남시분당구갑" → "경기 성남시 분당구갑"
 *
 * 전체 시/군/구 이름을 greedy match해서 분리하므로
 * "구리시", "군포시", "양구군", "구례군" 등을 잘못 자르지 않음.
 */
export function formatDistrict(district: string): string {
  const trimmed = district.trim();
  if (!trimmed) return trimmed;

  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx < 0) return trimmed;

  const sido = trimmed.slice(0, spaceIdx);
  const rest = trimmed.slice(spaceIdx + 1);

  // 갑/을/병/정/무 접미사 분리
  const suffixMatch = rest.match(/([갑을병정무])(\s*)$/);
  const suffix = suffixMatch ? suffixMatch[1] : "";
  const body = suffix ? rest.slice(0, -suffix.length).trimEnd() : rest;

  // 시/군/구 이름을 shortest-first 매칭으로 분리
  // 한국 행정구역 이름: 1~4글자 + 시/군/구 (동구, 구리시, 마산합포구 등)
  const units: string[] = [];
  let pos = 0;
  while (pos < body.length) {
    let matched = false;
    for (let len = 2; len <= Math.min(6, body.length - pos); len++) {
      const candidate = body.slice(pos, pos + len);
      if (candidate.endsWith("시") || candidate.endsWith("군") || candidate.endsWith("구")) {
        units.push(candidate);
        pos += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (units.length > 0) {
        units[units.length - 1] += body.slice(pos);
      } else {
        units.push(body.slice(pos));
      }
      break;
    }
  }

  if (units.length <= 1) return trimmed;

  // 시+구 또는 구+구 조합 → 공백 (성남시 분당구, 동구 남구)
  // 시/군이 섞이거나 군 포함 → · (남원시·장수군, 동구·군위군)
  const hasCounty = units.some((u) => u.endsWith("군"));
  const hasCityOrCounty = units.filter((u) => u.endsWith("시") || u.endsWith("군")).length >= 2;
  const useMiddleDot = hasCounty || hasCityOrCounty;

  const formatted = useMiddleDot ? units.join("·") : units.join(" ");
  return `${sido} ${formatted}${suffix}`;
}

export function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
}
