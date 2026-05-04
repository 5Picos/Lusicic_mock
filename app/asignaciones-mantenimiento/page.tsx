'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  assignedMaintenances as initialItems,
  maintenanceTypes,
  trucks,
} from '@/lib/mock-data'
import type { AssignedMaintenance } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

type AssignForm = {
  truckId: string
  maintenanceTypeId: string
  kmInterval: string
  daysInterval: string
  alertKmBefore: string
  alertDaysBefore: string
  active: boolean
}

const EMPTY_FORM: AssignForm = {
  truckId: '', maintenanceTypeId: '',
  kmInterval: '', daysInterval: '',
  alertKmBefore: '', alertDaysBefore: '',
  active: true,
}

function toNullableInt(val: string): number | null {
  const n = parseInt(val, 10)
  return isNaN(n) || n <= 0 ? null : n
}

export default function AsignacionesMantenimientoPage() {
  const [items, setItems] = useState(initialItems)
  const [filterTruckId, setFilterTruckId] = useState('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AssignedMaintenance | null>(null)
  const [form, setForm] = useState<AssignForm>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    filterTruckId === 'all' ? items : items.filter(i => i.truckId === filterTruckId),
    [items, filterTruckId]
  )

  const availableTypes = useMemo(() => {
    if (!form.truckId) return maintenanceTypes
    const assigned = items
      .filter(i => i.truckId === form.truckId && i.id !== editingItem?.id)
      .map(i => i.maintenanceTypeId)
    return maintenanceTypes.filter(mt => !assigned.includes(mt.id))
  }, [form.truckId, items, editingItem])

  function openNew() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setSheetOpen(true)
  }

  function openEdit(item: AssignedMaintenance) {
    setEditingItem(item)
    setForm({
      truckId: item.truckId,
      maintenanceTypeId: item.maintenanceTypeId,
      kmInterval: item.kmInterval?.toString() ?? '',
      daysInterval: item.daysInterval?.toString() ?? '',
      alertKmBefore: item.alertKmBefore?.toString() ?? '',
      alertDaysBefore: item.alertDaysBefore?.toString() ?? '',
      active: item.active,
    })
    setSheetOpen(true)
  }

  function handleTypeSelect(typeId: string | null) {
    if (!typeId) return
    const mt = maintenanceTypes.find(t => t.id === typeId)
    setForm(p => ({
      ...p,
      maintenanceTypeId: typeId,
      kmInterval: mt?.defaultKmInterval?.toString() ?? '',
      daysInterval: mt?.defaultDaysInterval?.toString() ?? '',
      alertKmBefore: mt?.defaultAlertKmBefore?.toString() ?? '',
      alertDaysBefore: mt?.defaultAlertDaysBefore?.toString() ?? '',
    }))
  }

  function handleSave() {
    if (!form.truckId || !form.maintenanceTypeId) return
    const data: Omit<AssignedMaintenance, 'id'> = {
      truckId: form.truckId,
      maintenanceTypeId: form.maintenanceTypeId,
      kmInterval: toNullableInt(form.kmInterval),
      daysInterval: toNullableInt(form.daysInterval),
      alertKmBefore: toNullableInt(form.alertKmBefore),
      alertDaysBefore: toNullableInt(form.alertDaysBefore),
      active: form.active,
    }
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { id: editingItem.id, ...data } : i))
    } else {
      setItems(prev => [...prev, { id: `am${Date.now()}`, ...data }])
    }
    setSheetOpen(false)
  }

  function handleDelete() {
    setItems(prev => prev.filter(i => i.id !== deleteId))
    setDeleteId(null)
  }

  function toggleActive(item: AssignedMaintenance) {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i))
  }

  const deletingItem = items.find(i => i.id === deleteId)
  const deletingTruck = trucks.find(t => t.id === deletingItem?.truckId)
  const deletingType = maintenanceTypes.find(mt => mt.id === deletingItem?.maintenanceTypeId)

  const columns: Column<AssignedMaintenance>[] = [
    {
      key: 'truck',
      header: 'Camión',
      cell: i => {
        const t = trucks.find(t => t.id === i.truckId)
        return (
          <div>
            <span className="font-mono font-semibold text-slate-800">{t?.plate ?? '—'}</span>
            <span className="text-[11px] text-slate-400 ml-1.5">{t?.description}</span>
          </div>
        )
      },
    },
    {
      key: 'type',
      header: 'Tipo de mantenimiento',
      cell: i => {
        const mt = maintenanceTypes.find(mt => mt.id === i.maintenanceTypeId)
        return <span className="text-slate-700">{mt?.name ?? '—'}</span>
      },
    },
    {
      key: 'kmInterval',
      header: 'Intervalo km',
      className: 'text-right',
      cell: i => <span className="tabular-nums text-slate-600">{i.kmInterval ? i.kmInterval.toLocaleString('es-AR') : '—'}</span>,
    },
    {
      key: 'daysInterval',
      header: 'Intervalo días',
      className: 'text-right',
      cell: i => <span className="tabular-nums text-slate-600">{i.daysInterval ?? '—'}</span>,
    },
    {
      key: 'alertKm',
      header: 'Alerta km',
      className: 'text-right',
      cell: i => <span className="tabular-nums text-slate-400 text-[11px]">{i.alertKmBefore ? i.alertKmBefore.toLocaleString('es-AR') : '—'}</span>,
    },
    {
      key: 'alertDays',
      header: 'Alerta días',
      className: 'text-right',
      cell: i => <span className="tabular-nums text-slate-400 text-[11px]">{i.alertDaysBefore ?? '—'}</span>,
    },
    {
      key: 'active',
      header: 'Activo',
      className: 'text-center',
      cell: i => (
        <button
          onClick={() => toggleActive(i)}
          className={cn(
            'text-[11px] font-medium px-2 py-0.5 rounded-full border',
            i.active
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-slate-50 border-slate-200 text-slate-400',
          )}
        >
          {i.active ? 'Activo' : 'Inactivo'}
        </button>
      ),
    },
    {
      key: 'actions', header: '', className: 'text-right',
      cell: i => (
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => openEdit(i)} className="text-[11px] text-blue-600 font-medium hover:underline">Editar</button>
          <button onClick={() => setDeleteId(i.id)} className="text-[11px] text-red-500 font-medium hover:underline">Eliminar</button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Asignaciones de mantenimiento"
        action={<Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Nueva asignación</Button>}
      />

      <div className="px-6 pb-3">
        <Select value={filterTruckId} onValueChange={(v) => setFilterTruckId(v ?? 'all')}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Filtrar por camión..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los camiones</SelectItem>
            {trucks.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.plate} — {t.description}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={i => i.id}
        emptyMessage="Sin asignaciones"
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[420px] flex flex-col">
          <SheetHeader>
            <SheetTitle>{editingItem ? 'Editar asignación' : 'Nueva asignación'}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 p-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Camión *</Label>
              <Select
                value={form.truckId}
                onValueChange={v => setForm(p => ({ ...p, truckId: v ?? '', maintenanceTypeId: '' }))}
                disabled={!!editingItem}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar camión..." /></SelectTrigger>
                <SelectContent>
                  {trucks.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.plate} — {t.brand} {t.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Tipo de mantenimiento *</Label>
              <Select
                value={form.maintenanceTypeId}
                onValueChange={handleTypeSelect}
                disabled={!form.truckId || !!editingItem}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.truckId ? 'Seleccionar tipo...' : 'Primero seleccionar camión'} />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map(mt => (
                    <SelectItem key={mt.id} value={mt.id}>{mt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[10px] uppercase text-slate-400 font-semibold mb-3">Intervalos</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Cada X km</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.kmInterval}
                    onChange={e => setForm(p => ({ ...p, kmInterval: e.target.value }))}
                    placeholder="10000"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Cada X días</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.daysInterval}
                    onChange={e => setForm(p => ({ ...p, daysInterval: e.target.value }))}
                    placeholder="180"
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[10px] uppercase text-slate-400 font-semibold mb-3">Alertas</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Avisar X km antes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.alertKmBefore}
                    onChange={e => setForm(p => ({ ...p, alertKmBefore: e.target.value }))}
                    placeholder="1000"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Avisar X días antes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.alertDaysBefore}
                    onChange={e => setForm(p => ({ ...p, alertDaysBefore: e.target.value }))}
                    placeholder="15"
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <Label className="text-[10px] uppercase text-slate-500">Activo</Label>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, active: !p.active }))}
                className={cn(
                  'text-[11px] font-medium px-2 py-0.5 rounded-full border',
                  form.active
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400',
                )}
              >
                {form.active ? 'Activo' : 'Inactivo'}
              </button>
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.truckId || !form.maintenanceTypeId}>Guardar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        itemName={deletingTruck && deletingType ? `${deletingTruck.plate} — ${deletingType.name}` : undefined}
      />
    </div>
  )
}
