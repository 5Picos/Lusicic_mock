export type EstadoAlerta = "ok" | "proximo" | "vencido" | "sin_historial";

export interface Chofer {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
}

export interface TipoMantenimiento {
  id: string;
  nombre: string;
  descripcion: string;
  intervaloKm: number | null;
  intervaloDias: number | null;
  alertaKmAntes: number | null;
  alertaDiasAntes: number | null;
}

export interface Camion {
  id: string;
  patente: string;
  descripcion: string;
  marca: string;
  modelo: string;
  anio: number;
  kmReales: number;
  kmEstimados: number;
}

export interface MantenimientoAsignado {
  id: string;
  camionId: string;
  tipoMantenimientoId: string;
  intervaloKm: number | null;
  intervaloDias: number | null;
  alertaKmAntes: number | null;
  alertaDiasAntes: number | null;
  activo: boolean;
}

export interface RegistroMantenimiento {
  id: string;
  camionId: string;
  tipoMantenimientoId: string;
  choferId: string;
  fecha: string;
  kmAlMomento: number;
  notas: string;
}

export interface Viaje {
  id: string;
  camionId: string;
  choferId: string;
  fecha: string;
  kmViaje: number;
  origen: string;
  destino: string;
}

export const choferes: Chofer[] = [
  { id: "c1", nombre: "Carlos Rodríguez", telefono: "011-4523-1234", email: "carlos@flota.com" },
  { id: "c2", nombre: "Miguel Fernández", telefono: "011-4523-5678", email: "miguel@flota.com" },
  { id: "c3", nombre: "Roberto Gómez", telefono: "011-4523-9012", email: "roberto@flota.com" },
  { id: "c4", nombre: "Diego Martínez", telefono: "011-4523-3456", email: "diego@flota.com" },
];

export const tiposMantenimiento: TipoMantenimiento[] = [
  {
    id: "tm1",
    nombre: "Cambio de aceite",
    descripcion: "Cambio de aceite de motor y filtro",
    intervaloKm: 10000,
    intervaloDias: 180,
    alertaKmAntes: 500,
    alertaDiasAntes: 15,
  },
  {
    id: "tm2",
    nombre: "Cambio de cubiertas",
    descripcion: "Reemplazo de neumáticos",
    intervaloKm: 60000,
    intervaloDias: null,
    alertaKmAntes: 2000,
    alertaDiasAntes: null,
  },
  {
    id: "tm3",
    nombre: "Revisión de frenos",
    descripcion: "Inspección y ajuste del sistema de frenos",
    intervaloKm: 20000,
    intervaloDias: 365,
    alertaKmAntes: 1000,
    alertaDiasAntes: 30,
  },
  {
    id: "tm4",
    nombre: "Filtro de combustible diesel",
    descripcion: "Cambio de filtro de combustible (solo diesel)",
    intervaloKm: 30000,
    intervaloDias: 365,
    alertaKmAntes: 1500,
    alertaDiasAntes: 30,
  },
  {
    id: "tm5",
    nombre: "Revisión de batería",
    descripcion: "Control y carga de batería",
    intervaloKm: null,
    intervaloDias: 180,
    alertaKmAntes: null,
    alertaDiasAntes: 15,
  },
  {
    id: "tm6",
    nombre: "Cambio de correa de distribución",
    descripcion: "Reemplazo de correa de distribución",
    intervaloKm: 80000,
    intervaloDias: 730,
    alertaKmAntes: 3000,
    alertaDiasAntes: 30,
  },
];

export const camiones: Camion[] = [
  {
    id: "cam1",
    patente: "ABC 123",
    descripcion: "Camión de reparto zona norte",
    marca: "Mercedes-Benz",
    modelo: "Atego 1725",
    anio: 2019,
    kmReales: 98500,
    kmEstimados: 99200,
  },
  {
    id: "cam2",
    patente: "DEF 456",
    descripcion: "Camión de reparto zona sur",
    marca: "Volkswagen",
    modelo: "Delivery 9.170",
    anio: 2021,
    kmReales: 45300,
    kmEstimados: 46100,
  },
  {
    id: "cam3",
    patente: "GHI 789",
    descripcion: "Camión frigorífico",
    marca: "Ford",
    modelo: "Cargo 1723",
    anio: 2018,
    kmReales: 134200,
    kmEstimados: 135000,
  },
  {
    id: "cam4",
    patente: "JKL 012",
    descripcion: "Camión de larga distancia",
    marca: "Scania",
    modelo: "R 450",
    anio: 2020,
    kmReales: 211000,
    kmEstimados: 212500,
  },
];

