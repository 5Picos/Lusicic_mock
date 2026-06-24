# Lusicic Choferes — Definición de la App

## Propósito

Aplicación móvil minimalista para que los choferes reporten **notas previas al mantenimiento** (fallas o anomalías del vehículo) sin usar usuario ni contraseña. Cada nota llega al sistema de gestión Lusicic como un `VehicleIssueReport` con `source = "app"` y aparece en la página `/fallas` para que el operador la atienda.

La app hace **una sola cosa**: crear notas. No consulta historial, no muestra estados, no recibe notificaciones. Todo lo demás está explícitamente fuera de alcance (ver al final).

> La contraparte del lado del sistema (entidades `Device` / `EnrollmentCode`, administración en `/choferes`, reglas de negocio y API) está especificada en `SYSTEM_DESIGN.md`, sección **"Driver App & Device Enrollment"**. Ese documento es la fuente autoritativa del backend; este define la app.

---

## Usuarios y contexto de uso

- **Quién:** choferes de la empresa, cada uno con su teléfono personal (Android principalmente, iOS posible).
- **Cuándo:** al detectar un problema en el camión — en ruta, en la playa de estacionamiento, antes o después de un viaje.
- **Cómo:** uso esporádico, de segundos. La app debe abrir directo en el formulario de nota, sin fricción. Texto grande, pocos toques, tolerante a manos ocupadas y mala señal.

---

## Modelo de identidad (sin login)

La identidad del chofer **es el dispositivo**. El vínculo se establece una sola vez:

1. El administrador, desde la ficha del chofer en el sistema web, genera un **código de vinculación** de 6 dígitos (vence a las 48 h, un solo uso) y se lo pasa al chofer por WhatsApp o en persona.
2. El chofer abre la app por primera vez, ingresa el código y la app lo canjea contra el servidor junto con un `installationId` (UUID que la app genera en su primer arranque) y los datos del teléfono.
3. El servidor valida el código, crea el dispositivo (auto-aprobado: el código ES la aprobación), revoca cualquier dispositivo activo anterior del mismo chofer, y devuelve un **token opaco**.
4. La app guarda el token en almacenamiento seguro (Android Keystore / iOS Keychain). **Nunca vuelve a pedir nada**: cada request va con `Authorization: Bearer <token>`.

Reglas que la app debe respetar:

- **Sin identificadores de hardware.** El `installationId` es un UUID generado por la app, persistido localmente. Desinstalar y reinstalar genera uno nuevo → requiere código nuevo (comportamiento deseado).
- **El token nunca se muestra** al chofer ni se exporta por ningún canal.
- **401 = dispositivo dado de baja.** Ante cualquier respuesta 401, la app borra el token y el estado local, y vuelve a la pantalla de vinculación con un mensaje claro ("Tu dispositivo fue dado de baja. Pedí un nuevo código al administrador").

---

## Pantallas

### 1. Vinculación (solo primera vez o tras revocación)

```
┌──────────────────────────────┐
│         Lusicic Choferes     │
│                              │
│  Ingresá el código que te    │
│  dio el administrador:       │
│                              │
│      ┌──┬──┬──┬──┬──┬──┐     │
│      │ 4│ 8│ 2│ 9│ 1│ 3│     │
│      └──┴──┴──┴──┴──┴──┘     │
│                              │
│        [ Vincular ]          │
└──────────────────────────────┘
```

- Input numérico de 6 dígitos, teclado numérico, autofocus.
- Al canjear con éxito muestra "¡Hola, {driverName}!" y pasa al formulario de nota.
- Errores con mensaje específico: código inválido, código vencido, sin conexión (reintentar).

### 2. Crear nota (pantalla principal — la app abre acá)

```
┌──────────────────────────────┐
│  Hola, Juan          ⚙ (i)   │
│                              │
│  Camión                      │
│  ┌──────────────────────┐    │
│  │ ABC 123 — Mercedes ▾ │    │  ← preseleccionado (suggestedTruckId)
│  └──────────────────────┘    │
│                              │
│  ¿Qué está fallando?         │
│  ┌──────────────────────┐    │
│  │                      │    │
│  │  (texto libre,       │    │
│  │   multilínea)        │    │
│  └──────────────────────┘    │
│                              │
│      [ Enviar nota ]         │
└──────────────────────────────┘
```

