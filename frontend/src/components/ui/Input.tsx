interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export default function Input({ icon, className = "", ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--color-text-tertiary)">
          {icon}
        </div>
      )}
      <input
        className={`w-full rounded-lg border-2 border-(--color-bg-tertiary) bg-(--color-bg-primary) px-4 py-3 text-base text-(--color-text-primary) transition-colors placeholder:text-(--color-text-tertiary) focus:border-(--color-primary) focus:outline-none ${
          icon ? "pl-10" : ""
        } ${className}`}
        {...props}
      />
    </div>
  );
}
