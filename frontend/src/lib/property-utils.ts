import type { PropertyMember, PropertyAsset } from "@/types";

// ====== 분류 기준 ======
export type PropertyCategory = "multi-home" | "expensive-home" | "excessive-property" | "none";

export interface ClassifyConfig {
  multiHomeThreshold: number; // 채 (기본: 2)
  expensiveHomeThreshold: number; // 천원 단위 (기본: 1,500,000 = 15억)
  excessivePropertyThreshold: number; // 천원 단위 (기본: 3,000,000 = 30억)
}

export const DEFAULT_CONFIG: ClassifyConfig = {
  multiHomeThreshold: 2,
  expensiveHomeThreshold: 1_500_000,
  excessivePropertyThreshold: 3_000_000,
};

// ====== 주거용 건물 판별 ======
const HOUSING_PREFIXES = [
  "아파트",
  "단독주택",
  "다가구주택",
  "다세대주택",
  "연립주택",
  "오피스텔",
  "복합건물(주택",
];

export function isHousingBuilding(item: string): boolean {
  if (item.includes("분양권")) return false;
  return HOUSING_PREFIXES.some((prefix) => item.startsWith(prefix));
}

// ====== 부동산 관련 위원회 ======
const PROPERTY_RELATED_COMMITTEES = ["국토교통위원회", "기획재정위원회", "정무위원회"];

export function isPropertyRelatedCommittee(committee: string): boolean {
  return PROPERTY_RELATED_COMMITTEES.some((c) => committee.includes(c));
}

// ====== 의원별 부동산 프로필 ======
export interface MemberPropertyProfile {
  memberId: string;
  name: string;
  photoUrl: string;
  party: string;
  partyColor: string;
  district: string;
  proportional: boolean;
  committees: string[];
  electedCount: number;
  categories: PropertyCategory[];
  housingCount: number;
  housingTotalAmount: number;
  maxSingleHousingAmount: number;
  maxSingleHousingItem: string;
  maxSingleHousingRelation: string;
  totalRealEstateAmount: number;
  buildingAmount: number;
  landAmount: number;
}

// ====== 분류 로직 ======
export function buildProfiles(
  members: PropertyMember[],
  assets: PropertyAsset[],
  config: ClassifyConfig = DEFAULT_CONFIG,
): MemberPropertyProfile[] {
  // 의원별 자산 그룹핑
  const assetMap = new Map<string, PropertyAsset[]>();
  for (const a of assets) {
    const list = assetMap.get(a.memberId) ?? [];
    list.push(a);
    assetMap.set(a.memberId, list);
  }

  return members.map((m) => {
    const memberAssets = assetMap.get(m.memberId) ?? [];

    // 주거용 건물 필터
    const housingAssets = memberAssets.filter(
      (a) => a.category === "건물" && isHousingBuilding(a.item),
    );

    // 공동명의 처리: 같은 item을 본인/배우자가 각각 신고한 경우 합산하여 1채로 카운트
    const housingByItem = new Map<string, { totalAmount: number; relations: string[] }>();
    for (const h of housingAssets) {
      const existing = housingByItem.get(h.item);
      if (existing) {
        existing.totalAmount += h.amount;
        if (!existing.relations.includes(h.relation)) existing.relations.push(h.relation);
      } else {
        housingByItem.set(h.item, { totalAmount: h.amount, relations: [h.relation] });
      }
    }

    const housingCount = housingByItem.size;
    let housingTotalAmount = 0;
    let maxSingleHousingAmount = 0;
    let maxSingleHousingItem = "";
    let maxSingleHousingRelation = "";
    for (const [item, info] of housingByItem) {
      housingTotalAmount += info.totalAmount;
      if (info.totalAmount > maxSingleHousingAmount) {
        maxSingleHousingAmount = info.totalAmount;
        maxSingleHousingItem = item;
        maxSingleHousingRelation = info.relations.length > 1 ? "공동명의" : info.relations[0];
      }
    }

    // 부동산 전체 (건물 + 토지)
    const buildingAmount = memberAssets
      .filter((a) => a.category === "건물")
      .reduce((sum, a) => sum + a.amount, 0);
    const landAmount = memberAssets
      .filter((a) => a.category === "토지")
      .reduce((sum, a) => sum + a.amount, 0);
    const totalRealEstateAmount = buildingAmount + landAmount;

    // 카테고리 분류
    const categories: PropertyCategory[] = [];
    if (housingCount >= config.multiHomeThreshold) categories.push("multi-home");
    if (maxSingleHousingAmount >= config.expensiveHomeThreshold) categories.push("expensive-home");
    if (totalRealEstateAmount >= config.excessivePropertyThreshold)
      categories.push("excessive-property");
    if (categories.length === 0) categories.push("none");

    return {
      ...m,
      categories,
      housingCount,
      housingTotalAmount,
      maxSingleHousingAmount,
      maxSingleHousingItem,
      maxSingleHousingRelation,
      totalRealEstateAmount,
      buildingAmount,
      landAmount,
    };
  });
}

// ====== 금액 포맷 ======
export function formatPropertyAmount(amountInThousandWon: number): string {
  if (!amountInThousandWon) return "0원";

  // 1억 = 100,000 (공직자 재산신고 단위: 천원)
  const uk = amountInThousandWon / 100000;

  if (uk >= 10000) {
    return `${(uk / 10000).toFixed(1)}조`;
  }

  if (uk >= 1) {
    // 소수점 1자리 표시 (예: 15.3억), 딱 떨어지면 .0 제거
    return `${uk.toFixed(1).replace(/\.0$/, "")}억`;
  }

  const manwon = amountInThousandWon / 10;
  if (manwon > 0) {
    return `${Math.round(manwon).toLocaleString()}만원`;
  }

  return "0원";
}

// ====== 탭 정의 ======
export const PROPERTY_TABS = [
  { value: "multi-home" as const, label: "다주택자", color: "#dc2626" },
  { value: "expensive-home" as const, label: "고가주택", color: "#d97706" },
  { value: "excessive-property" as const, label: "부동산 과다보유", color: "#7c3aed" },
  { value: "none" as const, label: "해당없음", color: "#6b7280" },
];
