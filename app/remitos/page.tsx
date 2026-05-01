'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import AmberPanel from '@/components/AmberPanel'
import DataTable, { Column } from '@/components/DataTable'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  orders as initialOrders,
  receipts as initialReceipts,
  orderLines, articles, clients, localities, localityTolls, suppliers,
} from '@/lib/mock-data'
import type { Receipt, OrderStatus } from '@/lib/types'

export default function RemitosPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [receipts, setReceipts] = useState(initialReceipts)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [receiptNumber, setReceiptNumber] = useState('')
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0])
  const [receiptNotes, setReceiptNotes] = useState('')
  const [tollAmounts, setTollAmounts] = useState<Record<string, number>>({})

  const receiptedOrderIds = new Set(receipts.map(r => r.orderId))
  const pendingOrders = orders.filter(o => o.status === 'assigned' && !receiptedOrderIds.has(o.id))

  function openForOrder(orderId: string) {
    setSelectedOrderId(orderId)
    const order = orders.find(o => o.id === orderId)
    if (order) {
      const tolls = localityTolls.filter(lt => lt.localityId === order.localityId)
      const defaults: Record<string, number> = {}
      tolls.forEach(lt => { defaults[lt.id] = lt.amount })
      setTollAmounts(defaults)
    }
    setSheetOpen(true)
  }

  const selectedOrder = orders.find(o => o.id === selectedOrderId) ?? null
  const selectedLines = selectedOrder ? orderLines.filter(ol => ol.orderId === selectedOrder.id) : []
  const selectedTolls = selectedOrder ? localityTolls.filter(lt => lt.localityId === selectedOrder.localityId) : []

  function handleSave() {
    if (!selectedOrder || !receiptNumber) return
    const id = `re${Date.now()}`
    const newReceipt: Receipt = {
      id, orderId: selectedOrder.id, receiptNumber, date: receiptDate, notes: receiptNotes,
    }
    setReceipts(prev => [newReceipt, ...prev])
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'delivered' as OrderStatus } : o))
    setSheetOpen(false)
    setSelectedOrderId('')
    setReceiptNumber('')
    setReceiptNotes('')
    setTollAmounts({})
  }

  const receiptColumns: Column<Receipt>[] = [
    { key: 'num',    header: 'N° Remito',      cell: r => <span className="font-semibold text-slate-800">{r.receiptNumber}</span> },
    { key: 'date',   header: 'Fecha',          cell: r => <span className="text-slate-500">{r.date}</span> },
    { key: 'order',  header: 'N° Pedido',      cell: r => <span className="text-slate-700">{orders.find(o => o.id === r.orderId)?.orderNumber}</span> },
    {
      key: 'client', header: 'Cliente destino',
      cell: r => {
        const order = orders.find(o => o.id === r.orderId)
        return <span className="text-slate-700">{clients.find(c => c.id === order?.destinationClientId)?.name}</span>
      },
    },
    {
      key: 'loc', header: 'Localidad',
      cell: r => {
        const order = orders.find(o => o.id === r.orderId)
        return <span className="text-slate-500">{localities.find(l => l.id === order?.localityId)?.name}</span>
      },
    },
    {
      key: 'articles', header: 'Artículos',
      cell: r => {
        const lines = orderLines.filter(ol => ol.orderId === r.orderId)
        return (
          <div className="flex flex-wrap gap-1">
            {lines.map(ol => {
              const art = articles.find(a => a.id === ol.articleId)
              return <span key={ol.id} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded">{art?.code} ×{ol.quantity}</span>
            })}
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Remitos" />

      <AmberPanel
        title={`${pendingOrders.length} pedido${pendingOrders.length !== 1 ? 's' : ''} asignado${pendingOrders.length !== 1 ? 's' : ''} sin remito`}
        items={pendingOrders.map(o => ({
          id: o.id,
          label: (
            <span className="flex items-center gap-3">
              <span className="font-semibold">{o.orderNumber}</span>
              <span className="text-slate-500">{clients.find(c => c.id === o.destinationClientId)?.name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{localities.find(l => l.id === o.localityId)?.name}</span>
              <span className="text-slate-400 text-[11px]">{o.date}</span>
            </span>
          ),
          action: (
            <button onClick={() => openForOrder(o.id)} className="hover:underline">
              Registrar remito →
            </button>
          ),
        }))}
      />

      <DataTable
        title="Remitos registrados"
        columns={receiptColumns}
        rows={receipts}
        getRowId={r => r.id}
        emptyMessage="Sin remitos registrados"
      />

      <Sheet open={sheetOpen} onOpenChange={open => { if (!open) setSheetOpen(false) }}>
        <SheetContent className="w-[480px] flex flex-col overflow-y-auto">
          <SheetHeader><SheetTitle>Registrar remito</SheetTitle></SheetHeader>

          <div className="flex flex-col gap-4 p-4 flex-1">
            <div className="flex flex-col gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pedido</div>
              <Select value={selectedOrderId} onValueChange={v => v && openForOrder(v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar pedido..." /></SelectTrigger>
                <SelectContent>
                  {pendingOrders.map(o => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.orderNumber} · {clients.find(c => c.id === o.destinationClientId)?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">N° Remito</Label>
                  <Input value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} placeholder="R-0042" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Fecha</Label>
                  <Input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Notas</Label>
                <Input value={receiptNotes} onChange={e => setReceiptNotes(e.target.value)} placeholder="Observaciones..." />
              </div>
            </div>

            {selectedLines.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-t border-slate-100 pt-3">Artículos despachados</div>
                <div className="text-[10px] text-slate-400">Solo lectura — para editar cantidades, modificar el pedido primero</div>
                <table className="w-full text-[12px] border border-slate-200 rounded-md overflow-hidden">
                  <thead><tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Código</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Artículo</th>
                    <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Cantidad</th>
                  </tr></thead>
                  <tbody>
                    {selectedLines.map(ol => {
                      const art = articles.find(a => a.id === ol.articleId)
                      return (
                        <tr key={ol.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-2 text-slate-500">{art?.code}</td>
                          <td className="px-3 py-2 text-slate-800">{art?.name}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-700">{ol.quantity}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {selectedTolls.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-t border-slate-100 pt-3">Peajes</div>
                <table className="w-full text-[12px] border border-slate-200 rounded-md overflow-hidden">
                  <thead><tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Cabina</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Proveedor</th>
                    <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Monto</th>
                  </tr></thead>
                  <tbody>
                    {selectedTolls.map(lt => (
                      <tr key={lt.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2 text-slate-700">{lt.description}</td>
                        <td className="px-3 py-2 text-slate-500">{suppliers.find(s => s.id === lt.supplierId)?.name}</td>
                        <td className="px-3 py-2 text-right">
                          <Input
                            type="number"
                            value={tollAmounts[lt.id] ?? lt.amount}
                            onChange={e => setTollAmounts(prev => ({ ...prev, [lt.id]: Number(e.target.value) }))}
                            className="w-24 h-7 text-[12px] text-right tabular-nums ml-auto"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-[10px] text-slate-400">Al guardar se generará un gasto por cada peaje</div>
              </div>
            )}
          </div>

          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!selectedOrderId || !receiptNumber}>
              Registrar remito
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