export const mantenimientosAsignados: MantenimientoAsignado[] = [
  // Camión 1 (diesel - Mercedes)
  { id: "ma1", camionId: "cam1", tipoMantenimientoId: "tm1", intervaloKm: 10000, intervaloDias: 180, alertaKmAntes: 500, alertaDiasAntes: 15, activo: true },
  { id: "ma2", camionId: "cam1", tipoMantenimientoId: "tm2", intervaloKm: 60000, intervaloDias: null, alertaKmAntes: 2000, alertaDiasAntes: null, activo: true },
  { id: "ma3", camionId: "cam1", tipoMantenimientoId: "tm3", intervaloKm: 20000, intervaloDias: 365, alertaKmAntes: 1000, alertaDiasAntes: 30, activo: true },
  { id: "ma4", camionId: "cam1", tipoMantenimientoId: "tm4", intervaloKm: 30000, intervaloDias: 365, alertaKmAntes: 1500, alertaDiasAntes: 30, activo: true },
  // Camión 2 (Volkswagen)
  { id: "ma5", camionId: "cam2", tipoMantenimientoId: "tm1", intervaloKm: 10000, intervaloDias: 180, alertaKmAntes: 500, alertaDiasAntes: 15, activo: true },
  { id: "ma6", camionId: "cam2", tipoMantenimientoId: "tm3", intervaloKm: 20000, intervaloDias: 365, alertaKmAntes: 1000, alertaDiasAntes: 30, activo: true },
  { id: "ma7", camionId: "cam2", tipoMantenimientoId: "tm5", intervaloKm: null, intervaloDias: 180, alertaKmAntes: null, alertaDiasAntes: 15, activo: true },
  // Camión 3 (Ford - diesel)
  { id: "ma8", camionId: "cam3", tipoMantenimientoId: "tm1", intervaloKm: 8000, intervaloDias: 180, alertaKmAntes: 500, alertaDiasAntes: 15, activo: true },
  { id: "ma9", camionId: "cam3", tipoMantenimientoId: "tm2", intervaloKm: 60000, intervaloDias: null, alertaKmAntes: 2000, alertaDiasAntes: null, activo: true },
  { id: "ma10", camionId: "cam3", tipoMantenimientoId: "tm4", intervaloKm: 30000, intervaloDias: 365, alertaKmAntes: 1500, alertaDiasAntes: 30, activo: true },
  { id: "ma11", camionId: "cam3", tipoMantenimientoId: "tm6", intervaloKm: 80000, intervaloDias: 730, alertaKmAntes: 3000, alertaDiasAntes: 30, activo: true },
  // Camión 4 (Scania - larga distancia, diesel)
  { id: "ma12", camionId: "cam4", tipoMantenimientoId: "tm1", intervaloKm: 15000, intervaloDias: 180, alertaKmAntes: 1000, alertaDiasAntes: 15, activo: true },
  { id: "ma13", camionId: "cam4", tipoMantenimientoId: "tm2", intervaloKm: 80000, intervaloDias: null, alertaKmAntes: 3000, alertaDiasAntes: null, activo: true },
  { id: "ma14", camionId: "cam4", tipoMantenimientoId: "tm3", intervaloKm: 30000, intervaloDias: 365, alertaKmAntes: 1500, alertaDiasAntes: 30, activo: true },
  { id: "ma15", camionId: "cam4", tipoMantenimientoId: "tm4", intervaloKm: 40000, intervaloDias: 365, alertaKmAntes: 2000, alertaDiasAntes: 30, activo: true },
];