- **Selector de camión** poblado desde `GET /api/app/trucks`, preseleccionado con `suggestedTruckId` (el camión del pedido vigente del chofer, o su camión por defecto). El chofer puede cambiarlo.
- La lista de camiones se cachea localmente y se refresca en cada apertura con conexión; si no hay señal, se usa el cache.
- **Descripción**: texto libre obligatorio, multilínea.
- Al enviar con éxito: confirmación visual breve ("Nota enviada ✓") y el formulario se limpia, listo para otra nota.
- La fecha la pone el servidor; la app no pide fecha.

### 3. Ajustes mínimos (ícono ⚙)

Solo informativo: nombre del chofer vinculado, modelo del dispositivo, versión de la app. Sin acciones destructivas — la baja del dispositivo se hace desde el sistema web.

No hay más pantallas.

---

## Contrato de API

Base: el servidor del sistema Lusicic. Todo por HTTPS.

### `POST /api/app/enroll` — canje del código (sin token)

```jsonc
// Request
{
  "code": "482913",
  "installationId": "c0a8e1f2-9b3d-4e5f-8a7b-1c2d3e4f5a6b",
  "platform": "android",          // "android" | "ios"
  "model": "Samsung Galaxy A52"
}

// 200
{ "token": "<opaco, 256 bits>", "driverName": "Juan Pérez" }

// Errores
// 404 code_invalid   → "Código incorrecto"
// 410 code_expired   → "El código venció, pedí uno nuevo"
// 429 rate_limited   → "Demasiados intentos, esperá un minuto"
```

El servidor aplica rate limit por IP (ej. 5 intentos/minuto). Al canjear, el dispositivo activo anterior del chofer queda revocado automáticamente.

### `GET /api/app/trucks` — lista para el selector (Bearer)

```jsonc
// 200
{
  "trucks": [
    { "id": "tr1", "plate": "ABC 123", "label": "ABC 123 — Mercedes Actros" }
  ],
  "suggestedTruckId": "tr1"   // pedido vigente → camión por defecto → null
}
```

### `POST /api/app/issue-reports` — crear la nota (Bearer)

```jsonc
// Request
{ "truckId": "tr1", "description": "Pierde aceite debajo del motor" }

// 201
{ "id": "vir123" }
```

El `driverId` lo resuelve el servidor desde el token del dispositivo; la nota se crea con `source = "app"` y `status = "pendiente"`.

### Errores comunes (todos los endpoints con token)

| Código | Significado | Reacción de la app |
|---|---|---|
| `401` | Token inválido o dispositivo revocado | Borrar token y estado local → pantalla de vinculación |
| `422` | Datos inválidos (ej. `truckId` inexistente) | Mensaje y permitir corregir |
| Sin conexión / timeout | — | Mensaje "Sin conexión" y reintento manual; la nota escrita no se pierde (queda en el formulario) |

---

## Estado local de la app

| Dato | Dónde | Cuándo |
|---|---|---|
| `installationId` (UUID) | Storage normal | Generado en el primer arranque, nunca cambia |
| Token | Keystore / Keychain | Al canjear el código; se borra ante 401 |
| `driverName` | Storage normal | Al canjear; solo para el saludo |
| Cache de camiones + `suggestedTruckId` | Storage normal | En cada apertura con conexión |

Arranque de la app: si hay token → pantalla de nota; si no → pantalla de vinculación.

---

## Stack sugerido

| Capa | Tecnología | Motivo |
|---|---|---|
| Framework | React Native (Expo) | Un solo código para Android/iOS; el equipo ya trabaja en React/Next.js |
| Almacenamiento seguro | `expo-secure-store` | Keystore/Keychain sin código nativo |
| HTTP | `fetch` nativo | Tres endpoints no justifican librerías |
| Distribución | APK directo / TestFlight interno | Flota chica; no hace falta publicar en stores |

---

## Fuera de alcance (v1)

- Ver historial o estado de las notas enviadas.
- Notificaciones push.
- Fotos adjuntas en la nota. *(candidato natural a v2 — una foto vale más que la descripción)*
- Cola offline con reenvío automático. *(v1: requiere conexión para enviar; el texto no se pierde)*
- Cualquier otra función del sistema (pedidos, vencimientos, etc.).
- Baja del dispositivo desde la app (se administra solo desde `/choferes` en el sistema web).
