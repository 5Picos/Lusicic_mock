# FlotaTrack — System Design

## Overview

FlotaTrack is a web-based management system for transport companies. It covers four main domains:

1. **Maintenance tracking** — alerts when trucks or drivers are due for service or document renewal, based on elapsed time and/or accumulated kilometers.
2. **Order and billing management** — tracks transport orders from reception through delivery, receipts, invoicing, and accounts receivable.
3. **Expense management** — registers payments to suppliers (fuel, tolls, spare parts, government entities), including auto-generated toll expenses when a receipt is created.
4. **Reporting** — period-based reports for expenses, income, trips, tolls, and operational summaries.

---

## Domain Model

### Entities and Relationships

```
── MAINTENANCE MODULE ─────────────────────────────────────────────────────────

MaintenanceType (catalog — for trucks)
 ├── name, description
 ├── defaultKmInterval         -- null if km-based trigger not applicable
 ├── defaultDaysInterval       -- null if time-based trigger not applicable
 ├── defaultAlertKmBefore      -- warning threshold in km
 └── defaultAlertDaysBefore    -- warning threshold in days

Truck
 ├── plate, description, brand, model, year
 ├── realKm                    -- manually confirmed odometer reading
 └── estimatedKm               -- accumulated from receipts via locality.roundTripKm

AssignedMaintenance            -- junction between Truck and MaintenanceType
 ├── truckId
 ├── maintenanceTypeId
 ├── kmInterval                -- overrides type default; null = no km trigger
 ├── daysInterval              -- overrides type default; null = no time trigger
 ├── alertKmBefore
 ├── alertDaysBefore
 └── active                   -- soft-disable without deleting history

MaintenanceRecord              -- log entry when maintenance is performed
 ├── truckId
 ├── maintenanceTypeId
 ├── driverId                  -- driver who took the truck to the service shop
 ├── date
 ├── kmAtMoment                -- odometer reading at time of service
 └── notes

── DRIVER EXPIRY MODULE ───────────────────────────────────────────────────────

DriverExpiryType (catalog — for drivers)
 ├── name, description
 ├── daysInterval              -- renewal frequency in days (no km component)
 └── alertDaysBefore           -- warning threshold in days

Driver
 ├── name, phone, email
 └── (referenced in orders, maintenance records, and expiry records)

DriverExpiryAssigned           -- junction between Driver and DriverExpiryType
 ├── driverId
 ├── expiryTypeId
 ├── daysInterval              -- overrides type default
 ├── alertDaysBefore           -- overrides type default
 └── active

ExpiryRecord                   -- log entry when a document/certificate is renewed
 ├── driverId
 ├── expiryTypeId
 ├── date
 └── notes

── ORDER MODULE ───────────────────────────────────────────────────────────────

Client
 ├── name, phone, email
 └── (acts as requesting client, destination client, or both depending on the order)

Locality (catalog)
 ├── name
 ├── roundTripKm               -- added to truck.estimatedKm when receipt is saved
 └── peaje                     -- estimated toll cost for the round trip; auto-fills
                                  toll expense when a receipt is created

PriceList                      -- named price list (e.g. "SIP - 32t", "FCA")
 └── name

LocalityPrice                  -- price per locality per list
 ├── priceListId               -- FK → PriceList
 ├── localityId                -- FK → Locality
 └── price                     -- single price; supports unlimited lists

Order                          -- one order = one truck round trip
 ├── orderNumber               -- unique; manually entered
 ├── date
 ├── requestingClientId        -- FK → Client (who places the order)
 ├── destinationClientId       -- FK → Client (who receives the delivery)
 ├── localityId                -- FK → Locality
 ├── modality                  -- "SIP" | "FCA"
 ├── tonnage                   -- number | null; recorded for SIP context
 ├── cargoDetail               -- free text
 ├── truckId                   -- FK → Truck; null until assigned
 ├── driverId                  -- FK → Driver; null until assigned
 ├── appliedPrice              -- selected by operator at creation; immutable after save
 └── status                    -- "pending" | "assigned" | "delivered" | "invoiced"

Receipt (Remito)               -- 1:1 with Order; confirms delivery
 ├── orderId                   -- FK → Order (unique)
 ├── receiptNumber             -- identifier from physical document
 ├── date
 └── notes

── BILLING MODULE ─────────────────────────────────────────────────────────────

Invoice (Factura)
 ├── clientId                  -- FK → Client
 ├── date
 ├── total                     -- set at creation; not recomputed after save
 ├── status                    -- "pending" | "partially_paid" | "paid"
 └── receiptIds[]              -- linked receipts (unique constraint per receipt)

ClientPayment (Cobro)          -- payment received from a client; floating (not yet
 ├── clientId                    linked to a specific invoice)
 ├── date
 ├── amount
 ├── paymentMethod             -- "cash" | "transfer" | "check"
 ├── reference                 -- check/transfer identifier
 └── notes

Check (Cheque)                 -- check received from client; independent status lifecycle
 ├── bank
 ├── checkNumber
 ├── creditDate                -- expected bank credit date
 ├── amount
 ├── clientName
 ├── invoiceDate
 └── status                   -- "pending" | "credited"

── EXPENSE MODULE ─────────────────────────────────────────────────────────────

Supplier (Proveedor)
 ├── name, cuit, phone
 └── type                     -- "combustible" | "estatal" | "repuestos" | "varios"

Expense (Gasto)
 ├── supplierId               -- FK → Supplier
 ├── date
 ├── concept                  -- free text description
 ├── truckId                  -- FK → Truck; null for general expenses
 ├── orderId                  -- FK → Order; non-null for auto-generated toll expenses
 ├── amount
 ├── paymentMethod            -- "cash" | "transfer" | "check"
 ├── reference
 └── notes
```

