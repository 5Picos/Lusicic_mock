# Lusicic — System Design

## Overview

Lusicic is a web-based management system for transport companies. It covers four main domains:

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
 └── roundTripKm               -- added to truck.estimatedKm when receipt is saved

LocalityToll                   -- one row per toll booth per locality; drives auto-expense on receipt
 ├── id
 ├── localityId                -- FK → Locality
 ├── supplierId                -- FK → Supplier (typically type = "estatal")
 ├── description               -- toll booth label, e.g. "Autopista del Sol km 37", "AUBASA"
 └── amount                    -- toll cost for this booth (round trip)

Article (Artículo — catalog)
 ├── code                      -- unique alphanumeric identifier, e.g. "HRT-001"
 └── name                      -- descriptive name, e.g. "Harina de trigo 25kg"

OrderLine (ItemPedido)         -- articles included in an order
 ├── orderId                   -- FK → Order
 ├── articleId                 -- FK → Article
 └── quantity                  -- units dispatched

PriceList                      -- named price list (e.g. "CIP- 32t", "FCA")
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
 ├── modality                  -- "CIP" | "FCA"
 ├── tonnage                   -- number | null; recorded for CIPcontext
 ├── cargoDetail               -- free text
 ├── truckId                   -- FK → Truck; null until assigned
 ├── driverId                  -- FK → Driver; null until assigned
 ├── appliedPrice              -- selected by operator at creation; immutable after save
 └── status                    -- "pending" | "assigned" | "delivered" | "invoiced"

Receipt (Remito)               -- 1:1 with Order; confirms delivery
 ├── orderId                   -- FK → Order (unique)
 ├── receiptNumber             -- identifier from physical document
 ├── date
 ├── notes
 └── (articles derived from Order → OrderLine; no separate ReceiptLine needed)

── BILLING MODULE ─────────────────────────────────────────────────────────────

Invoice (Factura)
 ├── clientId                  -- FK → Client
 ├── date
 ├── total                     -- set at creation; not recomputed after save
 ├── status                    -- "pending" | "partially_paid" | "paid" — computed from InvoicePayment
 └── receiptIds[]              -- linked receipts (unique constraint per receipt)

InvoicePayment (Pago)          -- payment received for a specific invoice
 ├── invoiceId                 -- FK → Invoice
 ├── date
 ├── amount
 ├── paymentMethod             -- "cash" | "transfer" | "check"
 ├── reference                 -- check/transfer identifier
 └── notes

Check (Cheque)                 -- check received from client; independent bank clearance lifecycle
 ├── invoicePaymentId          -- FK → InvoicePayment (the payment this check covers)
 ├── bank
 ├── checkNumber
 ├── creditDate                -- expected bank credit date
 ├── amount
 └── status                   -- "pending" | "credited" — independent of Invoice.status

── AUTH MODULE ────────────────────────────────────────────────────────────────

User
 ├── name                     -- display name
 ├── email                    -- login credential; unique
 └── passwordHash             -- bcrypt hash; never stored in plain text

── EXPENSE MODULE ─────────────────────────────────────────────────────────────

ExpenseType (TipoGasto — catalog, user-configurable)
 ├── name                     -- e.g. "Combustible", "Estatal / Impuestos", "Sueldos"
 └── description              -- optional clarification

Supplier (Proveedor)
 ├── name, cuit, phone
 └── expenseTypeId            -- FK → ExpenseType

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

**Flexible price lists replace fixed CIP/FCA tables.** The old design had two hardcoded price tables (CIPPrice with price32t/price38t, and FCAPrice). The new model uses `PriceList` + `LocalityPrice`, which supports an unlimited number of named lists. The operator selects any list and locality when creating an order. This accommodates new client categories without schema changes.

**`appliedPrice` is operator-selected and immutable.** When creating an order, the operator picks the applicable price from the active price list for that locality. The stored value never changes, so historical records are unaffected by future price adjustments.

**One order = one truck, one round trip.** No multi-stop trips. Each order maps to exactly one truck assignment and exactly one receipt.

**`LocalityToll` rows drive automatic toll expense creation.** When the operator registers a receipt, the system reads all `LocalityToll` rows for the order's locality. The dialog shows one editable line per toll booth (supplier, description, amount). On save, one `Gasto` is created per toll entry with `orderId` set, linking each expense back to the order and making it queryable in `/informes/peajes`. Localities without `LocalityToll` rows generate no automatic expenses.

**`Receipt` articles are the same as the linked `Order`'s `OrderLine` rows.** Since the relationship is 1:1, there is no need for a separate `ReceiptLine` table. The receipt dialog reads `OrderLine` for the selected order and displays them read-only as the list of dispatched goods. If the actual delivered quantities differ from the order, the operator edits the `OrderLine` before confirming the receipt.

