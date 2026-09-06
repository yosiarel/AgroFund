import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary — System Error (Doc 5, Sec 61)
 * Error types:
 * - User Error: input/action salah
 * - Business Rule Error: action tidak diperbolehkan
 * - System Error: system failure (this component handles System Error)
 *
 * Visual and copy must provide contextual distinction.
 * Success state must NOT be shown before success is confirmed.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("System error caught by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center min-h-[50vh]">
          <div
            className="w-16 h-16 bg-[var(--color-error-100)] text-[var(--color-error-500)] rounded-full flex items-center justify-center mb-4"
            aria-hidden="true"
          >
            <AlertTriangle className="w-8 h-8" />
          </div>
          {/* Error type: System Error */}
          <span className="text-[var(--text-caption)] font-[500] text-[var(--color-error-700)] bg-[var(--color-error-100)] px-2.5 py-0.5 rounded-full mb-3">
            Kesalahan Sistem
          </span>
          <h2 className="text-[var(--text-h3)] leading-[var(--text-h3--line-height)] font-[600] text-[var(--color-neutral-900)] mb-2">
            Terjadi Kesalahan yang Tidak Terduga
          </h2>
          <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)] mb-6 max-w-md">
            Sistem menemui masalah teknis. Ini bukan kesalahan Anda. Silakan muat ulang halaman atau kembali ke beranda.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = "/"}
              className="px-4 py-2 rounded-[var(--radius-m)] border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] text-[var(--text-body-m)] font-[500] hover:bg-[var(--color-neutral-100)] transition-colors"
            >
              Kembali ke Beranda
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-[var(--radius-m)] bg-[var(--color-primary-600)] text-white text-[var(--text-body-m)] font-[500] hover:bg-[var(--color-primary-700)] transition-colors"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
