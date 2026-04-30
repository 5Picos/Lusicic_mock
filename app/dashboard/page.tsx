import PageHeader from '@/components/PageHeader'
import SummaryCard from '@/components/SummaryCard'
import DataTable, { Column } from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import {
  trucks, drivers,
  assignedMaintenances, maintenanceRecords, maintenanceTypes,
  driverExpiryAssigned, expiryRecords, driverExpiryTypes,
} from '@/lib/mock-data'
import {
  computeTruckAlertState,
  computeDriverAlertState,
  compareAlertState,
} from '@/lib/alert-engine'
import type { AlertState } from '@/lib/types'

const TODAY = new Date().toISOString().split('T')[0]

interface TruckAlertRow {
  id: string
  plate: string
  maintenanceName: string
  state: AlertState
  nextDueKm: number | null
  nextDueDate: string | null
  kmRemaining: number | null
  daysRemaining: number | null
}

function buildTruckRows(): TruckAlertRow[] {
  const rows: TruckAlertRow[] = []
  for (const truck of trucks) {
    const assignments = assignedMaintenances.filter(a => a.truckId === truck.id && a.active)
    for (const assignment of assignments) {
      const lastRecord = maintenanceRecords
        .filter(r => r.truckId === truck.id && r.maintenanceTypeId === assignment.maintenanceTypeId)
        .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null

      const state = computeTruckAlertState(truck, assignment, lastRecord, TODAY)
      const mt = maintenanceTypes.find(m => m.id === assignment.maintenanceTypeId)!

      const nextDueKm = lastRecord && assignment.kmInterval
        ? lastRecord.kmAtMoment + assignment.kmInterval : null
      const kmRemaining = nextDueKm !== null ? nextDueKm - truck.realKm : null

      const nextDueDate = lastRecord && assignment.daysInterval
        ? (() => {
            const d = new Date(lastRecord.date)
            d.setDate(d.getDate() + assignment.daysInterval!)
            return d.toISOString().split('T')[0]
          })() : null
      const daysRemaining = nextDueDate
        ? Math.round((new Date(nextDueDate).getTime() - new Date(TODAY).getTime()) / 86_400_000)
        : null

      rows.push({ id: `${truck.id}-${assignment.id}`, plate: truck.plate, maintenanceName: mt.name, state, nextDueKm, nextDueDate, kmRemaining, daysRemaining })
    }
  }
  return rows.sort((a, b) => compareAlertState(a.state, b.state))
}

interface DriverAlertRow {
  id: string
  driverName: string
  expiryTypeName: string
  state: AlertState
  nextDueDate: string | null
  daysRemaining: number | null
}

function buildDriverRows(): DriverAlertRow[] {
  const rows: DriverAlertRow[] = []
  for (const driver of drivers) {
    const assignments = driverExpiryAssigned.filter(a => a.driverId === driver.id && a.active)
    for (const assignment of assignments) {
      const lastRecord = expiryRecords
        .filter(r => r.driverId === driver.id && r.expiryTypeId === assignment.expiryTypeId)
        .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null

      const state = computeDriverAlertState(assignment, lastRecord, TODAY)
      const et = driverExpiryTypes.find(t => t.id === assignment.expiryTypeId)!

      const nextDueDate = lastRecord
        ? (() => {
            const d = new Date(lastRecord.date)
            d.setDate(d.getDate() + assignment.daysInterval)
            return d.toISOString().split('T')[0]
          })() : null
      const daysRemaining = nextDueDate
        ? Math.round((new Date(nextDueDate).getTime() - new Date(TODAY).getTime()) / 86_400_000)
        : null

      rows.push({ id: `${driver.id}-${assignment.id}`, driverName: driver.name, expiryTypeName: et.name, state, nextDueDate, daysRemaining })
    }
  }
  return rows.sort((a, b) => compareAlertState(a.state, b.state))
}

const ROW_CLASS: Record<AlertState, string> = {
  overdue:    'bg-red-50 border-l-[3px] border-l-red-600',
  upcoming:   'bg-amber-50 border-l-[3px] border-l-amber-500',
  ok:         '',
  no_history: 'bg-slate-50',
}

