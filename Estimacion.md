  Pantallas de carga de datos

  Maestros

  ┌──────────────────┬──────────────┬────────────────────────────────────────────────────────────┐
  │     Pantalla     │     Ruta     │                        Qué se carga                        │
  ├──────────────────┼──────────────┼────────────────────────────────────────────────────────────┤
  │ Camiones         │ /camiones    │ Alta/edición de unidades                                   │
  ├──────────────────┼──────────────┼────────────────────────────────────────────────────────────┤
  │ Choferes         │ /choferes    │ Alta de choferes + asignación y renovación de vencimientos │
  ├──────────────────┼──────────────┼────────────────────────────────────────────────────────────┤
  │ Clientes         │ /clientes    │ Alta de clientes (solicitante / destino)                   │
  ├──────────────────┼──────────────┼────────────────────────────────────────────────────────────┤
  │ Proveedores      │ /proveedores │ Alta de proveedores por tipo                               │
  ├──────────────────┼──────────────┼────────────────────────────────────────────────────────────┤
  │ Localidades      │ /localidades │ Alta de localidades con tarifa de peaje                    │
  ├──────────────────┼──────────────┼────────────────────────────────────────────────────────────┤
  │ Listas de precio │ /precios     │ Precios por localidad/cliente                              │
  └──────────────────┴──────────────┴────────────────────────────────────────────────────────────┘

  Mantenimiento

  ┌────────────────────┬──────────────────────┬──────────────────────────────────────────────────┐
  │      Pantalla      │         Ruta         │                   Qué se carga                   │
  ├────────────────────┼──────────────────────┼──────────────────────────────────────────────────┤
  │ Tipos camión       │ /mantenimientos      │ Definición de tipos de mantenimiento (km + días) │
  ├────────────────────┼──────────────────────┼──────────────────────────────────────────────────┤
  │ Historial camiones │ /historial           │ Registro de mantenimientos realizados            │
  ├────────────────────┼──────────────────────┼──────────────────────────────────────────────────┤
  │ Tipos chofer       │ /vencimientos-chofer │ Definición de tipos de vencimiento (días)        │
  └────────────────────┴──────────────────────┴──────────────────────────────────────────────────┘

  Administración

  ┌─────────────┬──────────────┬────────────────────────────────────────────┐
  │  Pantalla   │     Ruta     │                Qué se carga                │
  ├─────────────┼──────────────┼────────────────────────────────────────────┤
  │ Pedidos     │ /pedidos     │ Carga de pedidos de clientes               │
  ├─────────────┼──────────────┼────────────────────────────────────────────┤
  │ Remitos     │ /remitos     │ Generación de remito + auto-gasto de peaje │
  ├─────────────┼──────────────┼────────────────────────────────────────────┤
  │ Facturación │ /facturacion │ Emisión de facturas                        │
  ├─────────────┼──────────────┼────────────────────────────────────────────┤
  │ Cobros      │ /cobros      │ Registro de pagos recibidos de clientes    │
  ├─────────────┼──────────────┼────────────────────────────────────────────┤
  │ Cheques     │ /cheques     │ Gestión de cheques recibidos               │
  ├─────────────┼──────────────┼────────────────────────────────────────────┤
  │ Gastos      │ /gastos      │ Registro de gastos a proveedores           │
  └─────────────┴──────────────┴────────────────────────────────────────────┘

  ---
  Informes

  ┌─────────────────────┬────────────────────────────┬──────────────────────────────────────────────────────────────┐
  │       Informe       │            Ruta            │                         Qué muestra                          │
  ├─────────────────────┼────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Gastos por período  │ /informes/gastos           │ Gastos filtrados por fecha, desglose por categoría y camión  │
  ├─────────────────────┼────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Ingresos por        │ /informes/ingresos         │ Cobros filtrados por fecha, desglose por forma de pago y     │
  │ período             │                            │ cliente                                                      │
  ├─────────────────────┼────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Viajes              │ /informes/viajes           │ Km por camión/chofer, filtros fecha+chofer+camión            │
  ├─────────────────────┼────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Peajes pagados      │ /informes/peajes           │ Gastos de peaje de remitos, por destino y proveedor          │
  ├─────────────────────┼────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Facturas destino    │ /informes/facturas-destino │ Facturas agrupadas por cliente destino                       │
  └─────────────────────┴────────────────────────────┴──────────────────────────────────────────────────────────────┘

  ---
  Procesos / Vistas de gestión

  ┌──────────────────────┬───────────────────┬─────────────────────────────────────────────────────────────────┐
  │        Vista         │       Ruta        │                           Qué muestra                           │
  ├──────────────────────┼───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Dashboard alertas    │ /dashboard        │ Alertas de mantenimiento de camiones + vencimientos de choferes │
  ├──────────────────────┼───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Cuenta corriente     │ /cuenta-corriente │ Pendiente de facturar + saldo por cliente                       │
  ├──────────────────────┼───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Pedidos sin remito   │ /remitos          │ Pedidos entregados sin remito generado                          │
  ├──────────────────────┼───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Pedidos sin asignar  │ /pedidos          │ Pedidos sin chofer/camión asignado                              │
  ├──────────────────────┼───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Remitos sin facturar │ /cuenta-corriente │ Remitos pendientes de facturación                               │
  ├──────────────────────┼───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Cheques a depositar  │ /cheques          │ Cheques pendientes de depósito                                  │
  └──────────────────────┴───────────────────┴─────────────────────────────────────────────────────────────────┘

  ---
  Total: 13 pantallas de carga + 5 informes propios + 6 vistas de proceso