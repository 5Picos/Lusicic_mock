'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import SummaryCard from '@/components/SummaryCard'
import DataTable, { Column } from '@/components/DataTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { receipts, orders, trucks, drivers, localities } from '@/lib/mock-data'
import { Truck, MapPin, DollarSign } from 'lucide-react'

type ViajeRow = {
  id: string
  date: string
  receiptNumber: string
  orderNumber: string
  truckId: string
  driverId: string
  truckPlate: string
  driverName: string
  localityName: string
  roundTripKm: number
  appliedPrice: number
}

export default function InformesViajesPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [truckFilter, setTruckFilter] = useState('')
  const [driverFilter, setDriverFilter] = useState('')

  const allRows = useMemo((): ViajeRow[] =>
    receipts.flatMap(r => {
      const order = orders.find(o => o.id === r.orderId)
      if (!order) return []
      const locality = localities.find(l => l.id === order.localityId)
      return [{
        id: r.id,
        date: r.date,
        receiptNumber: r.receiptNumber,
        orderNumber: order.orderNumber,
        truckId: order.truckId ?? '',
        driverId: order.driverId ?? '',
        truckPlate: trucks.find(t => t.id === order.truckId)?.plate ?? '—',
        driverName: drivers.find(d => d.id === order.driverId)?.name ?? '—',
        localityName: locality?.name ?? '—',
        roundTripKm: locality?.roundTripKm ?? 0,
        appliedPrice: order.appliedPrice,
      }]
    }),
    []
  )

  const filtered = useMemo(() => allRows.filter(r => {
    if (from && r.date < from) return false
    if (to && r.date > to) return false
    if (truckFilter && r.truckId !== truckFilter) return false
    if (driverFilter && r.driverId !== driverFilter) return false
    return true
  }), [allRows, from, to, truckFilter, driverFilter])

  const totals = useMemo(() => ({
    count: filtered.length,
    km: filtered.reduce((s, r) => s + r.roundTripKm, 0),
    ingresos: filtered.reduce((s, r) => s + r.appliedPrice, 0),
  }), [filtered])

  const columns: Column<ViajeRow>[] = [
    { key: 'date',          header: 'Fecha',     cell: r => <span className="tabular-nums text-slate-500">{r.date}</span> },
    { key: 'receiptNumber', header: 'Remito',    cell: r => <span className="font-semibold text-slate-800">{r.receiptNumber}</span> },
    { key: 'orderNumber',   header: 'Pedido',    cell: r => <span className="text-slate-600">{r.orderNumber}</span> },
    { key: 'truck',         header: 'Camión',    cell: r => <span className="font-mono text-[11px] text-slate-700">{r.truckPlate}</span> },
    { key: 'driver',        header: 'Chofer',    cell: r => <span className="text-slate-500">{r.driverName}</span> },
    { key: 'locality',      header: 'Destino',   cell: r => <span className="text-slate-700">{r.localityName}</span> },
    { key: 'km',            header: 'Km',        className: 'text-right', cell: r => <span className="tabular-nums text-slate-600">{r.roundTripKm.toLocaleString('es-AR')}</span> },
    { key: 'price',         header: 'Monto',     className: 'text-right', cell: r => <span className="tabular-nums font-medium text-slate-700">${r.appliedPrice.toLocaleString('es-AR')}</span> },
  ]

  return (
    <div>
      <PageHeader title="Informe de viajes" />
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-slate-500">Desde</span>
          <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-8 text-[12px] w-[140px]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-slate-500">Hasta</span>
          <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-8 text-[12px] w-[140px]" />
        </div>
        <Select value={truckFilter || 'all'} onValueChange={v => setTruckFilter(v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className="h-8 text-[12px] w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los camiones</SelectItem>
            {trucks.map(t => <SelectItem key={t.id} value={t.id}>{t.plate}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={driverFilter || 'all'} onValueChange={v => setDriverFilter(v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className="h-8 text-[12px] w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los choferes</SelectItem>
            {drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <SummaryCard variant="info" icon={Truck} label="Viajes" value={totals.count} />
        <SummaryCard variant="info" icon={MapPin} label="Km totales" value={totals.km.toLocaleString('es-AR')} iconBg="bg-slate-100" />
        <SummaryCard variant="info" icon={DollarSign} label="Ingresos" value={`$${totals.ingresos.toLocaleString('es-AR')}`} iconBg="bg-green-50" />
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={r => r.id}
        emptyMessage="Sin viajes para el período seleccionado"
      />
    </div>
  )
}
