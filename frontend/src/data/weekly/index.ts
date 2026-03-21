import type { WeeklyArticle } from "./types";
import w202509w1 from "./2025-09-w1";
import w202509w2 from "./2025-09-w2";
import w202509w3 from "./2025-09-w3";
import w202509w4 from "./2025-09-w4";
import w202510w1 from "./2025-10-w1";
import w202510w2 from "./2025-10-w2";
import w202510w3 from "./2025-10-w3";
import w202510w4 from "./2025-10-w4";
import w202511w1 from "./2025-11-w1";
import w202511w2 from "./2025-11-w2";
import w202511w3 from "./2025-11-w3";
import w202511w4 from "./2025-11-w4";
import w202512w1 from "./2025-12-w1";
import w202512w2 from "./2025-12-w2";
import w202512w3 from "./2025-12-w3";
import w202512w4 from "./2025-12-w4";
import w202601w1 from "./2026-01-w1";
import w202601w2 from "./2026-01-w2";
import w202601w3 from "./2026-01-w3";
import w202601w4 from "./2026-01-w4";
import w202602w1 from "./2026-02-w1";
import w202602w2 from "./2026-02-w2";
import w202602w3 from "./2026-02-w3";
import w202602w4 from "./2026-02-w4";
import w202603w1 from "./2026-03-w1";
import w202603w2 from "./2026-03-w2";
import w202603w3 from "./2026-03-w3";

/** 최신순 정렬 */
const articles: WeeklyArticle[] = [
  w202603w3,
  w202603w2,
  w202603w1,
  w202602w4,
  w202602w3,
  w202602w2,
  w202602w1,
  w202601w4,
  w202601w3,
  w202601w2,
  w202601w1,
  w202512w4,
  w202512w3,
  w202512w2,
  w202512w1,
  w202511w4,
  w202511w3,
  w202511w2,
  w202511w1,
  w202510w4,
  w202510w3,
  w202510w2,
  w202510w1,
  w202509w4,
  w202509w3,
  w202509w2,
  w202509w1,
];

export function getAllWeeklyArticles(): WeeklyArticle[] {
  return articles;
}

export function getWeeklyArticle(id: string): WeeklyArticle | undefined {
  return articles.find((a) => a.id === id);
}

export function getWeeklyArticleIds(): string[] {
  return articles.map((a) => a.id);
}
