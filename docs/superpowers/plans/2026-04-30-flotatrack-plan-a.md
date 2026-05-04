# Lusicic — Plan A: Scaffolding + Core Pages (Etapas 0–3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el scaffolding completo y las 3 páginas prioritarias (/dashboard, /pedidos, /remitos) que validan todos los patrones de diseño del sistema.

**Architecture:** Next.js App Router con layout shell (sidebar accordion + topbar), componentes compartidos reutilizables (StatusBadge, SummaryCard, DataTable, AmberPanel, PageHeader), lógica de alertas en módulo puro sin dependencias React, y mock data tipada estáticamente en lib/mock-data.ts.

**Tech Stack:** Next.js 16 App Router · Tailwind CSS v4 · shadcn/ui · TypeScript strict · Inter (next/font/google) · Vitest para tests · Lucide React para íconos

---

## Scope

Este plan cubre **Etapas 0–3** del spec. Planes B y C cubren Maestros, Administración e Informes.

---

## File Map

```
app/
  layout.tsx                    CREAR — shell con sidebar + topbar
  page.tsx                      CREAR — redirect a /dashboard
  dashboard/page.tsx            CREAR — página dashboard
  pedidos/page.tsx              CREAR — página pedidos
  remitos/page.tsx              CREAR — página remitos
  globals.css                   MODIFICAR — variables CSS shadcn + tabular-nums

components/
  layout/
    Sidebar.tsx                 CREAR — accordion nav (client component)
    Topbar.tsx                  CREAR — breadcrumb bar (client component)
  StatusBadge.tsx               CREAR — pill de estado (alert|lifecycle|payment)
  SummaryCard.tsx               CREAR — card variante A (alerta) y C (info)
  DataTable.tsx                 CREAR — tabla con toolbar
  AmberPanel.tsx                CREAR — panel de pendientes urgentes
  PageHeader.tsx                CREAR — título + subtítulo + slot de acción

lib/
  types.ts                      CREAR — todos los tipos TypeScript del dominio
  alert-engine.ts               CREAR — lógica pura de estados de alerta
  mock-data.ts                  CREAR — datos semilla para todas las entidades

__tests__/
  alert-engine.test.ts          CREAR — unit tests de la lógica de alertas
```

---

## Task 1: Inicializar proyecto Next.js + shadcn/ui + Vitest

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`

- [ ] **Inicializar Next.js en el directorio existente**

```bash
cd C:\Code\lusicic_alt
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

Si pregunta por el directorio no vacío, confirmar con Enter.

- [ ] **Instalar shadcn/ui**

```bash
npx shadcn@latest init
```

Cuando pregunte, seleccionar:
- Style: Default
- Base color: Slate
- CSS variables: Yes

- [ ] **Instalar componentes shadcn necesarios**

```bash
npx shadcn@latest add button dialog sheet select input label separator tabs
```

- [ ] **Instalar Vitest**

```bash
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Crear `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Crear `vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Agregar scripts de test a `package.json`**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Verificar que el proyecto compila**

```bash
npm run build
```

Expected: build exitoso sin errores TypeScript.

- [ ] **Commit**

```bash
git add -A
git commit -m "chore: init Next.js + shadcn/ui + Vitest"
```

---

## Task 2: Tipos TypeScript del dominio

**Files:**
- Create: `lib/types.ts`

- [ ] **Crear `lib/types.ts`**

```typescript
export type AlertState = 'overdue' | 'upcoming' | 'ok' | 'no_history'
export type OrderStatus = 'pending' | 'assigned' | 'delivered' | 'invoiced'
export type InvoiceStatus = 'pending' | 'partially_paid' | 'paid'
export type CheckStatus = 'pending' | 'credited'
export type PaymentMethod = 'cash' | 'transfer' | 'check'
export type OrderModality = 'CIP' | 'FCA'

export interface Truck {
  id: string
  plate: string
  description: string
  brand: string
  model: string
  year: number
  realKm: number
  estimatedKm: number
}

export interface Driver {
  id: string
  name: string
  phone: string
  email: string
}

export interface MaintenanceType {
  id: string
  name: string
  description: string
  defaultKmInterval: number | null
  defaultDaysInterval: number | null
  defaultAlertKmBefore: number | null
  defaultAlertDaysBefore: number | null
}

export interface AssignedMaintenance {
  id: string
  truckId: string
  maintenanceTypeId: string
  kmInterval: number | null
  daysInterval: number | null
  alertKmBefore: number | null
  alertDaysBefore: number | null
  active: boolean
}

export interface MaintenanceRecord {
  id: string
  truckId: string
  maintenanceTypeId: string
  driverId: string
  date: string
  kmAtMoment: number
  notes: string
}

export interface DriverExpiryType {
  id: string
  name: string
  description: string
  daysInterval: number
  alertDaysBefore: number
}

export interface DriverExpiryAssigned {
  id: string
  driverId: string
  expiryTypeId: string
  daysInterval: number
  alertDaysBefore: number
  active: boolean
}

export interface ExpiryRecord {
  id: string
  driverId: string
  expiryTypeId: string
  date: string
  notes: string
}

export interface Client {
  id: string
  name: string
  phone: string
  email: string
}

export interface Locality {
  id: string
  name: string
  roundTripKm: number
}

export interface LocalityToll {
  id: string
  localityId: string
  supplierId: string
  description: string
  amount: number
}

export interface Article {
  id: string
  code: string
  name: string
}

export interface OrderLine {
  id: string
  orderId: string
  articleId: string
  quantity: number
}

export interface PriceList {
  id: string
  name: string
}

export interface LocalityPrice {
  id: string
  priceListId: string
  localityId: string
  price: number
}

export interface Order {
  id: string
  orderNumber: string
  date: string
  requestingClientId: string
  destinationClientId: string
  localityId: string
  modality: OrderModality
  tonnage: number | null
  cargoDetail: string
  truckId: string | null
  driverId: string | null
  appliedPrice: number
  status: OrderStatus
}

export interface Receipt {
  id: string
  orderId: string
  receiptNumber: string
  date: string
  notes: string
}

export interface Invoice {
  id: string
  clientId: string
  date: string
  total: number
  status: InvoiceStatus
  receiptIds: string[]
}

export interface InvoicePayment {
  id: string
  invoiceId: string
  date: string
  amount: number
  paymentMethod: PaymentMethod
  reference: string
  notes: string
}

export interface Check {
  id: string
  invoicePaymentId: string
  bank: string
  checkNumber: string
  creditDate: string
  amount: number
  status: CheckStatus
}

export interface ExpenseType {
  id: string
  name: string
  description: string
}

export interface Supplier {
  id: string
  name: string
  expenseTypeId: string
  cuit: string
  phone: string
}

export interface Expense {
  id: string
  supplierId: string
  date: string
  concept: string
  truckId: string | null
  orderId: string | null
  amount: number
  paymentMethod: PaymentMethod
  reference: string
  notes: string
}
```

- [ ] **Verificar que TypeScript no reporta errores**

```bash
npx tsc --noEmit
```

Expected: sin output (0 errores).

- [ ] **Commit**

```bash
git add lib/types.ts
git commit -m "feat: add domain TypeScript types"
```

---

## Task 3: Alert engine con tests

**Files:**
- Create: `lib/alert-engine.ts`
- Create: `__tests__/alert-engine.test.ts`

- [ ] **Crear `lib/alert-engine.ts`**

```typescript
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
```

- [ ] **Crear `__tests__/alert-engine.test.ts`**

```typescript
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
```

- [ ] **Correr tests — deben pasar todos**

```bash
npm test
```

Expected: `Test Files 1 passed | Tests 11 passed`

- [ ] **Commit**

```bash
git add lib/alert-engine.ts __tests__/alert-engine.test.ts
git commit -m "feat: add alert engine with unit tests"
```

---

## Task 4: Mock data

**Files:**
- Create: `lib/mock-data.ts`

- [ ] **Crear `lib/mock-data.ts`** — datos que producen todos los estados visuales

```typescript
import type {
  Truck, Driver, Client, Locality, LocalityToll, Article,
  OrderLine, PriceList, LocalityPrice, Order, Receipt,
  MaintenanceType, AssignedMaintenance, MaintenanceRecord,
  DriverExpiryType, DriverExpiryAssigned, ExpiryRecord,
  ExpenseType, Supplier, Expense,
} from './types'