export const registrosMantenimiento: RegistroMantenimiento[] = [
  // Camión 1
  { id: "rm1", camionId: "cam1", tipoMantenimientoId: "tm1", choferId: "c1", fecha: "2025-11-10", kmAlMomento: 89000, notas: "Cambio de aceite 5W40 sintético" },
  { id: "rm2", camionId: "cam1", tipoMantenimientoId: "tm3", choferId: "c1", fecha: "2025-09-05", kmAlMomento: 80000, notas: "Pastillas traseras con 40% de desgaste" },
  { id: "rm3", camionId: "cam1", tipoMantenimientoId: "tm4", choferId: "c2", fecha: "2025-07-20", kmAlMomento: 75000, notas: "" },
  // Camión 2
  { id: "rm4", camionId: "cam2", tipoMantenimientoId: "tm1", choferId: "c2", fecha: "2026-01-15", kmAlMomento: 40000, notas: "Aceite 10W40" },
  { id: "rm5", camionId: "cam2", tipoMantenimientoId: "tm3", choferId: "c3", fecha: "2025-12-01", kmAlMomento: 38000, notas: "Frenos en buen estado" },
  { id: "rm6", camionId: "cam2", tipoMantenimientoId: "tm5", choferId: "c2", fecha: "2025-10-20", kmAlMomento: 35000, notas: "Batería cargada al 85%" },
  // Camión 3
  { id: "rm7", camionId: "cam3", tipoMantenimientoId: "tm1", choferId: "c3", fecha: "2026-02-28", kmAlMomento: 126500, notas: "" },
  { id: "rm8", camionId: "cam3", tipoMantenimientoId: "tm4", choferId: "c3", fecha: "2025-08-10", kmAlMomento: 108000, notas: "Filtro Bosch original" },
  { id: "rm9", camionId: "cam3", tipoMantenimientoId: "tm6", choferId: "c4", fecha: "2024-06-15", kmAlMomento: 80000, notas: "Correa + tensores" },
  // Camión 4
  { id: "rm10", camionId: "cam4", tipoMantenimientoId: "tm1", choferId: "c4", fecha: "2026-03-10", kmAlMomento: 200000, notas: "Aceite 15W40 Shell" },
  { id: "rm11", camionId: "cam4", tipoMantenimientoId: "tm3", choferId: "c4", fecha: "2025-11-20", kmAlMomento: 185000, notas: "" },
  { id: "rm12", camionId: "cam4", tipoMantenimientoId: "tm4", choferId: "c1", fecha: "2025-06-01", kmAlMomento: 172000, notas: "" },
];

export type EstadoPedido = "pending" | "assigned" | "delivered" | "invoiced";
export type Modalidad = "SIP" | "FCA";

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
}

export interface Localidad {
  id: string;
  nombre: string;
  kmIdaVuelta: number;
  peaje: number;
}

export interface ListaPrecio {
  id: string;
  nombre: string;
}

export interface PrecioLocalidad {
  id: string;
  listaPrecioId: string;
  localidadId: string;
  precio: number;
}

export interface Pedido {
  id: string;
  numeroPedido: string;
  fecha: string;
  clienteSolicitanteId: string;
  clienteDestinoId: string;
  localidadId: string;
  modalidad: Modalidad;
  tonelaje: number | null;
  detalleCarga: string;
  camionId: string | null;
  choferId: string | null;
  precioAplicado: number;
  estado: EstadoPedido;
}

export interface Remito {
  id: string;
  pedidoId: string;
  numeroRemito: string;
  fecha: string;
  notas: string;
}

export const clientes: Cliente[] = [
  { id: "cl1", nombre: "Molinos Río de la Plata", telefono: "011-4000-1234", email: "logistica@molinos.com" },
  { id: "cl2", nombre: "Arcor S.A.I.C.", telefono: "011-4000-5678", email: "transporte@arcor.com" },
  { id: "cl3", nombre: "Frigorífico Paladini", telefono: "011-4000-9012", email: "operaciones@paladini.com" },
  { id: "cl4", nombre: "Supermercados DIA", telefono: "011-4000-3456", email: "compras@dia.com" },
];

export const localidades: Localidad[] = [
  { id: "loc1", nombre: "Rosario",   kmIdaVuelta: 600,  peaje: 8500 },
  { id: "loc2", nombre: "Córdoba",   kmIdaVuelta: 1400, peaje: 12000 },
  { id: "loc3", nombre: "Mendoza",   kmIdaVuelta: 2200, peaje: 18000 },
  { id: "loc4", nombre: "La Plata",  kmIdaVuelta: 120,  peaje: 2500 },
  { id: "loc5", nombre: "Santa Fe",  kmIdaVuelta: 640,  peaje: 9200 },
];

export const listasPrecio: ListaPrecio[] = [
  { id: "lp1", nombre: "SIP - 32 toneladas" },
  { id: "lp2", nombre: "SIP - 38 toneladas" },
  { id: "lp3", nombre: "FCA" },
];

