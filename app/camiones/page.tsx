'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trucks as initialItems } from '@/lib/mock-data'
import type { Truck } from '@/lib/types'
import { Plus } from 'lucide-react'

type TruckForm = {
  plate: string
  description: string
  brand: string
  model: string
  year: string
  realKm: string
  estimatedKm: string
}

const EMPTY_FORM: TruckForm = { plate: '', description: '', brand: '', model: '', year: '', realKm: '', estimatedKm: '' }

export default function CamionesPage() {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Truck | null>(null)
  const [form, setForm] = useState<TruckForm>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    items.filter(i =>
      i.plate.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      i.brand.toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  )

  function openNew() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setSheetOpen(true)
  }

  function openEdit(item: Truck) {
    setEditingItem(item)
    setForm({
      plate: item.plate,
      description: item.description,
      brand: item.brand,
      model: item.model,
      year: String(item.year),
      realKm: String(item.realKm),
      estimatedKm: String(item.estimatedKm),
    })
    setSheetOpen(true)
  }

  function handleSave() {
    if (!form.plate.trim() || !form.brand.trim() || !form.model.trim()) return
    const parsed = {
      plate: form.plate.trim().toUpperCase(),
      description: form.description,
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      realKm: Number(form.realKm) || 0,
      estimatedKm: Number(form.estimatedKm) || 0,
    }
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...parsed } : i))
    } else {
      setItems(prev => [...prev, { id: `tr${Date.now()}`, ...parsed }])
    }
    setSheetOpen(false)
  }

  function handleDelete() {
    setItems(prev => prev.filter(i => i.id !== deleteId))
    setDeleteId(null)
  }

  const deletingItem = items.find(i => i.id === deleteId)

  const columns: Column<Truck>[] = [
    { key: 'plate',       header: 'Patente',      cell: i => <span className="font-mono font-semibold text-slate-800">{i.plate}</span> },
    { key: 'description', header: 'Descripción',  cell: i => <span className="text-slate-600">{i.description || '—'}</span> },
    { key: 'brand',       header: 'Marca/Modelo', cell: i => <span className="text-slate-500">{i.brand} {i.model} ({i.year})</span> },
    { key: 'realKm',      header: 'Km reales', className: 'text-right', cell: i => <span className="tabular-nums text-slate-600">{i.realKm.toLocaleString('es-AR')}</span> },
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
        title="Camiones"
        action={<Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Nuevo camión</Button>}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={i => i.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por patente, marca o descripción..."
        emptyMessage="Sin camiones"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[440px] flex flex-col overflow-y-auto">
          <SheetHeader><SheetTitle>{editingItem ? 'Editar camión' : 'Nuevo camión'}</SheetTitle></SheetHeader>
          <div className="flex flex-col gap-4 py-4 flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Patente</Label>
                <Input value={form.plate} onChange={e => setForm(p => ({ ...p, plate: e.target.value }))} placeholder="ABC 123" autoFocus />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Año</Label>
                <Input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} placeholder="2020" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Descripción</Label>
              <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Unidad 1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Marca</Label>
                <Input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} placeholder="Mercedes" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Modelo</Label>
                <Input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} placeholder="Actros" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Km reales</Label>
                <Input type="number" value={form.realKm} onChange={e => setForm(p => ({ ...p, realKm: e.target.value }))} placeholder="87420" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Km estimados</Label>
                <Input type="number" value={form.estimatedKm} onChange={e => setForm(p => ({ ...p, estimatedKm: e.target.value }))} placeholder="88100" />
              </div>
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.plate.trim() || !form.brand.trim() || !form.model.trim()}>Guardar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        itemName={`${deletingItem?.plate} · ${deletingItem?.brand} ${deletingItem?.model}`}
      />
    </div>
  )
}
