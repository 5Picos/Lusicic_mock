'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { maintenanceTypes as initialItems } from '@/lib/mock-data'
import type { MaintenanceType } from '@/lib/types'
import { Plus } from 'lucide-react'

type MaintTypeForm = {
  name: string
  description: string
  defaultKmInterval: string
  defaultDaysInterval: string
  defaultAlertKmBefore: string
  defaultAlertDaysBefore: string
}

const EMPTY_FORM: MaintTypeForm = {
  name: '', description: '',
  defaultKmInterval: '', defaultDaysInterval: '',
  defaultAlertKmBefore: '', defaultAlertDaysBefore: '',
}

function toNullableInt(val: string): number | null {
  const n = parseInt(val, 10)
  return isNaN(n) || n <= 0 ? null : n
}

export default function TiposMantenimientoPage() {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MaintenanceType | null>(null)
  const [form, setForm] = useState<MaintTypeForm>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  )

  function openNew() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setSheetOpen(true)
  }

  function openEdit(item: MaintenanceType) {
    setEditingItem(item)
    setForm({
      name: item.name,
      description: item.description,
      defaultKmInterval: item.defaultKmInterval?.toString() ?? '',
      defaultDaysInterval: item.defaultDaysInterval?.toString() ?? '',
      defaultAlertKmBefore: item.defaultAlertKmBefore?.toString() ?? '',
      defaultAlertDaysBefore: item.defaultAlertDaysBefore?.toString() ?? '',
    })
    setSheetOpen(true)
  }

  function handleSave() {
    if (!form.name.trim()) return
    const data: Omit<MaintenanceType, 'id'> = {
      name: form.name.trim(),
      description: form.description.trim(),
      defaultKmInterval: toNullableInt(form.defaultKmInterval),
      defaultDaysInterval: toNullableInt(form.defaultDaysInterval),
      defaultAlertKmBefore: toNullableInt(form.defaultAlertKmBefore),
      defaultAlertDaysBefore: toNullableInt(form.defaultAlertDaysBefore),
    }
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { id: editingItem.id, ...data } : i))
    } else {
      setItems(prev => [...prev, { id: `mt${Date.now()}`, ...data }])
    }
    setSheetOpen(false)
  }

  function handleDelete() {
    setItems(prev => prev.filter(i => i.id !== deleteId))
    setDeleteId(null)
  }

  const deletingItem = items.find(i => i.id === deleteId)

  const columns: Column<MaintenanceType>[] = [
    { key: 'name',        header: 'Nombre',      cell: i => <span className="font-medium text-slate-800">{i.name}</span> },
    { key: 'description', header: 'Descripción', cell: i => <span className="text-slate-500">{i.description || '—'}</span> },
    {
      key: 'kmInterval',
      header: 'Intervalo km',
      className: 'text-right',
      cell: i => <span className="tabular-nums text-slate-600">{i.defaultKmInterval ? i.defaultKmInterval.toLocaleString('es-AR') : '—'}</span>,
    },
    {
      key: 'daysInterval',
      header: 'Intervalo días',
      className: 'text-right',
      cell: i => <span className="tabular-nums text-slate-600">{i.defaultDaysInterval ?? '—'}</span>,
    },
    {
      key: 'alertKm',
      header: 'Alerta km',
      className: 'text-right',
      cell: i => <span className="tabular-nums text-slate-400 text-[11px]">{i.defaultAlertKmBefore ? i.defaultAlertKmBefore.toLocaleString('es-AR') : '—'}</span>,
    },
    {
      key: 'alertDays',
      header: 'Alerta días',
      className: 'text-right',
      cell: i => <span className="tabular-nums text-slate-400 text-[11px]">{i.defaultAlertDaysBefore ?? '—'}</span>,
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
        title="Tipos de mantenimiento"
        action={<Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Nuevo tipo</Button>}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={i => i.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar tipo..."
        emptyMessage="Sin tipos de mantenimiento"
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[420px] flex flex-col">
          <SheetHeader>
            <SheetTitle>{editingItem ? 'Editar tipo de mantenimiento' : 'Nuevo tipo de mantenimiento'}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 p-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Nombre *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ej: Aceite motor"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Descripción</Label>
              <Input
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Descripción opcional"
              />
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[10px] uppercase text-slate-400 font-semibold mb-3">Intervalos por defecto</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Cada X km</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.defaultKmInterval}
                    onChange={e => setForm(p => ({ ...p, defaultKmInterval: e.target.value }))}
                    placeholder="10000"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Cada X días</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.defaultDaysInterval}
                    onChange={e => setForm(p => ({ ...p, defaultDaysInterval: e.target.value }))}
                    placeholder="180"
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[10px] uppercase text-slate-400 font-semibold mb-3">Alertas por defecto</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Avisar X km antes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.defaultAlertKmBefore}
                    onChange={e => setForm(p => ({ ...p, defaultAlertKmBefore: e.target.value }))}
                    placeholder="1000"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Avisar X días antes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.defaultAlertDaysBefore}
                    onChange={e => setForm(p => ({ ...p, defaultAlertDaysBefore: e.target.value }))}
                    placeholder="15"
                  />
                </div>
              </div>
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>Guardar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        itemName={deletingItem?.name}
      />
    </div>
  )
}
