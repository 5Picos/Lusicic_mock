"use client";

import { useState, useMemo } from "react";
import { gastos, pedidos, proveedores, localidades, camiones, choferes } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark } from "lucide-react";

const MES_ACTUAL_DESDE = new Date().toISOString().slice(0, 7) + "-01";
const HOY = new Date().toISOString().split("T")[0];

function fmt(n: number) { return `$${n.toLocaleString("es-AR")}`; }
function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// Only toll expenses (linked to an order via orderId)
const gastosPeajeBase = gastos.filter((g) => g.pedidoId !== null);

export default function InformePeajesPage() {
  const [desde, setDesde]             = useState(MES_ACTUAL_DESDE);
  const [hasta, setHasta]             = useState(HOY);
  const [filtroChofer, setFiltroChofer] = useState("all");
  const [filtroLocalidad, setFiltroLocalidad] = useState("all");

  const gastosFiltrados = useMemo(() =>
    gastosPeajeBase
      .filter((g) => g.fecha >= desde && g.fecha <= hasta)
      .filter((g) => {
        if (filtroChofer === "all") return true;
        const pedido = pedidos.find((p) => p.id === g.pedidoId);
        return pedido?.choferId === filtroChofer;
      })
      .filter((g) => {
        if (filtroLocalidad === "all") return true;
        const pedido = pedidos.find((p) => p.id === g.pedidoId);
        return pedido?.localidadId === filtroLocalidad;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [desde, hasta, filtroChofer, filtroLocalidad]
  );

  const total = gastosFiltrados.reduce((a, g) => a + g.monto, 0);

  const porLocalidad = localidades.map((loc) => {
    const items = gastosFiltrados.filter((g) => {
      const pedido = pedidos.find((p) => p.id === g.pedidoId);
      return pedido?.localidadId === loc.id;
    });
    return { localidad: loc, items, total: items.reduce((a, g) => a + g.monto, 0) };
  }).filter((x) => x.items.length > 0).sort((a, b) => b.total - a.total);

  const porProveedor = proveedores.map((pv) => ({
    proveedor: pv,
    total: gastosFiltrados.filter((g) => g.proveedorId === pv.id).reduce((a, g) => a + g.monto, 0),
    count: gastosFiltrados.filter((g) => g.proveedorId === pv.id).length,
  })).filter((x) => x.total > 0).sort((a, b) => b.total - a.total);

  const localidadesConPeaje = localidades.filter((loc) =>
    gastosPeajeBase.some((g) => {
      const pedido = pedidos.find((p) => p.id === g.pedidoId);
      return pedido?.localidadId === loc.id;
    })
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Peajes pagados</h1>
        <p className="text-slate-500 text-sm mt-1">Gastos de peaje generados desde remitos</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">Desde</Label>
              <Input type="date" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} className="w-36" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">Hasta</Label>
              <Input type="date" value={hasta} min={desde} max={HOY} onChange={(e) => setHasta(e.target.value)} className="w-36" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">Chofer</Label>
              <select
                value={filtroChofer}
                onChange={(e) => setFiltroChofer(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="all">Todos</option>
                {choferes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">Destino</Label>
              <select
                value={filtroLocalidad}
                onChange={(e) => setFiltroLocalidad(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="all">Todos</option>
                {localidadesConPeaje.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center">
                <Landmark className="w-4 h-4 text-slate-200" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{fmt(total)}</p>
                <p className="text-xs text-slate-300 font-medium">Total peajes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-5 pb-4">
            <p className="text-2xl font-bold text-slate-800">{gastosFiltrados.length}</p>
            <p className="text-xs text-slate-500 font-medium">Registros de peaje</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-5 pb-4">
            <p className="text-2xl font-bold text-slate-800">{porLocalidad.length}</p>
            <p className="text-xs text-slate-500 font-medium">Destinos con peaje</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por localidad */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Por destino</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {porLocalidad.length === 0 && <p className="text-slate-400 text-sm">Sin registros en el período</p>}
            {porLocalidad.map(({ localidad, items, total: subtotal }) => {
              const pct = total > 0 ? Math.round((subtotal / total) * 100) : 0;
              return (
                <div key={localidad.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{localidad.nombre}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-800">{fmt(subtotal)}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{items.length} viaje{items.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className="h-1.5 rounded-full bg-slate-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Tarifa por viaje: {fmt(localidad.peaje)}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Por proveedor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Por proveedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {porProveedor.length === 0 && <p className="text-slate-400 text-sm">Sin registros en el período</p>}
            {porProveedor.map(({ proveedor, total: subtotal, count }) => {
              const pct = total > 0 ? Math.round((subtotal / total) * 100) : 0;
              return (
                <div key={proveedor.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{proveedor.nombre}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-800">{fmt(subtotal)}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{count} pago{count !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className="h-1.5 rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Detalle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Detalle por remito</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Concepto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pedido</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Chofer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Camión</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Proveedor</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gastosFiltrados.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Sin registros para los filtros seleccionados</td></tr>
              )}
              {gastosFiltrados.map((g) => {
                const pedido    = pedidos.find((p) => p.id === g.pedidoId);
                const camion    = camiones.find((c) => c.id === g.camionId);
                const chofer    = choferes.find((c) => c.id === pedido?.choferId);
                const proveedor = proveedores.find((p) => p.id === g.proveedorId);
                return (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{fmtFecha(g.fecha)}</td>
                    <td className="px-6 py-3 text-slate-700">{g.concepto}</td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-500">#{pedido?.numeroPedido ?? "—"}</td>
                    <td className="px-6 py-3 text-slate-600">{chofer?.nombre ?? "—"}</td>
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{camion?.patente ?? "—"}</td>
                    <td className="px-6 py-3 text-slate-600">{proveedor?.nombre ?? "—"}</td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-800">{fmt(g.monto)}</td>
                  </tr>
                );
              })}
            </tbody>
            {gastosFiltrados.length > 0 && (
              <tfoot>
                <tr className="border-t bg-slate-50">
                  <td colSpan={6} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-900">{fmt(total)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
