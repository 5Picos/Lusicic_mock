# FlotaTrack — UI Design Spec

**Fecha:** 2026-04-30
**Stack:** Next.js 16 App Router · Tailwind CSS v4 · shadcn/ui · TypeScript · Inter (fuente)

---

## 1. Dirección visual

**Estilo:** Clean Light — fondo blanco/gris claro, azul como acento primario. Sin dark mode en v1.

**Tono:** Herramienta operativa profesional. Legible todo el día. Las alertas comunican urgencia sin ser alarmistas. Similar en sensación a Linear o Vercel Dashboard — familiar para usuarios que vienen de Excel.

---

## 2. Sistema de colores

### Neutrales

| Token | Valor | Uso |
|---|---|---|
| `white` | `#ffffff` | Fondo de cards, tablas, sidebar |
| `slate-50` | `#f8fafc` | Fondo de página, header de tabla |
| `slate-100` | `#f1f5f9` | Hover de filas, badge bg no_history |
| `slate-200` | `#e2e8f0` | Bordes generales |
| `slate-500` | `#64748b` | Texto secundario, labels de columna |
| `slate-800` | `#1e293b` | Texto principal |

### Azul — acento primario

| Token | Valor | Uso |
|---|---|---|
| `blue-50` | `#eff6ff` | Fondo item activo en sidebar, badge bg info |
| `blue-200` | `#bfdbfe` | Borde suave en cards de precio seleccionado |
| `blue-600` | `#2563eb` | Botones primarios, links de acción, borde activo sidebar |
| `blue-700` | `#1d4ed8` | Hover de botón primario |

### Semáforo de alertas

Cada estado tiene una tripleta: **fondo de fila** (muy suave) / **badge background** / **color de borde izquierdo y texto**.

| Estado | Fondo fila | Badge bg | Color |
|---|---|---|---|
| `overdue` | `red-50 #fef2f2` | `red-100 #fee2e2` | `red-600 #dc2626` |
| `upcoming` | `amber-50 #fffbeb` | `amber-100 #fef3c7` | `amber-600 #d97706` |
| `ok` | `green-50 #f0fdf4` | `green-100 #dcfce7` | `green-600 #16a34a` |
| `no_history` | `slate-50 #f8fafc` | `slate-100 #f1f5f9` | `slate-400 #94a3b8` |

Prioridad de color en la tripleta: `overdue > upcoming > ok > no_history` — el estado más crítico de una fila gana.

---

## 3. Tipografía — Inter

Cargada via `next/font/google`. `font-variant-numeric: tabular-nums` aplicado a todos los números en tablas y cards.

| Uso | Tamaño | Peso |
|---|---|---|
| Título de página | 20–24px | 700 · tracking -0.02em |
| Encabezado de sección / card | 15px | 600 |
| Texto de tabla y formularios | 13px | 400 |
| Label de columna | 11px | 600 · uppercase · letter-spacing 0.05em |
| Texto secundario / fecha | 11–12px | 400 · slate-500 |
| Números grandes (summary cards) | 22–26px | 700 · tracking -0.02em |

---

## 4. Layout shell

### Sidebar (220px fijo)

- Fondo: `white` (contrasta con el fondo de página `slate-50`)
- **Header:** logo "FlotaTrack" 15px/700 + subtítulo "Gestión de flota" en slate-400
- **Nav:** 4 grupos accordion — solo el grupo de la página activa se expande; los demás muestran solo el label con chevron
  - Grupo colapsado: label 11px/600 slate-400 + chevron `▸`
  - Grupo expandido: label 11px/600 slate-800 + chevron `▾` + fondo slate-50
  - Item activo: fondo blue-50, borde derecho 2px blue-600, texto slate-800 500
  - Item inactivo: texto slate-500, hover fondo slate-50
  - Íconos: Lucide React, 14px, alineados a la izquierda del label con 6px de gap
- **Footer:** avatar circular con iniciales (26px) + nombre de usuario + rol "Operador"

### Top bar (44px)

- Fondo: `white`, border-bottom slate-200
- Izquierda: breadcrumb `Grupo › Página` — grupo en slate-500, página en slate-800/500
- Derecha: iconos de utilidad (futuro: notificaciones)

### Área de contenido

