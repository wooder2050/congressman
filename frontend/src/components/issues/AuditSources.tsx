import type { AuditSource } from "@/data/audit-2026";

export default function AuditSources({ sources }: { sources: AuditSource[] }) {
  if (sources.length === 0) return null;
  return (
    <ul className="mt-2 space-y-0.5 text-xs text-(--color-text-tertiary)">
      {sources.map((s) => (
        <li key={s.url}>
          출처:{" "}
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-(--color-text-secondary)"
          >
            {s.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
