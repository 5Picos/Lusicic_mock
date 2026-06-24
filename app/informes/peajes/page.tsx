'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import SummaryCard from '@/components/SummaryCard'
import DataTable, { Column } from '@/components/DataTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { expenses, suppliers, trucks, drivers, orders, localities } from '@/lib/mock-data'
import type { Expense } from '@/lib/types'
import { DollarSign, Receipt } from 'lucide-react'

type PeajeRow = Expense & {
  driverId: string | null
  truckId: string | null
  localityName: string
  orderNumber: string
  driverName: string
  truckPlate: string
  supplierName: string
}

export default function InformesPagejesPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [driverFilter, setDriverFilter] = useState('')
  const [truckFilter, setTruckFilter] = useState('')

  const allRows = useMemo((): PeajeRow[] =>
    expenses
      .filter(e => e.orderId !== null)
      .map(e => {
        const order = orders.find(o => o.id === e.orderId)
        const locality = order ? localities.find(l => l.id === order.localityId) : null
        return {
          ...e,
          driverId: order?.driverId ?? null,
          truckId: order?.truckId ?? null,
          localityName: locality?.name ?? '—',
          orderNumber: order?.orderNumber ?? '—',
          driverName: drivers.find(d => d.id === order?.driverId)?.name ?? '—',
          truckPlate: trucks.find(t => t.id === order?.truckId)?.plate ?? '—',
          supplierName: suppliers.find(s => s.id === e.supplierId)?.name ?? '—',
        }
      }),
    []
  )

  const filtered = useMemo(() => allRows.filter(r => {
    if (from && r.date < from) return false
    if (to && r.date > to) return false
    if (driverFilter && r.driverId !== driverFilter) return false
    if (truckFilter && r.truckId !== truckFilter) return false
    return true
  }), [allRows, from, to, driverFilter, truckFilter])

  const totals = useMemo(() => ({
    count: filtered.length,
    amount: filtered.reduce((s, r) => s + r.amount, 0),
  }), [filtered])

  const columns: Column<PeajeRow>[] = [
    { key: 'date',     header: 'Fecha',       cell: r => <span className="tabular-nums text-slate-500">{r.date}</span> },
    { key: 'order',    header: 'Pedido',      cell: r => <span className="font-semibold text-slate-800">{r.orderNumber}</span> },
    { key: 'concept',  header: 'Descripción', cell: r => <span className="text-slate-700">{r.concept}</span> },
    { key: 'locality', header: 'Localidad',   cell: r => <span className="text-slate-600">{r.localityName}</span> },
    { key: 'driver',   header: 'Chofer',      cell: r => <span className="text-slate-500">{r.driverName}</span> },
    { key: 'truck',    header: 'Camión',      cell: r => <span className="font-mono text-[11px] text-slate-700">{r.truckPlate}</span> },
    { key: 'supplier', header: 'Proveedor',   cell: r => <span className="text-slate-500">{r.supplierName}</span> },
    { key: 'amount',   header: 'Monto',       className: 'text-right', cell: r => <span className="tabular-nums font-medium text-slate-700">${r.amount.toLocaleString('es-AR')}</span> },
  ]

  return (
    <div>
      <PageHeader title="Informe de peajes" />
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-slate-500">Desde</span>
          <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-8 text-[12px] w-[140px]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-slate-500">Hasta</span>
          <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-8 text-[12px] w-[140px]" />
        </div>
        <Select value={driverFilter || 'all'} onValueChange={v => setDriverFilter(v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className="h-8 text-[12px] w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los choferes</SelectItem>
            {drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={truckFilter || 'all'} onValueChange={v => setTruckFilter(v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className="h-8 text-[12px] w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los camiones</SelectItem>
            {trucks.map(t => <SelectItem key={t.id} value={t.id}>{t.plate}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <SummaryCard variant="info" icon={DollarSign} label="Total peajes" value={`$${totals.amount.toLocaleString('es-AR')}`} />
        <SummaryCard variant="info" icon={Receipt} label="Cantidad" value={totals.count} />
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={e => e.id}
        emptyMessage="Sin peajes para los filtros seleccionados"
      />
    </div>
  )
}
