'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { maintenanceRecords, expiryRecords, trucks, drivers, maintenanceTypes, maintenanceCategories, driverExpiryTypes } from '@/lib/mock-data'

export default function HistorialPage() {
  const [selectedTruckId, setSelectedTruckId] = useState(trucks[0]?.id ?? '')
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id ?? '')

  const truckRecords = maintenanceRecords
    .filter(r => r.truckId === selectedTruckId)
    .sort((a, b) => b.date.localeCompare(a.date))

  const driverRecords = expiryRecords
    .filter(r => r.driverId === selectedDriverId)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <PageHeader title="Historial" />
      <Tabs defaultValue="camiones">
        <TabsList className="mb-4">
          <TabsTrigger value="camiones">Camiones</TabsTrigger>
          <TabsTrigger value="choferes">Choferes</TabsTrigger>
        </TabsList>

        <TabsContent value="camiones">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[12px] font-medium text-slate-500">Camión:</span>
            <Select value={selectedTruckId} onValueChange={v => setSelectedTruckId(v ?? trucks[0]?.id ?? '')}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {trucks.map(t => <SelectItem key={t.id} value={t.id}>{t.plate} — {t.brand} {t.model}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="data-card">
            {truckRecords.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-[12px]">Sin historial de mantenimiento para este camión</div>
            ) : (
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="tbl-th text-left">Fecha</th>
                    <th className="tbl-th text-left">Categoría</th>
                    <th className="tbl-th text-left">Tipo</th>
                    <th className="tbl-th text-left">Chofer</th>
                    <th className="tbl-th text-right">Km</th>
                    <th className="tbl-th text-left">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {truckRecords.map(r => (
                    <tr key={r.id} className="border-b border-slate-100 last:border-0">
                      <td className="tbl-td tabular-nums text-slate-500">{r.date}</td>
                      <td className="tbl-td text-slate-500">{maintenanceCategories.find(c => c.id === maintenanceTypes.find(mt => mt.id === r.maintenanceTypeId)?.categoryId)?.name ?? '—'}</td>
                      <td className="tbl-td font-medium text-slate-800">{maintenanceTypes.find(mt => mt.id === r.maintenanceTypeId)?.name ?? '—'}</td>
                      <td className="tbl-td text-slate-500">{drivers.find(d => d.id === r.driverId)?.name ?? '—'}</td>
                      <td className="tbl-td text-right tabular-nums text-slate-600">{r.kmAtMoment.toLocaleString('es-AR')}</td>
                      <td className="tbl-td text-[11px] text-slate-400">{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="choferes">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[12px] font-medium text-slate-500">Chofer:</span>
            <Select value={selectedDriverId} onValueChange={v => setSelectedDriverId(v ?? drivers[0]?.id ?? '')}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="data-card">
            {driverRecords.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-[12px]">Sin historial de vencimientos para este chofer</div>
            ) : (
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="tbl-th text-left">Fecha</th>
                    <th className="tbl-th text-left">Documento</th>
                    <th className="tbl-th text-left">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {driverRecords.map(r => (
                    <tr key={r.id} className="border-b border-slate-100 last:border-0">
                      <td className="tbl-td tabular-nums text-slate-500">{r.date}</td>
                      <td className="tbl-td font-medium text-slate-800">{driverExpiryTypes.find(t => t.id === r.expiryTypeId)?.name ?? '—'}</td>
                      <td className="tbl-td text-[11px] text-slate-400">{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
