import type { Metadata } from "next";
import BookmarksPageClient from "@/components/bookmarks/BookmarksPageClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "즐겨찾기 — lawmake",
  description: "저장한 법안과 의원 목록을 확인하세요.",
};

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">즐겨찾기</h1>
      <BookmarksPageClient />
    </div>
  );
}