export const preciosLocalidad: PrecioLocalidad[] = [
  // SIP - 32 toneladas
  { id: "pl01", listaPrecioId: "lp1", localidadId: "loc1", precio: 85000 },
  { id: "pl02", listaPrecioId: "lp1", localidadId: "loc2", precio: 145000 },
  { id: "pl03", listaPrecioId: "lp1", localidadId: "loc3", precio: 220000 },
  { id: "pl04", listaPrecioId: "lp1", localidadId: "loc4", precio: 28000 },
  { id: "pl05", listaPrecioId: "lp1", localidadId: "loc5", precio: 88000 },
  // SIP - 38 toneladas
  { id: "pl06", listaPrecioId: "lp2", localidadId: "loc1", precio: 95000 },
  { id: "pl07", listaPrecioId: "lp2", localidadId: "loc2", precio: 165000 },
  { id: "pl08", listaPrecioId: "lp2", localidadId: "loc3", precio: 250000 },
  { id: "pl09", listaPrecioId: "lp2", localidadId: "loc4", precio: 32000 },
  { id: "pl10", listaPrecioId: "lp2", localidadId: "loc5", precio: 98000 },
  // FCA
  { id: "pl11", listaPrecioId: "lp3", localidadId: "loc1", precio: 90000 },
  { id: "pl12", listaPrecioId: "lp3", localidadId: "loc2", precio: 155000 },
  { id: "pl13", listaPrecioId: "lp3", localidadId: "loc3", precio: 235000 },
  { id: "pl14", listaPrecioId: "lp3", localidadId: "loc4", precio: 30000 },
  { id: "pl15", listaPrecioId: "lp3", localidadId: "loc5", precio: 92000 },
];

export const pedidos: Pedido[] = [
  { id: "p1", numeroPedido: "0045", fecha: "2026-04-27", clienteSolicitanteId: "cl1", clienteDestinoId: "cl1", localidadId: "loc2", modalidad: "SIP", tonelaje: 32, detalleCarga: "Harina de trigo", camionId: null, choferId: null, precioAplicado: 145000, estado: "pending" },
  { id: "p2", numeroPedido: "0046", fecha: "2026-04-27", clienteSolicitanteId: "cl1", clienteDestinoId: "cl3", localidadId: "loc4", modalidad: "FCA", tonelaje: null, detalleCarga: "Productos refrigerados", camionId: null, choferId: null, precioAplicado: 30000, estado: "pending" },
  { id: "p3", numeroPedido: "0044", fecha: "2026-04-25", clienteSolicitanteId: "cl1", clienteDestinoId: "cl2", localidadId: "loc1", modalidad: "SIP", tonelaje: 38, detalleCarga: "Aceite de girasol", camionId: "cam2", choferId: "c2", precioAplicado: 95000, estado: "assigned" },
  { id: "p4", numeroPedido: "0041", fecha: "2026-04-17", clienteSolicitanteId: "cl1", clienteDestinoId: "cl4", localidadId: "loc1", modalidad: "FCA", tonelaje: null, detalleCarga: "Snacks y golosinas", camionId: "cam3", choferId: "c3", precioAplicado: 90000, estado: "assigned" },
  { id: "p5", numeroPedido: "0043", fecha: "2026-04-22", clienteSolicitanteId: "cl1", clienteDestinoId: "cl1", localidadId: "loc3", modalidad: "SIP", tonelaje: 38, detalleCarga: "Mezcla lista para torta", camionId: "cam4", choferId: "c4", precioAplicado: 250000, estado: "delivered" },
  { id: "p6", numeroPedido: "0040", fecha: "2026-04-15", clienteSolicitanteId: "cl1", clienteDestinoId: "cl2", localidadId: "loc5", modalidad: "SIP", tonelaje: 32, detalleCarga: "Pastas secas", camionId: "cam1", choferId: "c1", precioAplicado: 88000, estado: "delivered" },
  { id: "p7", numeroPedido: "0042", fecha: "2026-04-18", clienteSolicitanteId: "cl1", clienteDestinoId: "cl1", localidadId: "loc5", modalidad: "SIP", tonelaje: 32, detalleCarga: "Fideos secos", camionId: "cam1", choferId: "c1", precioAplicado: 88000, estado: "invoiced" },
  { id: "p8", numeroPedido: "0039", fecha: "2026-04-10", clienteSolicitanteId: "cl1", clienteDestinoId: "cl4", localidadId: "loc2", modalidad: "FCA", tonelaje: null, detalleCarga: "Galletitas", camionId: "cam3", choferId: "c3", precioAplicado: 155000, estado: "invoiced" },
];

