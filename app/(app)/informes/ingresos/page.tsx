"use client";

import { useState, useMemo } from "react";
import { cobros, clientes, FormaPagoCobro } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Banknote, ArrowRightLeft, Landmark } from "lucide-react";

const FORMA_CFG: Record<FormaPagoCobro, { label: string; icon: React.ElementType; cls: string; bar: string }> = {
  efectivo:      { label: "Efectivo",      icon: Banknote,      cls: "bg-green-50 text-green-700 border-green-200",   bar: "bg-green-400" },
  transferencia: { label: "Transferencia", icon: ArrowRightLeft, cls: "bg-blue-50 text-blue-700 border-blue-200",     bar: "bg-blue-400" },
  cheque:        { label: "Cheque",        icon: Landmark,      cls: "bg-yellow-50 text-yellow-700 border-yellow-200", bar: "bg-yellow-400" },
};

const FORMAS: FormaPagoCobro[] = ["efectivo", "transferencia", "cheque"];

const MES_ACTUAL_DESDE = new Date().toISOString().slice(0, 7) + "-01";
const HOY = new Date().toISOString().split("T")[0];

function fmt(n: number) { return `$${n.toLocaleString("es-AR")}`; }
function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function InformeIngresosPage() {
  const [desde, setDesde] = useState(MES_ACTUAL_DESDE);
  const [hasta, setHasta] = useState(HOY);

  const cobrosFiltrados = useMemo(() =>
    cobros.filter((c) => c.fecha >= desde && c.fecha <= hasta)
          .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [desde, hasta]
  );

  const total = cobrosFiltrados.reduce((a, c) => a + c.monto, 0);

  const porForma = FORMAS.map((f) => {
    const items = cobrosFiltrados.filter((c) => c.formaPago === f);
    return { forma: f, total: items.reduce((a, c) => a + c.monto, 0), count: items.length };
  }).filter((x) => x.total > 0);

  const porCliente = clientes.map((cl) => ({
    cliente: cl,
    total: cobrosFiltrados.filter((c) => c.clienteId === cl.id).reduce((a, c) => a + c.monto, 0),
    count: cobrosFiltrados.filter((c) => c.clienteId === cl.id).length,
  })).filter((x) => x.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ingresos por período</h1>
        <p className="text-slate-500 text-sm mt-1">Análisis de cobros en el rango seleccionado</p>
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
              <p className="text-xs text-slate-400">{cobrosFiltrados.length} cobros en el período</p>
              <p className="text-2xl font-bold text-green-700">{fmt(total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por forma de pago */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Por forma de pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {porForma.length === 0 && (
              <p className="text-slate-400 text-sm">Sin cobros en el período</p>
            )}
            {porForma.map(({ forma, total: subtotal, count }) => {
              const cfg  = FORMA_CFG[forma];
              const Icon = cfg.icon;
              const pct  = total > 0 ? Math.round((subtotal / total) * 100) : 0;
              return (
                <div key={forma}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-800">{fmt(subtotal)}</span>
                      <span className="text-xs text-slate-400 ml-2">{count} cobro{count !== 1 ? "s" : ""}</span>
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

        {/* Por cliente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Por cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {porCliente.length === 0 && (
              <p className="text-slate-400 text-sm">Sin cobros en el período</p>
            )}
            {porCliente.map(({ cliente, total: subtotal, count }) => {
              const iniciales = cliente.nombre.split(" ").map((n: string) => n[0]).slice(0, 2).join("");
              const pct = total > 0 ? Math.round((subtotal / total) * 100) : 0;
              return (
                <div key={cliente.id}>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {iniciales}
                    </div>
                    <span className="text-sm font-medium text-slate-800 flex-1 truncate">{cliente.nombre}</span>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-800">{fmt(subtotal)}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{count} cobro{count !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full ml-8">
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
          <CardTitle className="text-sm font-semibold text-slate-700">Detalle</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Forma de pago</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Referencia</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cobrosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Sin cobros en el período seleccionado</td>
                </tr>
              )}
              {cobrosFiltrados.map((c) => {
                const cliente = clientes.find((cl) => cl.id === c.clienteId)!;
                const cfg     = FORMA_CFG[c.formaPago];
                const Icon    = cfg.icon;
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{fmtFecha(c.fecha)}</td>
                    <td className="px-6 py-3 font-medium text-slate-900">{cliente.nombre}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{c.referencia || "—"}</td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-800">{fmt(c.monto)}</td>
                  </tr>
                );
              })}
            </tbody>
            {cobrosFiltrados.length > 0 && (
              <tfoot>
                <tr className="border-t bg-slate-50">
                  <td colSpan={4} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total período</td>
                  <td className="px-6 py-3 text-right font-bold text-green-700">{fmt(total)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
