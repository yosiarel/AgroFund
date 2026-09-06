import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
}

/**
 * Input Component (Doc 5, Sec 26 & Form System)
 * Every form field MUST have:
 * - label
 * - required/optional indicator
 * - helper text
 * - validation & error feedback (must explain what is wrong + how to fix)
 *
 * Radius: 8px (radius-m) per Doc 5 Sec 14
 * Height: 40px (control-md) per Doc 5 Sec 13
 * Border default: 1px Neutral 200 per Doc 5 Sec 15
 * Border error: 1px Error 500 per Doc 5 Sec 15
 * Focus: 2px Primary 500 per Doc 5 Sec 67
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, required, helperText, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
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
        <input
          id={inputId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={cn(
            "flex h-10 w-full rounded-[var(--radius-m)] border bg-white px-3 py-2",
            "text-[var(--text-body-m)] text-[var(--color-neutral-900)]",
            "placeholder:text-[var(--color-neutral-400)]",
            "border-[var(--color-neutral-200)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-0 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-neutral-50)]",
            error && "border-[var(--color-error-500)] focus:ring-[var(--color-error-500)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {/* Helper text — shown only when no error */}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
            {helperText}
          </p>
        )}
        {/* Error feedback — must explain what's wrong and how to fix (Doc 5, Sec 26) */}
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-[var(--text-caption)] text-[var(--color-error-500)]">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"
