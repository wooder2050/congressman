import type { AssetResponse } from "@/types";

export const mockAssetResponse: AssetResponse = {
  years: [
    {
      year: 2024,
      total: 2_150_000,
      categories: [
        { category: "건물", amount: 800_000 },
        { category: "토지", amount: 500_000 },
        { category: "예금", amount: 450_000 },
        { category: "증권", amount: 300_000 },
        { category: "채무", amount: -100_000 },
        { category: "기타", amount: 200_000 },
      ],
    },
    {
      year: 2023,
      total: 1_980_000,
      categories: [
        { category: "건물", amount: 750_000 },
        { category: "토지", amount: 480_000 },
        { category: "예금", amount: 400_000 },
        { category: "증권", amount: 250_000 },
        { category: "채무", amount: -80_000 },
        { category: "기타", amount: 180_000 },
      ],
    },
    {
      year: 2022,
      total: 1_700_000,
      categories: [
        { category: "건물", amount: 700_000 },
        { category: "토지", amount: 450_000 },
        { category: "예금", amount: 350_000 },
        { category: "증권", amount: 150_000 },
        { category: "기타", amount: 50_000 },
      ],
    },
  ],
  details: [
    {
      year: 2024,
      category: "건물",
      item: "서울시 강남구 아파트 102동",
      amount: 500_000,
      relation: "본인",
    },
    {
      year: 2024,
      category: "건물",
      item: "경기도 성남시 오피스텔",
      amount: 300_000,
      relation: "배우자",
    },
    {
      year: 2024,
      category: "토지",
      item: "충남 논산시 전 2,000㎡",
      amount: 300_000,
      relation: "본인",
    },
    {
      year: 2024,
      category: "토지",
      item: "경기도 용인시 대지 500㎡",
      amount: 200_000,
      relation: "본인",
    },
    { year: 2024, category: "예금", item: "국민은행 정기예금", amount: 250_000, relation: "본인" },
    {
      year: 2024,
      category: "예금",
      item: "신한은행 보통예금",
      amount: 200_000,
      relation: "배우자",
    },
    { year: 2024, category: "증권", item: "삼성전자 외 3종", amount: 300_000, relation: "본인" },
    {
      year: 2024,
      category: "채무",
      item: "국민은행 주택담보대출",
      amount: -100_000,
      relation: "본인",
    },
    { year: 2024, category: "기타", item: "자동차 (BMW 520d)", amount: 50_000, relation: "본인" },
    { year: 2024, category: "기타", item: "회원권 (골프)", amount: 150_000, relation: "본인" },
  ],
};
