'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import AmberPanel from '@/components/AmberPanel'
import DataTable, { Column } from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { invoices as initialInvoices, receipts, orders as initialOrders, clients } from '@/lib/mock-data'
import type { Invoice, OrderStatus } from '@/lib/types'
import { Plus } from 'lucide-react'

export default function FacturacionPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [clientId, setClientId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedReceiptIds, setSelectedReceiptIds] = useState<string[]>([])

  const invoicedReceiptIds = useMemo(
    () => new Set(invoices.flatMap(inv => inv.receiptIds)),
    [invoices]
  )

  const uninvoicedOrders = useMemo(() =>
    orders.filter(o => {
      if (o.status !== 'delivered') return false
      const receipt = receipts.find(r => r.orderId === o.id)
      return receipt !== undefined && !invoicedReceiptIds.has(receipt.id)
    }),
    [orders, invoicedReceiptIds]
  )

  const clientReceipts = useMemo(() => {
    if (!clientId) return []
    return receipts.filter(r => {
      const order = orders.find(o => o.id === r.orderId)
      return (
        order?.destinationClientId === clientId &&
        order.status === 'delivered' &&
        !invoicedReceiptIds.has(r.id)
      )
    })
  }, [clientId, orders, invoicedReceiptIds])

  const selectedTotal = useMemo(() =>
    selectedReceiptIds.reduce((sum, rId) => {
      const order = orders.find(o => o.id === receipts.find(r => r.id === rId)?.orderId)
      return sum + (order?.appliedPrice ?? 0)
    }, 0),
    [selectedReceiptIds, orders]
  )

  function toggleReceipt(id: string) {
    setSelectedReceiptIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  function openSheet(preClientId = '', preReceiptIds: string[] = []) {
    setClientId(preClientId)
    setSelectedReceiptIds(preReceiptIds)
    setInvoiceNumber('')
    setInvoiceDate(new Date().toISOString().split('T')[0])
    setSheetOpen(true)
  }

  function handleSave() {
    if (!clientId || !invoiceNumber.trim() || selectedReceiptIds.length === 0) return
    const newInvoice: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: invoiceNumber.trim(),
      clientId,
      date: invoiceDate,
      total: selectedTotal,
      status: 'pending',
      receiptIds: selectedReceiptIds,
    }
    setInvoices(prev => [newInvoice, ...prev])
    const invoicedOrderIds = new Set(
      selectedReceiptIds
        .map(rId => receipts.find(r => r.id === rId)?.orderId)
        .filter((id): id is string => Boolean(id))
    )
    setOrders(prev => prev.map(o =>
      invoicedOrderIds.has(o.id) ? { ...o, status: 'invoiced' as OrderStatus } : o
    ))
    setSheetOpen(false)
  }

  const columns: Column<Invoice>[] = [
    { key: 'num',    header: 'N° Factura', cell: inv => <span className="font-semibold text-slate-800">{inv.invoiceNumber}</span> },
    { key: 'date',   header: 'Fecha',      cell: inv => <span className="tabular-nums text-slate-500">{inv.date}</span> },
    { key: 'client', header: 'Cliente',    cell: inv => <span className="text-slate-700">{clients.find(c => c.id === inv.clientId)?.name ?? '—'}</span> },
    { key: 'qty',    header: 'Remitos', className: 'text-right', cell: inv => <span className="tabular-nums text-slate-500">{inv.receiptIds.length}</span> },
    { key: 'total',  header: 'Total',  className: 'text-right', cell: inv => <span className="tabular-nums font-medium text-slate-700">${inv.total.toLocaleString('es-AR')}</span> },
    { key: 'status', header: 'Estado',     cell: inv => <StatusBadge variant="payment" state={inv.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Facturación"
        action={<Button size="sm" onClick={() => openSheet()}><Plus size={14} className="mr-1" /> Nueva factura</Button>}
      />

      <AmberPanel
        title={`${uninvoicedOrders.length} remito${uninvoicedOrders.length !== 1 ? 's' : ''} entregado${uninvoicedOrders.length !== 1 ? 's' : ''} sin facturar`}
        items={uninvoicedOrders.map(o => {
          const receipt = receipts.find(r => r.orderId === o.id)
          return {
            id: o.id,
            label: (
              <span className="flex items-center gap-3">
                <span className="font-semibold">{receipt?.receiptNumber ?? o.orderNumber}</span>
                <span className="text-slate-500">{clients.find(c => c.id === o.destinationClientId)?.name}</span>
                <span className="tabular-nums text-[11px] text-slate-400">${o.appliedPrice.toLocaleString('es-AR')}</span>
              </span>
            ),
            action: (
              <button
                onClick={() => receipt && openSheet(o.destinationClientId, [receipt.id])}
                className="hover:underline"
              >
                Facturar →
              </button>
            ),
          }
        })}
      />

      <DataTable
        title="Facturas emitidas"
        columns={columns}
        rows={invoices}
        getRowId={inv => inv.id}
        emptyMessage="Sin facturas emitidas"
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[480px] flex flex-col overflow-y-auto">
          <SheetHeader><SheetTitle>Nueva factura</SheetTitle></SheetHeader>
          <div className="flex flex-col gap-4 py-4 flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">N° Factura</Label>
                <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="F-0002" autoFocus />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Fecha</Label>
                <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Cliente</Label>
              <Select value={clientId} onValueChange={v => { setClientId(v ?? ''); setSelectedReceiptIds([]) }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente..." /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {clientId && (
              <div className="flex flex-col gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-t border-slate-100 pt-3">Remitos a incluir</div>
                {clientReceipts.length === 0 ? (
                  <p className="text-[12px] text-slate-400">Sin remitos pendientes para este cliente.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {clientReceipts.map(r => {
                      const order = orders.find(o => o.id === r.orderId)
                      return (
                        <label key={r.id} className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-md cursor-pointer hover:bg-slate-100">
                          <input
                            type="checkbox"
                            checked={selectedReceiptIds.includes(r.id)}
                            onChange={() => toggleReceipt(r.id)}
                            className="h-3.5 w-3.5"
                          />
                          <span className="text-[12px] text-slate-700 flex-1">
                            <span className="font-medium">{r.receiptNumber}</span>
                            <span className="text-slate-400 ml-2">{r.date}</span>
                          </span>
                          <span className="tabular-nums text-[12px] font-medium text-slate-600">
                            ${order?.appliedPrice.toLocaleString('es-AR')}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
                {selectedReceiptIds.length > 0 && (
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 mt-1">
                    <span className="text-[11px] text-slate-500">Total factura</span>
                    <span className="text-[13px] font-semibold text-slate-800">${selectedTotal.toLocaleString('es-AR')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={!clientId || !invoiceNumber.trim() || selectedReceiptIds.length === 0}
            >
              Emitir factura
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
