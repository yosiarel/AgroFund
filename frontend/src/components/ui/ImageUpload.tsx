import * as React from "react"
import { cn } from "../../lib/utils"
import { UploadCloud, FileImage, X, AlertCircle } from "lucide-react"
import api from "../../lib/axios"

/**
 * ImageUpload Component (PB-FE-008 / EP-16 — Cloudinary via Backend)
 *
 * Flow: File selected → POST to /upload endpoint (backend) → Cloudinary URL returned
 * Evidence pattern (Doc 5, Sec 44):
 * States: Not Submitted → Submitted → Under Review → Validated → Rejected
 * Submitted ≠ Validated (critical rule)
 */

interface UploadedFile {
  url: string;
  publicId: string;
  originalName: string;
}

interface ImageUploadProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  value?: UploadedFile | null;
  onChange?: (file: UploadedFile | null) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  label,
  required,
  helperText,
  error,
  value,
  onChange,
  accept = "image/*,application/pdf",
  maxSizeMB = 5,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = label?.toLowerCase().replace(/\s+/g, "-") ?? "image-upload"

  const handleFile = async (file: File) => {
    setUploadError(null)

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`Ukuran file maksimal ${maxSizeMB}MB.`)
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await api.post<UploadedFile>("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      onChange?.(result as unknown as UploadedFile)
    } catch {
      setUploadError("Gagal mengunggah file. Silakan coba lagi.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    onChange?.(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const displayError = error ?? uploadError

  return (
    <div className={cn("w-full flex flex-col gap-1", className)}>
      {label && (
        <label htmlFor={inputId} className="text-[var(--text-label)] font-[500] text-[var(--color-neutral-700)]">
          {label}
          {required && <span className="ml-1 text-[var(--color-error-500)]" aria-label="wajib diisi">*</span>}
          {!required && <span className="ml-1 text-[var(--text-caption)] text-[var(--color-neutral-500)]">(opsional)</span>}
        </label>
      )}

      {/* Preview state — file already uploaded */}
      {value ? (
        <div className="flex items-center gap-3 p-3 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-[var(--radius-m)]">
          <div className="flex-shrink-0 w-10 h-10 bg-[var(--color-primary-100)] rounded-[var(--radius-s)] flex items-center justify-center">
            <FileImage className="w-5 h-5 text-[var(--color-primary-600)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[var(--text-body-s)] font-[500] text-[var(--color-neutral-900)] truncate">
              {value.originalName}
            </p>
            <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
              Berhasil diunggah {/* Submitted state — NOT "Validated" (Sec 44) */}
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Hapus file"
              className="flex-shrink-0 p-1.5 text-[var(--color-neutral-400)] hover:text-[var(--color-error-500)] hover:bg-[var(--color-error-100)] rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-6 rounded-[var(--radius-m)] border-2 border-dashed cursor-pointer transition-colors",
            isDragging
              ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)]"
              : "border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] hover:border-[var(--color-primary-400)] hover:bg-[var(--color-primary-50)]",
            disabled && "cursor-not-allowed opacity-50",
            displayError && "border-[var(--color-error-500)] bg-[var(--color-error-100)]"
          )}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={label ? `Unggah ${label}` : "Unggah file"}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click() }}
        >
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin" />
          ) : (
            <UploadCloud className={cn(
              "w-8 h-8",
              displayError ? "text-[var(--color-error-500)]" : "text-[var(--color-neutral-400)]"
            )} aria-hidden="true" />
          )}
          <div className="text-center">
            <p className="text-[var(--text-body-s)] font-[500] text-[var(--color-neutral-700)]">
              {isUploading ? "Mengunggah..." : "Klik atau seret file ke sini"}
            </p>
            <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
              Maks. {maxSizeMB}MB · {accept.replace(/,/g, ", ")}
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
        aria-hidden="true"
      />

      {helperText && !displayError && (
        <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{helperText}</p>
      )}
      {displayError && (
        <p role="alert" className="flex items-center gap-1 text-[var(--text-caption)] text-[var(--color-error-500)]">
          <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          {displayError}
        </p>
      )}
    </div>
  )
}
