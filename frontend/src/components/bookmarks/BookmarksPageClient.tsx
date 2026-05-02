"use client";

import { useState } from "react";
import BookmarkedBills from "./BookmarkedBills";
import BookmarkedMembers from "./BookmarkedMembers";

const TABS = [
  { key: "bills", label: "법안" },
  { key: "members", label: "의원" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function BookmarksPageClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("bills");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-(--color-bg-secondary) p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-(--color-bg-primary) text-(--color-text-primary) shadow-sm"
                : "text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "bills" ? <BookmarkedBills /> : <BookmarkedMembers />}
    </div>
  );
}