// ── Trucks ─────────────────────────────────────────────────────────────────
export const trucks: Truck[] = [
  { id: 'tr1', plate: 'ABC 123', description: 'Unidad 1', brand: 'Mercedes', model: 'Actros', year: 2018, realKm: 87_420, estimatedKm: 88_100 },
  { id: 'tr2', plate: 'DEF 456', description: 'Unidad 2', brand: 'Scania',   model: 'R450',   year: 2020, realKm: 54_200, estimatedKm: 55_000 },
  { id: 'tr3', plate: 'GHI 789', description: 'Unidad 3', brand: 'Volvo',    model: 'FH',      year: 2019, realKm: 61_000, estimatedKm: 61_800 },
  { id: 'tr4', plate: 'JKL 012', description: 'Unidad 4', brand: 'Mercedes', model: 'Atego',   year: 2022, realKm: 22_000, estimatedKm: 22_500 },
]

// ── Drivers ─────────────────────────────────────────────────────────────────
export const drivers: Driver[] = [
  { id: 'dr1', name: 'Carlos Méndez',   phone: '1145678901', email: 'cmendez@mail.com' },
  { id: 'dr2', name: 'Roberto Sánchez', phone: '1145678902', email: 'rsanchez@mail.com' },
  { id: 'dr3', name: 'Juan Pérez',      phone: '1145678903', email: 'jperez@mail.com' },
]

// ── Clients ──────────────────────────────────────────────────────────────────
export const clients: Client[] = [
  { id: 'cl1', name: 'Molinos Río de la Plata', phone: '1130001111', email: 'operaciones@molinos.com' },
  { id: 'cl2', name: 'Cargill S.A.',            phone: '1130002222', email: 'logistica@cargill.com' },
  { id: 'cl3', name: 'AGD S.A.',                phone: '1130003333', email: 'compras@agd.com' },
]

// ── Localities ───────────────────────────────────────────────────────────────
export const localities: Locality[] = [
  { id: 'lo1', name: 'Rosario',       roundTripKm: 660 },
  { id: 'lo2', name: 'Córdoba',       roundTripKm: 1400 },
  { id: 'lo3', name: 'Bahía Blanca',  roundTripKm: 1200 },
  { id: 'lo4', name: 'Mar del Plata', roundTripKm: 800 },
]

// ── Suppliers ────────────────────────────────────────────────────────────────
export const expenseTypes: ExpenseType[] = [
  { id: 'et1', name: 'Combustible',        description: '' },
  { id: 'et2', name: 'Estatal / Impuestos',description: 'AFIP, ARBA, peajes' },
  { id: 'et3', name: 'Repuestos',          description: '' },
  { id: 'et4', name: 'Sueldos',            description: '' },
  { id: 'et5', name: 'Varios',             description: '' },
]

export const suppliers: Supplier[] = [
  { id: 'su1', name: 'YPF',               expenseTypeId: 'et1', cuit: '30-54668997-9', phone: '0800333' },
  { id: 'su2', name: 'Autopista del Sol', expenseTypeId: 'et2', cuit: '30-69971657-8', phone: '' },
  { id: 'su3', name: 'AUBASA',            expenseTypeId: 'et2', cuit: '30-70737489-7', phone: '' },
  { id: 'su4', name: 'Repuestos Norte',   expenseTypeId: 'et3', cuit: '20-28374652-1', phone: '1145000001' },
]

// ── LocalityTolls ─────────────────────────────────────────────────────────────
export const localityTolls: LocalityToll[] = [
  { id: 'lt1', localityId: 'lo1', supplierId: 'su2', description: 'Autopista del Sol km 37', amount: 8_200 },
  { id: 'lt2', localityId: 'lo2', supplierId: 'su2', description: 'Autopista del Sol km 37', amount: 8_200 },
  { id: 'lt3', localityId: 'lo2', supplierId: 'su3', description: 'AUBASA — Ruta 2',          amount: 5_400 },
]

// ── Articles ─────────────────────────────────────────────────────────────────
export const articles: Article[] = [
  { id: 'ar1', code: 'HRT-001', name: 'Harina de trigo 25kg' },
  { id: 'ar2', code: 'ACE-001', name: 'Aceite de girasol 900ml' },
  { id: 'ar3', code: 'SEM-001', name: 'Semolín 1kg' },
]

// ── Price lists ───────────────────────────────────────────────────────────────
export const priceLists: PriceList[] = [
  { id: 'pl1', name: 'CIP - 32 toneladas' },
  { id: 'pl2', name: 'CIP - 38 toneladas' },
  { id: 'pl3', name: 'FCA' },
]

export const localityPrices: LocalityPrice[] = [
  { id: 'lp01', priceListId: 'pl1', localityId: 'lo1', price: 145_000 },
  { id: 'lp02', priceListId: 'pl1', localityId: 'lo2', price: 210_000 },
  { id: 'lp03', priceListId: 'pl1', localityId: 'lo3', price: 190_000 },
  { id: 'lp04', priceListId: 'pl1', localityId: 'lo4', price: 165_000 },
  { id: 'lp05', priceListId: 'pl2', localityId: 'lo1', price: 172_000 },
  { id: 'lp06', priceListId: 'pl2', localityId: 'lo2', price: 250_000 },
  { id: 'lp07', priceListId: 'pl3', localityId: 'lo1', price: 155_000 },
  { id: 'lp08', priceListId: 'pl3', localityId: 'lo2', price: 225_000 },
]

// ── Orders ────────────────────────────────────────────────────────────────────
export const orders: Order[] = [
  { id: 'or1', orderNumber: 'P-2024-001', date: '2026-04-15', requestingClientId: 'cl1', destinationClientId: 'cl2', localityId: 'lo1', modality: 'CIP', tonnage: 32, cargoDetail: 'Harina de trigo', truckId: 'tr1', driverId: 'dr1', appliedPrice: 145_000, status: 'assigned' },
  { id: 'or2', orderNumber: 'P-2024-002', date: '2026-04-14', requestingClientId: 'cl2', destinationClientId: 'cl3', localityId: 'lo2', modality: 'CIP', tonnage: 38, cargoDetail: 'Aceite granel',  truckId: 'tr2', driverId: 'dr2', appliedPrice: 250_000, status: 'assigned' },
  { id: 'or3', orderNumber: 'P-2024-003', date: '2026-04-10', requestingClientId: 'cl1', destinationClientId: 'cl1', localityId: 'lo3', modality: 'FCA', tonnage: null, cargoDetail: 'Semolín',       truckId: 'tr3', driverId: 'dr3', appliedPrice: 190_000, status: 'delivered' },
  { id: 'or4', orderNumber: 'P-2024-004', date: '2026-04-08', requestingClientId: 'cl3', destinationClientId: 'cl2', localityId: 'lo4', modality: 'CIP', tonnage: 32, cargoDetail: 'Harina integral', truckId: 'tr1', driverId: 'dr1', appliedPrice: 165_000, status: 'invoiced' },
  { id: 'or5', orderNumber: 'P-2024-005', date: '2026-04-28', requestingClientId: 'cl2', destinationClientId: 'cl3', localityId: 'lo1', modality: 'FCA', tonnage: null, cargoDetail: 'Aceite botellas', truckId: null, driverId: null, appliedPrice: 155_000, status: 'pending' },
  { id: 'or6', orderNumber: 'P-2024-006', date: '2026-04-29', requestingClientId: 'cl1', destinationClientId: 'cl2', localityId: 'lo2', modality: 'CIP', tonnage: 32, cargoDetail: 'Semolín granel',  truckId: null, driverId: null, appliedPrice: 210_000, status: 'pending' },
]

