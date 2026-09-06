import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

/**
 * Loading State (Doc 5, Sec 60)
 * - Used for asynchronous actions
 * - Loading must NOT use visual success treatment
 * - Must be accessible (aria-label)
 */
export function LoadingSpinner({ className, size = "md", label = "Memuat..." }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4"
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex flex-col items-center justify-center gap-3", className)}
    >
      <div
        className={cn(
          "border-[var(--color-primary-100)] border-t-[var(--color-primary-600)] rounded-full animate-spin",
          sizeClasses[size]
        )}
      />
      {size !== "sm" && (
        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{label}</span>
      )}
    </div>
  );
}
