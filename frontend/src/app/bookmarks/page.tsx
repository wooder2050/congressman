import type { Metadata } from "next";
import BookmarkedBills from "@/components/bookmarks/BookmarkedBills";

export const metadata: Metadata = {
  title: "저장한 법안 — lawmake",
  description: "즐겨찾기한 법안 목록을 확인하세요.",
};

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">저장한 법안</h1>
      <BookmarkedBills />
    </div>
  );
}
