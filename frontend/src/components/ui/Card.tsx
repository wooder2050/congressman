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
      className={`rounded-xl bg-(--color-bg-primary) p-4 shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-card-hover) ${
        onClick ? "w-full cursor-pointer text-left" : ""
      } ${className}`}
    >
      {children}
    </Component>
  );
}
