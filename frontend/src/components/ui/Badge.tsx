interface BadgeProps {
  label: string;
  color: string;
  textColor?: string;
  size?: "sm" | "md";
}

export default function Badge({ label, color, textColor = "#FFFFFF", size = "md" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${
        size === "sm" ? "px-2 py-0.5 text-[0.75rem]" : "px-3 py-1 text-[0.875rem]"
      }`}
      style={{ backgroundColor: color, color: textColor }}
    >
      {label}
    </span>
  );
}
