import React from "react"
import { cn } from "../../lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-s)] bg-[var(--color-neutral-200)]/70", className)}
      {...props}
    />
  )
}

export { Skeleton }