export const remitos: Remito[] = [
  { id: "rem1", pedidoId: "p5", numeroRemito: "R-00891", fecha: "2026-04-24", notas: "" },
  { id: "rem2", pedidoId: "p6", numeroRemito: "R-00889", fecha: "2026-04-17", notas: "Entrega en depósito B" },
  { id: "rem3", pedidoId: "p7", numeroRemito: "R-00887", fecha: "2026-04-20", notas: "" },
  { id: "rem4", pedidoId: "p8", numeroRemito: "R-00882", fecha: "2026-04-12", notas: "Firma: María López" },
];

export type TipoProveedor = "combustible" | "estatal" | "repuestos" | "varios";

export interface Proveedor {
  id: string;
  nombre: string;
  tipo: TipoProveedor;
  cuit: string;
  telefono: string;
}

export type FormaPagoGasto = "efectivo" | "transferencia" | "cheque";

export interface Gasto {
  id: string;
  proveedorId: string;
  fecha: string;
  concepto: string;
  camionId: string | null;
  pedidoId: string | null;
  monto: number;
  formaPago: FormaPagoGasto;
  referencia: string;
  notas: string;
}

export const proveedores: Proveedor[] = [
  { id: "pv1", nombre: "YPF S.A.",                tipo: "combustible", cuit: "30-54668997-9", telefono: "0800-888-4973" },
  { id: "pv2", nombre: "Shell Argentina",          tipo: "combustible", cuit: "30-50000254-7", telefono: "0800-444-7435" },
  { id: "pv3", nombre: "AGIP / Italiana de Petróleo", tipo: "combustible", cuit: "30-50000120-9", telefono: "011-4340-6000" },
  { id: "pv4", nombre: "ARBA",                     tipo: "estatal",     cuit: "30-71002450-4", telefono: "0800-321-2722" },
  { id: "pv5", nombre: "AFIP",                     tipo: "estatal",     cuit: "33-69345023-9", telefono: "0800-999-2347" },
  { id: "pv6", nombre: "Repuestos Del Sur S.R.L.", tipo: "repuestos",   cuit: "30-71234567-8", telefono: "011-4555-7890" },
  { id: "pv7", nombre: "Neumáticos Rodavía",       tipo: "repuestos",   cuit: "30-65432198-7", telefono: "011-4312-4567" },
  { id: "pv8", nombre: "Lubricantes Omega",        tipo: "varios",      cuit: "20-28765432-1", telefono: "011-4789-0123" },
];

export type FormaPagoCobro = "efectivo" | "transferencia" | "cheque";

export interface Cobro {
  id: string;
  clienteId: string;
  fecha: string;
  monto: number;
  formaPago: FormaPagoCobro;
  referencia: string;
  notas: string;
}

export const cobros: Cobro[] = [
  { id: "co1", clienteId: "cl1", fecha: "2026-04-15", monto: 100000, formaPago: "cheque",        referencia: "Bco Nación #00654321",  notas: "" },
  { id: "co2", clienteId: "cl4", fecha: "2026-04-15", monto: 155000, formaPago: "transferencia", referencia: "TRF-2026-04150022",     notas: "Pago total factura abril" },
  { id: "co3", clienteId: "cl3", fecha: "2026-03-30", monto: 30000,  formaPago: "efectivo",      referencia: "",                      notas: "" },
  { id: "co4", clienteId: "cl2", fecha: "2026-04-10", monto: 45000,  formaPago: "transferencia", referencia: "TRF-2026-04100008",     notas: "" },
  { id: "co5", clienteId: "cl1", fecha: "2026-03-20", monto: 80000,  formaPago: "cheque",        referencia: "Bco Galicia #00782211", notas: "" },
];

