'use client'

import { useState, useMemo, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import SummaryCard from '@/components/SummaryCard'
import DataTable, { Column } from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  orders as initialOrders, trucks, drivers, clients,
  localities, priceLists, localityPrices, articles,
} from '@/lib/mock-data'
import type { Order, OrderStatus, OrderModality } from '@/lib/types'
import { ShoppingCart, Truck, CheckCircle2, Receipt, Plus, Minus } from 'lucide-react'

export default function PedidosPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  // Modal: assign truck/driver
  const [assignOrderId, setAssignOrderId] = useState<string | null>(null)
  const [assignTruckId, setAssignTruckId] = useState('')
  const [assignDriverId, setAssignDriverId] = useState('')

  // Sheet: new order
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [newOrder, setNewOrder] = useState({
    orderNumber: '', date: '', deliveryDate: '', requestingClientId: '', destinationClientId: '',
    localityId: '', modality: 'CIP' as OrderModality, tonnage: '', cargoDetail: '',
    priceListId: '', appliedPrice: 0,
  })
  const [deliveryDateTouched, setDeliveryDateTouched] = useState(false)
  const [priceListTouched, setPriceListTouched] = useState(false)
  const [tonnageOverridden, setTonnageOverridden] = useState(false)
  const [newLines, setNewLines] = useState<{ articleId: string; quantity: string }[]>([])

  const filtered = useMemo(() => {
    return orders
      .filter(o => filterStatus === 'all' || o.status === filterStatus)
      .filter(o => {
        if (filterFrom && o.deliveryDate < filterFrom) return false
        if (filterTo && o.deliveryDate > filterTo) return false
        return true
      })
      .filter(o => {
        const q = search.toLowerCase()
        const client = clients.find(c => c.id === o.destinationClientId)
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          (client?.name.toLowerCase().includes(q) ?? false)
        )
      })
      .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate))
  }, [orders, search, filterStatus, filterFrom, filterTo])

  const counts = {
    pending:   orders.filter(o => o.status === 'pending').length,
    assigned:  orders.filter(o => o.status === 'assigned').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    invoiced:  orders.filter(o => o.status === 'invoiced').length,
  }
  const toInvoiceTotal = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.appliedPrice, 0)

  function handleAssign() {
    if (!assignOrderId || !assignTruckId || !assignDriverId) return
    setOrders(prev => prev.map(o =>
      o.id === assignOrderId
        ? { ...o, truckId: assignTruckId, driverId: assignDriverId, status: 'assigned' as OrderStatus }
        : o
    ))
    setAssignOrderId(null)
    setAssignTruckId('')
    setAssignDriverId('')
  }

  const computedPrice = useMemo(() => {
    if (!newOrder.priceListId || !newOrder.localityId) return null
    return localityPrices.find(
      lp => lp.priceListId === newOrder.priceListId && lp.localityId === newOrder.localityId
    )?.price ?? null
  }, [newOrder.priceListId, newOrder.localityId])

  const availablePriceLists = useMemo(() => {
    const own = priceLists.filter(pl => pl.clientId === newOrder.destinationClientId)
    const general = priceLists.filter(pl => pl.clientId === null)
    return [...own, ...general]
  }, [newOrder.destinationClientId])

  // Calculate tonnage from lines (kg → t)
  const calculatedTonnage = useMemo(() => {
    const totalKg = newLines
      .filter(l => l.articleId && l.quantity)
      .reduce((sum, l) => {
        const art = articles.find(a => a.id === l.articleId)
        return sum + Number(l.quantity) * (art?.unitWeightKg ?? 0)
      }, 0)
    return totalKg > 0 ? totalKg / 1000 : null
  }, [newLines])

  // Auto-fill tonnage when lines change and user hasn't overridden it
  useEffect(() => {
    if (!tonnageOverridden && newOrder.modality === 'CIP') {
      setNewOrder(p => ({ ...p, tonnage: calculatedTonnage != null ? calculatedTonnage.toFixed(3) : '' }))
    }
  }, [calculatedTonnage, tonnageOverridden, newOrder.modality])

  const deliveryDateInvalid = !!newOrder.date && !!newOrder.deliveryDate && newOrder.deliveryDate < newOrder.date

  function handleDestinationClientChange(value: string) {
    setNewOrder(p => {
      if (priceListTouched) return { ...p, destinationClientId: value }
      const ownList = priceLists.find(pl => pl.clientId === value)
      const defaultList = priceLists.find(pl => pl.isDefault)
      return { ...p, destinationClientId: value, priceListId: ownList?.id ?? defaultList?.id ?? '' }
    })
  }

  function handlePriceListChange(value: string) {
    setPriceListTouched(true)
    setNewOrder(p => ({ ...p, priceListId: value }))
  }

  function handleDateChange(value: string) {
    setNewOrder(p => ({ ...p, date: value, deliveryDate: deliveryDateTouched ? p.deliveryDate : value }))
  }

  function handleDeliveryDateChange(value: string) {
    setDeliveryDateTouched(true)
    setNewOrder(p => ({ ...p, deliveryDate: value }))
  }

  function handleNewOrder() {
    if (!computedPrice || !newOrder.orderNumber || !newOrder.localityId || !newOrder.requestingClientId || !newOrder.destinationClientId || deliveryDateInvalid) return
    const id = `or${Date.now()}`
    const date = newOrder.date || new Date().toISOString().split('T')[0]
    const order: Order = {
      id,
      orderNumber: newOrder.orderNumber,
      date,
      deliveryDate: newOrder.deliveryDate || date,
      requestingClientId: newOrder.requestingClientId,
      destinationClientId: newOrder.destinationClientId,
      localityId: newOrder.localityId,
      modality: newOrder.modality,
      tonnage: newOrder.tonnage ? Number(newOrder.tonnage) : null,
      cargoDetail: newOrder.cargoDetail,
      truckId: null,
      driverId: null,
      appliedPrice: computedPrice,
      status: 'pending',
    }
    setOrders(prev => [order, ...prev])
    setNewOrderOpen(false)
    setNewOrder({ orderNumber: '', date: '', deliveryDate: '', requestingClientId: '', destinationClientId: '', localityId: '', modality: 'CIP', tonnage: '', cargoDetail: '', priceListId: '', appliedPrice: 0 })
    setDeliveryDateTouched(false)
    setPriceListTouched(false)
    setTonnageOverridden(false)
    setNewLines([])
  }

  const columns: Column<Order>[] = [
    { key: 'num',     header: 'N° Pedido',      cell: o => <span className="font-semibold text-slate-800">{o.orderNumber}</span> },
    { key: 'date',    header: 'Fecha pedido',   cell: o => <span className="text-slate-500">{o.date}</span> },
    { key: 'delivery',header: 'Fecha entrega',  cell: o => <span className="text-slate-700">{o.deliveryDate}</span> },
    { key: 'client',  header: 'Cliente destino',cell: o => <span className="text-slate-800">{clients.find(c => c.id === o.destinationClientId)?.name}</span> },
    { key: 'loc',     header: 'Localidad',      cell: o => <span className="text-slate-500">{localities.find(l => l.id === o.localityId)?.name}</span> },
    { key: 'mod',     header: 'Modal.',         cell: o => <span className="text-slate-500">{o.modality}</span> },
    { key: 'tonnage', header: 'Tonelaje',       className: 'text-right', cell: o => <span className="tabular-nums text-slate-700">{o.tonnage != null ? `${o.tonnage} t` : '—'}</span> },
    { key: 'status',  header: 'Estado',         cell: o => <StatusBadge variant="lifecycle" state={o.status} /> },
    { key: 'price',   header: 'Precio',         className: 'text-right', cell: o => <span className="tabular-nums text-slate-700">${o.appliedPrice.toLocaleString('es-AR')}</span> },
    {
      key: 'actions', header: '', className: 'text-right',
      cell: o => {
        if (o.status === 'pending')
          return <button onClick={() => setAssignOrderId(o.id)} className="row-action">Asignar</button>
        if (o.status === 'assigned')
          return <span className="text-[11px] text-slate-400">Registrar remito</span>
        return null
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Pedidos"
        action={
          <Button size="sm" onClick={() => setNewOrderOpen(true)}>
            <Plus size={14} className="mr-1" /> Nuevo pedido
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-2.5 mb-5">
        <SummaryCard variant="info" icon={ShoppingCart} value={counts.pending}   label="Pendiente" subtitle="sin asignar" />
        <SummaryCard variant="info" icon={Truck}         value={counts.assigned}  label="Asignado"  subtitle="en camino" />
        <SummaryCard variant="info" icon={CheckCircle2}  value={counts.delivered} label="Entregado" subtitle={`$${toInvoiceTotal.toLocaleString('es-AR')} a facturar`} />
        <SummaryCard variant="info" icon={Receipt}       value={counts.invoiced}  label="Facturado" subtitle="este período" />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={o => o.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por número o cliente..."
        filters={
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-slate-500">Desde</span>
              <Input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="h-8 text-[12px] w-[140px]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-slate-500">Hasta</span>
              <Input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="h-8 text-[12px] w-[140px]" />
            </div>
          </>
        }
        action={
          <Select value={filterStatus} onValueChange={v => setFilterStatus((v ?? 'all') as OrderStatus | 'all')}>
            <SelectTrigger className="h-8 text-[12px] w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="assigned">Asignado</SelectItem>
              <SelectItem value="delivered">Entregado</SelectItem>
              <SelectItem value="invoiced">Facturado</SelectItem>
            </SelectContent>
          </Select>
        }
        emptyMessage="Sin pedidos"
      />

      {/* Modal: Assign */}
      <Dialog open={!!assignOrderId} onOpenChange={open => !open && setAssignOrderId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Asignar camión y chofer</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="form-field">
              <Label className="text-[10px] uppercase tracking-wide text-slate-500">Camión</Label>
              <Select value={assignTruckId} onValueChange={v => setAssignTruckId(v ?? '')}>
                <SelectTrigger><SelectValue placeholder="Seleccionar camión..." /></SelectTrigger>
                <SelectContent>
                  {trucks.map(t => <SelectItem key={t.id} value={t.id}>{t.plate} · {t.brand} {t.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="form-field">
              <Label className="text-[10px] uppercase tracking-wide text-slate-500">Chofer</Label>
              <Select value={assignDriverId} onValueChange={v => setAssignDriverId(v ?? '')}>
                <SelectTrigger><SelectValue placeholder="Seleccionar chofer..." /></SelectTrigger>
                <SelectContent>
                  {drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOrderId(null)}>Cancelar</Button>
            <Button onClick={handleAssign} disabled={!assignTruckId || !assignDriverId}>Asignar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet: New order */}
      <Sheet open={newOrderOpen} onOpenChange={setNewOrderOpen}>
        <SheetContent className="w-[480px] flex flex-col overflow-y-auto">
          <SheetHeader><SheetTitle>Nuevo pedido</SheetTitle></SheetHeader>

          <div className="sheet-body">
            <div className="flex flex-col gap-3">
              <div className="section-heading border-t border-slate-100 pt-3">Datos del pedido</div>
              <div className="form-grid">
                <div className="form-field">
                  <Label className="form-label">N° Pedido</Label>
                  <Input value={newOrder.orderNumber} onChange={e => setNewOrder(p => ({ ...p, orderNumber: e.target.value }))} placeholder="P-2024-007" />
                </div>
                <div className="form-field">
                  <Label className="form-label">Fecha pedido</Label>
                  <Input type="date" value={newOrder.date} onChange={e => handleDateChange(e.target.value)} />
                </div>
              </div>
              <div className="form-field">
                <Label className="form-label">Fecha entrega</Label>
                <Input type="date" value={newOrder.deliveryDate} onChange={e => handleDeliveryDateChange(e.target.value)} min={newOrder.date || undefined} />
                {deliveryDateInvalid && (
                  <span className="text-[11px] text-red-600">No puede ser anterior a la fecha del pedido</span>
                )}
              </div>
              <div className="form-field">
                <Label className="form-label">Cliente solicitante</Label>
                <Select value={newOrder.requestingClientId} onValueChange={v => setNewOrder(p => ({ ...p, requestingClientId: v ?? '' }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="form-field">
                <Label className="form-label">Cliente destino</Label>
                <Select value={newOrder.destinationClientId} onValueChange={v => handleDestinationClientChange(v ?? '')}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <Label className="form-label">Localidad</Label>
                  <Select value={newOrder.localityId} onValueChange={v => setNewOrder(p => ({ ...p, localityId: v ?? '' }))}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>{localities.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="form-field">
                  <Label className="form-label">Modalidad</Label>
                  <Select value={newOrder.modality} onValueChange={v => setNewOrder(p => ({ ...p, modality: (v ?? 'CIP') as OrderModality }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CIP">CIP</SelectItem>
                      <SelectItem value="FCA">FCA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newOrder.modality === 'CIP' && (
                <div className="form-field">
                  <Label className="form-label">Tonelaje (t)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={newOrder.tonnage}
                    onChange={e => { setTonnageOverridden(true); setNewOrder(p => ({ ...p, tonnage: e.target.value })) }}
                    placeholder="32.000"
                  />
                  {!tonnageOverridden && calculatedTonnage != null && (
                    <span className="form-hint text-blue-500">Calculado desde artículos</span>
                  )}
                  {tonnageOverridden && calculatedTonnage != null && (
                    <button
                      type="button"
                      onClick={() => { setTonnageOverridden(false); setNewOrder(p => ({ ...p, tonnage: calculatedTonnage.toFixed(3) })) }}
                      className="text-[11px] text-blue-500 hover:underline w-fit"
                    >
                      ↩ Volver al calculado ({calculatedTonnage.toFixed(3)} t)
                    </button>
                  )}
                </div>
              )}
              <div className="form-field">
                <Label className="form-label">Detalle de carga</Label>
                <Input value={newOrder.cargoDetail} onChange={e => setNewOrder(p => ({ ...p, cargoDetail: e.target.value }))} placeholder="Harina de trigo granel" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="section-heading border-t border-slate-100 pt-3">Lista de precios</div>
              <div className="form-field">
                <Label className="form-label">Lista</Label>
                <Select value={newOrder.priceListId} onValueChange={v => handlePriceListChange(v ?? '')}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar lista..." /></SelectTrigger>
                  <SelectContent>
                    {availablePriceLists.map(pl => (
                      <SelectItem key={pl.id} value={pl.id}>{pl.name}{pl.clientId ? ' (propia)' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {computedPrice !== null ? (
                <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-[13px] font-semibold text-blue-700 tabular-nums">
                  Precio aplicado: ${computedPrice.toLocaleString('es-AR')}
                </div>
              ) : newOrder.priceListId && newOrder.localityId ? (
                <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-[12px] text-red-600">
                  Sin precio para esta combinación lista / localidad
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3">
              <div className="section-heading border-t border-slate-100 pt-3">Artículos</div>
              {newLines.map((line, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_auto] gap-2 items-end">
                  <Select value={line.articleId} onValueChange={v => setNewLines(prev => prev.map((l, idx) => idx === i ? { ...l, articleId: v ?? '' } : l))}>
                    <SelectTrigger className="text-[12px]"><SelectValue placeholder="Artículo..." /></SelectTrigger>
                    <SelectContent>{articles.map(a => <SelectItem key={a.id} value={a.id}>{a.code} · {a.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={line.quantity}
                    onChange={e => setNewLines(prev => prev.map((l, idx) => idx === i ? { ...l, quantity: e.target.value } : l))}
                    placeholder="Cant."
                    className="text-[12px]"
                  />
                  <button onClick={() => setNewLines(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                    <Minus size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setNewLines(prev => [...prev, { articleId: '', quantity: '' }])}
                className="flex items-center gap-1 text-[12px] text-blue-600 font-medium w-fit"
              >
                <Plus size={13} /> Agregar artículo
              </button>
              {calculatedTonnage != null && (
                <div className="text-[12px] text-slate-500 tabular-nums">
                  Peso total calculado: <span className="font-semibold text-slate-700">{calculatedTonnage.toFixed(3)} t</span>
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="sheet-section">
            <Button variant="outline" onClick={() => setNewOrderOpen(false)}>Cancelar</Button>
            <Button onClick={handleNewOrder} disabled={!computedPrice || !newOrder.orderNumber || deliveryDateInvalid}>Guardar pedido</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
