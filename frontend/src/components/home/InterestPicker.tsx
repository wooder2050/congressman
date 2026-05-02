"use client";

import { useState } from "react";
import { TOPIC_MAP } from "@/lib/constants";
import { useUpdatePreferences } from "@/hooks/useUserPreferences";

interface InterestPickerProps {
  initialInterests?: string[];
  onSaved?: () => void;
}

export default function InterestPicker({ initialInterests = [], onSaved }: InterestPickerProps) {
  const [selected, setSelected] = useState<string[]>(initialInterests);
  const { mutate, isPending } = useUpdatePreferences();

  const toggle = (topic: string) => {
    setSelected((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const handleSave = () => {
    mutate({ interests: selected }, { onSuccess: () => onSaved?.() });
  };

  return (
    <div className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <div>
        <h3 className="text-base font-bold text-(--color-text-primary)">관심 주제 설정</h3>
        <p className="mt-1 text-sm text-(--color-text-tertiary)">
          관심 있는 주제를 선택하면 맞춤 법안을 추천해 드립니다.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(TOPIC_MAP).map(([key, { label, emoji }]) => {
          const isSelected = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "border-(--color-border-primary) bg-(--color-bg-secondary) text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
              }`}
            >
              <span>{emoji}</span>
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-(--color-text-tertiary)">
          {selected.length}개 선택됨 (최소 1개)
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={selected.length === 0 || isPending}
          className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {isPending ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
