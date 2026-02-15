interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export default function Input({ icon, className = "", ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary) pointer-events-none">
          {icon}
        </div>
      )}
      <input
        className={`w-full px-4 py-3 text-base rounded-lg border-2 border-(--color-bg-tertiary) bg-(--color-bg-primary) text-(--color-text-primary) placeholder:text-(--color-text-tertiary) focus:border-(--color-primary) focus:outline-none transition-colors ${
          icon ? "pl-10" : ""
        } ${className}`}
        {...props}
      />
    </div>
  );
}
