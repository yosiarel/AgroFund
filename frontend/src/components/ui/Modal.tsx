import * as React from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * Modal System (Doc 5, Sec 56)
   * Pattern: Action → Confirmation → Result
   * Used for: Pay Guarantee, Contribute, Commit PO, Cancel, Reserve Request, Resolve Natura, Recovery action
   * Radius: 16px (radius-xl) per Doc 5 Sec 14
   * Shadow: E3 (overlay) per Doc 5 Sec 16
   * Motion: purposeful, subtle, fast (Doc 5, Sec 65)
   */
  size?: "sm" | "md" | "lg"
}

export function Modal({ isOpen, onClose, title, children, footer, size = "md" }: ModalProps) {
  // Close on Escape key — accessibility (Doc 5, Sec 64)
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-neutral-950)]/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-e3)] w-full ${sizes[size]} overflow-hidden`}
        style={{ animation: "modalIn 0.15s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-neutral-100)]">
          <h2
            id="modal-title"
            className="text-[var(--text-h4)] leading-[var(--text-h4--line-height)] font-[600] text-[var(--color-neutral-900)]"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup dialog"
            className="p-1 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)] rounded-[var(--radius-s)] hover:bg-[var(--color-neutral-100)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto text-[var(--text-body-m)] text-[var(--color-neutral-700)]">
          {children}
        </div>

        {/* Footer — primary action on right, secondary on left (Doc 5 Sec 75) */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)]">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes modalIn { from {} to {} }
        }
      `}</style>
    </div>
  )
}