export const gastos: Gasto[] = [
  { id: "g1", proveedorId: "pv1", fecha: "2026-04-25", concepto: "Carga diesel cam1",  camionId: "cam1", pedidoId: null, monto: 85000,  formaPago: "efectivo",      referencia: "", notas: "" },
  { id: "g2", proveedorId: "pv1", fecha: "2026-04-24", concepto: "Carga diesel cam3",  camionId: "cam3", pedidoId: null, monto: 92000,  formaPago: "efectivo",      referencia: "", notas: "" },
  { id: "g3", proveedorId: "pv6", fecha: "2026-04-22", concepto: "Pastillas de freno", camionId: "cam2", pedidoId: null, monto: 38000,  formaPago: "transferencia", referencia: "TRF-2026-04220011",    notas: "" },
  { id: "g4", proveedorId: "pv7", fecha: "2026-04-18", concepto: "Juego de cubiertas", camionId: "cam4", pedidoId: null, monto: 420000, formaPago: "cheque",        referencia: "Bco Galicia #00891234", notas: "4 cubiertas traseras" },
  { id: "g5", proveedorId: "pv5", fecha: "2026-04-10", concepto: "Vto. IVA marzo",     camionId: null,   pedidoId: null, monto: 67000,  formaPago: "transferencia", referencia: "VEP-4892347",           notas: "" },
  { id: "g6", proveedorId: "pv4", fecha: "2026-04-08", concepto: "Ingresos brutos Q1", camionId: null,   pedidoId: null, monto: 54000,  formaPago: "transferencia", referencia: "ARBA-20260408",         notas: "" },
  { id: "g7", proveedorId: "pv8", fecha: "2026-04-05", concepto: "Aceite motor 20L",   camionId: "cam1", pedidoId: null, monto: 18000,  formaPago: "efectivo",      referencia: "", notas: "" },
  { id: "g8", proveedorId: "pv2", fecha: "2026-03-30", concepto: "Carga diesel cam2",  camionId: "cam2", pedidoId: null, monto: 78000,  formaPago: "efectivo",      referencia: "", notas: "" },
  // Peajes generados desde remitos
  { id: "g9",  proveedorId: "pv4", fecha: "2026-04-24", concepto: "Peaje R-00891 — Mendoza",   camionId: "cam4", pedidoId: "p5", monto: 18000, formaPago: "efectivo", referencia: "", notas: "" },
  { id: "g10", proveedorId: "pv4", fecha: "2026-04-17", concepto: "Peaje R-00889 — Santa Fe",  camionId: "cam1", pedidoId: "p6", monto: 9200,  formaPago: "efectivo", referencia: "", notas: "" },
  { id: "g11", proveedorId: "pv4", fecha: "2026-04-20", concepto: "Peaje R-00887 — Santa Fe",  camionId: "cam1", pedidoId: "p7", monto: 9200,  formaPago: "efectivo", referencia: "", notas: "" },
  { id: "g12", proveedorId: "pv4", fecha: "2026-04-12", concepto: "Peaje R-00882 — Córdoba",   camionId: "cam3", pedidoId: "p8", monto: 12000, formaPago: "efectivo", referencia: "", notas: "" },
];

export const viajes: Viaje[] = [
  { id: "v1", camionId: "cam1", choferId: "c1", fecha: "2026-04-20", kmViaje: 180, origen: "Buenos Aires", destino: "Rosario" },
  { id: "v2", camionId: "cam1", choferId: "c1", fecha: "2026-04-22", kmViaje: 120, origen: "Rosario", destino: "Santa Fe" },
  { id: "v3", camionId: "cam2", choferId: "c2", fecha: "2026-04-21", kmViaje: 95, origen: "Buenos Aires", destino: "La Plata" },
  { id: "v4", camionId: "cam3", choferId: "c3", fecha: "2026-04-19", kmViaje: 310, origen: "Buenos Aires", destino: "Córdoba" },
  { id: "v5", camionId: "cam4", choferId: "c4", fecha: "2026-04-20", kmViaje: 620, origen: "Buenos Aires", destino: "Mendoza" },
  { id: "v6", camionId: "cam4", choferId: "c4", fecha: "2026-04-23", kmViaje: 580, origen: "Mendoza", destino: "Buenos Aires" },
  { id: "v7", camionId: "cam2", choferId: "c3", fecha: "2026-04-24", kmViaje: 85, origen: "Buenos Aires", destino: "Campana" },
  { id: "v8", camionId: "cam1", choferId: "c2", fecha: "2026-04-25", kmViaje: 150, origen: "Santa Fe", destino: "Paraná" },
];

// ── Vencimientos de choferes ──────────────────────────────────────────────────

export interface TipoVencimientoChofer {
  id: string;
  nombre: string;
  descripcion: string;
  intervaloDias: number;
  alertaDiasAntes: number;
}

export interface VencimientoChoferAsignado {
  id: string;
  choferId: string;
  tipoVencimientoId: string;
  intervaloDias: number;
  alertaDiasAntes: number;
  activo: boolean;
}

export interface RegistroVencimiento {
  id: string;
  choferId: string;
  tipoVencimientoId: string;
  fecha: string;
  notas: string;
}

