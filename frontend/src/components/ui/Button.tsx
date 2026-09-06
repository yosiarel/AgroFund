import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "destructive"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

/**
 * Button System (Doc 5, Sec 24 & 25)
 * - Primary: main action (Contribute, Pay Guarantee, Submit, Approve)
 * - Secondary: alternative action
 * - Tertiary: low-emphasis action
 * - Destructive: consequential action (Cancel, Reject)
 *
 * Radius: 8px (radius-m) per Doc 5 Sec 14
 * Height sm=32px, md=40px, lg=48px per Doc 5 Sec 13
 * Min touch target: 44px per Doc 5 Sec 13
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary:
        "bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] active:bg-[var(--color-primary-700)] border border-transparent shadow-[var(--shadow-e1)]",
      secondary:
        "bg-[var(--color-primary-100)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)] hover:brightness-95 border border-transparent",
      tertiary:
        "bg-transparent text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)] border border-transparent",
      destructive:
        "bg-[var(--color-error-500)] text-white hover:bg-[var(--color-error-700)] border border-transparent shadow-[var(--shadow-e1)]",
    }

    const sizes = {
      sm: "h-8 px-3 text-[var(--text-body-s)]",
      md: "h-10 px-4 text-[var(--text-body-m)]",
      lg: "h-12 px-6 text-[var(--text-body-l)]",
    }

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          // Base: radius-m = 8px, font-weight 500 for label
          "inline-flex items-center justify-center gap-2 rounded-[var(--radius-m)] font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          // Button success state must NOT show before action truly succeeds (Doc 5, Sec 25)
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
