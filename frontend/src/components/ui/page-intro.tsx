interface PageIntroProps {
  description: string;
  details?: string[];
}

export default function PageIntro({ description, details }: PageIntroProps) {
  return (
    <div className="rounded-xl bg-(--color-bg-secondary) p-4 sm:p-5">
      <p className="text-sm leading-relaxed text-(--color-text-secondary)">{description}</p>
      {details && details.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {details.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm leading-relaxed text-(--color-text-secondary)"
            >
              <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-text-tertiary)" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
