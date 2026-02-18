"use client";

interface CareerTabProps {
  career: string | null | undefined;
  termId?: number;
}

const CURRENT_TERM = 22;

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

interface CareerSection {
  title: string | null;
  items: string[];
}

function parseCareer(raw: string): CareerSection[] {
  const decoded = decodeHtmlEntities(raw);
  const lines = decoded
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const sections: CareerSection[] = [];
  let current: CareerSection = { title: null, items: [] };

  for (const line of lines) {
    // <학력>, <경력> 같은 섹션 헤더 감지
    const headerMatch = line.match(/^<(.+?)>$/);
    if (headerMatch) {
      if (current.items.length > 0 || current.title) {
        sections.push(current);
      }
      current = { title: headerMatch[1], items: [] };
      continue;
    }

    // ◆, -, · 등 불릿 제거
    const cleaned = line.replace(/^[◆◇●○■□▶▷·\-•]\s*/, "").trim();
    if (cleaned) {
      current.items.push(cleaned);
    }
  }

  if (current.items.length > 0 || current.title) {
    sections.push(current);
  }

  return sections;
}

export default function CareerTab({ career, termId }: CareerTabProps) {
  if (!career) {
    const isPastTerm = termId !== undefined && termId < CURRENT_TERM;
    return (
      <div className="py-8 text-center text-(--color-text-tertiary)">
        <p>경력 정보가 없습니다.</p>
        {isPastTerm && (
          <p className="mt-2 text-xs">역대 국회의원의 경력 정보는 국회에서 제공하지 않습니다.</p>
        )}
      </div>
    );
  }

  const sections = parseCareer(career);

  if (sections.length === 0) {
    return (
      <div className="py-8 text-center text-(--color-text-tertiary)">경력 정보가 없습니다.</div>
    );
  }

  return (
    <div className="space-y-6 py-4" role="tabpanel">
      {sections.map((section, i) => (
        <div key={i}>
          {section.title && (
            <h3 className="mb-3 text-sm font-semibold text-(--color-text-tertiary)">
              {section.title}
            </h3>
          )}
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)">
            <ul className="divide-y divide-(--color-border-primary)">
              {section.items.map((item, j) => (
                <li key={j} className="px-4 py-3 text-sm text-(--color-text-primary)">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