**`Expense.orderId` is the traceability key for tolls.** Manual expenses have `orderId = null`. Auto-generated toll expenses (one per `LocalityToll` entry) have `orderId` set. This single field separates operational expenses from toll payments in reports. Multiple toll expenses with the same `orderId` are expected and correct when a locality has several booths.

**Driver document expiry uses a date-only alert model.** The alert state machine for drivers mirrors the truck maintenance one, but drops the km axis entirely. `DriverExpiryType.daysInterval` and `alertDaysBefore` are the only parameters. The same four states apply: `ok | upcoming | overdue | no_history`.

**`ExpenseType` is a user-managed catalog.** Suppliers are grouped by expense type; this grouping drives the filter tabs in `/gastos`, the breakdown bars in `/informes/gastos`, and the category columns in `/informes/comparativo`. The initial seed data provides common types (Combustible, Estatal / Impuestos, Repuestos, Sueldos, Varios), but the operator can add, rename, or remove types without any code change.

**`InvoicePayment` links directly to a specific invoice.** Every payment is registered against the invoice it covers. There is no floating payment concept. If a client pays a lump sum covering multiple invoices, the operator registers one `InvoicePayment` per invoice. This makes `Invoice.status` trivially computable and eliminates the need for a separate imputation step.

**`Check` status is independent of `Invoice` status.** When a client pays with a check, the `InvoicePayment` is registered immediately (moving the invoice toward paid) and a linked `Check` record is created for bank clearance tracking. The check's own `status` tracks whether the bank has credited the funds. These two states must not be conflated.

**`Invoice.total` is stored at creation, not derived.** Recomputing from linked receipts after the fact would cause drift if receipts are edited. The stored value is authoritative.

**`Truck` has two odometer counters.** `estimatedKm` is incremented automatically when a receipt is saved (via `locality.roundTripKm`). `realKm` is updated manually from the physical odometer. Alert calculations always use `realKm`.

---

### Business Rules

**`Receipt.orderId` must be unique.** One receipt per order; enforced by unique constraint.

**`InvoiceReceipt.receiptId` must be unique.** A receipt cannot be linked to two invoices simultaneously.

**`orderNumber` must be unique.** Validated on save; duplicates are rejected.

**A locality must have an entry in the selected price list before an order can be saved.** If no `LocalityPrice` row exists for the combination, the system must reject the order.

**Receipts should not be deletable after km have been applied.** Deleting a receipt would inflate `estimatedKm` with no correction path. Use an explicit edit flow instead.

**`Invoice.status` is computed, not manually set.**
```
paid_sum = sum(InvoicePayment.amount) where invoiceId = invoice.id
pending          → paid_sum = 0
partially_paid   → 0 < paid_sum < invoice.total
paid             → paid_sum >= invoice.total
```

**One toll expense per `LocalityToll` entry is created on receipt save.** There is no opt-out. Localities with no `LocalityToll` rows generate no expenses. Amounts are editable in the dialog before saving; a zero amount still generates the expense record for audit purposes. Each generated expense carries the `supplierId` of its specific toll booth, not a shared supplier.

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
  └─→ One Expense created per LocalityToll row: orderId set, supplierId and amount from toll entry
  └─→ status = "delivered"

Receipt linked to Invoice
  └─→ status = "invoiced"

InvoicePayment recorded
  └─→ Payment registered directly against the invoice
  └─→ Invoice.status recomputed immediately (pending → partially_paid → paid)

Check received as payment method
  └─→ InvoicePayment created with paymentMethod = "check"
  └─→ Check record created and linked to InvoicePayment; Check.status = "pending"
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
- `/tipos-gasto` — Expense type catalog (user-configurable; drives supplier grouping and report breakdown)
- `/articulos` — Article catalog (code + name; referenced in orders and receipts)
- `/localidades` — Localities (km, toll booths per locality)
- `/precios` — Price lists (global adjustment, per-locality editing)
- `/usuarios` — User management (create / edit / deactivate login accounts)

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
- `/cobros` — Invoice payment registration (select invoice → register payment)
- `/cheques` — Check management
- `/gastos` — Expense registration (manual + auto-generated)

### Informes
Read-only period reports and operational summaries.
- `/informes/gastos` — Expenses by period (filterable by supplier type, breakdown by truck)
- `/informes/ingresos` — Income by period (breakdown by client and payment method)
- `/informes/comparativo` — Side-by-side income vs. expense comparison for a period
- `/informes/viajes` — Trips derived from Orders+Receipts; filtered by driver / truck / date range
- `/informes/peajes` — Toll expenses linked to receipts; filterable by period, driver, and locality
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