---

### Key Design Decisions

**Flexible price lists replace fixed SIP/FCA tables.** The old design had two hardcoded price tables (SIPPrice with price32t/price38t, and FCAPrice). The new model uses `PriceList` + `LocalityPrice`, which supports an unlimited number of named lists. The operator selects any list and locality when creating an order. This accommodates new client categories without schema changes.

**`appliedPrice` is operator-selected and immutable.** When creating an order, the operator picks the applicable price from the active price list for that locality. The stored value never changes, so historical records are unaffected by future price adjustments.

**One order = one truck, one round trip.** No multi-stop trips. Each order maps to exactly one truck assignment and exactly one receipt.

**`Locality.peaje` drives automatic toll expense creation.** When the operator registers a receipt, the system reads `locality.peaje` and pre-fills the toll amount in the dialog. On save, a `Gasto` is created automatically with `orderId` set. This links the expense back to the order and makes it queryable in the toll report (`/informes/peajes`). The operator can override the amount and select the toll authority from the supplier list.

**`Expense.orderId` is the traceability key for tolls.** Manual expenses have `orderId = null`. Auto-generated toll expenses have `orderId` set. This single field is sufficient to separate operational expenses from toll payments in reports.

**Driver document expiry uses a date-only alert model.** The alert state machine for drivers mirrors the truck maintenance one, but drops the km axis entirely. `DriverExpiryType.daysInterval` and `alertDaysBefore` are the only parameters. The same four states apply: `ok | upcoming | overdue | no_history`.

**`ClientPayment` is floating — not imputed to invoices.** A received payment is recorded against a client, not against a specific invoice. Invoice application is a separate future step. This avoids blocking cash registration when the accounting context is unclear.

**`Check` status is independent of `Invoice` status.** Receiving a check moves the invoice to paid (or partially paid) immediately. The check's own status tracks bank clearance separately. These two states must not be conflated.

**`Invoice.total` is stored at creation, not derived.** Recomputing from linked receipts after the fact would cause drift if receipts are edited. The stored value is authoritative.

**`Truck` has two odometer counters.** `estimatedKm` is incremented automatically when a receipt is saved (via `locality.roundTripKm`). `realKm` is updated manually from the physical odometer. Alert calculations always use `realKm`.

---

### Business Rules

**`Receipt.orderId` must be unique.** One receipt per order; enforced by unique constraint.

**`InvoiceReceipt.receiptId` must be unique.** A receipt cannot be linked to two invoices simultaneously.

