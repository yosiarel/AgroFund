import * as React from "react"
import { cn } from "../../lib/utils"
import {
  Info,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  XCircle,
} from "lucide-react"

/**
 * Alert System (Doc 5, Sec 55)
 * Types: Information, Success, Warning, Risk, Error
 *
 * CRITICAL RULES:
 * - Alert must be: concise, contextual, actionable if needed
 * - Critical information must NOT only be in a dismissable alert
 * - Status must NOT be conveyed by color alone (DS-PR-003)
 * - Risk Alert uses orange, NOT red (Risk ≠ Failure, Sec 8 Rule 4)
 */

type AlertVariant = "info" | "success" | "warning" | "risk" | "error"

const ALERT_CONFIG: Record<
  AlertVariant,
  {
    bgColor: string
    borderColor: string
    textColor: string
    titleColor: string
    Icon: React.ComponentType<{ className?: string }>
  }
> = {
  info: {
    bgColor:     "bg-[var(--color-info-100)]",
    borderColor: "border-[var(--color-info-500)]",
    textColor:   "text-[var(--color-info-700)]",
    titleColor:  "text-[var(--color-info-700)]",
    Icon: Info,
  },
  success: {
    bgColor:     "bg-[var(--color-success-100)]",
    borderColor: "border-[var(--color-success-500)]",
    textColor:   "text-[var(--color-success-700)]",
    titleColor:  "text-[var(--color-success-700)]",
    Icon: CheckCircle,
  },
  warning: {
    bgColor:     "bg-[var(--color-warning-100)]",
    borderColor: "border-[var(--color-warning-500)]",
    textColor:   "text-[var(--color-warning-700)]",
    titleColor:  "text-[var(--color-warning-700)]",
    Icon: AlertTriangle,
  },
  // Risk: orange treatment — NOT red (Doc 5, Sec 8 Rule 4, Sec 71)
  risk: {
    bgColor:     "bg-[var(--color-risk-100)]",
    borderColor: "border-[var(--color-risk-500)]",
    textColor:   "text-[var(--color-risk-700)]",
    titleColor:  "text-[var(--color-risk-700)]",
    Icon: AlertOctagon,
  },
  error: {
    bgColor:     "bg-[var(--color-error-100)]",
    borderColor: "border-[var(--color-error-500)]",
    textColor:   "text-[var(--color-error-700)]",
    titleColor:  "text-[var(--color-error-700)]",
    Icon: XCircle,
  },
}

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  action,
  dismissible,
  onDismiss,
  onClose,
  className,
}: AlertProps) {
  const config = ALERT_CONFIG[variant]
  const { Icon } = config
  const handleClose = onClose || onDismiss
  const isDismissible = dismissible ?? !!handleClose

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 p-4 rounded-[var(--radius-m)] border-l-4",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {/* Icon — status not conveyed by color alone (DS-PR-003) */}
      <Icon
        className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.textColor)}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn("text-[var(--text-label)] font-[600] mb-1", config.titleColor)}>
            {title}
          </p>
        )}
        <div className={cn("text-[var(--text-body-s)] leading-[var(--text-body-s--line-height)]", config.textColor)}>
          {children}
        </div>
        {/* Actionable if needed (Sec 55) */}
        {action && (
          <div className="mt-3">{action}</div>
        )}
      </div>

      {/* Dismiss — critical info must NOT only be in dismissable alert (Sec 55) */}
      {isDismissible && handleClose && (
        <button
          onClick={handleClose}
          aria-label="Tutup notifikasi"
          className={cn(
            "flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors",
            config.textColor,
            "min-w-[44px] min-h-[44px] flex items-center justify-center text-lg leading-none font-bold"
          )}
        >
          ×
        </button>
      )}
    </div>
  )
}
