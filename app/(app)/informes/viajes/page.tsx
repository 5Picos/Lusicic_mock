"use client";

import { useState, useMemo } from "react";
import { viajes, choferes, camiones } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Route } from "lucide-react";

const MES_ACTUAL_DESDE = new Date().toISOString().slice(0, 7) + "-01";
const HOY = new Date().toISOString().split("T")[0];

function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function InformeViajesPage() {
  const [desde, setDesde]           = useState(MES_ACTUAL_DESDE);
  const [hasta, setHasta]           = useState(HOY);
  const [filtroChofer, setFiltroChofer] = useState("all");
  const [filtroCamion, setFiltroCamion] = useState("all");

  const viajesFiltrados = useMemo(() =>
    viajes
      .filter((v) => v.fecha >= desde && v.fecha <= hasta)
      .filter((v) => filtroChofer === "all" || v.choferId === filtroChofer)
      .filter((v) => filtroCamion === "all" || v.camionId === filtroCamion)
      .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [desde, hasta, filtroChofer, filtroCamion]
  );

  const totalKm     = viajesFiltrados.reduce((a, v) => a + v.kmViaje, 0);
  const totalViajes = viajesFiltrados.length;

  // Km por camión
  const kmPorCamion = camiones.map((c) => ({
    camion: c,
    km: viajesFiltrados.filter((v) => v.camionId === c.id).reduce((a, v) => a + v.kmViaje, 0),
    count: viajesFiltrados.filter((v) => v.camionId === c.id).length,
  })).filter((x) => x.km > 0).sort((a, b) => b.km - a.km);

  // Km por chofer
  const kmPorChofer = choferes.map((c) => ({
    chofer: c,
    km: viajesFiltrados.filter((v) => v.choferId === c.id).reduce((a, v) => a + v.kmViaje, 0),
    count: viajesFiltrados.filter((v) => v.choferId === c.id).length,
  })).filter((x) => x.km > 0).sort((a, b) => b.km - a.km);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Viajes por período</h1>
        <p className="text-slate-500 text-sm mt-1">Actividad de viajes filtrada por chofer, camión y fecha</p>
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
              <Label className="text-xs text-slate-500 uppercase tracking-wide">Camión</Label>
              <select
                value={filtroCamion}
                onChange={(e) => setFiltroCamion(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="all">Todos</option>
                {camiones.map((c) => <option key={c.id} value={c.id}>{c.patente}</option>)}
              </select>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-400">{totalViajes} viaje{totalViajes !== 1 ? "s" : ""} en el período</p>
              <p className="text-2xl font-bold text-slate-800">{totalKm.toLocaleString("es-AR")} km</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por camión */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Km por camión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {kmPorCamion.length === 0 && <p className="text-slate-400 text-sm">Sin viajes en el período</p>}
            {kmPorCamion.map(({ camion, km, count }) => {
              const pct = totalKm > 0 ? Math.round((km / totalKm) * 100) : 0;
              return (
                <div key={camion.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{camion.patente}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{camion.marca} {camion.modelo}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-800">{km.toLocaleString("es-AR")} km</span>
                      <span className="text-xs text-slate-400 ml-1.5">{count} viaje{count !== 1 ? "s" : ""}</span>
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

        {/* Por chofer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Km por chofer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {kmPorChofer.length === 0 && <p className="text-slate-400 text-sm">Sin viajes en el período</p>}
            {kmPorChofer.map(({ chofer, km, count }) => {
              const iniciales = chofer.nombre.split(" ").map((n: string) => n[0]).slice(0, 2).join("");
              const pct = totalKm > 0 ? Math.round((km / totalKm) * 100) : 0;
              return (
                <div key={chofer.id}>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {iniciales}
                    </div>
                    <span className="text-sm font-medium text-slate-800 flex-1">{chofer.nombre}</span>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-800">{km.toLocaleString("es-AR")} km</span>
                      <span className="text-xs text-slate-400 ml-1.5">{count} viaje{count !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full ml-8">
                    <div className="h-1.5 rounded-full bg-green-400" style={{ width: `${pct}%` }} />
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
          <CardTitle className="text-sm font-semibold text-slate-700">Detalle de viajes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Camión</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Chofer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Origen</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Destino</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">KM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {viajesFiltrados.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Sin viajes para los filtros seleccionados</td></tr>
              )}
              {viajesFiltrados.map((v) => {
                const camion = camiones.find((c) => c.id === v.camionId)!;
                const chofer = choferes.find((c) => c.id === v.choferId)!;
                return (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{fmtFecha(v.fecha)}</td>
                    <td className="px-6 py-3">
                      <span className="font-medium text-slate-900">{camion.patente}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{camion.marca}</span>
                    </td>
                    <td className="px-6 py-3 text-slate-700">{chofer.nombre}</td>
                    <td className="px-6 py-3 text-slate-600">{v.origen}</td>
                    <td className="px-6 py-3 text-slate-600">{v.destino}</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-800">{v.kmViaje.toLocaleString("es-AR")}</td>
                  </tr>
                );
              })}
            </tbody>
            {viajesFiltrados.length > 0 && (
              <tfoot>
                <tr className="border-t bg-slate-50">
                  <td colSpan={5} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-900">{totalKm.toLocaleString("es-AR")} km</td>
                </tr>
              </tfoot>
            )}
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
