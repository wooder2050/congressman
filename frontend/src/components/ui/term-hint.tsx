"use client";

import { getTerm } from "@/lib/glossary";
import MetricHint from "./metric-hint";

interface TermHintProps {
  termKey: string;
  className?: string;
}

/**
 * 용어 설명 힌트 컴포넌트
 *
 * glossary.ts에 정의된 용어의 설명을 툴팁으로 표시합니다.
 *
 * @example
 * <TermHint termKey="passed_original" />
 */
export default function TermHint({ termKey, className }: TermHintProps) {
  const term = getTerm(termKey);

  if (!term) {
    console.warn(`[TermHint] Unknown term key: ${termKey}`);
    return null;
  }

  return <MetricHint text={term.shortDesc} />;
}
