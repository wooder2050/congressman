import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center py-20 text-center">
      <h1 className="mb-2 text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mb-6 text-base text-(--color-text-secondary)">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Button asChild size="lg" className="text-base font-semibold">
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </div>
  );
}
