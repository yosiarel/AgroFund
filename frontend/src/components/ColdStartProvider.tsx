import { type ReactNode } from "react";
import api from '../lib/axios';
import { useEffect, useState } from "react";

/**
 * Cold Start Provider (PB-FE-002)
 * Handles Render.com free-tier cold start with informative overlay.
 * Purposeful, subtle, non-disruptive motion per Doc 5 Sec 65.
 */
export function ColdStartProvider({ children }: { children: ReactNode }) {
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    let activeRequests = 0;

    const requestInterceptor = api.interceptors.request.use((config) => {
      activeRequests++;
      if (activeRequests === 1) {
        // Show overlay if no response after 5 seconds
        timeoutId = window.setTimeout(() => {
          setIsWakingUp(true);
        }, 5000);
      }
      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        activeRequests = Math.max(0, activeRequests - 1);
        if (activeRequests === 0) {
          clearTimeout(timeoutId);
          setIsWakingUp(false);
        }
        return response;
      },
      (error) => {
        activeRequests = Math.max(0, activeRequests - 1);
        if (activeRequests === 0) {
          clearTimeout(timeoutId);
          setIsWakingUp(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {children}
      {isWakingUp && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Server sedang dimuat"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-neutral-950)]/50 backdrop-blur-sm"
        >
          <div className="bg-white p-8 rounded-[var(--radius-xl)] shadow-[var(--shadow-e3)] text-center max-w-sm mx-4">
            <div className="w-12 h-12 border-4 border-[var(--color-primary-100)] border-t-[var(--color-primary-600)] rounded-full animate-spin mx-auto mb-5" />
            <h3 className="text-[var(--text-h4)] leading-[var(--text-h4--line-height)] font-[600] text-[var(--color-neutral-900)] mb-2">
              Membangunkan Server...
            </h3>
            <p className="text-[var(--text-body-s)] leading-[var(--text-body-s--line-height)] text-[var(--color-neutral-600)]">
              Backend sedang dalam proses <em>cold start</em>. Ini wajar dan biasanya selesai dalam 1 menit. Mohon tunggu sebentar.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
