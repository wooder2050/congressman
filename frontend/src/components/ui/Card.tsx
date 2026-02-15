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
      className={`bg-(--color-bg-primary) rounded-xl shadow-(--shadow-card) p-4 transition-shadow hover:shadow-(--shadow-card-hover) ${
        onClick ? "cursor-pointer w-full text-left" : ""
      } ${className}`}
    >
      {children}
    </Component>
  );
}
