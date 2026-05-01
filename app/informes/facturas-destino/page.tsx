'use client'

import { useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import SummaryCard from '@/components/SummaryCard'
import DataTable, { Column } from '@/components/DataTable'
import { invoices, receipts, orders, localities } from '@/lib/mock-data'
import { DollarSign, MapPin } from 'lucide-react'

type DestinoRow = {
  id: string
  localityName: string
  count: number
  total: number
  average: number
}

export default function InformesFacturasDestinoPage() {
  const rows = useMemo((): DestinoRow[] => {
    const byLocality: Record<string, { name: string; count: number; total: number }> = {}
    for (const inv of invoices) {
      const firstReceiptId = inv.receiptIds[0]
      if (!firstReceiptId) continue
      const receipt = receipts.find(r => r.id === firstReceiptId)
      if (!receipt) continue
      const order = orders.find(o => o.id === receipt.orderId)
      if (!order) continue
      const locality = localities.find(l => l.id === order.localityId)
      if (!locality) continue
      if (!byLocality[locality.id]) {
        byLocality[locality.id] = { name: locality.name, count: 0, total: 0 }
      }
      byLocality[locality.id].count++
      byLocality[locality.id].total += inv.total
    }
    return Object.entries(byLocality)
      .map(([id, data]) => ({
        id,
        localityName: data.name,
        count: data.count,
        total: data.total,
        average: Math.round(data.total / data.count),
      }))
      .sort((a, b) => b.total - a.total)
  }, [])

  const grandTotal = useMemo(() => rows.reduce((s, r) => s + r.total, 0), [rows])

  const columns: Column<DestinoRow>[] = [
    { key: 'locality', header: 'Localidad',           cell: r => <span className="font-medium text-slate-800">{r.localityName}</span> },
    { key: 'count',    header: 'Facturas',             className: 'text-right', cell: r => <span className="tabular-nums text-slate-600">{r.count}</span> },
    { key: 'total',    header: 'Total facturado',      className: 'text-right', cell: r => <span className="tabular-nums font-medium text-slate-700">${r.total.toLocaleString('es-AR')}</span> },
    { key: 'average',  header: 'Promedio por factura', className: 'text-right', cell: r => <span className="tabular-nums text-slate-500">${r.average.toLocaleString('es-AR')}</span> },
  ]

  return (
    <div>
      <PageHeader title="Facturas por destino" subtitle="Total facturado agrupado por localidad de destino." />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <SummaryCard variant="info" icon={DollarSign} label="Total facturado" value={`$${grandTotal.toLocaleString('es-AR')}`} />
        <SummaryCard variant="info" icon={MapPin} label="Destinos" value={rows.length} />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={r => r.id}
        emptyMessage="Sin facturas registradas"
      />
    </div>
  )
}
