'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import SummaryCard from '@/components/SummaryCard'
import DataTable, { Column } from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { invoices, invoicePayments, clients } from '@/lib/mock-data'
import type { Invoice } from '@/lib/types'
import { DollarSign, CheckCircle, Clock } from 'lucide-react'

export default function InformesIngresosPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [clientFilter, setClientFilter] = useState('')

  const filtered = useMemo(() => invoices.filter(inv => {
    if (from && inv.date < from) return false
    if (to && inv.date > to) return false
    if (clientFilter && inv.clientId !== clientFilter) return false
    return true
  }), [from, to, clientFilter])

  function getPaid(invoiceId: string) {
    return invoicePayments.filter(p => p.invoiceId === invoiceId).reduce((s, p) => s + p.amount, 0)
  }

  const totals = useMemo(() => {
    const facturado = filtered.reduce((s, i) => s + i.total, 0)
    const cobrado = filtered.reduce((s, i) => s + getPaid(i.id), 0)
    return { facturado, cobrado, pendiente: facturado - cobrado }
  }, [filtered])

  const columns: Column<Invoice>[] = [
    { key: 'num',     header: 'N° Factura', cell: inv => <span className="font-semibold text-slate-800">{inv.invoiceNumber}</span> },
    { key: 'date',    header: 'Fecha',      cell: inv => <span className="tabular-nums text-slate-500">{inv.date}</span> },
    { key: 'client',  header: 'Cliente',    cell: inv => <span className="text-slate-700">{clients.find(c => c.id === inv.clientId)?.name ?? '—'}</span> },
    { key: 'qty',     header: 'Remitos',    className: 'text-right', cell: inv => <span className="tabular-nums text-slate-500">{inv.receiptIds.length}</span> },
    { key: 'total',   header: 'Total',      className: 'text-right', cell: inv => <span className="tabular-nums font-medium text-slate-700">${inv.total.toLocaleString('es-AR')}</span> },
    { key: 'cobrado', header: 'Cobrado',    className: 'text-right', cell: inv => <span className="tabular-nums text-green-700">${getPaid(inv.id).toLocaleString('es-AR')}</span> },
    { key: 'saldo',   header: 'Saldo',      className: 'text-right', cell: inv => {
      const saldo = inv.total - getPaid(inv.id)
      return <span className={`tabular-nums font-medium ${saldo > 0 ? 'text-red-600' : 'text-slate-400'}`}>${saldo.toLocaleString('es-AR')}</span>
    }},
    { key: 'status',  header: 'Estado',     cell: inv => <StatusBadge variant="payment" state={inv.status} /> },
  ]

  return (
    <div>
      <PageHeader title="Informe de ingresos" />
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-slate-500">Desde</span>
          <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-8 text-[12px] w-[140px]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-slate-500">Hasta</span>
          <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-8 text-[12px] w-[140px]" />
        </div>
        <Select value={clientFilter || 'all'} onValueChange={v => setClientFilter(v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className="h-8 text-[12px] w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los clientes</SelectItem>
            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <SummaryCard variant="info" icon={DollarSign} label="Total facturado" value={`$${totals.facturado.toLocaleString('es-AR')}`} />
        <SummaryCard variant="info" icon={CheckCircle} label="Total cobrado" value={`$${totals.cobrado.toLocaleString('es-AR')}`} iconBg="bg-green-50" />
        <SummaryCard variant="info" icon={Clock} label="Saldo pendiente" value={`$${totals.pendiente.toLocaleString('es-AR')}`} iconBg="bg-red-50" />
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={inv => inv.id}
        emptyMessage="Sin facturas para el período seleccionado"
      />
    </div>
  )
}
