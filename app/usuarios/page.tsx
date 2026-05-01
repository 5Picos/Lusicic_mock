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
import { users as initialItems } from '@/lib/mock-data'
import type { User, UserRole } from '@/lib/types'
import { Plus } from 'lucide-react'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  operador: 'Operador',
}

export default function UsuariosPage() {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<User | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'operador' as UserRole })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    items.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  )

  function openNew() {
    setEditingItem(null)
    setForm({ name: '', email: '', role: 'operador' })
    setSheetOpen(true)
  }

  function openEdit(item: User) {
    setEditingItem(item)
    setForm({ name: item.name, email: item.email, role: item.role })
    setSheetOpen(true)
  }

  function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...form, name: form.name.trim(), email: form.email.trim() } : i))
    } else {
      setItems(prev => [...prev, { id: `usr${Date.now()}`, ...form, name: form.name.trim(), email: form.email.trim() }])
    }
    setSheetOpen(false)
  }

  function handleDelete() {
    setItems(prev => prev.filter(i => i.id !== deleteId))
    setDeleteId(null)
  }

  const deletingItem = items.find(i => i.id === deleteId)

  const columns: Column<User>[] = [
    { key: 'name',  header: 'Nombre', cell: i => <span className="font-medium text-slate-800">{i.name}</span> },
    { key: 'email', header: 'Email',  cell: i => <span className="text-slate-500">{i.email}</span> },
    {
      key: 'role', header: 'Rol',
      cell: i => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          i.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {ROLE_LABELS[i.role]}
        </span>
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
        title="Usuarios"
        action={<Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Nuevo usuario</Button>}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={i => i.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o email..."
        emptyMessage="Sin usuarios"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] flex flex-col">
          <SheetHeader><SheetTitle>{editingItem ? 'Editar usuario' : 'Nuevo usuario'}</SheetTitle></SheetHeader>
          <div className="flex flex-col gap-4 p-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Nombre</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Juan García" autoFocus />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="usuario@empresa.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-slate-500">Rol</Label>
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: (v ?? 'operador') as UserRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || !form.email.trim()}>Guardar</Button>
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
