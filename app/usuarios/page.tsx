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
import type { User, UserRole, Section } from '@/lib/types'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  operador: 'Operador',
}

const SECTION_LABELS: Record<Section, string> = {
  maestros: 'Maestros',
  mantenimiento: 'Mantenimiento',
  administracion: 'Administración',
  informes: 'Informes',
}

const ALL_SECTIONS: Section[] = ['maestros', 'mantenimiento', 'administracion', 'informes']

export default function UsuariosPage() {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<User | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'operador' as UserRole, permissions: [] as Section[] })
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
    setForm({ name: '', email: '', role: 'operador', permissions: [] })
    setSheetOpen(true)
  }

  function openEdit(item: User) {
    setEditingItem(item)
    setForm({ name: item.name, email: item.email, role: item.role, permissions: item.permissions })
    setSheetOpen(true)
  }

  function togglePermission(section: Section) {
    setForm(p => ({
      ...p,
      permissions: p.permissions.includes(section)
        ? p.permissions.filter(s => s !== section)
        : [...p.permissions, section],
    }))
  }

  function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return
    const data = { ...form, name: form.name.trim(), email: form.email.trim(), permissions: form.role === 'admin' ? ALL_SECTIONS : form.permissions }
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...data } : i))
    } else {
      setItems(prev => [...prev, { id: `usr${Date.now()}`, ...data }])
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
        <span className={cn('badge', i.role === 'admin' ? 'badge-blue' : 'badge-slate')}>
          {ROLE_LABELS[i.role]}
        </span>
      ),
    },
    {
      key: 'permissions', header: 'Secciones',
      cell: i => i.role === 'admin' ? (
        <span className="text-[11px] text-slate-400">Todas</span>
      ) : i.permissions.length === 0 ? (
        <span className="text-[11px] text-slate-300">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {i.permissions.map(p => (
            <span key={p} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {SECTION_LABELS[p]}
            </span>
          ))}
        </div>
      ),
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
          <div className="sheet-body">
            <div className="form-field">
              <Label className="form-label">Nombre</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Juan García" autoFocus />
            </div>
            <div className="form-field">
              <Label className="form-label">Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="usuario@empresa.com" />
            </div>
            <div className="form-field">
              <Label className="form-label">Rol</Label>
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: (v ?? 'operador') as UserRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="form-field">
              <Label className="form-label">Acceso a secciones</Label>
              <div className="flex flex-col gap-1.5">
                {ALL_SECTIONS.map(section => {
                  const checked = form.role === 'admin' || form.permissions.includes(section)
                  const disabled = form.role === 'admin'
                  return (
                    <label
                      key={section}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-md',
                        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-100',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => togglePermission(section)}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-[12px] text-slate-700">{SECTION_LABELS[section]}</span>
                    </label>
                  )
                })}
              </div>
              {form.role === 'admin' && (
                <p className="form-hint">Los administradores tienen acceso a todas las secciones.</p>
              )}
            </div>
          </div>
          <SheetFooter className="sheet-section">
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