- Fondo: `slate-50`
- Padding: 20px en todos los lados
- **Page header:** título + subtítulo opcional a la izquierda; botón de acción primaria a la derecha
- Cards y tablas sobre fondo `white` con borde `slate-200` y `border-radius: 8px` (rounded-lg)

---

## 5. Componentes clave

### StatusBadge

Pill redondeado (`rounded-full`), 10–11px/600, padding 2px 8px.

Variante `alert` (4 estados):

```
overdue   → bg red-100   · text red-600   · "VENCIDO"
upcoming  → bg amber-100 · text amber-700 · "PRÓXIMO"
ok        → bg green-100 · text green-700 · "AL DÍA"
no_history→ bg slate-100 · text slate-500 · "SIN HISTORIAL"
```

Variante `lifecycle` (ciclo de pedidos):

```
pending        → bg slate-100  · text slate-600  · "PENDIENTE"
assigned       → bg amber-100  · text amber-700  · "ASIGNADO"
delivered      → bg green-100  · text green-700  · "ENTREGADO"
invoiced       → bg violet-100 · text violet-700 · "FACTURADO"
```

Variante `payment` (estado de factura):

```
pending        → bg red-100   · text red-600   · "PENDIENTE COBRO"
partially_paid → bg amber-100 · text amber-700 · "PAGO PARCIAL"
paid           → bg green-100 · text green-700 · "PAGADO"
```

### SummaryCard — Variante A (alertas con color semántico)

Usada en: `/dashboard` (overdue, upcoming, ok, no_history).

- Fondo `white`, borde lateral slate-200 (tenue, del color del estado), **borde superior 3px del color del estado**
- Número grande: 22–26px/700 del color del estado
- Label: 10px/600 uppercase slate-500

### SummaryCard — Variante C (informativa, sin color semántico)

Usada en: `/pedidos`, `/facturacion`, `/cuenta-corriente`, `/cobros`.

- Fondo `white`, borde slate-200, sin borde superior de color
- Ícono en badge suave (16px en caja 28px, fondo blue-50 o slate-50)
- Número grande: 22–26px/700 slate-800
- Label: 10px/600 uppercase slate-500
- Subtítulo contextual: 11px slate-400 (ej: "$2.840.000 a facturar")

### DataTable

- Toolbar: buscador (flex-1, max-w 240px) + filtros de estado (select) + botón primario (margin-left auto)
- Header: fondo slate-50, texto 10px/600 uppercase slate-500, border-bottom slate-200
- Filas: padding 9px vertical / 14px horizontal
- Separador entre filas: `border-bottom slate-100` (muy suave, no slate-200)
- Hover: fondo slate-50
- Filas con estado de alerta: fondo del estado (muy suave) + borde izquierdo 3px del color del estado
- Acciones contextuales: links inline a la derecha, texto blue-600, cambian según estado de la fila

### AmberPanel

- Fondo amber-50, borde amber-200, rounded-lg
- Header: ícono ⚠️ + conteo + descripción en amber-800/600 + label accionable a la derecha
- Filas de items: fondo white, borde amber-200, rounded-md; link de acción a la derecha en blue-600
- Se oculta cuando no hay pendientes (`hidden` si array vacío)

### PageHeader

- Título 20px/700 slate-800 + subtítulo opcional 12px slate-500 debajo
- Botón primario de acción alineado arriba a la derecha
- Margin bottom 16px antes de las summary cards

---

## 6. Patrón Modal vs Sheet

### Modal (shadcn/ui Dialog)

Formularios simples — ≤5 campos, sin secciones ni listas dinámicas.

Ejemplos: Asignar camión/chofer · Nuevo artículo · Nueva localidad · Nuevo tipo de mantenimiento · Registrar renovación de documento chofer · Confirmar eliminación.

- Ancho: `max-w-md` (448px)
- Header: título 13px/700 + botón ✕
- Body: campos con labels 10px/600 uppercase slate-500
- Footer: bg slate-50, border-top, botones "Cancelar" (outline) + "Guardar" (primary)

### Sheet (shadcn/ui Sheet — side=right)

Formularios complejos — 2+ secciones o listas dinámicas.

Ejemplos: Nuevo pedido (cliente + localidad + precio + picker de artículos) · Registrar remito (artículos read-only + peajes editables) · Registrar cobro (cliente → factura → pago → cheque opcional) · Nueva factura · Nuevo camión · Nuevo chofer.