export const tiposVencimientoChofer: TipoVencimientoChofer[] = [
  { id: "tv1", nombre: "Licencia de conducir",      descripcion: "Renovación de habilitación para conducir vehículos de carga", intervaloDias: 365, alertaDiasAntes: 60 },
  { id: "tv2", nombre: "Examen psicotécnico",        descripcion: "Evaluación psicológica y médica periódica",                   intervaloDias: 365, alertaDiasAntes: 30 },
  { id: "tv3", nombre: "ART / Seguro personal",      descripcion: "Renovación anual de la póliza de accidentes de trabajo",      intervaloDias: 365, alertaDiasAntes: 30 },
  { id: "tv4", nombre: "Curso manejo defensivo",     descripcion: "Capacitación obligatoria en técnicas de conducción segura",   intervaloDias: 730, alertaDiasAntes: 60 },
];

export const vencimientosChoferAsignados: VencimientoChoferAsignado[] = [
  // Carlos Rodríguez (c1)
  { id: "vca1", choferId: "c1", tipoVencimientoId: "tv1", intervaloDias: 365, alertaDiasAntes: 60, activo: true },
  { id: "vca2", choferId: "c1", tipoVencimientoId: "tv2", intervaloDias: 365, alertaDiasAntes: 30, activo: true },
  { id: "vca3", choferId: "c1", tipoVencimientoId: "tv3", intervaloDias: 365, alertaDiasAntes: 30, activo: true },
  { id: "vca4", choferId: "c1", tipoVencimientoId: "tv4", intervaloDias: 730, alertaDiasAntes: 60, activo: true },
  // Miguel Fernández (c2)
  { id: "vca5", choferId: "c2", tipoVencimientoId: "tv1", intervaloDias: 365, alertaDiasAntes: 60, activo: true },
  { id: "vca6", choferId: "c2", tipoVencimientoId: "tv2", intervaloDias: 365, alertaDiasAntes: 30, activo: true },
  { id: "vca7", choferId: "c2", tipoVencimientoId: "tv3", intervaloDias: 365, alertaDiasAntes: 30, activo: true },
  // Roberto Gómez (c3)
  { id: "vca8",  choferId: "c3", tipoVencimientoId: "tv1", intervaloDias: 365, alertaDiasAntes: 60, activo: true },
  { id: "vca9",  choferId: "c3", tipoVencimientoId: "tv2", intervaloDias: 365, alertaDiasAntes: 30, activo: true },
  { id: "vca10", choferId: "c3", tipoVencimientoId: "tv3", intervaloDias: 365, alertaDiasAntes: 30, activo: true },
  // Diego Martínez (c4)
  { id: "vca11", choferId: "c4", tipoVencimientoId: "tv1", intervaloDias: 365, alertaDiasAntes: 60, activo: true },
  { id: "vca12", choferId: "c4", tipoVencimientoId: "tv2", intervaloDias: 365, alertaDiasAntes: 30, activo: true },
  { id: "vca13", choferId: "c4", tipoVencimientoId: "tv4", intervaloDias: 730, alertaDiasAntes: 60, activo: true },
];

export const registrosVencimiento: RegistroVencimiento[] = [
  // c1 - Carlos: todo ok
  { id: "rv1",  choferId: "c1", tipoVencimientoId: "tv1", fecha: "2026-01-10", notas: "" },
  { id: "rv2",  choferId: "c1", tipoVencimientoId: "tv2", fecha: "2026-03-15", notas: "Aprobado" },
  { id: "rv3",  choferId: "c1", tipoVencimientoId: "tv3", fecha: "2026-04-01", notas: "" },
  { id: "rv4",  choferId: "c1", tipoVencimientoId: "tv4", fecha: "2024-10-01", notas: "Curso completo 8hs" },
  // c2 - Miguel: licencia próxima a vencer
  { id: "rv5",  choferId: "c2", tipoVencimientoId: "tv1", fecha: "2025-05-01", notas: "" },
  { id: "rv6",  choferId: "c2", tipoVencimientoId: "tv2", fecha: "2025-12-01", notas: "Aprobado" },
  { id: "rv7",  choferId: "c2", tipoVencimientoId: "tv3", fecha: "2026-03-20", notas: "" },
  // c3 - Roberto: licencia vencida
  { id: "rv8",  choferId: "c3", tipoVencimientoId: "tv1", fecha: "2025-04-01", notas: "" },
  { id: "rv9",  choferId: "c3", tipoVencimientoId: "tv2", fecha: "2026-02-01", notas: "Aprobado" },
  { id: "rv10", choferId: "c3", tipoVencimientoId: "tv3", fecha: "2026-01-15", notas: "" },
  // c4 - Diego: psicotécnico sin historial, curso próximo a vencer
  { id: "rv11", choferId: "c4", tipoVencimientoId: "tv1", fecha: "2025-11-15", notas: "" },
  { id: "rv12", choferId: "c4", tipoVencimientoId: "tv4", fecha: "2024-05-01", notas: "Curso completo" },
];

