"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getBillTopics } from "@/lib/api";
import { TOPIC_MAP } from "@/lib/constants";

interface TopicSectionProps {
  termId: number;
}

export default function TopicSection({ termId }: TopicSectionProps) {
  const { data: topics } = useCongressSuspenseQuery(getBillTopics, termId);

  if (!topics || topics.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {topics.map(({ topic, count }) => {
        const info = TOPIC_MAP[topic];
        if (!info) return null;
        return (
          <Link
            key={topic}
            href={`/bills?term=${termId}&topic=${encodeURIComponent(topic)}`}
            className="flex items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-hover)"
          >
            <span className="text-2xl" aria-hidden>
              {info.emoji}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-(--color-text-primary)">
                {info.label}
              </p>
              <p className="text-xs text-(--color-text-tertiary)">{count.toLocaleString()}건</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
