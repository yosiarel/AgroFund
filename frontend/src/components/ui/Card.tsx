import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Card System (Doc 5, Sec 27)
 * Structure: Title → Primary Info → Supporting Info → Action
 * Radius: 12px (radius-l) per Doc 5 Sec 14
 * Shadow: E1 (subtle) for standard cards per Doc 5 Sec 16
 * Border: 1px Neutral 200 per Doc 5 Sec 15
 * Card only shows CTAs valid against current state.
 */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-[var(--radius-l)] border border-[var(--color-neutral-200)] shadow-[var(--shadow-e1)] overflow-hidden",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1 p-6 border-b border-[var(--color-neutral-100)]", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-[var(--text-h4)] leading-[var(--text-h4--line-height)] font-[600] text-[var(--color-neutral-900)]",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 px-6 py-4 border-t border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)]",
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"