**`orderNumber` must be unique.** Validated on save; duplicates are rejected.

**A locality must have an entry in the selected price list before an order can be saved.** If no `LocalityPrice` row exists for the combination, the system must reject the order.

**Receipts should not be deletable after km have been applied.** Deleting a receipt would inflate `estimatedKm` with no correction path. Use an explicit edit flow instead.

**`Invoice.status` is computed, not manually set.** The system updates it based on the sum of linked payments vs. total.

**Toll expense is always created on receipt save.** There is no opt-out checkbox. If the operator enters zero as the toll amount, the system should still create the expense record with amount = 0 for audit purposes.

---

## Alert State Machine

Two parallel state machines share the same four states and the same priority order.

### States

| State | Meaning |
|---|---|
| `ok` | Within safe range on all axes |
| `upcoming` | Within warning threshold on at least one axis |
| `overdue` | Past due on at least one axis |
| `no_history` | No record exists for this assignment |

Priority (most critical wins): `overdue` > `upcoming` > `ok` > `no_history`

---

### Truck Maintenance Alert

For each `AssignedMaintenance`:

1. Find the most recent `MaintenanceRecord` for `truckId + maintenanceTypeId`. If none → `no_history`.
2. **Km axis** (if `kmInterval` ≠ null):
   - `nextDueKm = record.kmAtMoment + assignment.kmInterval`
   - `kmRemaining = nextDueKm - truck.realKm`
   - `≤ 0` → `overdue` / `≤ alertKmBefore` → `upcoming` / else → `ok`
3. **Date axis** (if `daysInterval` ≠ null):
   - `nextDueDate = record.date + assignment.daysInterval`
   - `daysRemaining = nextDueDate - today`
   - `≤ 0` → `overdue` / `≤ alertDaysBefore` → `upcoming` / else → `ok`
4. Final state = most critical of km state and date state.

---

### Driver Expiry Alert

For each `DriverExpiryAssigned`:

1. Find the most recent `ExpiryRecord` for `driverId + expiryTypeId`. If none → `no_history`.
2. **Date axis only:**
   - `nextDueDate = record.date + assignment.daysInterval`
   - `daysRemaining = nextDueDate - today`
   - `≤ 0` → `overdue` / `≤ alertDaysBefore` → `upcoming` / else → `ok`

---

### Dashboard Display

The dashboard renders both alert tables in sequence:
- **Trucks** — maintenance alerts sorted by priority then plate
- **Drivers** — expiry alerts sorted by priority then name
- Summary cards count all items from both tables combined.

---

## Order Lifecycle

```
Order created
  └─→ appliedPrice selected by operator from PriceList × LocalityPrice
  └─→ status = "pending"

Truck and driver assigned
  └─→ status = "assigned"

Receipt registered
  └─→ truck.estimatedKm += locality.roundTripKm
  └─→ Expense (Gasto) created: type = toll, orderId set, amount = locality.peaje
  └─→ status = "delivered"

Receipt linked to Invoice
  └─→ status = "invoiced"

ClientPayment recorded
  └─→ Floating payment registered against client (not yet applied to invoice)
  └─→ Invoice.status updated when payment is imputed

Check received as payment
  └─→ Check.status = "pending"
  └─→ When bank clears: Check.status = "credited"
```

---

## Navigation Structure

The sidebar is organized into five accordion groups:

### Maestros
Catalog entities that are referenced by operational records.
- `/camiones` — Trucks
- `/choferes` — Drivers (includes expiry management, expandable per driver)
- `/clientes` — Clients
- `/proveedores` — Suppliers
- `/localidades` — Localities (km, toll)
- `/precios` — Price lists (global adjustment, per-locality editing)

### Mantenimiento
Truck and driver maintenance tracking.
- `/dashboard` — Combined alert dashboard (trucks + drivers)
- `/mantenimientos` — Truck maintenance type catalog
- `/historial` — Truck maintenance record log
- `/vencimientos-chofer` — Driver expiry type catalog

