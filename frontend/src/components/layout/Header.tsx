import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-(--color-bg-primary) shadow-(--shadow-header)">
      <div className="mx-auto flex h-20 max-w-5xl items-center px-4">
        <Link href="/" className="text-xl font-bold text-(--color-text-primary) no-underline">
          국회의원 의정활동
        </Link>
      </div>
    </header>
  );
}
