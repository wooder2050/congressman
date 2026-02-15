import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-(--color-bg-primary) border-b border-(--color-bg-tertiary)">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">
        <Link
          href="/"
          className="text-xl font-bold text-(--color-text-primary) no-underline"
        >
          국회의원 의정활동
        </Link>
      </div>
    </header>
  );
}