- Ancho: `w-[480px]` (fijo, no overlay completo)
- Secciones internas separadas por `border-t slate-100` con título de sección 11px/600 uppercase slate-500
- Footer pegado al bottom: bg slate-50, border-top, mismos botones que Modal

---

## 7. Páginas prioritarias — especificación de layout

### `/dashboard`

```
PageHeader: "Dashboard" + fecha actual
SummaryCards (×4, variante A): overdue · upcoming · ok · no_history
  → conteo combinado camiones + choferes

Sección "Mantenimiento de camiones"
  → DataTable sin toolbar (sin búsqueda, sin acción nueva)
  → Columnas: Camión · Tipo · Estado (StatusBadge alert) · Próx. km · Próx. fecha · Restan
  → Ordenado: overdue primero, luego upcoming, luego ok, luego no_history
  → Filas con color según estado

Sección "Vencimientos de choferes"
  → DataTable sin toolbar
  → Columnas: Chofer · Documento · Estado (StatusBadge alert) · Próx. fecha · Días restantes
  → Mismo ordenamiento por prioridad
```

### `/pedidos`

```
PageHeader: "Pedidos" + botón "Nuevo pedido" → abre Sheet
SummaryCards (×4, variante C):
  Pendiente (📋) · Asignado (🚛) · Entregado (✅, subtítulo: total $) · Facturado (🧾)

DataTable con toolbar:
  → Búsqueda por número/cliente · Filtro por estado
  → Columnas: N° Pedido · Fecha · Cliente solicitante · Cliente destino · Localidad ·
              Modalidad · Artículos (badges compactos) · Estado (lifecycle) · Precio · Acciones
  → Acciones contextuales por estado:
      pending   → "Asignar" (Modal)
      assigned  → "Registrar remito" (link a /remitos pre-seleccionado)
      delivered → "Ver remito"
      invoiced  → "Ver factura"

Modal "Asignar":
  → Select camión (muestra patente + marca) · Select chofer (muestra nombre)
  → Botón "Asignar"

Sheet "Nuevo pedido":
  Sección 1 — Datos del pedido:
    N° de pedido (texto) · Fecha · Cliente solicitante · Cliente destino ·
    Localidad · Modalidad (CIP/FCA) · Tonelaje (condicional si CIP) · Detalle de carga
  Sección 2 — Lista de precios:
    Select lista de precios → muestra precio para la localidad seleccionada
    Campo "Precio aplicado" (readonly, se llena automáticamente)
  Sección 3 — Artículos:
    Tabla editable: select artículo + cantidad · botón "+ Agregar artículo"
```

### `/remitos`

```
PageHeader: "Remitos"

AmberPanel (condicional):
  → Muestra pedidos en estado "assigned" sin remito
  → Cada fila: N° pedido · cliente · localidad · fecha · link "Registrar remito →"

DataTable: tabla de remitos existentes
  → Columnas: N° Remito · Fecha · N° Pedido · Cliente destino · Localidad ·
              Artículos (badges) · Acciones (ver)

Sheet "Registrar remito":
  → Al abrirse desde AmberPanel: pre-selecciona el pedido
  Campo: Select pedido (filtra solo assigned sin remito) · N° Remito · Fecha · Notas

  Sección "Artículos despachados" (read-only):
    → Lista de OrderLines del pedido seleccionado
    → Columnas: Código · Artículo · Cantidad
    → Nota: editar cantidades requiere editar el pedido primero

  Sección "Peajes" (condicional — oculta si localidad sin LocalityToll):
    → Una fila editable por LocalityToll de la localidad del pedido
    → Columnas: Cabina · Proveedor · Monto (editable)
    → Nota debajo: "Al guardar se generará un gasto por cada peaje"

  Footer: Botón "Registrar remito"
  → Al guardar: crea Receipt + Expenses de peajes + incrementa estimatedKm del camión
```

### Páginas con layout diferenciado

#### `/camiones`

```
PageHeader: "Camiones" + botón "Nuevo camión" → abre Sheet

Grid de cards (3 columnas, responsive a 2):
  Cada card:
    → Borde superior 3px del color del peor estado de alerta del camión
    → Header: patente (bold) + descripción + marca/modelo/año
    → Fila de km: "Real: X km · Est: Y km" en slate-500
    → Chips por tipo de mantenimiento asignado (StatusBadge variante alert, tamaño xs)
    → Click en card → expande/navega a detalle (o abre Sheet de edición)
```

