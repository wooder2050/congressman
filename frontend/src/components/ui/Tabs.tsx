"use client";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex border-b border-(--color-bg-tertiary)">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-3 text-center text-base font-semibold transition-colors border-b-3 ${
              isActive
                ? "border-(--color-primary) text-(--color-primary)"
                : "border-transparent text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
