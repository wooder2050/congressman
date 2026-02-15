import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--color-bg-tertiary) bg-(--color-bg-primary)">
      <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
        <Link href="/" className="text-xl font-bold text-(--color-text-primary) no-underline">
          국회의원 의정활동
        </Link>
      </div>
    </header>
  );
}
