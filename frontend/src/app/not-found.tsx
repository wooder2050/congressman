import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center justify-center py-20 text-center">
      <h1 className="mb-2 text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mb-6 text-base text-(--color-text-secondary)">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-(--color-primary) px-6 py-3 text-base font-semibold text-(--color-text-inverse) no-underline transition-colors hover:bg-(--color-primary-hover)"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
