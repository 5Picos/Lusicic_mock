'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import SummaryCard from '@/components/SummaryCard'
import DataTable, { Column } from '@/components/DataTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { expenses, suppliers, expenseTypes, trucks } from '@/lib/mock-data'
import type { Expense, PaymentMethod } from '@/lib/types'
import { DollarSign, Receipt } from 'lucide-react'

const PM_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  check: 'Cheque',
}

export default function InformesGastosPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const filtered = useMemo(() => expenses.filter(e => {
    if (from && e.date < from) return false
    if (to && e.date > to) return false
    if (typeFilter) {
      const supplier = suppliers.find(s => s.id === e.supplierId)
      if (supplier?.expenseTypeId !== typeFilter) return false
    }
    return true
  }), [from, to, typeFilter])

  const total = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered])

  const columns: Column<Expense>[] = [
    { key: 'date',     header: 'Fecha',      cell: e => <span className="tabular-nums text-slate-500">{e.date}</span> },
    { key: 'supplier', header: 'Proveedor',  cell: e => <span className="font-medium text-slate-800">{suppliers.find(s => s.id === e.supplierId)?.name ?? '—'}</span> },
    { key: 'type',     header: 'Tipo',       cell: e => {
      const supplier = suppliers.find(s => s.id === e.supplierId)
      return <span className="text-slate-500">{expenseTypes.find(et => et.id === supplier?.expenseTypeId)?.name ?? '—'}</span>
    }},
    { key: 'concept',  header: 'Concepto',   cell: e => <span className="text-slate-700">{e.concept}</span> },
    { key: 'truck',    header: 'Camión',     cell: e => <span className="text-slate-500">{trucks.find(t => t.id === e.truckId)?.plate ?? '—'}</span> },
    { key: 'amount',   header: 'Monto',      className: 'text-right', cell: e => <span className="tabular-nums font-medium text-slate-700">${e.amount.toLocaleString('es-AR')}</span> },
    { key: 'method',   header: 'Forma pago', cell: e => <span className="text-[11px] text-slate-500">{PM_LABELS[e.paymentMethod]}</span> },
  ]

  return (
    <div>
      <PageHeader title="Informe de gastos" />
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-slate-500">Desde</span>
          <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-8 text-[12px] w-[140px]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-slate-500">Hasta</span>
          <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-8 text-[12px] w-[140px]" />
        </div>
        <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className="h-8 text-[12px] w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {expenseTypes.map(et => <SelectItem key={et.id} value={et.id}>{et.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <SummaryCard variant="info" icon={DollarSign} label="Total gastos" value={`$${total.toLocaleString('es-AR')}`} />
        <SummaryCard variant="info" icon={Receipt} label="Cantidad" value={filtered.length} />
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={e => e.id}
        emptyMessage="Sin gastos para el período seleccionado"
      />
    </div>
  )
}
