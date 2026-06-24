'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { maintenanceCategories as initialItems, maintenanceTypes } from '@/lib/mock-data'
import type { MaintenanceCategory } from '@/lib/types'
import { Plus } from 'lucide-react'

export default function CategoriasMantenimientoPage() {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MaintenanceCategory | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  )

  const typeCount = (categoryId: string) => maintenanceTypes.filter(mt => mt.categoryId === categoryId).length

  function openNew() {
    setEditingItem(null)
    setForm({ name: '', description: '' })
    setSheetOpen(true)
  }

  function openEdit(item: MaintenanceCategory) {
    setEditingItem(item)
    setForm({ name: item.name, description: item.description })
    setSheetOpen(true)
  }

  function handleSave() {
    if (!form.name.trim()) return
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, name: form.name.trim(), description: form.description.trim() } : i))
    } else {
      setItems(prev => [...prev, { id: `mc${Date.now()}`, name: form.name.trim(), description: form.description.trim() }])
    }
    setSheetOpen(false)
  }

  function handleDelete() {
    setItems(prev => prev.filter(i => i.id !== deleteId))
    setDeleteId(null)
  }

  const deletingItem = items.find(i => i.id === deleteId)
  const deletingInUse = deletingItem ? typeCount(deletingItem.id) > 0 : false

  const columns: Column<MaintenanceCategory>[] = [
    { key: 'name',        header: 'Nombre',      cell: i => <span className="font-medium text-slate-800">{i.name}</span> },
    { key: 'description', header: 'Descripción', cell: i => <span className="text-slate-500">{i.description || '—'}</span> },
    {
      key: 'types', header: 'Tipos asignados', className: 'text-right',
      cell: i => <span className="tabular-nums text-slate-600">{typeCount(i.id)}</span>,
    },
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
        title="Categorías de mantenimiento"
        subtitle="Agrupan los tipos de mantenimiento (reparaciones) del catálogo."
        action={<Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Nueva categoría</Button>}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={i => i.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar categoría..."
        emptyMessage="Sin categorías"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] flex flex-col">
          <SheetHeader><SheetTitle>{editingItem ? 'Editar categoría' : 'Nueva categoría'}</SheetTitle></SheetHeader>
          <div className="sheet-body">
            <div className="form-field">
              <Label className="form-label">Nombre</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Motor" autoFocus />
            </div>
            <div className="form-field">
              <Label className="form-label">Descripción</Label>
              <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descripción opcional" />
            </div>
          </div>
          <SheetFooter className="sheet-section">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>Guardar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <DeleteConfirmDialog
        open={!!deleteId && !deletingInUse}
        onOpenChange={open => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        itemName={deletingItem?.name}
      />
      <Dialog open={!!deleteId && deletingInUse} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>No se puede eliminar</DialogTitle></DialogHeader>
          <p className="text-[13px] text-slate-600 py-2">
            La categoría &quot;{deletingItem?.name}&quot; tiene {deletingItem ? typeCount(deletingItem.id) : 0} tipo(s) de mantenimiento asignado(s). Reasigná esos tipos a otra categoría antes de eliminarla.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
