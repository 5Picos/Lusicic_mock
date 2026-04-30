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
