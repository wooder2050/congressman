interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={`rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 transition-colors hover:bg-(--color-bg-hover) ${
        onClick ? "w-full cursor-pointer text-left" : ""
      } ${className}`}
    >
      {children}
    </Component>
  );
}
