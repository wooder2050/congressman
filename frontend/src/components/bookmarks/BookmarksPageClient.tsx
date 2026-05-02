"use client";

import { useSearchParams, useRouter } from "next/navigation";
import BookmarkedBills from "./BookmarkedBills";
import BookmarkedMembers from "./BookmarkedMembers";

const TABS = [
  { key: "bills", label: "법안", panelId: "panel-bills" },
  { key: "members", label: "의원", panelId: "panel-members" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isValidTab(value: string | null): value is TabKey {
  return value === "bills" || value === "members";
}

export default function BookmarksPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const activeTab: TabKey = isValidTab(tabParam) ? tabParam : "bills";

  const setActiveTab = (tab: TabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "bills") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.replace(`/bookmarks${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <div role="tablist" className="flex gap-1 rounded-lg bg-(--color-bg-secondary) p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={tab.panelId}
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

      <div role="tabpanel" id={activeTab === "bills" ? "panel-bills" : "panel-members"}>
        {activeTab === "bills" ? <BookmarkedBills /> : <BookmarkedMembers />}
      </div>
    </div>
  );
}