### `/pedidos`
- Summary cards: pending, assigned, delivered (with total to invoice), invoiced.
- Table: order number, date, destination client, locality, modality, price, truck/driver, articles (compact badge list), status.
- "New order" dialog: requesting client, destination client, locality, modality, tonnage, cargo detail, price list selection, article picker (add `OrderLine` rows: article + quantity).
- "Assign" action per row in `pending` state: select truck and driver.

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

### `/articulos`
- Table of all articles: code, name.
- "New article" dialog: code (unique), name.
- Edit dialog: same fields.
- Articles are referenced in orders; deleting an article that has order lines is blocked.

### `/remitos`
- Amber panel: orders in `assigned` status without a receipt, each with "Register receipt" shortcut.
- Full receipt table: each row includes a compact article list derived from the order's `OrderLine`.
- "Register receipt" dialog:
  - Select order (pre-selectable from amber panel shortcut).
  - Article section: read-only list of `OrderLine` rows for the selected order — columns: code, article name, quantity. Displayed for reference; the operator edits `OrderLine` on the order itself before creating the receipt if needed.
  - Toll section: shows one editable row per `LocalityToll` entry for the order's locality — columns: booth description, supplier, amount. Hidden if the locality has no toll entries.
  - On save: creates the `Receipt` + one `Expense` per toll row with `orderId` set and `concept = "Peaje {receiptNumber} — {toll.description}"`.
  - Also increments `truck.estimatedKm` by `locality.roundTripKm`.

### `/cuenta-corriente`
- **Section 1 — Pending to invoice:** receipts grouped by requesting client, table per client with remito, order, destination, date, price. Total per client.
- **Section 2 — Invoiced, pending collection:** expandable client cards. Per invoice: total, sum of `InvoicePayment.amount`, saldo (`total - paid_sum`), status badge. Only invoices with `status ≠ "paid"` shown by default; toggle to show all.
- Summary cards: total to invoice (blue), total to collect (red), combined total (dark).

### `/gastos`
- Filter by supplier type (tabs).
- 4 summary cards: total by category (combustible, estatal, repuestos, varios).
- Table: date, supplier, concept, truck, payment method, reference, amount.
- "Register expense" dialog: supplier (grouped by type), concept, date, amount, truck (optional), payment method, reference, notes.
- Auto-generated toll expenses (from remitos) appear in this list tagged with the order concept.

### `/cobros`
- List of all `InvoicePayment` records ordered by date descending.
- Summary cards: total collected in current month, count of invoices fully paid, count partially paid.
- "Register payment" dialog:
  - Select client → shows only invoices with `status ≠ "paid"` for that client (invoice date, total, saldo).
  - Select invoice.
  - Enter: date, amount (pre-filled with remaining saldo, editable for partial payment), payment method, reference, notes.
  - If `paymentMethod = "check"`: additional fields appear — bank, check number, credit date.
  - On save: creates `InvoicePayment`; if check, also creates `Check` linked to it; `Invoice.status` recomputes immediately.

### `/informes/gastos`
- Date range filter (defaults to current month).
- Breakdown bars: by supplier category, by truck.
- Detail table with total at footer.

### `/informes/ingresos`
- Date range filter (defaults to current month).
- Breakdown bars: by payment method, by client.
- Detail table with total at footer.

### `/informes/viajes`
- Data source: Orders in `delivered` or `invoiced` status joined with their Receipt. Each order with a receipt = one trip record.
- Trip fields derived: `Receipt.date` (delivery date), `Order.truckId`, `Order.driverId`, `Order.localityId → Locality.name` (destination), `Locality.roundTripKm` (km).
- Filters: date range (on Receipt.date), driver, truck (combinable).
- Breakdown bars: km by truck, km by driver.
- Detail table: date, truck, driver, destination, km. Total km at footer.

### `/informes/peajes`
- Shows only `Expense` records where `orderId ≠ null`.
- Filters: date range, driver (resolved via `Expense.orderId → Order.driverId`), locality.
- Summary: total, record count, distinct localities.
- Breakdown: by destination locality (with per-trip reference rate), by supplier.
- Detail table: date, concept, order number, driver, truck, supplier, amount.

