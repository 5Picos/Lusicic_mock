"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Landmark, Clock, CheckCircle2, Search, Check } from "lucide-react";

type EstadoCheque = "pending" | "credited";

interface Cheque {
  id: string;
  banco: string;
  numeroCheque: string;
  fechaAcreditacion: string;
  monto: number;
  estado: EstadoCheque;
  clienteNombre: string;
  facturaFecha: string;
}

const chequesIniciales: Cheque[] = [
  { id: "ch1", banco: "Banco Nación",     numeroCheque: "00123456", fechaAcreditacion: "2026-05-10", monto: 100000, estado: "pending",  clienteNombre: "Molinos Río de la Plata", facturaFecha: "2026-03-15" },
  { id: "ch2", banco: "Banco Galicia",    numeroCheque: "00789012", fechaAcreditacion: "2026-05-03", monto: 88000,  estado: "pending",  clienteNombre: "Arcor S.A.I.C.",          facturaFecha: "2026-04-05" },
  { id: "ch3", banco: "Banco Nación",     numeroCheque: "00654321", fechaAcreditacion: "2026-04-18", monto: 45000,  estado: "credited", clienteNombre: "Molinos Río de la Plata", facturaFecha: "2026-03-01" },
  { id: "ch4", banco: "BBVA Argentina",   numeroCheque: "00334455", fechaAcreditacion: "2026-04-25", monto: 62000,  estado: "credited", clienteNombre: "Frigorífico Paladini",    facturaFecha: "2026-03-20" },
  { id: "ch5", banco: "Banco Santander",  numeroCheque: "00998877", fechaAcreditacion: "2026-05-20", monto: 175000, estado: "pending",  clienteNombre: "Arcor S.A.I.C.",          facturaFecha: "2026-04-10" },
  { id: "ch6", banco: "Banco Galicia",    numeroCheque: "00111222", fechaAcreditacion: "2026-04-12", monto: 30000,  estado: "credited", clienteNombre: "Supermercados DIA",       facturaFecha: "2026-03-28" },
];

const bancos = [...new Set(chequesIniciales.map((c) => c.banco))].sort();

function fmt(n: number) { return `$${n.toLocaleString("es-AR")}`; }
function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ChequesPage() {
  const [cheques, setCheques]       = useState<Cheque[]>(chequesIniciales);
  const [filtroEstado, setFiltroEstado] = useState<"all" | EstadoCheque>("all");
  const [filtroBanco, setFiltroBanco]   = useState<string>("all");
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  function acreditar(id: string) {
    setCheques((prev) => prev.map((c) => c.id === id ? { ...c, estado: "credited" } : c));
  }

  const filtrados = cheques
    .filter((c) => filtroEstado === "all" || c.estado === filtroEstado)
    .filter((c) => filtroBanco  === "all" || c.banco === filtroBanco)
    .filter((c) => {
      if (!filtroBusqueda) return true;
      const q = filtroBusqueda.toLowerCase();
      return (
        c.numeroCheque.includes(q) ||
        c.clienteNombre.toLowerCase().includes(q) ||
        c.banco.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(a.fechaAcreditacion).getTime() - new Date(b.fechaAcreditacion).getTime());

  const pendientes  = cheques.filter((c) => c.estado === "pending");
  const acreditados = cheques.filter((c) => c.estado === "credited");
  const montoPendiente  = pendientes.reduce((a, c) => a + c.monto, 0);
  const montoAcreditado = acreditados.reduce((a, c) => a + c.monto, 0);

  // Cheques pendientes que vencen en los próximos 7 días
  const hoy = new Date();
  const en7dias = new Date(hoy); en7dias.setDate(hoy.getDate() + 7);
  const proximosAVencer = pendientes.filter((c) => {
    const fecha = new Date(c.fechaAcreditacion + "T00:00:00");
    return fecha >= hoy && fecha <= en7dias;
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cheques</h1>
        <p className="text-slate-500 text-sm mt-1">{cheques.length} cheques registrados</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-yellow-700">{fmt(montoPendiente)}</p>
                <p className="text-xs text-yellow-600 font-medium">{pendientes.length} cheques pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-700">{fmt(montoAcreditado)}</p>
                <p className="text-xs text-green-600 font-medium">{acreditados.length} cheques acreditados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={proximosAVencer.length > 0 ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-slate-50"}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${proximosAVencer.length > 0 ? "bg-orange-100" : "bg-slate-100"}`}>
                <Landmark className={`w-4 h-4 ${proximosAVencer.length > 0 ? "text-orange-600" : "text-slate-400"}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${proximosAVencer.length > 0 ? "text-orange-700" : "text-slate-500"}`}>
                  {proximosAVencer.length}
                </p>
                <p className={`text-xs font-medium ${proximosAVencer.length > 0 ? "text-orange-600" : "text-slate-400"}`}>
                  A acreditar en 7 días
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-0 pt-4 px-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Estado */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200 text-sm">
              {(["all", "pending", "credited"] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setFiltroEstado(e)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    filtroEstado === e
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {e === "all" ? "Todos" : e === "pending" ? "Pendientes" : "Acreditados"}
                </button>
              ))}
            </div>

            {/* Banco */}
            <select
              value={filtroBanco}
              onChange={(e) => setFiltroBanco(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="all">Todos los bancos</option>
              {bancos.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            {/* Búsqueda */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="N° cheque, cliente, banco..."
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>

            <p className="text-xs text-slate-400 ml-auto">{filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}</p>
          </div>
        </CardHeader>

        <CardContent className="p-0 mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">N° Cheque</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Banco</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acredita</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Factura</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400 text-sm">
                    Sin resultados para los filtros aplicados
                  </td>
                </tr>
              )}
              {filtrados.map((ch) => {
                const venceProximo = ch.estado === "pending" && (() => {
                  const fecha = new Date(ch.fechaAcreditacion + "T00:00:00");
                  return fecha >= hoy && fecha <= en7dias;
                })();

                return (
                  <tr key={ch.id} className={`${venceProximo ? "bg-orange-50/40" : "hover:bg-slate-50"}`}>
                    <td className="px-6 py-3.5">
                      <span className="font-mono font-semibold text-slate-900">{ch.numeroCheque}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Landmark className="w-3.5 h-3.5 text-slate-400" />
                        {ch.banco}
                      </div>
                    </td>
                    <td className={`px-6 py-3.5 whitespace-nowrap font-medium ${venceProximo ? "text-orange-600" : "text-slate-600"}`}>
                      {fmtFecha(ch.fechaAcreditacion)}
                      {venceProximo && <span className="ml-1.5 text-xs font-normal text-orange-500">próximo</span>}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{ch.clienteNombre}</td>
                    <td className="px-6 py-3.5 text-slate-500 text-xs">{fmtFecha(ch.facturaFecha)}</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-800">{fmt(ch.monto)}</td>
                    <td className="px-6 py-3.5">
                      {ch.estado === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="w-3 h-3" /> Acreditado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      {ch.estado === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() => acreditar(ch.id)}
                        >
                          <Check className="w-3 h-3" />
                          Acreditar
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
