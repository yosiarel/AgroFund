import { useQuery } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { AuditLog } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Shield, Clock } from "lucide-react"

export function AuditTrailPage() {
  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["admin-audit-logs"],
    queryFn: () => api.get("/admin/audit-logs"),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat jejak audit platform..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Jejak Audit & Log Transparansi (Audit Trail)
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
          Catatan tidak dapat diubah (immutable log) seluruh transaksi keuangan, perubahan status proyek, dan verifikasi lapangan (EP-14).
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[var(--text-h5)] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--color-primary-600)]" /> Log Aktivitas Sistem
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(!logs || logs.length === 0) ? (
            <div className="py-12 text-center text-[var(--color-neutral-500)]">
              <Clock className="w-10 h-10 text-[var(--color-neutral-400)] mx-auto mb-2" />
              <p>Belum ada aktivitas audit tercatat.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[var(--text-body-s)]">
                <thead>
                  <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-600)]">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Aktor & Role</th>
                    <th className="py-3 px-4">Aksi / Operasi</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Detail Mutasi</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)] transition-colors">
                      <td className="py-3 px-4 text-[var(--text-caption)] text-[var(--color-neutral-500)] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString("id-ID", {
                          hour: "2-digit", minute: "2-digit", day: "numeric", month: "short"
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-[600] text-[var(--color-neutral-900)]">{log.actor}</span>{" "}
                        <Badge variant="default" className="text-[10px] ml-1">{log.role}</Badge>
                      </td>
                      <td className="py-3 px-4 font-[500] text-[var(--color-primary-700)]">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-[var(--color-neutral-700)]">
                        {log.targetResource}
                      </td>
                      <td className="py-3 px-4 text-[var(--color-neutral-600)] max-w-xs truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
