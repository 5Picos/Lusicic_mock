'use client'

import { useMemo, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { invoices, invoicePayments, clients } from '@/lib/mock-data'

export default function CuentaCorrientePage() {
  const [clientId, setClientId] = useState(clients[0]?.id ?? '')

  const clientInvoices = useMemo(
    () => invoices.filter(i => i.clientId === clientId),
    [clientId]
  )

  function getPaidAmount(invoiceId: string) {
    return invoicePayments.filter(p => p.invoiceId === invoiceId).reduce((s, p) => s + p.amount, 0)
  }

  const totals = useMemo(() => {
    const invoiced = clientInvoices.reduce((s, i) => s + i.total, 0)
    const paid = clientInvoices.reduce((s, i) => s + getPaidAmount(i.id), 0)
    return { invoiced, paid, pending: invoiced - paid }
  }, [clientInvoices])

  const summary = [
    { label: 'Total facturado', value: totals.invoiced, colorClass: 'text-slate-700' },
    { label: 'Total cobrado',   value: totals.paid,     colorClass: 'text-green-700' },
    { label: 'Saldo pendiente', value: totals.pending,  colorClass: totals.pending > 0 ? 'text-red-600' : 'text-slate-700' },
  ]

  return (
    <div>
      <PageHeader title="Cuenta corriente" />

      <div className="flex items-center gap-3 mb-4">
        <span className="text-[12px] font-medium text-slate-500">Cliente:</span>
        <Select value={clientId} onValueChange={v => setClientId(v ?? clients[0]?.id ?? '')}>
          <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
          <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {summary.map(({ label, value, colorClass }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-lg px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">{label}</div>
            <div className={`text-[18px] font-bold tabular-nums ${colorClass}`}>${value.toLocaleString('es-AR')}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {clientInvoices.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400 text-[12px]">Sin facturas para este cliente</div>
        ) : (
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3.5 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em]">N° Factura</th>
                <th className="px-3.5 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em]">Fecha</th>
                <th className="px-3.5 py-2 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em]">Total</th>
                <th className="px-3.5 py-2 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em]">Cobrado</th>
                <th className="px-3.5 py-2 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em]">Saldo</th>
                <th className="px-3.5 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em]">Estado</th>
              </tr>
            </thead>
            <tbody>
              {clientInvoices.map(inv => {
                const paid = getPaidAmount(inv.id)
                const pending = inv.total - paid
                return (
                  <tr key={inv.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3.5 py-[9px] font-semibold text-slate-800">{inv.invoiceNumber}</td>
                    <td className="px-3.5 py-[9px] tabular-nums text-slate-500">{inv.date}</td>
                    <td className="px-3.5 py-[9px] text-right tabular-nums font-medium text-slate-700">${inv.total.toLocaleString('es-AR')}</td>
                    <td className="px-3.5 py-[9px] text-right tabular-nums text-green-700">${paid.toLocaleString('es-AR')}</td>
                    <td className={`px-3.5 py-[9px] text-right tabular-nums font-medium ${pending > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                      ${pending.toLocaleString('es-AR')}
                    </td>
                    <td className="px-3.5 py-[9px]"><StatusBadge variant="payment" state={inv.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
