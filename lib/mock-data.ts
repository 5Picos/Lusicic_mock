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

// ── Expense types & Suppliers ─────────────────────────────────────────────────
export const expenseTypes: ExpenseType[] = [
  { id: 'et1', name: 'Combustible',         description: '' },
  { id: 'et2', name: 'Estatal / Impuestos', description: 'AFIP, ARBA, peajes' },
  { id: 'et3', name: 'Repuestos',           description: '' },
  { id: 'et4', name: 'Sueldos',             description: '' },
  { id: 'et5', name: 'Varios',              description: '' },
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
  { id: 'or1', orderNumber: 'P-2024-001', date: '2026-04-15', requestingClientId: 'cl1', destinationClientId: 'cl2', localityId: 'lo1', modality: 'CIP', tonnage: 32,   cargoDetail: 'Harina de trigo',  truckId: 'tr1', driverId: 'dr1', appliedPrice: 145_000, status: 'assigned' },
  { id: 'or2', orderNumber: 'P-2024-002', date: '2026-04-14', requestingClientId: 'cl2', destinationClientId: 'cl3', localityId: 'lo2', modality: 'CIP', tonnage: 38,   cargoDetail: 'Aceite granel',    truckId: 'tr2', driverId: 'dr2', appliedPrice: 250_000, status: 'assigned' },
  { id: 'or3', orderNumber: 'P-2024-003', date: '2026-04-10', requestingClientId: 'cl1', destinationClientId: 'cl1', localityId: 'lo3', modality: 'FCA', tonnage: null, cargoDetail: 'Semolín',          truckId: 'tr3', driverId: 'dr3', appliedPrice: 190_000, status: 'delivered' },
  { id: 'or4', orderNumber: 'P-2024-004', date: '2026-04-08', requestingClientId: 'cl3', destinationClientId: 'cl2', localityId: 'lo4', modality: 'CIP', tonnage: 32,   cargoDetail: 'Harina integral',  truckId: 'tr1', driverId: 'dr1', appliedPrice: 165_000, status: 'invoiced' },
  { id: 'or5', orderNumber: 'P-2024-005', date: '2026-04-28', requestingClientId: 'cl2', destinationClientId: 'cl3', localityId: 'lo1', modality: 'FCA', tonnage: null, cargoDetail: 'Aceite botellas',  truckId: null,  driverId: null,  appliedPrice: 155_000, status: 'pending' },
  { id: 'or6', orderNumber: 'P-2024-006', date: '2026-04-29', requestingClientId: 'cl1', destinationClientId: 'cl2', localityId: 'lo2', modality: 'CIP', tonnage: 32,   cargoDetail: 'Semolín granel',   truckId: null,  driverId: null,  appliedPrice: 210_000, status: 'pending' },
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
  { id: 'mt1', name: 'Aceite motor',   description: '',                    defaultKmInterval: 10_000, defaultDaysInterval: 180,  defaultAlertKmBefore: 1_000, defaultAlertDaysBefore: 15 },
  { id: 'mt2', name: 'Filtro de aire', description: '',                    defaultKmInterval: 20_000, defaultDaysInterval: null, defaultAlertKmBefore: 1_500, defaultAlertDaysBefore: null },
  { id: 'mt3', name: 'Frenos',         description: 'Pastillas y discos', defaultKmInterval: 50_000, defaultDaysInterval: 365,  defaultAlertKmBefore: 3_000, defaultAlertDaysBefore: 30 },
]

export const assignedMaintenances: AssignedMaintenance[] = [
  // tr1 — aceite: overdue en km
  { id: 'am1', truckId: 'tr1', maintenanceTypeId: 'mt1', kmInterval: 10_000, daysInterval: 180,  alertKmBefore: 1_000, alertDaysBefore: 15,   active: true },
  // tr1 — filtro: ok
  { id: 'am2', truckId: 'tr1', maintenanceTypeId: 'mt2', kmInterval: 20_000, daysInterval: null, alertKmBefore: 1_500, alertDaysBefore: null, active: true },
  // tr2 — aceite: upcoming en km
  { id: 'am3', truckId: 'tr2', maintenanceTypeId: 'mt1', kmInterval: 10_000, daysInterval: 180,  alertKmBefore: 1_000, alertDaysBefore: 15,   active: true },
  // tr3 — frenos: ok
  { id: 'am4', truckId: 'tr3', maintenanceTypeId: 'mt3', kmInterval: 50_000, daysInterval: 365,  alertKmBefore: 3_000, alertDaysBefore: 30,   active: true },
  // tr4 — aceite: no_history
  { id: 'am5', truckId: 'tr4', maintenanceTypeId: 'mt1', kmInterval: 10_000, daysInterval: 180,  alertKmBefore: 1_000, alertDaysBefore: 15,   active: true },
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
  // dr1 licencia: renovada 2025-04-15, nextDue=2026-04-15, ~15 días restantes → UPCOMING
  { id: 'er1', driverId: 'dr1', expiryTypeId: 'det1', date: '2025-04-15', notes: '' },
  // dr1 psicotécnico: renovada reciente → ok
  { id: 'er2', driverId: 'dr1', expiryTypeId: 'det2', date: '2026-01-01', notes: '' },
  // dr2 licencia: venció → OVERDUE
  { id: 'er3', driverId: 'dr2', expiryTypeId: 'det1', date: '2025-01-15', notes: '' },
  // dr3 ART: sin registros → no_history (no ExpiryRecord para dea4)
]

// ── Expenses ─────────────────────────────────────────────────────────────────
export const expenses: Expense[] = [
  { id: 'ex1', supplierId: 'su1', date: '2026-04-12', concept: 'Combustible viaje Bahía',              truckId: 'tr3', orderId: null,  amount: 45_000, paymentMethod: 'cash', reference: '', notes: '' },
  { id: 'ex2', supplierId: 'su2', date: '2026-04-12', concept: 'Peaje R-0041 — Autopista del Sol km 37', truckId: 'tr3', orderId: 'or3', amount: 8_200,  paymentMethod: 'cash', reference: '', notes: '' },
]
