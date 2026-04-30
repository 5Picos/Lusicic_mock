import { describe, test, expect } from 'vitest'
import {
  computeTruckAlertState,
  computeDriverAlertState,
  compareAlertState,
  worstState,
} from '../lib/alert-engine'
import type {
  Truck, AssignedMaintenance, MaintenanceRecord,
  DriverExpiryAssigned, ExpiryRecord,
} from '../lib/types'

const TODAY = '2026-04-30'

const truck: Truck = {
  id: 't1', plate: 'ABC 123', description: '', brand: 'Mercedes', model: 'Actros',
  year: 2020, realKm: 50_000, estimatedKm: 50_500,
}

const assignment: AssignedMaintenance = {
  id: 'a1', truckId: 't1', maintenanceTypeId: 'mt1', active: true,
  kmInterval: 10_000, daysInterval: 180,
  alertKmBefore: 1_000, alertDaysBefore: 15,
}

const baseRecord: MaintenanceRecord = {
  id: 'r1', truckId: 't1', maintenanceTypeId: 'mt1',
  driverId: 'd1', date: '2026-01-01', kmAtMoment: 45_000, notes: '',
}

describe('computeTruckAlertState', () => {
  test('no_history when no record', () => {
    expect(computeTruckAlertState(truck, assignment, null, TODAY)).toBe('no_history')
  })

  test('ok when far from both thresholds', () => {
    // nextDueKm = 55000, realKm = 50000, remaining = 5000 > 1000
    // nextDueDate = 2026-07-01, daysRemaining > 15
    expect(computeTruckAlertState(truck, assignment, baseRecord, TODAY)).toBe('ok')
  })

  test('upcoming when km within alert threshold', () => {
    const closeTruck = { ...truck, realKm: 54_200 }
    // remaining = 55000 - 54200 = 800 < 1000
    expect(computeTruckAlertState(closeTruck, assignment, baseRecord, TODAY)).toBe('upcoming')
  })

  test('overdue when km exceeded', () => {
    const overTruck = { ...truck, realKm: 56_000 }
    // remaining = 55000 - 56000 = -1000
    expect(computeTruckAlertState(overTruck, assignment, baseRecord, TODAY)).toBe('overdue')
  })

  test('overdue wins over upcoming', () => {
    const overTruck = { ...truck, realKm: 56_000 }
    const recentRecord = { ...baseRecord, date: '2026-04-20' }
    // km overdue, date upcoming (10 days from now, < 15 threshold)
    expect(computeTruckAlertState(overTruck, assignment, recentRecord, TODAY)).toBe('overdue')
  })

  test('ignores km axis when kmInterval is null', () => {
    const kmlessAssignment = { ...assignment, kmInterval: null, alertKmBefore: null }
    // only date axis: record 2026-01-01 + 180 days = 2026-06-30, far → ok
    expect(computeTruckAlertState(truck, kmlessAssignment, baseRecord, TODAY)).toBe('ok')
  })
})

describe('computeDriverAlertState', () => {
  const da: DriverExpiryAssigned = {
    id: 'da1', driverId: 'd1', expiryTypeId: 'et1', active: true,
    daysInterval: 365, alertDaysBefore: 30,
  }

  const baseExpiry: ExpiryRecord = {
    id: 'er1', driverId: 'd1', expiryTypeId: 'et1', date: '2026-01-01', notes: '',
  }

  test('no_history when no record', () => {
    expect(computeDriverAlertState(da, null, TODAY)).toBe('no_history')
  })

  test('ok when far from due', () => {
    // nextDue = 2027-01-01, far → ok
    expect(computeDriverAlertState(da, baseExpiry, TODAY)).toBe('ok')
  })

  test('upcoming within threshold', () => {
    const record = { ...baseExpiry, date: '2025-05-10' }
    // nextDue = 2026-05-10, 10 days remaining < 30 → upcoming
    expect(computeDriverAlertState(da, record, TODAY)).toBe('upcoming')
  })

  test('overdue when past due', () => {
    const record = { ...baseExpiry, date: '2025-01-01' }
    // nextDue = 2026-01-01, already past → overdue
    expect(computeDriverAlertState(da, record, TODAY)).toBe('overdue')
  })
})

describe('compareAlertState', () => {
  test('sorts overdue before upcoming before ok before no_history', () => {
    const states = ['ok', 'no_history', 'overdue', 'upcoming'] as const
    const sorted = [...states].sort(compareAlertState)
    expect(sorted).toEqual(['overdue', 'upcoming', 'ok', 'no_history'])
  })
})

describe('worstState', () => {
  test('returns most critical state in array', () => {
    expect(worstState(['ok', 'upcoming', 'no_history'])).toBe('upcoming')
    expect(worstState(['ok', 'overdue', 'upcoming'])).toBe('overdue')
    expect(worstState(['no_history'])).toBe('no_history')
    expect(worstState([])).toBe('no_history')
  })
})
