"use client";

import { useState } from "react";
import { clientes, pedidos, remitos, localidades } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet, ChevronDown, ChevronRight, Clock, CheckCircle2,
  AlertTriangle, FileText, Receipt, ArrowRight,
} from "lucide-react";

// ── Facturas mock ─────────────────────────────────────────────────────────────
const facturas = [
  {
    id: "f1", clienteId: "cl1", fecha: "2026-04-20", total: 176000,
    estado: "pending" as const, remitos: ["R-00887"],
    pagos: [] as { monto: number; metodo: string }[],
  },
  {
    id: "f2", clienteId: "cl4", fecha: "2026-04-13", total: 155000,
    estado: "paid" as const, remitos: ["R-00882"],
    pagos: [{ monto: 155000, metodo: "Transferencia" }],
  },
  {
    id: "f3", clienteId: "cl1", fecha: "2026-03-15", total: 250000,
    estado: "partially_paid" as const, remitos: ["R-00871"],
    pagos: [{ monto: 100000, metodo: "Cheque" }],
  },
  {
    id: "f4", clienteId: "cl2", fecha: "2026-04-05", total: 88000,
    estado: "pending" as const, remitos: ["R-00878"],
    pagos: [] as { monto: number; metodo: string }[],
  },
  {
    id: "f5", clienteId: "cl3", fecha: "2026-03-28", total: 30000,
    estado: "paid" as const, remitos: ["R-00875"],
    pagos: [{ monto: 30000, metodo: "Efectivo" }],
  },
];