### Administración
Operational and financial flows.
- `/pedidos` — Orders
- `/remitos` — Receipts (creation triggers toll expense)
- `/facturacion` — Invoices
- `/cuenta-corriente` — Accounts receivable pipeline (pending to invoice + pending to collect)
- `/cobros` — Client payment registration (floating)
- `/cheques` — Check management
- `/gastos` — Expense registration (manual + auto-generated)

### Informes
Read-only period reports and operational summaries.
- `/informes/gastos` — Expenses by period (filterable by supplier type, breakdown by truck)
- `/informes/ingresos` — Income by period (breakdown by client and payment method)
- `/informes/viajes` — Trips by driver / truck / date range
- `/informes/peajes` — Toll expenses linked to receipts (by locality and supplier)
- `/informes/facturas-destino` — Invoices grouped by destination client
- `/remitos` — Orders without receipt (amber panel)
- `/pedidos` — Unassigned orders
- `/cuenta-corriente` — Receipts pending invoicing
- `/cheques` — Checks pending deposit

---

## Page Reference

### `/dashboard`
- 4 summary cards: overdue, upcoming, ok, no_history (combined trucks + drivers).
- Table: truck maintenance alerts (plate, type, state, next km, next date, remaining).
- Table: driver expiry alerts (name, document type, state, next date, remaining days).

### `/camiones`
- Card grid with color bar (worst alert state per truck).
- Real km / estimated km displayed side by side.
- Chips for assigned maintenance types with state colors.

### `/choferes`
- Expandable card per driver.
- Header shows color dot (worst expiry state).
- Expanded panel shows:
  - Active expiry grid: each document with state badge, next due date, days remaining.
  - Renewal history table with filter by document type.
  - "Register renewal" button → dialog (type, date, notes).

### `/remitos`
- Amber panel: delivered orders without receipt, each with "Register receipt" shortcut.
- Full receipt table with toll column.
- "Register receipt" dialog: select order → auto-fills toll amount from `locality.peaje` → select toll supplier → on save: creates receipt + creates toll Gasto with `orderId` set.

### `/cuenta-corriente`
- **Section 1 — Pending to invoice:** receipts grouped by requesting client, table per client with remito, order, destination, date, price. Total per client.
- **Section 2 — Invoiced, pending collection:** expandable client cards with invoice detail, payment history, saldo per invoice.
- Summary cards: total to invoice (blue), total to collect (red), combined total (dark).

### `/gastos`
- Filter by supplier type (tabs).
- 4 summary cards: total by category (combustible, estatal, repuestos, varios).
- Table: date, supplier, concept, truck, payment method, reference, amount.
- "Register expense" dialog: supplier (grouped by type), concept, date, amount, truck (optional), payment method, reference, notes.
- Auto-generated toll expenses (from remitos) appear in this list tagged with the order concept.

### `/cobros`
- List of floating client payments ordered by date.
- Summary cards: total collected, top clients.
- "Register payment" dialog: client, date, amount, payment method (cash/transfer/check), reference, notes.

### `/informes/gastos`
- Date range filter (defaults to current month).
- Breakdown bars: by supplier category, by truck.
- Detail table with total at footer.

### `/informes/ingresos`
- Date range filter (defaults to current month).
- Breakdown bars: by payment method, by client.
- Detail table with total at footer.

### `/informes/viajes`
- Filters: date range, driver, truck (combinable).
- Breakdown bars: km by truck, km by driver.
- Detail table: date, truck, driver, origin, destination, km. Total km at footer.

### `/informes/peajes`
- Shows only `Expense` records where `orderId ≠ null`.
- Summary: total, record count, distinct localities.
- Breakdown: by destination locality (with per-trip reference rate), by supplier.
- Detail table: date, concept, order number, truck, supplier, amount.

### `/informes/facturas-destino`
- Invoiced orders grouped by `destinationClientId` (different view from the soliciting-client view in `/cuenta-corriente`).
- Per client: list of deliveries with remito, order, locality, date, price, invoice status.
- Highlights clients with unpaid invoices.

---

## Price List Model

Replaces the previous `SIPPrice`/`FCAPrice` dual-table design.