export function getUltimoRegistroVencimiento(
  choferId: string,
  tipoVencimientoId: string
): RegistroVencimiento | null {
  const registros = registrosVencimiento.filter(
    (r) => r.choferId === choferId && r.tipoVencimientoId === tipoVencimientoId
  );
  if (registros.length === 0) return null;
  return registros.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
}

export function calcularEstadoAlertaChofer(
  asignado: VencimientoChoferAsignado,
  ultimoRegistro: RegistroVencimiento | null
): { estado: EstadoAlerta; diasRestantes: number | null; proximaFecha: string | null } {
  if (!ultimoRegistro) {
    return { estado: "sin_historial", diasRestantes: null, proximaFecha: null };
  }
  const hoy = new Date();
  const fechaUltimo = new Date(ultimoRegistro.fecha + "T00:00:00");
  const diasTranscurridos = Math.floor((hoy.getTime() - fechaUltimo.getTime()) / (1000 * 60 * 60 * 24));
  const diasRestantes = asignado.intervaloDias - diasTranscurridos;

  const proximaFechaDate = new Date(fechaUltimo);
  proximaFechaDate.setDate(proximaFechaDate.getDate() + asignado.intervaloDias);
  const proximaFecha = proximaFechaDate.toISOString().split("T")[0];

  let estado: EstadoAlerta;
  if (diasRestantes < 0) estado = "vencido";
  else if (diasRestantes <= asignado.alertaDiasAntes) estado = "proximo";
  else estado = "ok";

  return { estado, diasRestantes, proximaFecha };
}

// Calcula el estado de alerta de un mantenimiento asignado
export function calcularEstadoAlerta(
  asignado: MantenimientoAsignado,
  camion: Camion,
  ultimoRegistro: RegistroMantenimiento | null
): {
  estado: EstadoAlerta;
  proximoKm: number | null;
  proximaFecha: string | null;
  kmRestantes: number | null;
  diasRestantes: number | null;
} {
  const hoy = new Date();

  if (!ultimoRegistro) {
    return { estado: "sin_historial", proximoKm: null, proximaFecha: null, kmRestantes: null, diasRestantes: null };
  }

  const kmActual = camion.kmReales;
  const fechaUltimo = new Date(ultimoRegistro.fecha);

  let estadoKm: EstadoAlerta = "ok";
  let proximoKm: number | null = null;
  let kmRestantes: number | null = null;

  if (asignado.intervaloKm !== null) {
    proximoKm = ultimoRegistro.kmAlMomento + asignado.intervaloKm;
    kmRestantes = proximoKm - kmActual;
    if (kmRestantes <= 0) estadoKm = "vencido";
    else if (asignado.alertaKmAntes !== null && kmRestantes <= asignado.alertaKmAntes) estadoKm = "proximo";
  }

  let estadoFecha: EstadoAlerta = "ok";
  let proximaFecha: string | null = null;
  let diasRestantes: number | null = null;

  if (asignado.intervaloDias !== null) {
    const proxFecha = new Date(fechaUltimo);
    proxFecha.setDate(proxFecha.getDate() + asignado.intervaloDias);
    proximaFecha = proxFecha.toISOString().split("T")[0];
    diasRestantes = Math.ceil((proxFecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 0) estadoFecha = "vencido";
    else if (asignado.alertaDiasAntes !== null && diasRestantes <= asignado.alertaDiasAntes) estadoFecha = "proximo";
  }

  // El estado final es el más crítico
  const prioridad: Record<EstadoAlerta, number> = { vencido: 3, proximo: 2, ok: 1, sin_historial: 0 };
  const estado = prioridad[estadoKm] >= prioridad[estadoFecha] ? estadoKm : estadoFecha;

  return { estado, proximoKm, proximaFecha, kmRestantes, diasRestantes };
}

export function getUltimoRegistro(camionId: string, tipoId: string): RegistroMantenimiento | null {
  const registros = registrosMantenimiento
    .filter((r) => r.camionId === camionId && r.tipoMantenimientoId === tipoId)
    .sort((a, b) => {
      const fechaDiff = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      if (fechaDiff !== 0) return fechaDiff;
      return b.kmAlMomento - a.kmAlMomento;
    });
  return registros[0] ?? null;
}