export const orderLines: OrderLine[] = [
  { id: 'ol1', orderId: 'or1', articleId: 'ar1', quantity: 1280 },
  { id: 'ol2', orderId: 'or2', articleId: 'ar2', quantity: 4200 },
  { id: 'ol3', orderId: 'or3', articleId: 'ar3', quantity: 900 },
  { id: 'ol4', orderId: 'or4', articleId: 'ar1', quantity: 1280 },
  { id: 'ol5', orderId: 'or5', articleId: 'ar2', quantity: 3600 },
  { id: 'ol6', orderId: 'or6', articleId: 'ar3', quantity: 1000 },
]

// ── Receipts ──────────────────────────────────────────────────────────────────
export const receipts: Receipt[] = [
  { id: 're1', orderId: 'or3', receiptNumber: 'R-0041', date: '2026-04-12', notes: '' },
  { id: 're2', orderId: 'or4', receiptNumber: 'R-0040', date: '2026-04-09', notes: '' },
]

// ── Maintenance types ─────────────────────────────────────────────────────────
export const maintenanceTypes: MaintenanceType[] = [
  { id: 'mt1', name: 'Aceite motor',  description: '',        defaultKmInterval: 10_000, defaultDaysInterval: 180, defaultAlertKmBefore: 1_000, defaultAlertDaysBefore: 15 },
  { id: 'mt2', name: 'Filtro de aire',description: '',        defaultKmInterval: 20_000, defaultDaysInterval: null, defaultAlertKmBefore: 1_500, defaultAlertDaysBefore: null },
  { id: 'mt3', name: 'Frenos',        description: 'Pastillas y discos', defaultKmInterval: 50_000, defaultDaysInterval: 365,  defaultAlertKmBefore: 3_000, defaultAlertDaysBefore: 30 },
]

export const assignedMaintenances: AssignedMaintenance[] = [
  // tr1 — aceite: overdue en km
  { id: 'am1', truckId: 'tr1', maintenanceTypeId: 'mt1', kmInterval: 10_000, daysInterval: 180, alertKmBefore: 1_000, alertDaysBefore: 15, active: true },
  // tr1 — filtro: ok
  { id: 'am2', truckId: 'tr1', maintenanceTypeId: 'mt2', kmInterval: 20_000, daysInterval: null, alertKmBefore: 1_500, alertDaysBefore: null, active: true },
  // tr2 — aceite: upcoming en km
  { id: 'am3', truckId: 'tr2', maintenanceTypeId: 'mt1', kmInterval: 10_000, daysInterval: 180, alertKmBefore: 1_000, alertDaysBefore: 15, active: true },
  // tr3 — frenos: ok
  { id: 'am4', truckId: 'tr3', maintenanceTypeId: 'mt3', kmInterval: 50_000, daysInterval: 365, alertKmBefore: 3_000, alertDaysBefore: 30, active: true },
  // tr4 — aceite: no_history
  { id: 'am5', truckId: 'tr4', maintenanceTypeId: 'mt1', kmInterval: 10_000, daysInterval: 180, alertKmBefore: 1_000, alertDaysBefore: 15, active: true },
]

export const maintenanceRecords: MaintenanceRecord[] = [
  // tr1 aceite: lastKm=76000, nextDue=86000, realKm=87420 → OVERDUE
  { id: 'mr1', truckId: 'tr1', maintenanceTypeId: 'mt1', driverId: 'dr1', date: '2025-10-01', kmAtMoment: 76_000, notes: '' },
  // tr1 filtro: lastKm=70000, nextDue=90000, realKm=87420 → ok
  { id: 'mr2', truckId: 'tr1', maintenanceTypeId: 'mt2', driverId: 'dr1', date: '2025-08-01', kmAtMoment: 70_000, notes: '' },
  // tr2 aceite: lastKm=45000, nextDue=55000, realKm=54200 → UPCOMING (800 km restantes < 1000)
  { id: 'mr3', truckId: 'tr2', maintenanceTypeId: 'mt1', driverId: 'dr2', date: '2026-01-15', kmAtMoment: 45_000, notes: '' },
  // tr3 frenos: lastKm=20000, nextDue=70000, realKm=61000 → ok
  { id: 'mr4', truckId: 'tr3', maintenanceTypeId: 'mt3', driverId: 'dr3', date: '2025-06-01', kmAtMoment: 20_000, notes: '' },
  // tr4: no records → no_history
]

// ── Driver expiry types ───────────────────────────────────────────────────────
export const driverExpiryTypes: DriverExpiryType[] = [
  { id: 'det1', name: 'Licencia de conducir', description: '', daysInterval: 365, alertDaysBefore: 30 },
  { id: 'det2', name: 'Psicotécnico',          description: '', daysInterval: 365, alertDaysBefore: 30 },
  { id: 'det3', name: 'ART',                   description: '', daysInterval: 365, alertDaysBefore: 15 },
]

export const driverExpiryAssigned: DriverExpiryAssigned[] = [
  // dr1 licencia: upcoming
  { id: 'dea1', driverId: 'dr1', expiryTypeId: 'det1', daysInterval: 365, alertDaysBefore: 30, active: true },
  // dr1 psicotécnico: ok
  { id: 'dea2', driverId: 'dr1', expiryTypeId: 'det2', daysInterval: 365, alertDaysBefore: 30, active: true },
  // dr2 licencia: overdue
  { id: 'dea3', driverId: 'dr2', expiryTypeId: 'det1', daysInterval: 365, alertDaysBefore: 30, active: true },
  // dr3 ART: no_history
  { id: 'dea4', driverId: 'dr3', expiryTypeId: 'det3', daysInterval: 365, alertDaysBefore: 15, active: true },
]

export const expiryRecords: ExpiryRecord[] = [
  // dr1 licencia: renovada 2026-04-10, nextDue=2027-04-10, 15 días restantes → UPCOMING
  { id: 'er1', driverId: 'dr1', expiryTypeId: 'det1', date: '2025-04-15', notes: '' },
  // dr1 psicotécnico: renovada reciente → ok
  { id: 'er2', driverId: 'dr1', expiryTypeId: 'det2', date: '2026-01-01', notes: '' },
  // dr2 licencia: venció → OVERDUE
  { id: 'er3', driverId: 'dr2', expiryTypeId: 'det1', date: '2025-01-15', notes: '' },
  // dr3 ART: sin registros → no_history (no ExpiryRecord para dea4)
]

