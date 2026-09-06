import * as React from "react"
import { cn } from "../../lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

/**
 * Select Component (Doc 5, Sec 26 & Form System)
 * Radius: 8px (radius-m), Height: 40px (control-md)
 * Must have: label, required/optional indicator, helper text, error feedback
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, required, helperText, error, options, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[var(--text-label)] font-[500] text-[var(--color-neutral-700)]"
          >
            {label}
            {required && (
              <span className="ml-1 text-[var(--color-error-500)]" aria-label="wajib diisi">*</span>
            )}
            {!required && (
              <span className="ml-1 text-[var(--text-caption)] text-[var(--color-neutral-500)]">(opsional)</span>
            )}
          </label>
        )}
        <select
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          className={cn(
            "flex h-10 w-full rounded-[var(--radius-m)] border bg-white px-3 py-2",
            "text-[var(--text-body-m)] text-[var(--color-neutral-900)]",
            "border-[var(--color-neutral-200)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-0 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-neutral-50)]",
            error && "border-[var(--color-error-500)] focus:ring-[var(--color-error-500)]",
            className
          )}
          ref={ref}
          {...props}
        >
          <option value="" disabled>Pilih...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
            {helperText}
          </p>
        )}
        {error && (
          <p id={`${selectId}-error`} role="alert" className="text-[var(--text-caption)] text-[var(--color-error-500)]">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"
