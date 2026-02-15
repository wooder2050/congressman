import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ColorBadgeProps {
  label: string;
  color: string;
  textColor?: string;
  size?: "sm" | "md";
}

export default function ColorBadge({
  label,
  color,
  textColor = "#FFFFFF",
  size = "md",
}: ColorBadgeProps) {
  return (
    <Badge
      className={cn(size === "sm" ? "px-2 py-0.5 text-[0.75rem]" : "px-3 py-1 text-[0.875rem]")}
      style={{ backgroundColor: color, color: textColor }}
    >
      {label}
    </Badge>
  );
}