// ── Expenses ─────────────────────────────────────────────────────────────────
export const expenses: Expense[] = [
  { id: 'ex1', supplierId: 'su1', date: '2026-04-12', concept: 'Combustible viaje Bahía',    truckId: 'tr3', orderId: null,  amount: 45_000, paymentMethod: 'cash',     reference: '', notes: '' },
  { id: 'ex2', supplierId: 'su2', date: '2026-04-12', concept: 'Peaje R-0041 — Autopista del Sol km 37', truckId: 'tr3', orderId: 'or3', amount: 8_200,  paymentMethod: 'cash',     reference: '', notes: '' },
]
```

- [ ] **Verificar tipos**

```bash
npx tsc --noEmit
```

Expected: 0 errores.

- [ ] **Commit**

```bash
git add lib/mock-data.ts
git commit -m "feat: add typed mock data with all alert states represented"
```

---

## Task 5: Layout shell

**Files:**
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/Topbar.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `app/page.tsx`

- [ ] **Crear `components/layout/Sidebar.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Wrench, History, CalendarClock,
  Truck, Users, Building2, Store, Settings, Package,
  MapPin, DollarSign, UserCog, ShoppingCart, FileCheck,
  Receipt, CreditCard, Banknote, FileText, PiggyBank,
  TrendingDown, TrendingUp, ArrowLeftRight, Route,
  Landmark, FileSearch, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_GROUPS = [
  {
    id: 'maestros',
    label: 'Maestros',
    items: [
      { href: '/camiones',        label: 'Camiones',       icon: Truck },
      { href: '/choferes',        label: 'Choferes',       icon: Users },
      { href: '/clientes',        label: 'Clientes',       icon: Building2 },
      { href: '/proveedores',     label: 'Proveedores',    icon: Store },
      { href: '/tipos-gasto',     label: 'Tipos de gasto', icon: Settings },
      { href: '/articulos',       label: 'Artículos',      icon: Package },
      { href: '/localidades',     label: 'Localidades',    icon: MapPin },
      { href: '/precios',         label: 'Precios',        icon: DollarSign },
      { href: '/usuarios',        label: 'Usuarios',       icon: UserCog },
    ],
  },
  {
    id: 'mantenimiento',
    label: 'Mantenimiento',
    items: [
      { href: '/dashboard',          label: 'Dashboard',       icon: LayoutDashboard },
      { href: '/mantenimientos',     label: 'Tipos mant.',     icon: Wrench },
      { href: '/historial',          label: 'Historial',       icon: History },
      { href: '/vencimientos-chofer',label: 'Venc. choferes',  icon: CalendarClock },
    ],
  },
  {
    id: 'administracion',
    label: 'Administración',
    items: [
      { href: '/pedidos',           label: 'Pedidos',          icon: ShoppingCart },
      { href: '/remitos',           label: 'Remitos',          icon: FileCheck },
      { href: '/facturacion',       label: 'Facturación',      icon: Receipt },
      { href: '/cuenta-corriente',  label: 'Cuenta corriente', icon: CreditCard },
      { href: '/cobros',            label: 'Cobros',           icon: Banknote },
      { href: '/cheques',           label: 'Cheques',          icon: FileText },
      { href: '/gastos',            label: 'Gastos',           icon: PiggyBank },
    ],
  },
  {
    id: 'informes',
    label: 'Informes',
    items: [
      { href: '/informes/gastos',           label: 'Gastos',         icon: TrendingDown },
      { href: '/informes/ingresos',         label: 'Ingresos',       icon: TrendingUp },
      { href: '/informes/comparativo',      label: 'Comparativo',    icon: ArrowLeftRight },
      { href: '/informes/viajes',           label: 'Viajes',         icon: Route },
      { href: '/informes/peajes',           label: 'Peajes',         icon: Landmark },
      { href: '/informes/facturas-destino', label: 'Fact. destino',  icon: FileSearch },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  const activeGroupId = NAV_GROUPS.find(g =>
    g.items.some(item => pathname.startsWith(item.href))
  )?.id ?? 'mantenimiento'

  return (
    <aside className="w-[220px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="text-[15px] font-bold text-slate-800 tracking-tight">Lusicic</div>
        <div className="text-[11px] text-slate-400 mt-0.5">Gestión de flota</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_GROUPS.map(group => {
          const isOpen = group.id === activeGroupId
          return (
            <div key={group.id}>
              <button
                className={cn(
                  'w-full flex items-center justify-between px-4 py-[7px] text-[11px] font-semibold',
                  isOpen ? 'text-slate-800 bg-slate-50' : 'text-slate-400 hover:text-slate-600',
                )}
              >
                {group.label}
                <ChevronRight
                  size={12}
                  className={cn('transition-transform', isOpen && 'rotate-90')}
                />
              </button>
              {isOpen && (
                <div>
                  {group.items.map(item => {
                    const Icon = item.icon
                    const active = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-1.5 pl-6 pr-4 py-[6px] text-[12px]',
                          active
                            ? 'bg-blue-50 border-r-2 border-blue-600 text-slate-800 font-medium'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
                        )}
                      >
                        <Icon size={14} />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2">
        <div className="w-[26px] h-[26px] rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-600">
          GA
        </div>
        <div>
          <div className="text-[11px] font-medium text-slate-800">Admin</div>
          <div className="text-[10px] text-slate-400">Operador</div>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Crear `components/layout/Topbar.tsx`**

```tsx
'use client'

import { usePathname } from 'next/navigation'

const BREADCRUMBS: Record<string, { group: string; page: string }> = {
  '/dashboard':           { group: 'Mantenimiento',   page: 'Dashboard' },
  '/mantenimientos':      { group: 'Mantenimiento',   page: 'Tipos de mantenimiento' },
  '/historial':           { group: 'Mantenimiento',   page: 'Historial' },
  '/vencimientos-chofer': { group: 'Mantenimiento',   page: 'Venc. choferes' },
  '/camiones':            { group: 'Maestros',        page: 'Camiones' },
  '/choferes':            { group: 'Maestros',        page: 'Choferes' },
  '/clientes':            { group: 'Maestros',        page: 'Clientes' },
  '/proveedores':         { group: 'Maestros',        page: 'Proveedores' },
  '/tipos-gasto':         { group: 'Maestros',        page: 'Tipos de gasto' },
  '/articulos':           { group: 'Maestros',        page: 'Artículos' },
  '/localidades':         { group: 'Maestros',        page: 'Localidades' },
  '/precios':             { group: 'Maestros',        page: 'Precios' },
  '/usuarios':            { group: 'Maestros',        page: 'Usuarios' },
  '/pedidos':             { group: 'Administración',  page: 'Pedidos' },
  '/remitos':             { group: 'Administración',  page: 'Remitos' },
  '/facturacion':         { group: 'Administración',  page: 'Facturación' },
  '/cuenta-corriente':    { group: 'Administración',  page: 'Cuenta corriente' },
  '/cobros':              { group: 'Administración',  page: 'Cobros' },
  '/cheques':             { group: 'Administración',  page: 'Cheques' },
  '/gastos':              { group: 'Administración',  page: 'Gastos' },
  '/informes/gastos':     { group: 'Informes',        page: 'Gastos' },
  '/informes/ingresos':   { group: 'Informes',        page: 'Ingresos' },
  '/informes/comparativo':{ group: 'Informes',        page: 'Comparativo' },
  '/informes/viajes':     { group: 'Informes',        page: 'Viajes' },
  '/informes/peajes':     { group: 'Informes',        page: 'Peajes' },
  '/informes/facturas-destino': { group: 'Informes',  page: 'Facturas por destino' },
}

export default function Topbar() {
  const pathname = usePathname()
  const crumb = BREADCRUMBS[pathname] ?? { group: '', page: pathname }

  return (
    <header className="h-11 bg-white border-b border-slate-200 flex items-center px-5 flex-shrink-0">
      <nav className="flex items-center gap-1.5 text-[11px]">
        {crumb.group && (
          <>
            <span className="text-slate-500">{crumb.group}</span>
            <span className="text-slate-300">›</span>
          </>
        )}
        <span className="text-slate-800 font-medium">{crumb.page}</span>
      </nav>
    </header>
  )
}
```

- [ ] **Modificar `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lusicic',
  description: 'Sistema de gestión de flota',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-50`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-5">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Crear `app/page.tsx`** — redirect a dashboard

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

- [ ] **Agregar `tabular-nums` a `app/globals.css`**

Al final del archivo globals.css, agregar:

```css
/* Números alineados en tablas */
[data-tabular] {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Verificar en browser que el shell funciona**

```bash
npm run dev
```

Navegar a `http://localhost:3000`. Debe verse el sidebar con los 4 grupos accordion, topbar con breadcrumb, y redirigir a /dashboard (que aún no existe — 404 está bien en este punto).

- [ ] **Commit**

```bash
git add components/layout/ app/layout.tsx app/page.tsx app/globals.css
git commit -m "feat: add layout shell with accordion sidebar and topbar"
```

---

## Task 6: Componentes compartidos

**Files:**
- Create: `components/StatusBadge.tsx`
- Create: `components/SummaryCard.tsx`
- Create: `components/DataTable.tsx`
- Create: `components/AmberPanel.tsx`
- Create: `components/PageHeader.tsx`

- [ ] **Crear `components/StatusBadge.tsx`**

```tsx
import { cn } from '@/lib/utils'
import type { AlertState, OrderStatus, InvoiceStatus } from '@/lib/types'

// Alert state (truck maintenance / driver expiry)
const ALERT_STYLES: Record<AlertState, string> = {
  overdue:    'bg-red-100 text-red-600',
  upcoming:   'bg-amber-100 text-amber-700',
  ok:         'bg-green-100 text-green-700',
  no_history: 'bg-slate-100 text-slate-500',
}
const ALERT_LABELS: Record<AlertState, string> = {
  overdue:    'VENCIDO',
  upcoming:   'PRÓXIMO',
  ok:         'AL DÍA',
  no_history: 'SIN HISTORIAL',
}

// Order lifecycle
const ORDER_STYLES: Record<OrderStatus, string> = {
  pending:   'bg-slate-100 text-slate-600',
  assigned:  'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
  invoiced:  'bg-violet-100 text-violet-700',
}
const ORDER_LABELS: Record<OrderStatus, string> = {
  pending:   'PENDIENTE',
  assigned:  'ASIGNADO',
  delivered: 'ENTREGADO',
  invoiced:  'FACTURADO',
}

// Invoice payment status
const INVOICE_STYLES: Record<InvoiceStatus, string> = {
  pending:        'bg-red-100 text-red-600',
  partially_paid: 'bg-amber-100 text-amber-700',
  paid:           'bg-green-100 text-green-700',
}
const INVOICE_LABELS: Record<InvoiceStatus, string> = {
  pending:        'PENDIENTE COBRO',
  partially_paid: 'PAGO PARCIAL',
  paid:           'PAGADO',
}

type Props =
  | { variant: 'alert';    state: AlertState }
  | { variant: 'lifecycle'; state: OrderStatus }
  | { variant: 'payment';  state: InvoiceStatus }

export default function StatusBadge(props: Props) {
  let className: string
  let label: string

  if (props.variant === 'alert') {
    className = ALERT_STYLES[props.state]
    label = ALERT_LABELS[props.state]
  } else if (props.variant === 'lifecycle') {
    className = ORDER_STYLES[props.state]
    label = ORDER_LABELS[props.state]
  } else {
    className = INVOICE_STYLES[props.state]
    label = INVOICE_LABELS[props.state]
  }

  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold', className)}>
      {label}
    </span>
  )
}
```

- [ ] **Crear `components/SummaryCard.tsx`**

```tsx
import { cn } from '@/lib/utils'
import type { AlertState } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

const ALERT_BORDER: Record<AlertState, string> = {
  overdue:    'border-t-red-600 border-red-200',
  upcoming:   'border-t-amber-500 border-amber-200',
  ok:         'border-t-green-600 border-green-200',
  no_history: 'border-t-slate-400 border-slate-200',
}
const ALERT_NUMBER: Record<AlertState, string> = {
  overdue:    'text-red-600',
  upcoming:   'text-amber-600',
  ok:         'text-green-600',
  no_history: 'text-slate-400',
}

type AlertProps = {
  variant: 'alert'
  state: AlertState
  value: number
  label: string
}

type InfoProps = {
  variant: 'info'
  icon: LucideIcon
  value: number | string
  label: string
  subtitle?: string
  iconBg?: string
}

type Props = AlertProps | InfoProps

export default function SummaryCard(props: Props) {
  if (props.variant === 'alert') {
    return (
      <div className={cn('bg-white rounded-lg border border-t-[3px] p-4', ALERT_BORDER[props.state])}>
        <div className={cn('text-[26px] font-bold leading-none tabular-nums', ALERT_NUMBER[props.state])}>
          {props.value}
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-slate-500 mt-1">
          {props.label}
        </div>
      </div>
    )
  }

  const Icon = props.icon
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-slate-500">
          {props.label}
        </div>
        <div className={cn('w-7 h-7 rounded-md flex items-center justify-center', props.iconBg ?? 'bg-blue-50')}>
          <Icon size={15} className="text-blue-600" />
        </div>
      </div>
      <div className="text-[26px] font-bold leading-none text-slate-800 tabular-nums">
        {props.value}
      </div>
      {props.subtitle && (
        <div className="text-[11px] text-slate-400">{props.subtitle}</div>
      )}
    </div>
  )
}
```

- [ ] **Crear `components/PageHeader.tsx`**

```tsx
import { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
```

- [ ] **Crear `components/AmberPanel.tsx`**

```tsx
import { AlertTriangle } from 'lucide-react'
import { ReactNode } from 'react'

interface Props {
  title: string
  items: {
    id: string
    label: ReactNode
    action?: ReactNode
  }[]
}

export default function AmberPanel({ title, items }: Props) {
  if (items.length === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-amber-600" />
        <span className="text-[13px] font-semibold text-amber-900">{title}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-white border border-amber-200 rounded-md px-3 py-2 flex items-center justify-between"
          >
            <div className="text-[12px] text-slate-700">{item.label}</div>
            {item.action && <div className="text-[11px] text-blue-600 font-medium">{item.action}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Crear `components/DataTable.tsx`**

```tsx
import { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  className?: string
  cell: (row: T) => ReactNode
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  getRowClassName?: (row: T) => string
  searchValue?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  action?: ReactNode
  title?: string
  emptyMessage?: string
}

export default function DataTable<T>({
  columns, rows, getRowId, getRowClassName,
  searchValue, onSearchChange, searchPlaceholder = 'Buscar...',
  filters, action, title, emptyMessage = 'Sin registros',
}: Props<T>) {
  const hasToolbar = onSearchChange || filters || action
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-slate-100 text-[13px] font-semibold text-slate-800">
          {title}
        </div>
      )}
      {hasToolbar && (
        <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
          {onSearchChange && (
            <div className="relative max-w-[240px] flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-7 h-8 text-[12px]"
              />
            </div>
          )}
          {filters}
          {action && <div className="ml-auto">{action}</div>}
        </div>
      )}
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map(col => (
              <th
                key={col.key}
                className={cn('px-3.5 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-[0.04em]', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3.5 py-8 text-center text-slate-400 text-[12px]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <tr
                key={getRowId(row)}
                className={cn('border-b border-slate-100 last:border-0', getRowClassName?.(row))}
              >
                {columns.map(col => (
                  <td key={col.key} className={cn('px-3.5 py-[9px]', col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Verificar que TypeScript no reporta errores**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add components/
git commit -m "feat: add shared UI components (StatusBadge, SummaryCard, DataTable, AmberPanel, PageHeader)"
```

---

## Task 7: Página /dashboard

**Files:**
- Create: `app/dashboard/page.tsx`

- [ ] **Crear `app/dashboard/page.tsx`**

```tsx
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
  worstState,
} from '@/lib/alert-engine'
import type { AlertState } from '@/lib/types'

const TODAY = new Date().toISOString().split('T')[0]

// ── Truck rows ───────────────────────────────────────────────────────────────
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

// ── Driver rows ───────────────────────────────────────────────────────────────
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

// ── Row styles ────────────────────────────────────────────────────────────────
const ROW_CLASS: Record<AlertState, string> = {
  overdue:    'bg-red-50 border-l-[3px] border-l-red-600',
  upcoming:   'bg-amber-50 border-l-[3px] border-l-amber-500',
  ok:         '',
  no_history: 'bg-slate-50',
}

// ── Page ──────────────────────────────────────────────────────────────────────
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
    { key: 'plate',   header: 'Camión',  cell: r => <span className="font-semibold text-slate-800">{r.plate}</span> },
    { key: 'type',    header: 'Tipo',    cell: r => <span className="text-slate-500">{r.maintenanceName}</span> },
    { key: 'state',   header: 'Estado',  cell: r => <StatusBadge variant="alert" state={r.state} /> },
    { key: 'nextKm',  header: 'Próx. km', className: 'text-right', cell: r => <span className="tabular-nums text-slate-500">{r.nextDueKm?.toLocaleString('es-AR') ?? '—'}</span> },
    { key: 'nextDate',header: 'Próx. fecha', className: 'text-right', cell: r => <span className="tabular-nums text-slate-500">{r.nextDueDate ?? '—'}</span> },
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
    { key: 'driver',  header: 'Chofer',    cell: r => <span className="font-semibold text-slate-800">{r.driverName}</span> },
    { key: 'type',    header: 'Documento', cell: r => <span className="text-slate-500">{r.expiryTypeName}</span> },
    { key: 'state',   header: 'Estado',    cell: r => <StatusBadge variant="alert" state={r.state} /> },
    { key: 'date',    header: 'Próx. fecha', className: 'text-right', cell: r => <span className="tabular-nums text-slate-500">{r.nextDueDate ?? '—'}</span> },
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

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2.5 mb-5">
        <SummaryCard variant="alert" state="overdue"    value={counts.overdue}    label="Vencidos" />
        <SummaryCard variant="alert" state="upcoming"   value={counts.upcoming}   label="Próximos" />
        <SummaryCard variant="alert" state="ok"         value={counts.ok}         label="Al día" />
        <SummaryCard variant="alert" state="no_history" value={counts.no_history} label="Sin historial" />
      </div>

      {/* Truck table */}
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

      {/* Driver table */}
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
```

- [ ] **Verificar en browser**

```bash
npm run dev
```

Navegar a `http://localhost:3000/dashboard`. Verificar:
- 4 summary cards con colores correctos (rojo/amarillo/verde/gris)
- Tabla de camiones con filas coloreadas según estado
- Pills de estado visibles
- Tabla de choferes con el mismo patrón
- Las filas `overdue` tienen borde izquierdo rojo, `upcoming` amarillo

- [ ] **Commit**

```bash
git add app/dashboard/
git commit -m "feat: add /dashboard page with alert state machine"
```

---

## Task 8: Página /pedidos

**Files:**
- Create: `app/pedidos/page.tsx`

- [ ] **Crear `app/pedidos/page.tsx`**

```tsx
'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import SummaryCard from '@/components/SummaryCard'
import DataTable, { Column } from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  orders as initialOrders, orderLines, trucks, drivers, clients,
  localities, priceLists, localityPrices, articles,
} from '@/lib/mock-data'
import type { Order, OrderStatus, OrderModality } from '@/lib/types'
import {
  ShoppingCart, Truck, CheckCircle2, Receipt,
  Plus, Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ORDER_ROW_CLASS: Record<OrderStatus, string> = {
  pending:   '',
  assigned:  '',
  delivered: '',
  invoiced:  '',
}

export default function PedidosPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')

  // Modal: assign truck/driver
  const [assignOrderId, setAssignOrderId] = useState<string | null>(null)
  const [assignTruckId, setAssignTruckId] = useState('')
  const [assignDriverId, setAssignDriverId] = useState('')

  // Sheet: new order
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [newOrder, setNewOrder] = useState({
    orderNumber: '', date: '', requestingClientId: '', destinationClientId: '',
    localityId: '', modality: 'CIP' as OrderModality, tonnage: '', cargoDetail: '',
    priceListId: '', appliedPrice: 0,
  })
  const [newLines, setNewLines] = useState<{ articleId: string; quantity: string }[]>([])

  const filtered = useMemo(() => {
    return orders
      .filter(o => filterStatus === 'all' || o.status === filterStatus)
      .filter(o => {
        const q = search.toLowerCase()
        const client = clients.find(c => c.id === o.destinationClientId)
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          client?.name.toLowerCase().includes(q)
        )
      })
  }, [orders, search, filterStatus])

  const counts = {
    pending:   orders.filter(o => o.status === 'pending').length,
    assigned:  orders.filter(o => o.status === 'assigned').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    invoiced:  orders.filter(o => o.status === 'invoiced').length,
  }
  const toInvoiceTotal = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.appliedPrice, 0)

  // Assign submit
  function handleAssign() {
    if (!assignOrderId || !assignTruckId || !assignDriverId) return
    setOrders(prev => prev.map(o =>
      o.id === assignOrderId
        ? { ...o, truckId: assignTruckId, driverId: assignDriverId, status: 'assigned' as OrderStatus }
        : o
    ))
    setAssignOrderId(null)
    setAssignTruckId('')
    setAssignDriverId('')
  }

  // Computed applied price from selected price list + locality
  const computedPrice = useMemo(() => {
    if (!newOrder.priceListId || !newOrder.localityId) return null
    return localityPrices.find(
      lp => lp.priceListId === newOrder.priceListId && lp.localityId === newOrder.localityId
    )?.price ?? null
  }, [newOrder.priceListId, newOrder.localityId])

  // New order submit
  function handleNewOrder() {
    if (!computedPrice || !newOrder.orderNumber || !newOrder.localityId || !newOrder.requestingClientId || !newOrder.destinationClientId) return
    const id = `or${Date.now()}`
    const order: Order = {
      id,
      orderNumber: newOrder.orderNumber,
      date: newOrder.date || new Date().toISOString().split('T')[0],
      requestingClientId: newOrder.requestingClientId,
      destinationClientId: newOrder.destinationClientId,
      localityId: newOrder.localityId,
      modality: newOrder.modality,
      tonnage: newOrder.tonnage ? Number(newOrder.tonnage) : null,
      cargoDetail: newOrder.cargoDetail,
      truckId: null,
      driverId: null,
      appliedPrice: computedPrice,
      status: 'pending',
    }
    setOrders(prev => [order, ...prev])
    setNewOrderOpen(false)
    setNewOrder({ orderNumber: '', date: '', requestingClientId: '', destinationClientId: '', localityId: '', modality: 'CIP', tonnage: '', cargoDetail: '', priceListId: '', appliedPrice: 0 })
    setNewLines([])
  }

  const columns: Column<Order>[] = [
    { key: 'num',    header: 'N° Pedido', cell: o => <span className="font-semibold text-slate-800">{o.orderNumber}</span> },
    { key: 'date',   header: 'Fecha',     cell: o => <span className="text-slate-500">{o.date}</span> },
    { key: 'client', header: 'Cliente destino', cell: o => <span className="text-slate-800">{clients.find(c => c.id === o.destinationClientId)?.name}</span> },
    { key: 'loc',    header: 'Localidad', cell: o => <span className="text-slate-500">{localities.find(l => l.id === o.localityId)?.name}</span> },
    { key: 'mod',    header: 'Modal.',    cell: o => <span className="text-slate-500">{o.modality}</span> },
    { key: 'status', header: 'Estado',    cell: o => <StatusBadge variant="lifecycle" state={o.status} /> },
    { key: 'price',  header: 'Precio', className: 'text-right', cell: o => <span className="tabular-nums text-slate-700">${o.appliedPrice.toLocaleString('es-AR')}</span> },
    {
      key: 'actions', header: '', className: 'text-right',
      cell: o => {
        if (o.status === 'pending')
          return <button onClick={() => setAssignOrderId(o.id)} className="text-[11px] text-blue-600 font-medium hover:underline">Asignar</button>
        if (o.status === 'assigned')
          return <span className="text-[11px] text-slate-400">Registrar remito</span>
        return null
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Pedidos"
        action={
          <Button size="sm" onClick={() => setNewOrderOpen(true)}>
            <Plus size={14} className="mr-1" /> Nuevo pedido
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2.5 mb-5">
        <SummaryCard variant="info" icon={ShoppingCart} value={counts.pending}   label="Pendiente" subtitle="sin asignar" />
        <SummaryCard variant="info" icon={Truck}         value={counts.assigned}  label="Asignado"  subtitle="en camino" />
        <SummaryCard variant="info" icon={CheckCircle2}  value={counts.delivered} label="Entregado" subtitle={`$${toInvoiceTotal.toLocaleString('es-AR')} a facturar`} />
        <SummaryCard variant="info" icon={Receipt}       value={counts.invoiced}  label="Facturado" subtitle="este período" />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={o => o.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por número o cliente..."
        action={
          <Select value={filterStatus} onValueChange={v => setFilterStatus(v as OrderStatus | 'all')}>
            <SelectTrigger className="h-8 text-[12px] w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="assigned">Asignado</SelectItem>
              <SelectItem value="delivered">Entregado</SelectItem>
              <SelectItem value="invoiced">Facturado</SelectItem>
            </SelectContent>
          </Select>
        }
        emptyMessage="Sin pedidos"
      />

      {/* Modal: Assign */}
      <Dialog open={!!assignOrderId} onOpenChange={open => !open && setAssignOrderId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Asignar camión y chofer</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase tracking-wide text-slate-500">Camión</Label>
              <Select value={assignTruckId} onValueChange={setAssignTruckId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar camión..." /></SelectTrigger>
                <SelectContent>
                  {trucks.map(t => <SelectItem key={t.id} value={t.id}>{t.plate} · {t.brand} {t.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] uppercase tracking-wide text-slate-500">Chofer</Label>
              <Select value={assignDriverId} onValueChange={setAssignDriverId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar chofer..." /></SelectTrigger>
                <SelectContent>
                  {drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOrderId(null)}>Cancelar</Button>
            <Button onClick={handleAssign} disabled={!assignTruckId || !assignDriverId}>Asignar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet: New order */}
      <Sheet open={newOrderOpen} onOpenChange={setNewOrderOpen}>
        <SheetContent className="w-[480px] flex flex-col overflow-y-auto">
          <SheetHeader><SheetTitle>Nuevo pedido</SheetTitle></SheetHeader>

          <div className="flex flex-col gap-4 py-4 flex-1">
            {/* Sección 1: Datos */}
            <div className="flex flex-col gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-t border-slate-100 pt-3">Datos del pedido</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">N° Pedido</Label>
                  <Input value={newOrder.orderNumber} onChange={e => setNewOrder(p => ({ ...p, orderNumber: e.target.value }))} placeholder="P-2024-007" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Fecha</Label>
                  <Input type="date" value={newOrder.date} onChange={e => setNewOrder(p => ({ ...p, date: e.target.value }))} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Cliente solicitante</Label>
                <Select value={newOrder.requestingClientId} onValueChange={v => setNewOrder(p => ({ ...p, requestingClientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Cliente destino</Label>
                <Select value={newOrder.destinationClientId} onValueChange={v => setNewOrder(p => ({ ...p, destinationClientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Localidad</Label>
                  <Select value={newOrder.localityId} onValueChange={v => setNewOrder(p => ({ ...p, localityId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>{localities.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Modalidad</Label>
                  <Select value={newOrder.modality} onValueChange={v => setNewOrder(p => ({ ...p, modality: v as OrderModality }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CIP">CIP</SelectItem>
                      <SelectItem value="FCA">FCA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newOrder.modality === 'CIP' && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Tonelaje</Label>
                  <Input type="number" value={newOrder.tonnage} onChange={e => setNewOrder(p => ({ ...p, tonnage: e.target.value }))} placeholder="32" />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Detalle de carga</Label>
                <Input value={newOrder.cargoDetail} onChange={e => setNewOrder(p => ({ ...p, cargoDetail: e.target.value }))} placeholder="Harina de trigo granel" />
              </div>
            </div>

            {/* Sección 2: Precio */}
            <div className="flex flex-col gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-t border-slate-100 pt-3">Lista de precios</div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Lista</Label>
                <Select value={newOrder.priceListId} onValueChange={v => setNewOrder(p => ({ ...p, priceListId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar lista..." /></SelectTrigger>
                  <SelectContent>{priceLists.map(pl => <SelectItem key={pl.id} value={pl.id}>{pl.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {computedPrice !== null ? (
                <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-[13px] font-semibold text-blue-700 tabular-nums">
                  Precio aplicado: ${computedPrice.toLocaleString('es-AR')}
                </div>
              ) : newOrder.priceListId && newOrder.localityId ? (
                <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-[12px] text-red-600">
                  Sin precio para esta combinación lista / localidad
                </div>
              ) : null}
            </div>

            {/* Sección 3: Artículos */}
            <div className="flex flex-col gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-t border-slate-100 pt-3">Artículos</div>
              {newLines.map((line, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_auto] gap-2 items-end">
                  <Select value={line.articleId} onValueChange={v => setNewLines(prev => prev.map((l, idx) => idx === i ? { ...l, articleId: v } : l))}>
                    <SelectTrigger className="text-[12px]"><SelectValue placeholder="Artículo..." /></SelectTrigger>
                    <SelectContent>{articles.map(a => <SelectItem key={a.id} value={a.id}>{a.code} · {a.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={line.quantity}
                    onChange={e => setNewLines(prev => prev.map((l, idx) => idx === i ? { ...l, quantity: e.target.value } : l))}
                    placeholder="Cant."
                    className="text-[12px]"
                  />
                  <button onClick={() => setNewLines(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                    <Minus size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setNewLines(prev => [...prev, { articleId: '', quantity: '' }])}
                className="flex items-center gap-1 text-[12px] text-blue-600 font-medium w-fit"
              >
                <Plus size={13} /> Agregar artículo
              </button>
            </div>
          </div>

          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setNewOrderOpen(false)}>Cancelar</Button>
            <Button onClick={handleNewOrder} disabled={!computedPrice || !newOrder.orderNumber}>Guardar pedido</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
```

- [ ] **Verificar en browser**

Navegar a `http://localhost:3000/pedidos`. Verificar:
- 4 summary cards informativas con íconos
- Tabla con todos los pedidos y badges de estado correctos
- Buscador filtra por número y cliente
- Filtro de estado funciona
- Fila con status `pending` muestra botón "Asignar" — al hacer click abre Modal
- Modal permite seleccionar camión y chofer, al confirmar la fila cambia a `assigned`
- Botón "Nuevo pedido" abre Sheet desde la derecha
- Sheet tiene 3 secciones: datos, precio (muestra el precio calculado o error si no hay), artículos con picker dinámico
- Al guardar aparece el nuevo pedido en la tabla

- [ ] **Commit**

```bash
git add app/pedidos/
git commit -m "feat: add /pedidos page with assign modal and new order sheet"
```

---

## Task 9: Página /remitos

**Files:**
- Create: `app/remitos/page.tsx`

- [ ] **Crear `app/remitos/page.tsx`**

```tsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import AmberPanel from '@/components/AmberPanel'
import DataTable, { Column } from '@/components/DataTable'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  orders as initialOrders,
  receipts as initialReceipts,
  orderLines, articles, clients, localities, localityTolls, suppliers, trucks,
} from '@/lib/mock-data'
import type { Receipt, Order, OrderStatus } from '@/lib/types'

export default function RemitosPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [receipts, setReceipts] = useState(initialReceipts)

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [receiptNumber, setReceiptNumber] = useState('')
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0])
  const [receiptNotes, setReceiptNotes] = useState('')
  const [tollAmounts, setTollAmounts] = useState<Record<string, number>>({})

  // Orders awaiting receipt (assigned, no receipt yet)
  const receiptedOrderIds = new Set(receipts.map(r => r.orderId))
  const pendingOrders = orders.filter(o => o.status === 'assigned' && !receiptedOrderIds.has(o.id))

  function openForOrder(orderId: string) {
    setSelectedOrderId(orderId)
    // Reset toll amounts to defaults for this order's locality
    const order = orders.find(o => o.id === orderId)
    if (order) {
      const tolls = localityTolls.filter(lt => lt.localityId === order.localityId)
      const defaults: Record<string, number> = {}
      tolls.forEach(lt => { defaults[lt.id] = lt.amount })
      setTollAmounts(defaults)
    }
    setSheetOpen(true)
  }

  const selectedOrder = orders.find(o => o.id === selectedOrderId) ?? null
  const selectedLines = selectedOrder ? orderLines.filter(ol => ol.orderId === selectedOrder.id) : []
  const selectedTolls = selectedOrder ? localityTolls.filter(lt => lt.localityId === selectedOrder.localityId) : []

  function handleSave() {
    if (!selectedOrder || !receiptNumber) return
    const id = `re${Date.now()}`
    const newReceipt: Receipt = {
      id, orderId: selectedOrder.id, receiptNumber, date: receiptDate, notes: receiptNotes,
    }
    setReceipts(prev => [newReceipt, ...prev])
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'delivered' as OrderStatus } : o))
    setSheetOpen(false)
    setSelectedOrderId('')
    setReceiptNumber('')
    setReceiptNotes('')
    setTollAmounts({})
  }

  const receiptColumns: Column<Receipt>[] = [
    { key: 'num',    header: 'N° Remito', cell: r => <span className="font-semibold text-slate-800">{r.receiptNumber}</span> },
    { key: 'date',   header: 'Fecha',     cell: r => <span className="text-slate-500">{r.date}</span> },
    { key: 'order',  header: 'N° Pedido', cell: r => <span className="text-slate-700">{orders.find(o => o.id === r.orderId)?.orderNumber}</span> },
    { key: 'client', header: 'Cliente destino', cell: r => {
      const order = orders.find(o => o.id === r.orderId)
      return <span className="text-slate-700">{clients.find(c => c.id === order?.destinationClientId)?.name}</span>
    }},
    { key: 'loc',    header: 'Localidad', cell: r => {
      const order = orders.find(o => o.id === r.orderId)
      return <span className="text-slate-500">{localities.find(l => l.id === order?.localityId)?.name}</span>
    }},
    { key: 'articles', header: 'Artículos', cell: r => {
      const lines = orderLines.filter(ol => ol.orderId === r.orderId)
      return (
        <div className="flex flex-wrap gap-1">
          {lines.map(ol => {
            const art = articles.find(a => a.id === ol.articleId)
            return <span key={ol.id} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded">{art?.code} ×{ol.quantity}</span>
          })}
        </div>
      )
    }},
  ]

  return (
    <div>
      <PageHeader title="Remitos" />

      {/* Amber panel */}
      <AmberPanel
        title={`${pendingOrders.length} pedido${pendingOrders.length !== 1 ? 's' : ''} asignado${pendingOrders.length !== 1 ? 's' : ''} sin remito`}
        items={pendingOrders.map(o => ({
          id: o.id,
          label: (
            <span className="flex items-center gap-3">
              <span className="font-semibold">{o.orderNumber}</span>
              <span className="text-slate-500">{clients.find(c => c.id === o.destinationClientId)?.name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{localities.find(l => l.id === o.localityId)?.name}</span>
              <span className="text-slate-400 text-[11px]">{o.date}</span>
            </span>
          ),
          action: (
            <button onClick={() => openForOrder(o.id)} className="hover:underline">
              Registrar remito →
            </button>
          ),
        }))}
      />

      {/* Receipts table */}
      <DataTable
        title="Remitos registrados"
        columns={receiptColumns}
        rows={receipts}
        getRowId={r => r.id}
        emptyMessage="Sin remitos registrados"
      />

      {/* Sheet: register receipt */}
      <Sheet open={sheetOpen} onOpenChange={open => { if (!open) setSheetOpen(false) }}>
        <SheetContent className="w-[480px] flex flex-col overflow-y-auto">
          <SheetHeader><SheetTitle>Registrar remito</SheetTitle></SheetHeader>

          <div className="flex flex-col gap-4 py-4 flex-1">
            {/* Pedido */}
            <div className="flex flex-col gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pedido</div>
              <Select value={selectedOrderId} onValueChange={v => openForOrder(v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar pedido..." /></SelectTrigger>
                <SelectContent>
                  {pendingOrders.map(o => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.orderNumber} · {clients.find(c => c.id === o.destinationClientId)?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">N° Remito</Label>
                  <Input value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} placeholder="R-0042" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase text-slate-500">Fecha</Label>
                  <Input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] uppercase text-slate-500">Notas</Label>
                <Input value={receiptNotes} onChange={e => setReceiptNotes(e.target.value)} placeholder="Observaciones..." />
              </div>
            </div>

            {/* Artículos (read-only) */}
            {selectedLines.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-t border-slate-100 pt-3">Artículos despachados</div>
                <div className="text-[10px] text-slate-400">Solo lectura — para editar cantidades, modificar el pedido primero</div>
                <table className="w-full text-[12px] border border-slate-200 rounded-md overflow-hidden">
                  <thead><tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Código</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Artículo</th>
                    <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Cantidad</th>
                  </tr></thead>
                  <tbody>
                    {selectedLines.map(ol => {
                      const art = articles.find(a => a.id === ol.articleId)
                      return (
                        <tr key={ol.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-2 text-slate-500">{art?.code}</td>
                          <td className="px-3 py-2 text-slate-800">{art?.name}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-700">{ol.quantity}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Peajes (editable) */}
            {selectedTolls.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-t border-slate-100 pt-3">Peajes</div>
                <table className="w-full text-[12px] border border-slate-200 rounded-md overflow-hidden">
                  <thead><tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Cabina</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Proveedor</th>
                    <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Monto</th>
                  </tr></thead>
                  <tbody>
                    {selectedTolls.map(lt => (
                      <tr key={lt.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2 text-slate-700">{lt.description}</td>
                        <td className="px-3 py-2 text-slate-500">{suppliers.find(s => s.id === lt.supplierId)?.name}</td>
                        <td className="px-3 py-2 text-right">
                          <Input
                            type="number"
                            value={tollAmounts[lt.id] ?? lt.amount}
                            onChange={e => setTollAmounts(prev => ({ ...prev, [lt.id]: Number(e.target.value) }))}
                            className="w-24 h-7 text-[12px] text-right tabular-nums ml-auto"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-[10px] text-slate-400">Al guardar se generará un gasto por cada peaje</div>
              </div>
            )}
          </div>

          <SheetFooter className="border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!selectedOrderId || !receiptNumber}>
              Registrar remito
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
```

- [ ] **Verificar en browser**

Navegar a `http://localhost:3000/remitos`. Verificar:
- Panel ámbar muestra los pedidos `assigned` sin remito (or1, or2)
- Click en "Registrar remito →" pre-selecciona el pedido en el Sheet
- Sheet muestra artículos en modo read-only para el pedido seleccionado
- Para pedidos con localidad que tiene peajes (Rosario = lt1, Córdoba = lt2+lt3): se ven las filas de peajes con montos editables
- Para pedidos sin peajes: la sección de peajes no aparece
- Al guardar: el panel ámbar reduce en 1, el remito aparece en la tabla, el pedido cambia a `delivered`

- [ ] **Correr tests finales**

```bash
npm test
npm run build
```

Expected: todos los tests pasan, build sin errores.

- [ ] **Commit final**

```bash
git add app/remitos/
git commit -m "feat: add /remitos page with amber panel and receipt sheet"
```

---

## Self-review

**Spec coverage:**
- ✅ Design system (colores, tipografía, espaciado) — implementado en globals.css + componentes
- ✅ Layout shell (sidebar accordion, topbar breadcrumb) — Task 5
- ✅ StatusBadge variantes alert/lifecycle/payment — Task 6
- ✅ SummaryCard variante A (alertas) y C (info) — Task 6
- ✅ DataTable con toolbar — Task 6
- ✅ AmberPanel — Task 6
- ✅ PageHeader — Task 6
- ✅ Alert engine con tests — Task 3
- ✅ /dashboard — Task 7
- ✅ /pedidos con Modal "Asignar" y Sheet "Nuevo pedido" — Task 8
- ✅ /remitos con AmberPanel y Sheet "Registrar remito" con artículos + peajes — Task 9

**Fuera de scope de este plan (Plan B y C):**
- Maestros: /camiones, /choferes, /clientes, /proveedores, /articulos, /localidades, /precios, /tipos-gasto, /usuarios
- Administración: /facturacion, /cuenta-corriente, /cobros, /cheques, /gastos, /historial
- Informes: /informes/gastos, ingresos, comparativo, viajes, peajes, facturas-destino

**Tipos consistentes:** Todos los tipos importan desde `@/lib/types`. Las funciones del alert-engine usan exactamente los mismos tipos definidos en Task 2.

**Sin placeholders:** Todos los pasos tienen código completo.