```
PriceList
  id: "lp1", name: "SIP - 32 toneladas"
  id: "lp2", name: "SIP - 38 toneladas"
  id: "lp3", name: "FCA"

LocalityPrice (one row per list × locality combination)
  priceListId | localityId | price
  lp1         | loc1       | 85000
  lp1         | loc2       | 145000
  lp3         | loc1       | 90000
  ...
```

The operator can add new lists without schema changes. The `/precios` page supports:
- Tab navigation between lists.
- Per-row inline price editing.
- Global adjustment panel: apply % or fixed-amount change to all rows in the active list.

---

## Expense Auto-Generation (Toll Flow)

When a receipt is saved:

1. System reads `order.localityId → locality.peaje`.
2. Dialog pre-fills `tollAmount = locality.peaje` (operator can edit).
3. Operator selects the toll authority from the supplier list (defaults to first `type = "estatal"` supplier).
4. On save: creates `Expense` with:
   - `supplierId` = selected supplier
   - `concept` = `"Peaje {receiptNumber} — {localityName}"`
   - `truckId` = `order.truckId`
   - `orderId` = `order.id`
   - `amount` = edited toll amount
   - `paymentMethod` = "cash"

The `orderId` field is the traceability link. The toll report filters `WHERE orderId IS NOT NULL`.

---

## Driver Expiry Workflows

### Registering a Renewal

```
1. Go to Drivers → expand driver card
2. Click "Register renewal"
3. Select document type (from assigned types)
4. Enter date of renewal and optional notes
5. Save → ExpiryRecord created; alert state recalculates immediately
```

### Adding a New Expiry Type

```
1. Go to Maintenance → Driver expiry types → New type
2. Enter: name, description, renewal interval (days), alert threshold (days)
3. Type is available for assignment to any driver
4. Existing driver assignments are not affected
```

### Dashboard Integration

Driver expiry alerts appear in the second table of `/dashboard`. The four summary cards count items from both truck maintenance and driver expiry tables combined, giving a unified view of all compliance obligations.

---

## System Bootstrap (First Install)

1. **Trucks** — register all vehicles with current real odometer reading.
2. **Drivers** — register all personnel.
3. **Clients** — register all known clients.
4. **Suppliers** — register fuel stations, AFIP/ARBA, spare parts suppliers.
5. **Localities** — populate with `roundTripKm` and `peaje` per destination.
6. **Price lists** — create lists and enter one `LocalityPrice` row per list × locality.
7. **Truck maintenance types** — create catalog; assign to trucks with overridden intervals if needed.
8. **Driver expiry types** — create catalog (license, psicotécnico, ART, etc.); assign to drivers.
9. **Seed last known records** — optionally enter last maintenance date/km and last document renewal dates to start alert cycles from real data.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 16 (App Router) | Mix of server and client components |
| Styling | Tailwind CSS v4 + shadcn/ui | base-ui based component library |
| Type safety | TypeScript strict mode | All interfaces in `lib/mock-data.ts` |
| State | React `useState` | No global state manager; local per page |
| Data | Static mock arrays | No backend; mock data in `lib/mock-data.ts` |
| Backend (v2) | Next.js API Routes | Same repository |
| Database (v2) | PostgreSQL | Via Supabase |
| Auth (v2) | NextAuth.js | Email/password; single role |
| Hosting (v2) | Vercel + Supabase | Free tier sufficient at this scale |
| Notifications (v3) | Twilio / Meta Cloud API | WhatsApp alerts for overdue items |

Current prototype uses static mock data. The data model, calculation logic, and UI are designed so that replacing mock arrays with API calls requires minimal changes to page components.

---

## Entity Field Reference

### Truck
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `plate` | string | Unique |
| `description` | string | |
| `brand` | string | |
| `model` | string | |
| `year` | number | |
| `realKm` | number | Manual odometer |
| `estimatedKm` | number | Auto from receipts |

### Driver
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `name` | string | |
| `phone` | string | |
| `email` | string | |

### MaintenanceType
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `name` | string | |
| `description` | string | |
| `defaultKmInterval` | number \| null | |
| `defaultDaysInterval` | number \| null | |
| `defaultAlertKmBefore` | number \| null | |
| `defaultAlertDaysBefore` | number \| null | |

