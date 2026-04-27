  Pantallas de carga de datos

  Maestros

  ┌──────────────────┬──────────────┬────────────────────────────────────────────────────────────┐
  │     Pantalla     │     Ruta     │                        Qué se carga                        │
  ├──────────────────┼──────────────┼────────────────────────────────────────────────────────────┤
  │ Camiones         │ /camiones    │ Alta/edición de unidades                                   │6
  ├──────────────────┼──────────────┼────────────────────────────────────────────────────────────┤
  │ Choferes         │ /choferes    │ Alta de choferes + asignación y renovación de vencimientos │6
  ├──────────────────┼──────────────┼────────────────────────────────────────────────────────────┤
  │ Clientes         │ /clientes    │ Alta de clientes (solicitante / destino)                   │6
  ├──────────────────┼──────────────┼────────────────────────────────────────────────────────────┤
  │ Proveedores      │ /proveedores │ Alta de proveedores por tipo                               │6
  ├──────────────────┼──────────────┼────────────────────────────────────────────────────────────┤
  │ Localidades      │ /localidades │ Alta de localidades con tarifa de peaje                    │6
  ├──────────────────┼──────────────┼────────────────────────────────────────────────────────────┤
  │ Listas de precio │ /precios     │ Precios por localidad/cliente                              │10
  └──────────────────┴──────────────┴────────────────────────────────────────────────────────────┘

  Mantenimiento

  ┌────────────────────┬──────────────────────┬──────────────────────────────────────────────────┐
  │      Pantalla      │         Ruta         │                   Qué se carga                   │
  ├────────────────────┼──────────────────────┼──────────────────────────────────────────────────┤
  │ Tipos camión       │ /mantenimientos      │ Definición de tipos de mantenimiento (km + días) │6
  ├────────────────────┼──────────────────────┼──────────────────────────────────────────────────┤
  │ Historial camiones │ /historial           │ Registro de mantenimientos realizados            │6
  ├────────────────────┼──────────────────────┼──────────────────────────────────────────────────┤
  │ Tipos chofer       │ /vencimientos-chofer │ Definición de tipos de vencimiento (días)        │6
  └────────────────────┴──────────────────────┴──────────────────────────────────────────────────┘

  Administración

  ┌─────────────┬──────────────┬────────────────────────────────────────────┐
  │  Pantalla   │     Ruta     │                Qué se carga                │
  ├─────────────┼──────────────┼────────────────────────────────────────────┤
  │ Pedidos     │ /pedidos     │ Carga de pedidos de clientes               │6
  ├─────────────┼──────────────┼────────────────────────────────────────────┤
  │ Remitos     │ /remitos     │ Generación de remito + auto-gasto de peaje │6
  ├─────────────┼──────────────┼────────────────────────────────────────────┤
  │ Facturación │ /facturacion │ Emisión de facturas                        │12
  ├─────────────┼──────────────┼────────────────────────────────────────────┤
  │ Cobros      │ /cobros      │ Registro de pagos recibidos de clientes    │6
  ├─────────────┼──────────────┼────────────────────────────────────────────┤
  │ Cheques     │ /cheques     │ Gestión de cheques recibidos               │6
  ├─────────────┼──────────────┼────────────────────────────────────────────┤
  │ Gastos      │ /gastos      │ Registro de gastos a proveedores           │6
  └─────────────┴──────────────┴────────────────────────────────────────────┘

  ---
  Informes

  ┌─────────────────────┬────────────────────────────┬──────────────────────────────────────────────────────────────┐
  │       Informe       │            Ruta            │                         Qué muestra                          │
  ├─────────────────────┼────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Gastos por período  │ /informes/gastos           │ Gastos filtrados por fecha, desglose por categoría y camión  │6
  ├─────────────────────┼────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Ingresos por        │ /informes/ingresos         │ Cobros filtrados por fecha, desglose por forma de pago y     │6
  │ período             │                            │ cliente                                                      │
  ├─────────────────────┼────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Viajes              │ /informes/viajes           │ Km por camión/chofer, filtros fecha+chofer+camión            │6
  ├─────────────────────┼────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Peajes pagados      │ /informes/peajes           │ Gastos de peaje de remitos, por destino y proveedor          │6
  ├─────────────────────┼────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Facturas destino    │ /informes/facturas-destino │ Facturas agrupadas por cliente destino                       │6
  └─────────────────────┴────────────────────────────┴──────────────────────────────────────────────────────────────┘

  ---
  Procesos / Vistas de gestión

  ┌──────────────────────┬───────────────────┬─────────────────────────────────────────────────────────────────┐
  │        Vista         │       Ruta        │                           Qué muestra                           │
  ├──────────────────────┼───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Dashboard alertas    │ /dashboard        │ Alertas de mantenimiento de camiones + vencimientos de choferes │8
  ├──────────────────────┼───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Cuenta corriente     │ /cuenta-corriente │ Pendiente de facturar + saldo por cliente                       │6
  ├──────────────────────┼───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Pedidos sin remito   │ /remitos          │ Pedidos entregados sin remito generado                          │6
  ├──────────────────────┼───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Pedidos sin asignar  │ /pedidos          │ Pedidos sin chofer/camión asignado                              │6
  ├──────────────────────┼───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Remitos sin facturar │ /cuenta-corriente │ Remitos pendientes de facturación                               │6
  ├──────────────────────┼───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Cheques a depositar  │ /cheques          │ Cheques pendientes de depósito                                  │6
  └──────────────────────┴───────────────────┴─────────────────────────────────────────────────────────────────┘

  ---
  Total: 13 pantallas de carga + 5 informes propios + 6 vistas de proceso
  Tiempo: 168 + 5 presupuesto
  $: 20k?
  Total: 3.460.000 
  quiiii?? un monton me parece