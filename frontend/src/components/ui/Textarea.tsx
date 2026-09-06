import * as React from "react"
import { cn } from "../../lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
}

/**
 * Textarea Component (Doc 5, Sec 26 & Form System)
 * Radius: 8px (radius-m)
 * Must have: label, required/optional indicator, helper text, error feedback
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, required, helperText, error, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label
            htmlFor={textareaId}
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
        <textarea
          id={textareaId}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          className={cn(
            "flex min-h-[80px] w-full rounded-[var(--radius-m)] border bg-white px-3 py-2",
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
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
            {helperText}
          </p>
        )}
        {error && (
          <p id={`${textareaId}-error`} role="alert" className="text-[var(--text-caption)] text-[var(--color-error-500)]">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"