### AssignedMaintenance
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `truckId` | string | FK → Truck |
| `maintenanceTypeId` | string | FK → MaintenanceType |
| `kmInterval` | number \| null | Overrides type default |
| `daysInterval` | number \| null | Overrides type default |
| `alertKmBefore` | number \| null | |
| `alertDaysBefore` | number \| null | |
| `active` | boolean | Soft delete |

### MaintenanceRecord
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `truckId` | string | FK → Truck |
| `maintenanceTypeId` | string | FK → MaintenanceType |
| `driverId` | string | FK → Driver |
| `date` | string | YYYY-MM-DD |
| `kmAtMoment` | number | |
| `notes` | string | |

### DriverExpiryType
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `name` | string | |
| `description` | string | |
| `daysInterval` | number | Renewal frequency |
| `alertDaysBefore` | number | Warning threshold |

### DriverExpiryAssigned
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `driverId` | string | FK → Driver |
| `expiryTypeId` | string | FK → DriverExpiryType |
| `daysInterval` | number | Overrides type default |
| `alertDaysBefore` | number | Overrides type default |
| `active` | boolean | Soft delete |

### ExpiryRecord
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `driverId` | string | FK → Driver |
| `expiryTypeId` | string | FK → DriverExpiryType |
| `date` | string | YYYY-MM-DD |
| `notes` | string | |

### Client
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `name` | string | |
| `phone` | string | |
| `email` | string | |

### Locality
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `name` | string | |
| `roundTripKm` | number | Added to truck.estimatedKm on receipt |
| `peaje` | number | Toll cost; pre-fills toll expense on receipt creation |

### PriceList
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `name` | string | e.g. "SIP - 32t", "FCA" |

### LocalityPrice
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `priceListId` | string | FK → PriceList |
| `localityId` | string | FK → Locality |
| `price` | number | |

### Order
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `orderNumber` | string | Unique; manually entered |
| `date` | string | YYYY-MM-DD |
| `requestingClientId` | string | FK → Client |
| `destinationClientId` | string | FK → Client |
| `localityId` | string | FK → Locality |
| `modality` | string | `"SIP"` \| `"FCA"` |
| `tonnage` | number \| null | Optional for FCA |
| `cargoDetail` | string | |
| `truckId` | string \| null | Null until assigned |
| `driverId` | string \| null | Null until assigned |
| `appliedPrice` | number | Selected at creation; immutable |
| `status` | string | `"pending"` \| `"assigned"` \| `"delivered"` \| `"invoiced"` |

### Receipt
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `orderId` | string | FK → Order — unique |
| `receiptNumber` | string | |
| `date` | string | YYYY-MM-DD |
| `notes` | string | |

### Invoice
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `clientId` | string | FK → Client |
| `date` | string | YYYY-MM-DD |
| `total` | number | Set at creation; not recomputed |
| `status` | string | `"pending"` \| `"partially_paid"` \| `"paid"` |

### ClientPayment
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `clientId` | string | FK → Client |
| `date` | string | YYYY-MM-DD |
| `amount` | number | |
| `paymentMethod` | string | `"cash"` \| `"transfer"` \| `"check"` |
| `reference` | string | Check/transfer identifier |
| `notes` | string | |

### Check
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `bank` | string | |
| `checkNumber` | string | |
| `creditDate` | string | Expected bank credit date |
| `amount` | number | |
| `clientName` | string | Denormalized for display |
| `status` | string | `"pending"` \| `"credited"` — independent of Invoice.status |

### Supplier
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `name` | string | |
| `type` | string | `"combustible"` \| `"estatal"` \| `"repuestos"` \| `"varios"` |
| `cuit` | string | Tax ID |
| `phone` | string | |

### Expense
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `supplierId` | string | FK → Supplier |
| `date` | string | YYYY-MM-DD |
| `concept` | string | Free text |
| `truckId` | string \| null | FK → Truck; null for general expenses |
| `orderId` | string \| null | FK → Order; non-null = auto-generated toll expense |
| `amount` | number | |
| `paymentMethod` | string | `"cash"` \| `"transfer"` \| `"check"` |
| `reference` | string | |
| `notes` | string | |
