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
  geotabDeviceId: string | null
  geotabKm: number | null
  geotabKmSyncedAt: string | null
}

export interface Driver {
  id: string
  name: string
  phone: string
  email: string
  defaultTruckId: string | null
}

export interface MaintenanceCategory {
  id: string
  name: string
  description: string
}

export interface MaintenanceType {
  id: string
  name: string
  description: string
  categoryId: string
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

export type VehicleIssueStatus = 'pendiente' | 'atendido' | 'solucionado' | 'descartado'
export type VehicleIssueSource = 'app' | 'manual'

export interface VehicleIssueReport {
  id: string
  date: string
  truckId: string
  driverId: string
  description: string
  status: VehicleIssueStatus
  source: VehicleIssueSource
}

export type DeviceStatus = 'active' | 'revoked'
export type DevicePlatform = 'android' | 'ios'

export interface Device {
  id: string
  driverId: string
  installationId: string
  platform: DevicePlatform
  model: string
  status: DeviceStatus
  enrolledAt: string
  lastSeenAt: string | null
  revokedAt: string | null
  revokedReason: string | null
}

export interface EnrollmentCode {
  id: string
  driverId: string
  code: string
  createdAt: string
  expiresAt: string
  usedAt: string | null
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
  unitWeightKg: number | null
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
  clientId: string | null
  isDefault: boolean
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
  deliveryDate: string
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
  tonnage: number | null
}

export interface Invoice {
  id: string
  invoiceNumber: string
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

export type UserRole = 'admin' | 'operador'
export type Section = 'maestros' | 'mantenimiento' | 'administracion' | 'informes'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: Section[]
}
