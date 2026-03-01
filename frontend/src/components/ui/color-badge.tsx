import { Badge } from "@/components/ui/badge";
import TermHint from "@/components/ui/term-hint";
import { cn } from "@/lib/utils";

interface ColorBadgeProps {
  label: string;
  color: string;
  textColor?: string;
  size?: "sm" | "md";
  termHint?: string; // glossary.ts의 termKey
}

export default function ColorBadge({
  label,
  color,
  textColor = "#FFFFFF",
  size = "md",
  termHint,
}: ColorBadgeProps) {
  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1",
        size === "sm" ? "px-2 py-0.5 text-[0.75rem]" : "px-3 py-1 text-[0.875rem]",
      )}
      style={{ backgroundColor: color, color: textColor }}
    >
      {label}
      {termHint && <TermHint termKey={termHint} />}
    </Badge>
  );
}
