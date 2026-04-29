"use client";

import { useState, useMemo } from "react";
import { gastos, proveedores, camiones, TipoProveedor } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TrendingDown, Fuel, Building, Wrench, Package, Users } from "lucide-react";

const TIPO_CFG: Record<TipoProveedor, { label: string; icon: React.ElementType; cls: string; bar: string }> = {
  combustible: { label: "Combustible", icon: Fuel,     cls: "bg-orange-50 text-orange-700 border-orange-200", bar: "bg-orange-400" },
  estatal:     { label: "Estatal",     icon: Building, cls: "bg-blue-50 text-blue-700 border-blue-200",       bar: "bg-blue-400" },
  repuestos:   { label: "Repuestos",   icon: Wrench,   cls: "bg-slate-100 text-slate-700 border-slate-200",   bar: "bg-slate-400" },
  sueldos:     { label: "Sueldos",     icon: Users,    cls: "bg-green-50 text-green-700 border-green-200",    bar: "bg-green-400" },
  varios:      { label: "Varios",      icon: Package,  cls: "bg-purple-50 text-purple-700 border-purple-200", bar: "bg-purple-400" },
};

const TIPOS: TipoProveedor[] = ["combustible", "estatal", "repuestos", "sueldos", "varios"];

const MES_ACTUAL_DESDE = new Date().toISOString().slice(0, 7) + "-01";
const HOY = new Date().toISOString().split("T")[0];

function fmt(n: number) { return `$${n.toLocaleString("es-AR")}`; }
function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function InformeGastosPage() {
  const [desde, setDesde] = useState(MES_ACTUAL_DESDE);
  const [hasta, setHasta] = useState(HOY);

  const gastosFiltrados = useMemo(() =>
    gastos.filter((g) => g.fecha >= desde && g.fecha <= hasta)
          .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [desde, hasta]
  );

  const total = gastosFiltrados.reduce((a, g) => a + g.monto, 0);

  const porTipo = TIPOS.map((t) => {
    const items = gastosFiltrados.filter((g) => proveedores.find((p) => p.id === g.proveedorId)?.tipo === t);
    return { tipo: t, total: items.reduce((a, g) => a + g.monto, 0), count: items.length };
  }).filter((x) => x.total > 0);

  const porCamion = camiones.map((c) => ({
    camion: c,
    total: gastosFiltrados.filter((g) => g.camionId === c.id).reduce((a, g) => a + g.monto, 0),
  })).filter((x) => x.total > 0).sort((a, b) => b.total - a.total);

  const totalCamiones = porCamion.reduce((a, x) => a + x.total, 0);
  const totalGeneral  = gastosFiltrados.reduce((a, g) => a + g.monto, 0);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gastos por período</h1>
        <p className="text-slate-500 text-sm mt-1">Análisis de egresos en el rango seleccionado</p>
      </div>

      {/* Filtro */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-end gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">Desde</Label>
              <Input type="date" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">Hasta</Label>
              <Input type="date" value={hasta} min={desde} max={HOY} onChange={(e) => setHasta(e.target.value)} className="w-40" />
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-400">{gastosFiltrados.length} registros en el período</p>
              <p className="text-2xl font-bold text-slate-800">{fmt(total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por tipo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Por categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {porTipo.length === 0 && (
              <p className="text-slate-400 text-sm">Sin gastos en el período</p>
            )}
            {porTipo.map(({ tipo, total: subtotal, count }) => {
              const cfg  = TIPO_CFG[tipo];
              const Icon = cfg.icon;
              const pct  = total > 0 ? Math.round((subtotal / total) * 100) : 0;
              return (
                <div key={tipo}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-800">{fmt(subtotal)}</span>
                      <span className="text-xs text-slate-400 ml-2">{count} registro{count !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className={`h-1.5 rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Por camión */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Por camión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {porCamion.length === 0 && (
              <p className="text-slate-400 text-sm">Sin gastos asignados a camión</p>
            )}
            {porCamion.map(({ camion, total: subtotal }) => {
              const pct = totalCamiones > 0 ? Math.round((subtotal / totalCamiones) * 100) : 0;
              return (
                <div key={camion.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{camion.patente}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{camion.marca} {camion.modelo}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{fmt(subtotal)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className="h-1.5 rounded-full bg-slate-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {porCamion.length > 0 && totalGeneral > totalCamiones && (
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                <span>Gastos generales (sin camión)</span>
                <span>{fmt(totalGeneral - totalCamiones)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detalle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Detalle</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Proveedor</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Concepto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Camión</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gastosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Sin gastos en el período seleccionado</td>
                </tr>
              )}
              {gastosFiltrados.map((g) => {
                const pv     = proveedores.find((p) => p.id === g.proveedorId)!;
                const camion = g.camionId ? camiones.find((c) => c.id === g.camionId) : null;
                const cfg    = TIPO_CFG[pv.tipo];
                const Icon   = cfg.icon;
                return (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{fmtFecha(g.fecha)}</td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900 text-sm">{pv.nombre}</div>
                      <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border mt-0.5 ${cfg.cls}`}>
                        <Icon className="w-2.5 h-2.5" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-700">{g.concepto}</td>
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{camion?.patente ?? "—"}</td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-800">{fmt(g.monto)}</td>
                  </tr>
                );
              })}
            </tbody>
            {gastosFiltrados.length > 0 && (
              <tfoot>
                <tr className="border-t bg-slate-50">
                  <td colSpan={4} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total período</td>
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