### `/informes/comparativo`
- Date range filter (defaults to current month).
- 3 summary cards: total ingresos, total gastos, resultado neto (positive = green, negative = red).
- Income source: Orders in `delivered` or `invoiced` status with a Receipt in the period, using `Order.appliedPrice` as revenue. Grouped by client.
- Expense source: `Expense` records in the period. Grouped by supplier type (`combustible`, `estatal`, `repuestos`, `sueldos`, `varios`). Auto-generated toll expenses (`orderId ≠ null`) included.
- Left column: expense breakdown bar by supplier type.
- Right column: income breakdown bar by client.
- No detail table; this is a summary view. Link to `/informes/gastos` and `/informes/ingresos` for full detail.

### `/usuarios`
- Table of registered users (name, email, status).
- "New user" dialog: name, email, password (confirmed twice).
- Edit dialog: name, email, deactivate toggle (soft-disable login without deleting the record).
- No per-user permissions; all active users have full access.

### `/informes/facturas-destino`
- Invoiced orders grouped by `destinationClientId` (different view from the soliciting-client view in `/cuenta-corriente`).
- Per client: list of deliveries with remito, order, locality, date, price, invoice status.
- Highlights clients with unpaid invoices.

---

## Price List Model

Replaces the previous `CIPPrice`/`FCAPrice` dual-table design.

```
PriceList
  id: "lp1", name: "CIP- 32 toneladas"
  id: "lp2", name: "CIP- 38 toneladas"
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

1. System reads all `LocalityToll` rows for `order.localityId`. If none exist, skip toll generation.
2. Dialog renders one editable row per toll entry: description, supplier name, amount.
3. Operator adjusts amounts as needed (e.g. if toll has changed since the catalog was last updated).
4. On save: for each toll row, creates one `Expense`:
   - `supplierId` = `LocalityToll.supplierId`
   - `concept` = `"Peaje {receiptNumber} — {LocalityToll.description}"`
   - `truckId` = `order.truckId`
   - `orderId` = `order.id`
   - `amount` = edited amount for this row
   - `paymentMethod` = "cash"

A locality with 3 toll booths generates 3 separate `Expense` records on each receipt save, each traceable to its specific supplier. The `orderId` field is the traceability link. The toll report filters `WHERE orderId IS NOT NULL`.

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
4. **Articles** — populate the article catalog with all transported products (code + name).
5. **Suppliers** — register fuel stations, AFIP/ARBA, spare parts suppliers.
5. **Localities** — populate with `roundTripKm`; add one `LocalityToll` row per toll booth per destination (supplier, description, default amount).
6. **Price lists** — create lists and enter one `LocalityPrice` row per list × locality.
7. **Truck maintenance types** — create catalog; assign to trucks with overridden intervals if needed.
8. **Driver expiry types** — create catalog (license, psicotécnico, ART, etc.); assign to drivers.
9. **Expense types** — verify or adjust the seeded catalog (Combustible, Estatal / Impuestos, Repuestos, Sueldos, Varios); add any company-specific categories.
10. **Users** — create at least one login account via `/usuarios`; the system must not be accessible without at least one active user.
11. **Seed last known records** — optionally enter last maintenance date/km and last document renewal dates to start alert cycles from real data.

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

### LocalityToll
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `localityId` | string | FK → Locality |
| `supplierId` | string | FK → Supplier |
| `description` | string | Toll booth label, e.g. "Autopista del Sol km 37" |
| `amount` | number | Default toll cost for this booth (round trip); editable at receipt time |

### Article
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `code` | string | Unique; alphanumeric identifier |
| `name` | string | Descriptive product name |

### OrderLine
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `orderId` | string | FK → Order |
| `articleId` | string | FK → Article |
| `quantity` | number | Units dispatched |

### PriceList
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `name` | string | e.g. "CIP- 32t", "FCA" |

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
| `modality` | string | `"CIP"` \| `"FCA"` |
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

### InvoicePayment
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `invoiceId` | string | FK → Invoice |
| `date` | string | YYYY-MM-DD |
| `amount` | number | |
| `paymentMethod` | string | `"cash"` \| `"transfer"` \| `"check"` |
| `reference` | string | Transfer ID or check number |
| `notes` | string | |

### Check
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `invoicePaymentId` | string | FK → InvoicePayment |
| `bank` | string | |
| `checkNumber` | string | |
| `creditDate` | string | Expected bank credit date |
| `amount` | number | |
| `status` | string | `"pending"` \| `"credited"` — independent of Invoice.status |

### User
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `name` | string | Display name |
| `email` | string | Unique; login credential |
| `passwordHash` | string | bcrypt hash; never stored plain text |
| `active` | boolean | Soft-disable; inactive users cannot log in |

### ExpenseType
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `name` | string | e.g. "Combustible", "Sueldos" |
| `description` | string | Optional |

### Supplier
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `name` | string | |
| `expenseTypeId` | string | FK → ExpenseType |
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
