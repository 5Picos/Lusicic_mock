'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { articles as initialItems } from '@/lib/mock-data'
import type { Article } from '@/lib/types'
import { Plus } from 'lucide-react'

export default function ArticulosPage() {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Article | null>(null)
  const [form, setForm] = useState({ code: '', name: '', unitWeightKg: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    items.filter(i =>
      i.code.toLowerCase().includes(search.toLowerCase()) ||
      i.name.toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  )

  function openNew() {
    setEditingItem(null)
    setForm({ code: '', name: '', unitWeightKg: '' })
    setSheetOpen(true)
  }

  function openEdit(item: Article) {
    setEditingItem(item)
    setForm({ code: item.code, name: item.name, unitWeightKg: item.unitWeightKg != null ? String(item.unitWeightKg) : '' })
    setSheetOpen(true)
  }

  function handleSave() {
    if (!form.code.trim() || !form.name.trim()) return
    const unitWeightKg = form.unitWeightKg.trim() ? Number(form.unitWeightKg) : null
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, code: form.code.trim(), name: form.name.trim(), unitWeightKg } : i))
    } else {
      setItems(prev => [...prev, { id: `ar${Date.now()}`, code: form.code.trim(), name: form.name.trim(), unitWeightKg }])
    }
    setSheetOpen(false)
  }

  function handleDelete() {
    setItems(prev => prev.filter(i => i.id !== deleteId))
    setDeleteId(null)
  }

  const deletingItem = items.find(i => i.id === deleteId)

  const columns: Column<Article>[] = [
    { key: 'code',   header: 'Código',     cell: i => <span className="font-mono text-[11px] font-medium text-slate-700">{i.code}</span> },
    { key: 'name',   header: 'Nombre',     cell: i => <span className="text-slate-800">{i.name}</span> },
    { key: 'weight', header: 'Peso unit.', className: 'text-right', cell: i => <span className="tabular-nums text-slate-700">{i.unitWeightKg != null ? `${i.unitWeightKg} kg` : '—'}</span> },
    {
      key: 'actions', header: '', className: 'text-right',
      cell: i => (
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => openEdit(i)} className="row-action">Editar</button>
          <button onClick={() => setDeleteId(i.id)} className="row-action-danger">Eliminar</button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Artículos"
        action={<Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Nuevo artículo</Button>}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={i => i.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por código o nombre..."
        emptyMessage="Sin artículos"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] flex flex-col">
          <SheetHeader><SheetTitle>{editingItem ? 'Editar artículo' : 'Nuevo artículo'}</SheetTitle></SheetHeader>
          <div className="flex flex-col gap-4 p-4 flex-1">
            <div className="form-field">
              <Label className="form-label">Código</Label>
              <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="HRT-001" autoFocus />
            </div>
            <div className="form-field">
              <Label className="form-label">Nombre</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Harina de trigo 25kg" />
            </div>
            <div className="form-field">
              <Label className="form-label">Peso unitario (kg)</Label>
              <Input
                type="number"
                min="0"
                step="0.001"
                value={form.unitWeightKg}
                onChange={e => setForm(p => ({ ...p, unitWeightKg: e.target.value }))}
                placeholder="25"
              />
              <span className="form-hint">Se usa para calcular el tonelaje en pedidos y remitos</span>
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.code.trim() || !form.name.trim()}>Guardar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        itemName={`${deletingItem?.code} · ${deletingItem?.name}`}
      />
    </div>
  )
}