#### `/choferes`

```
PageHeader: "Choferes" + botón "Nuevo chofer" → abre Sheet

Lista de cards expandibles (una por chofer):
  Card colapsada:
    → Dot de color (8px, del peor estado de vencimiento) a la izquierda del nombre
    → Nombre del chofer + teléfono + email
    → Chevron de expansión a la derecha

  Card expandida (toggle al hacer click):
    Sección "Vencimientos activos":
      → Grid de badges: un StatusBadge alert por cada DriverExpiryAssigned
      → Columnas: Documento · Estado · Próx. fecha · Días restantes
    Sección "Historial de renovaciones":
      → Tabla compacta: Tipo · Fecha · Notas
      → Filtro por tipo de documento (tabs o select)
    Footer de card:
      → Botón "Registrar renovación" → Modal (select tipo + fecha + notas)
```

#### `/precios`

```
PageHeader: "Listas de precios" + botón "Nueva lista"

Tabs (shadcn/ui Tabs): una tab por PriceList (ej: "CIP - 32t", "CIP - 38t", "FCA")

Por tab activa:
  Panel de ajuste global (colapsable):
    → Input % o monto fijo + botón "Aplicar a toda la lista"

  Tabla de precios:
    → Columnas: Localidad · Precio actual · Acciones (editar inline)
    → Edición inline: click en precio → input numérico → enter/blur para guardar
    → Sin botón de guardar por fila — guardado inmediato al confirmar
```

---

## 8. Estructura de archivos

```
app/
  layout.tsx              ← shell: sidebar accordion + topbar + slot de contenido
  dashboard/page.tsx
  pedidos/page.tsx
  remitos/page.tsx
  facturacion/page.tsx
  cuenta-corriente/page.tsx
  cobros/page.tsx
  cheques/page.tsx
  gastos/page.tsx
  camiones/page.tsx
  choferes/page.tsx
  clientes/page.tsx
  proveedores/page.tsx
  articulos/page.tsx
  localidades/page.tsx
  precios/page.tsx
  tipos-gasto/page.tsx
  usuarios/page.tsx
  mantenimientos/page.tsx
  historial/page.tsx
  vencimientos-chofer/page.tsx
  informes/
    gastos/page.tsx
    ingresos/page.tsx
    comparativo/page.tsx
    viajes/page.tsx
    peajes/page.tsx
    facturas-destino/page.tsx

components/
  StatusBadge.tsx         ← variantes: alert | lifecycle | payment
  SummaryCard.tsx         ← variantes: A (alert) | C (info)
  DataTable.tsx           ← toolbar + tabla con patrones de color por estado
  AmberPanel.tsx          ← panel de pendientes urgentes, se oculta si vacío
  PageHeader.tsx          ← título + subtítulo + slot de acción

lib/
  mock-data.ts            ← todos los tipos TypeScript e interfaces del dominio
  alert-engine.ts         ← cálculo de estados overdue/upcoming/ok/no_history (puro, sin UI)
```

---

## 9. Secuencia de construcción

| Etapa | Qué | Patrones validados |
|---|---|---|
| **0** | Scaffolding | Shell, mock-data, tokens de color, StatusBadge |
| **1** | `/dashboard` | SummaryCard-A, tablas de alerta, alert-engine |
| **2** | `/pedidos` | SummaryCard-C, DataTable, Modal, Sheet multi-sección |
| **3** | `/remitos` | AmberPanel, Sheet con secciones, lógica de guardar |
| **4** | Maestros (×9) | ABMs simples, patrones ya establecidos |
| **5** | Administración (×6) | Facturación, cobros, cheques, gastos |
| **6** | Informes (×6) | Read-only, filtros de fecha, breakdown bars |

---

## 10. Decisiones fuera de scope en v1

- Dark mode — se puede agregar en v2 con el sistema de tokens ya definido
- Responsive / mobile — la app es de escritorio; no se optimiza para móvil en v1
- Notificaciones WhatsApp (Twilio) — v3 según el SYSTEM_DESIGN
- Autenticación real (NextAuth) — v2; v1 usa mock data sin login
- Gráficos en informes — se usan tablas primero; los breakdown bars son CSS puro (divs con ancho %)