const ESTADO_CFG = {
  pending:        { label: "Pendiente",    cls: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  partially_paid: { label: "Pago parcial", cls: "bg-blue-50 text-blue-700 border-blue-200",      icon: Clock },
  paid:           { label: "Cobrada",      cls: "bg-green-50 text-green-700 border-green-200",    icon: CheckCircle2 },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
function saldoCliente(clienteId: string) {
  const fs = facturas.filter((f) => f.clienteId === clienteId);
  const totalFacturado = fs.reduce((a, f) => a + f.total, 0);
  const totalPagado    = fs.reduce((a, f) => a + f.pagos.reduce((b, p) => b + p.monto, 0), 0);
  return { totalFacturado, totalPagado, saldo: totalFacturado - totalPagado };
}

function fmt(n: number) { return `$${n.toLocaleString("es-AR")}`; }
function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// ── Datos derivados ───────────────────────────────────────────────────────────

// Pedidos entregados sin facturar, agrupados por cliente solicitante
const pedidosAFacturar = pedidos.filter((p) => p.estado === "delivered");

type GrupoAFacturar = {
  clienteId: string;
  items: { pedido: typeof pedidos[0]; remito: typeof remitos[0] | undefined }[];
  total: number;
};

const gruposAFacturar: GrupoAFacturar[] = clientes
  .map((cl) => {
    const items = pedidosAFacturar
      .filter((p) => p.clienteSolicitanteId === cl.id)
      .map((p) => ({ pedido: p, remito: remitos.find((r) => r.pedidoId === p.id) }));
    return { clienteId: cl.id, items, total: items.reduce((a, i) => a + i.pedido.precioAplicado, 0) };
  })
  .filter((g) => g.items.length > 0);

// ── Component ──────────────────────────────────────────────────────────────────
export default function CuentaCorrientePage() {
  const [expandido, setExpandido] = useState<string | null>(null);

  const resumen = clientes.map((c) => ({ ...c, ...saldoCliente(c.id) }));
  const totalDeuda       = resumen.reduce((a, c) => a + c.saldo, 0);
  const totalAFacturar   = gruposAFacturar.reduce((a, g) => a + g.total, 0);
  const clientesConDeuda = resumen.filter((c) => c.saldo > 0).length;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cuenta corriente</h1>
        <p className="text-slate-500 text-sm mt-1">Pipeline de facturación y cobranza</p>
      </div>

      {/* Resumen global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-700">{fmt(totalAFacturar)}</p>
                <p className="text-xs text-blue-600 font-medium">
                  A facturar · {pedidosAFacturar.length} remito{pedidosAFacturar.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-red-700">{fmt(totalDeuda)}</p>
                <p className="text-xs text-red-600 font-medium">Facturado pendiente de cobro</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-slate-200" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{fmt(totalAFacturar + totalDeuda)}</p>
                <p className="text-xs text-slate-300 font-medium">Total a cobrar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Sección 1: Pendiente de facturar ── */}
      {gruposAFacturar.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-800">Pendiente de facturar</h2>
            <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
              {pedidosAFacturar.length} remito{pedidosAFacturar.length !== 1 ? "s" : ""}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm text-slate-500">remitos entregados listos para facturar</span>
          </div>

          {gruposAFacturar.map((grupo) => {
            const cliente = clientes.find((c) => c.id === grupo.clienteId)!;
            const iniciales = cliente.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("");
            return (
              <Card key={grupo.clienteId} className="border-blue-100 bg-blue-50/40">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {iniciales}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{cliente.nombre}</p>

                      {/* Tabla de remitos */}
                      <div className="mt-3 border border-blue-100 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-blue-50 border-b border-blue-100">
                              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Remito</th>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pedido</th>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Destino</th>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha entrega</th>
                              <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Precio</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-blue-50 bg-white">
                            {grupo.items.map(({ pedido, remito }) => {
                              const localidad = localidades.find((l) => l.id === pedido.localidadId);
                              return (
                                <tr key={pedido.id}>
                                  <td className="px-4 py-2.5">
                                    {remito ? (
                                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                        {remito.numeroRemito}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-amber-600 font-medium">Sin remito</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-600 font-mono text-xs">#{pedido.numeroPedido}</td>
                                  <td className="px-4 py-2.5 text-slate-700">{localidad?.nombre ?? "—"}</td>
                                  <td className="px-4 py-2.5 text-slate-500 text-xs">
                                    {remito ? fmtFecha(remito.fecha) : "—"}
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-semibold text-slate-800">
                                    {fmt(pedido.precioAplicado)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="bg-blue-50 border-t border-blue-100">
                              <td colSpan={4} className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total a facturar</td>
                              <td className="px-4 py-2 text-right font-bold text-blue-700">{fmt(grupo.total)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* Total cliente */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-400">A facturar</p>
                      <p className="text-lg font-bold text-blue-700">{fmt(grupo.total)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Sección 2: Cuenta corriente (facturas emitidas) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-800">Facturas emitidas</h2>
          <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
            {clientesConDeuda} cliente{clientesConDeuda !== 1 ? "s" : ""} con saldo
          </span>
        </div>

        {resumen
          .sort((a, b) => b.saldo - a.saldo)
          .map((cliente) => {
            const abierto = expandido === cliente.id;
            const facturasCliente = facturas.filter((f) => f.clienteId === cliente.id);
            const iniciales = cliente.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("");
            const sinDeuda = cliente.saldo === 0;

            if (facturasCliente.length === 0) return null;

            return (
              <Card
                key={cliente.id}
                className={`transition-shadow ${sinDeuda ? "opacity-70" : "hover:shadow-md"}`}
              >
                <CardContent className="p-0">
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandido(abierto ? null : cliente.id)}
                  >
                    <div className="flex items-center gap-4 px-6 py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${sinDeuda ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {iniciales}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">{cliente.nombre}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{facturasCliente.length} factura{facturasCliente.length !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="flex items-center gap-8 text-right flex-shrink-0">
                        <div>
                          <p className="text-xs text-slate-400">Facturado</p>
                          <p className="text-sm font-medium text-slate-700">{fmt(cliente.totalFacturado)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Pagado</p>
                          <p className="text-sm font-medium text-green-600">{fmt(cliente.totalPagado)}</p>
                        </div>
                        <div className="min-w-[100px]">
                          <p className="text-xs text-slate-400">Saldo</p>
                          <p className={`text-base font-bold ${sinDeuda ? "text-green-600" : "text-red-600"}`}>
                            {sinDeuda ? "Al día" : fmt(cliente.saldo)}
                          </p>
                        </div>
                        <div className="text-slate-300">
                          {abierto ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </button>

                  {abierto && (
                    <div className="border-t border-slate-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                            <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Remitos</th>
                            <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pagos</th>
                            <th className="text-right px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                            <th className="text-right px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Saldo</th>
                            <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {facturasCliente.map((f) => {
                            const pagado = f.pagos.reduce((a, p) => a + p.monto, 0);
                            const saldo  = f.total - pagado;
                            const cfg    = ESTADO_CFG[f.estado];
                            const Icon   = cfg.icon;
                            return (
                              <tr key={f.id} className="hover:bg-slate-50/60">
                                <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{fmtFecha(f.fecha)}</td>
                                <td className="px-6 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {f.remitos.map((r) => (
                                      <span key={r} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{r}</span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-3 text-slate-500 text-xs">
                                  {f.pagos.length > 0
                                    ? f.pagos.map((p) => `${p.metodo} ${fmt(p.monto)}`).join(" · ")
                                    : <span className="text-slate-300">Sin pagos</span>}
                                </td>
                                <td className="px-6 py-3 text-right font-medium text-slate-800">{fmt(f.total)}</td>
                                <td className={`px-6 py-3 text-right font-semibold ${saldo > 0 ? "text-red-600" : "text-green-600"}`}>
                                  {saldo > 0 ? fmt(saldo) : "—"}
                                </td>
                                <td className="px-6 py-3">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                                    <Icon className="w-3 h-3" />
                                    {cfg.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
