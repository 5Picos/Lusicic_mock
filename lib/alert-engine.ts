import type {
  AlertState, Truck, AssignedMaintenance, MaintenanceRecord,
  DriverExpiryAssigned, ExpiryRecord,
} from './types'

const PRIORITY: Record<AlertState, number> = {
  overdue: 3, upcoming: 2, ok: 1, no_history: 0,
}

export function compareAlertState(a: AlertState, b: AlertState): number {
  return PRIORITY[b] - PRIORITY[a]
}

function mostCritical(a: AlertState, b: AlertState): AlertState {
  return PRIORITY[a] >= PRIORITY[b] ? a : b
}

function daysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000
  )
}

function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function computeTruckAlertState(
  truck: Truck,
  assignment: AssignedMaintenance,
  lastRecord: MaintenanceRecord | null,
  today: string,
): AlertState {
  if (!lastRecord) return 'no_history'

  let kmState: AlertState = 'ok'
  let dateState: AlertState = 'ok'

  if (assignment.kmInterval !== null && assignment.alertKmBefore !== null) {
    const remaining = lastRecord.kmAtMoment + assignment.kmInterval - truck.realKm
    if (remaining <= 0) kmState = 'overdue'
    else if (remaining <= assignment.alertKmBefore) kmState = 'upcoming'
  }

  if (assignment.daysInterval !== null && assignment.alertDaysBefore !== null) {
    const remaining = daysBetween(today, addDays(lastRecord.date, assignment.daysInterval))
    if (remaining <= 0) dateState = 'overdue'
    else if (remaining <= assignment.alertDaysBefore) dateState = 'upcoming'
  }

  return mostCritical(kmState, dateState)
}

export function computeDriverAlertState(
  assignment: DriverExpiryAssigned,
  lastRecord: ExpiryRecord | null,
  today: string,
): AlertState {
  if (!lastRecord) return 'no_history'
  const remaining = daysBetween(today, addDays(lastRecord.date, assignment.daysInterval))
  if (remaining <= 0) return 'overdue'
  if (remaining <= assignment.alertDaysBefore) return 'upcoming'
  return 'ok'
}

export function worstState(states: AlertState[]): AlertState {
  return states.reduce<AlertState>(
    (acc, s) => mostCritical(acc, s),
    'no_history',
  )
}
