'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import DataTable, { Column } from '@/components/DataTable'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { drivers as initialItems, devices as initialDevices, enrollmentCodes as initialCodes, trucks } from '@/lib/mock-data'
import type { Driver, Device, EnrollmentCode } from '@/lib/types'
import { Plus, Smartphone, Copy } from 'lucide-react'

const NO_TRUCK = 'none'

function newCode(driverId: string): EnrollmentCode {
  const now = new Date()
  const expires = new Date(now.getTime() + 48 * 60 * 60 * 1000)
  return {
    id: `ec${Date.now()}`,
    driverId,
    code: String(Math.floor(100000 + Math.random() * 900000)),
    createdAt: now.toISOString().split('T')[0],
    expiresAt: expires.toISOString().split('T')[0],
    usedAt: null,
  }
}

export default function ChoferesPage() {
  const [items, setItems] = useState(initialItems)
  const [devices, setDevices] = useState(initialDevices)
  const [codes, setCodes] = useState(initialCodes)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Driver | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', defaultTruckId: NO_TRUCK })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [revokeDeviceId, setRevokeDeviceId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    items.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  )

  const activeDevice = (driverId: string) => devices.find(d => d.driverId === driverId && d.status === 'active')
  const pendingCode = (driverId: string) => codes.find(c => c.driverId === driverId && !c.usedAt && c.expiresAt >= new Date().toISOString().split('T')[0])
  const revokedDevices = (driverId: string) => devices.filter(d => d.driverId === driverId && d.status === 'revoked')

  function openNew() {
    setEditingItem(null)
    setForm({ name: '', phone: '', email: '', defaultTruckId: NO_TRUCK })
    setSheetOpen(true)
  }

  function openEdit(item: Driver) {
    setEditingItem(item)
    setForm({ name: item.name, phone: item.phone, email: item.email, defaultTruckId: item.defaultTruckId ?? NO_TRUCK })
    setSheetOpen(true)
  }

  function handleSave() {
    if (!form.name.trim()) return
    const parsed = {
      name: form.name.trim(),
      phone: form.phone,
      email: form.email,
      defaultTruckId: form.defaultTruckId === NO_TRUCK ? null : form.defaultTruckId,
    }
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...parsed } : i))
    } else {
      setItems(prev => [...prev, { id: `dr${Date.now()}`, ...parsed }])
    }
    setSheetOpen(false)
  }

  function handleDelete() {
    setItems(prev => prev.filter(i => i.id !== deleteId))
    setDeleteId(null)
  }

  function generateCode(driverId: string) {
    setCodes(prev => [...prev.filter(c => !(c.driverId === driverId && !c.usedAt)), newCode(driverId)])
  }

  function cancelCode(driverId: string) {
    setCodes(prev => prev.filter(c => !(c.driverId === driverId && !c.usedAt)))
  }

  function revokeDevice() {
    if (!revokeDeviceId) return
    const today = new Date().toISOString().split('T')[0]
    setDevices(prev => prev.map(d => d.id === revokeDeviceId
      ? { ...d, status: 'revoked' as const, revokedAt: today, revokedReason: 'Baja manual' }
      : d
    ))
    setRevokeDeviceId(null)
  }

  // Demo: simula que el chofer canjeó el código desde la app.
  // Al canjearse, el dispositivo activo anterior queda revocado automáticamente.
  function simulateEnroll(driverId: string) {
    const code = pendingCode(driverId)
    if (!code) return
    const today = new Date().toISOString().split('T')[0]
    setCodes(prev => prev.map(c => c.id === code.id ? { ...c, usedAt: today } : c))
    setDevices(prev => [
      ...prev.map(d => d.driverId === driverId && d.status === 'active'
        ? { ...d, status: 'revoked' as const, revokedAt: today, revokedReason: 'Reemplazado por nuevo dispositivo' }
        : d
      ),
      {
        id: `dev${Date.now()}`,
        driverId,
        installationId: crypto.randomUUID(),
        platform: 'android' as const,
        model: 'Dispositivo de prueba',
        status: 'active' as const,
        enrolledAt: today,
        lastSeenAt: today,
        revokedAt: null,
        revokedReason: null,
      },
    ])
  }

  const deletingItem = items.find(i => i.id === deleteId)
  const revokingDevice = devices.find(d => d.id === revokeDeviceId)

  const columns: Column<Driver>[] = [
    { key: 'name',  header: 'Nombre',   cell: i => <span className="font-medium text-slate-800">{i.name}</span> },
    { key: 'phone', header: 'Teléfono', cell: i => <span className="text-slate-500">{i.phone || '—'}</span> },
    { key: 'email', header: 'Email',    cell: i => <span className="text-slate-500">{i.email || '—'}</span> },
    {
      key: 'defaultTruck', header: 'Camión por defecto',
      cell: i => {
        const truck = trucks.find(t => t.id === i.defaultTruckId)
        return truck
          ? <span className="font-mono text-slate-600">{truck.plate}</span>
          : <span className="text-slate-400">—</span>
      },
    },
    {
      key: 'device', header: 'Dispositivo',
      cell: i => {
        if (activeDevice(i.id)) return <span className="badge badge-green gap-1"><Smartphone size={10} /> VINCULADO</span>
        if (pendingCode(i.id)) return <span className="badge badge-amber">CÓDIGO PENDIENTE</span>
        return <span className="badge badge-slate">SIN VINCULAR</span>
      },
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

  const editingDevice = editingItem ? activeDevice(editingItem.id) : undefined
  const editingCode = editingItem ? pendingCode(editingItem.id) : undefined
  const editingRevoked = editingItem ? revokedDevices(editingItem.id) : []

  return (
    <div>
      <PageHeader
        title="Choferes"
        action={<Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Nuevo chofer</Button>}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={i => i.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o email..."
        emptyMessage="Sin choferes"
      />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[440px] flex flex-col overflow-y-auto">
          <SheetHeader><SheetTitle>{editingItem ? 'Editar chofer' : 'Nuevo chofer'}</SheetTitle></SheetHeader>
          <div className="sheet-body">
            <div className="form-field">
              <Label className="form-label">Nombre</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Carlos Méndez" autoFocus />
            </div>
            <div className="form-field">
              <Label className="form-label">Teléfono</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="1145678901" />
            </div>
            <div className="form-field">
              <Label className="form-label">Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="chofer@mail.com" />
            </div>
            <div className="form-field">
              <Label className="form-label">Camión por defecto</Label>
              <Select value={form.defaultTruckId} onValueChange={v => setForm(p => ({ ...p, defaultTruckId: v ?? NO_TRUCK }))}>
                <SelectTrigger><SelectValue placeholder="Sin camión asignado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_TRUCK}>Sin camión asignado</SelectItem>
                  {trucks.map(t => <SelectItem key={t.id} value={t.id}>{t.plate} — {t.brand} {t.model}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="form-hint">Se preselecciona en la app al crear una nota de falla.</p>
            </div>

            {editingItem && (
              <div className="info-panel">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase text-slate-500">
                  <Smartphone size={12} /> Dispositivo
                </div>

                {editingDevice ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-slate-700">{editingDevice.model} <span className="text-slate-400">({editingDevice.platform === 'android' ? 'Android' : 'iOS'})</span></div>
                    <div className="text-[11px] text-slate-500">Vinculado el {editingDevice.enrolledAt} · Última actividad: {editingDevice.lastSeenAt ?? 'nunca'}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setRevokeDeviceId(editingDevice.id)}>Dar de baja</Button>
                      {!editingCode && <Button size="sm" variant="outline" onClick={() => generateCode(editingItem.id)}>Generar código de reemplazo</Button>}
                    </div>
                  </div>
                ) : !editingCode ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-slate-400">Sin dispositivo vinculado</div>
                    <div><Button size="sm" variant="outline" onClick={() => generateCode(editingItem.id)}>Generar código</Button></div>
                  </div>
                ) : null}

                {editingCode && (
                  <div className="flex flex-col gap-2 rounded-md bg-amber-50 border border-amber-200 p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold tracking-widest text-amber-800">{editingCode.code}</span>
                      <button onClick={() => navigator.clipboard.writeText(editingCode.code)} className="text-amber-600 hover:text-amber-800" title="Copiar código"><Copy size={14} /></button>
                    </div>
                    <div className="text-[11px] text-amber-700">Vence el {editingCode.expiresAt} · un solo uso</div>
                    {editingDevice && (
                      <div className="text-[11px] text-amber-700 font-medium">⚠ Al canjearse, el dispositivo actual quedará dado de baja.</div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => generateCode(editingItem.id)}>Regenerar</Button>
                      <Button size="sm" variant="outline" onClick={() => cancelCode(editingItem.id)}>Anular</Button>
                      <Button size="sm" variant="outline" className="text-blue-600" onClick={() => simulateEnroll(editingItem.id)}>Simular canje (demo)</Button>
                    </div>
                  </div>
                )}

                {editingRevoked.length > 0 && (
                  <details className="text-[11px] text-slate-500">
                    <summary className="cursor-pointer font-medium">Historial ({editingRevoked.length})</summary>
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {editingRevoked.map(d => (
                        <li key={d.id}>{d.model} — baja el {d.revokedAt} ({d.revokedReason})</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
          <SheetFooter className="sheet-section">
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
      <Dialog open={!!revokeDeviceId} onOpenChange={open => !open && setRevokeDeviceId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Dar de baja dispositivo</DialogTitle></DialogHeader>
          <p className="text-[13px] text-slate-600 py-2">
            ¿Dar de baja {revokingDevice ? `"${revokingDevice.model}"` : 'el dispositivo'}?
            La app dejará de poder crear notas de inmediato. Para volver a habilitar al chofer habrá que generar un nuevo código.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDeviceId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={revokeDevice}>Dar de baja</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