export default function DashboardPage() {
  const truckRows = buildTruckRows()
  const driverRows = buildDriverRows()
  const allStates = [...truckRows.map(r => r.state), ...driverRows.map(r => r.state)]

  const counts = {
    overdue:    allStates.filter(s => s === 'overdue').length,
    upcoming:   allStates.filter(s => s === 'upcoming').length,
    ok:         allStates.filter(s => s === 'ok').length,
    no_history: allStates.filter(s => s === 'no_history').length,
  }

  const truckColumns: Column<TruckAlertRow>[] = [
    { key: 'plate',    header: 'Camión',       cell: r => <span className="font-semibold text-slate-800">{r.plate}</span> },
    { key: 'type',     header: 'Tipo',         cell: r => <span className="text-slate-500">{r.maintenanceName}</span> },
    { key: 'state',    header: 'Estado',       cell: r => <StatusBadge variant="alert" state={r.state} /> },
    { key: 'nextKm',   header: 'Próx. km',     className: 'text-right', cell: r => <span className="tabular-nums text-slate-500">{r.nextDueKm?.toLocaleString('es-AR') ?? '—'}</span> },
    { key: 'nextDate', header: 'Próx. fecha',  className: 'text-right', cell: r => <span className="tabular-nums text-slate-500">{r.nextDueDate ?? '—'}</span> },
    {
      key: 'remaining', header: 'Restan', className: 'text-right',
      cell: r => {
        if (r.state === 'no_history') return <span className="text-slate-400">—</span>
        const km = r.kmRemaining !== null
          ? <span className={r.kmRemaining <= 0 ? 'text-red-600 font-semibold' : 'text-slate-700'}>{r.kmRemaining.toLocaleString('es-AR')} km</span>
          : null
        const days = r.daysRemaining !== null
          ? <span className={r.daysRemaining <= 0 ? 'text-red-600 font-semibold' : 'text-slate-700'}>{r.daysRemaining} días</span>
          : null
        return <div className="flex flex-col items-end gap-0.5">{km}{days}</div>
      },
    },
  ]

  const driverColumns: Column<DriverAlertRow>[] = [
    { key: 'driver', header: 'Chofer',         cell: r => <span className="font-semibold text-slate-800">{r.driverName}</span> },
    { key: 'type',   header: 'Documento',      cell: r => <span className="text-slate-500">{r.expiryTypeName}</span> },
    { key: 'state',  header: 'Estado',         cell: r => <StatusBadge variant="alert" state={r.state} /> },
    { key: 'date',   header: 'Próx. fecha',    className: 'text-right', cell: r => <span className="tabular-nums text-slate-500">{r.nextDueDate ?? '—'}</span> },
    {
      key: 'days', header: 'Días restantes', className: 'text-right',
      cell: r => r.daysRemaining === null
        ? <span className="text-slate-400">—</span>
        : <span className={r.daysRemaining <= 0 ? 'text-red-600 font-semibold tabular-nums' : 'text-slate-700 tabular-nums'}>{r.daysRemaining}</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Alertas de mantenimiento y vencimientos — ${TODAY}`}
      />

      <div className="grid grid-cols-4 gap-2.5 mb-5">
        <SummaryCard variant="alert" state="overdue"    value={counts.overdue}    label="Vencidos" />
        <SummaryCard variant="alert" state="upcoming"   value={counts.upcoming}   label="Próximos" />
        <SummaryCard variant="alert" state="ok"         value={counts.ok}         label="Al día" />
        <SummaryCard variant="alert" state="no_history" value={counts.no_history} label="Sin historial" />
      </div>

      <div className="mb-4">
        <DataTable
          title="Mantenimiento de camiones"
          columns={truckColumns}
          rows={truckRows}
          getRowId={r => r.id}
          getRowClassName={r => ROW_CLASS[r.state]}
          emptyMessage="Sin mantenimientos asignados"
        />
      </div>

      <DataTable
        title="Vencimientos de choferes"
        columns={driverColumns}
        rows={driverRows}
        getRowId={r => r.id}
        getRowClassName={r => ROW_CLASS[r.state]}
        emptyMessage="Sin vencimientos asignados"
      />
    </div>
  )
}
