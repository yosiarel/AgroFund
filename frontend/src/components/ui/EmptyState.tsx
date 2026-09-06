import { type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * Empty State (Doc 5, Sec 59)
 * Must explain:
 * 1. apa yang kosong
 * 2. mengapa kosong bila relevan
 * 3. next action bila tersedia
 *
 * Status must NOT be conveyed by color alone (DS-PR-003)
 * Critical info must NOT be only in a dismissable alert (Doc 5, Sec 55)
 */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
      <div
        className="w-16 h-16 bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)] rounded-full flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        {icon || <SearchX className="w-8 h-8" />}
      </div>
      <h3 className="text-[var(--text-h4)] leading-[var(--text-h4--line-height)] font-[600] text-[var(--color-neutral-900)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--text-body-s)] leading-[var(--text-body-s--line-height)] text-[var(--color-neutral-500)] max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
