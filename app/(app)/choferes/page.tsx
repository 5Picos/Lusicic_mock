"use client";

import { useState } from "react";
import {
  choferes, pedidos, registrosMantenimiento,
  tiposVencimientoChofer, vencimientosChoferAsignados,
  registrosVencimiento as registrosVencimientoIniciales,
  getUltimoRegistroVencimiento, calcularEstadoAlertaChofer,
  RegistroVencimiento, VencimientoChoferAsignado, EstadoAlerta,
} from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EstadoBadge } from "@/components/estado-badge";
import {
  Phone, Mail, Package, Wrench, ChevronDown, ChevronRight,
  IdCard, Plus, Clock, History,
} from "lucide-react";

const HOY = new Date().toISOString().split("T")[0];

function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function peorEstado(estados: EstadoAlerta[]): EstadoAlerta {
  const prioridad: Record<EstadoAlerta, number> = { vencido: 3, proximo: 2, ok: 1, sin_historial: 0 };
  return estados.reduce((a, b) => prioridad[a] >= prioridad[b] ? a : b, "ok" as EstadoAlerta);
}

const ESTADO_DOT: Record<EstadoAlerta, string> = {
  vencido:      "bg-red-500",
  proximo:      "bg-yellow-400",
  ok:           "bg-green-500",
  sin_historial:"bg-slate-300",
};

export default function ChoferesPage() {
  const [registrosVenc, setRegistrosVenc] = useState<RegistroVencimiento[]>(registrosVencimientoIniciales);
  const [expandido, setExpandido]         = useState<string | null>(null);
  const [filtroPorChofer, setFiltroPorChofer] = useState<Record<string, string>>({});

  // Estado del diálogo de renovación
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [dialogChoferId, setDialogChoferId] = useState("");
  const [formRen, setFormRen] = useState({ tipoVencimientoId: "", fecha: HOY, notas: "" });
  const [errorRen, setErrorRen] = useState<string | null>(null);

  function abrirRenovacion(choferId: string) {
    const vencimientos = vencimientosChoferAsignados.filter((v) => v.choferId === choferId && v.activo);
    setDialogChoferId(choferId);
    setFormRen({ tipoVencimientoId: vencimientos[0]?.tipoVencimientoId ?? "", fecha: HOY, notas: "" });
    setErrorRen(null);
    setDialogAbierto(true);
  }

  function guardarRenovacion() {
    if (!formRen.tipoVencimientoId || !formRen.fecha) {
      setErrorRen("Tipo y fecha son obligatorios.");
      return;
    }
    const nuevo: RegistroVencimiento = {
      id: `rv${Date.now()}`,
      choferId: dialogChoferId,
      tipoVencimientoId: formRen.tipoVencimientoId,
      fecha: formRen.fecha,
      notas: formRen.notas,
    };
    setRegistrosVenc((prev) => [nuevo, ...prev]);
    setDialogAbierto(false);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Choferes</h1>
          <p className="text-slate-500 text-sm mt-1">{choferes.length} choferes registrados</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nuevo chofer
        </Button>
      </div>

      <div className="space-y-3">
        {choferes.map((chofer) => {
          const totalPedidos      = pedidos.filter((p) => p.choferId === chofer.id).length;
          const totalMant         = registrosMantenimiento.filter((r) => r.choferId === chofer.id).length;
          const iniciales         = chofer.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("");
          const abierto           = expandido === chofer.id;
          const filtroTipo        = filtroPorChofer[chofer.id] ?? "all";

          const vencimientosActivos: VencimientoChoferAsignado[] =
            vencimientosChoferAsignados.filter((v) => v.choferId === chofer.id && v.activo);

          // Calcular alertas para este chofer usando registrosVenc (con state)
          const alertasChofer = vencimientosActivos.map((v) => {
            const ultimo = registrosVenc
              .filter((r) => r.choferId === chofer.id && r.tipoVencimientoId === v.tipoVencimientoId)
              .sort((a, b) => b.fecha.localeCompare(a.fecha))[0] ?? null;
            return { asignado: v, calculo: calcularEstadoAlertaChofer(v, ultimo) };
          });

          const estadoGlobal = peorEstado(alertasChofer.map((a) => a.calculo.estado));

          // Historial filtrado
          const historialBase = registrosVenc
            .filter((r) => r.choferId === chofer.id)
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
          const historialFiltrado = filtroTipo === "all"
            ? historialBase
            : historialBase.filter((r) => r.tipoVencimientoId === filtroTipo);

          return (
            <Card key={chofer.id} className="overflow-hidden">
              {/* Cabecera */}
              <CardContent className="p-0">
                <button
                  className="w-full text-left"
                  onClick={() => setExpandido(abierto ? null : chofer.id)}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Avatar con dot de estado */}
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                        {iniciales}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${ESTADO_DOT[estadoGlobal]}`} />
                    </div>

                    {/* Datos */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{chofer.nombre}</p>
                      <div className="flex gap-4 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Phone className="w-3 h-3" />{chofer.telefono}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Mail className="w-3 h-3" />{chofer.email}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-5 text-sm text-slate-600 flex-shrink-0">
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-blue-400" />
                        <strong>{totalPedidos}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-green-400" />
                        <strong>{totalMant}</strong>
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <IdCard className="w-3.5 h-3.5" />
                        {vencimientosActivos.length} venc.
                      </span>
                      {abierto ? <ChevronDown className="w-4 h-4 text-slate-300" /> : <ChevronRight className="w-4 h-4 text-slate-300" />}
                    </div>
                  </div>
                </button>

                {/* Panel expandido */}
                {abierto && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                    <div className="p-5 space-y-5">

                      {/* Vencimientos activos */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                            <IdCard className="w-3.5 h-3.5" />
                            Vencimientos
                          </h4>
                          <Button
                            size="sm"
                            onClick={() => abrirRenovacion(chofer.id)}
                            className="h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="w-3 h-3" />
                            Registrar renovación
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {alertasChofer.map(({ asignado, calculo }) => {
                            const tipo = tiposVencimientoChofer.find((t) => t.id === asignado.tipoVencimientoId)!;
                            return (
                              <div key={asignado.id}
                                className="bg-white border border-slate-100 rounded-lg px-3 py-2.5 flex items-center gap-3">
                                <EstadoBadge estado={calculo.estado} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800 truncate">{tipo.nombre}</p>
                                  {calculo.proximaFecha && (
                                    <p className="text-xs text-slate-400">
                                      Vence: {fmtFecha(calculo.proximaFecha)}
                                      {calculo.diasRestantes !== null && (
                                        <span className={`ml-1.5 font-medium ${calculo.diasRestantes < 0 ? "text-red-500" : calculo.diasRestantes <= asignado.alertaDiasAntes ? "text-yellow-600" : "text-slate-400"}`}>
                                          ({calculo.diasRestantes < 0
                                            ? `${Math.abs(calculo.diasRestantes)}d vencido`
                                            : `${calculo.diasRestantes}d restantes`})
                                        </span>
                                      )}
                                    </p>
                                  )}
                                  {calculo.estado === "sin_historial" && (
                                    <p className="text-xs text-slate-400">Sin registros</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Historial */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" />
                            Historial
                          </h4>
                          <select
                            value={filtroTipo}
                            onChange={(e) => setFiltroPorChofer((prev) => ({ ...prev, [chofer.id]: e.target.value }))}
                            className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          >
                            <option value="all">Todos los tipos</option>
                            {vencimientosActivos.map((v) => {
                              const tipo = tiposVencimientoChofer.find((t) => t.id === v.tipoVencimientoId)!;
                              return <option key={v.tipoVencimientoId} value={v.tipoVencimientoId}>{tipo.nombre}</option>;
                            })}
                          </select>
                        </div>

                        {historialFiltrado.length === 0 ? (
                          <p className="text-sm text-slate-400 py-2">Sin registros para el filtro seleccionado</p>
                        ) : (
                          <div className="bg-white border border-slate-100 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b bg-slate-50">
                                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Notas</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {historialFiltrado.map((r) => {
                                  const tipo = tiposVencimientoChofer.find((t) => t.id === r.tipoVencimientoId);
                                  return (
                                    <tr key={r.id} className="hover:bg-slate-50/60">
                                      <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{fmtFecha(r.fecha)}</td>
                                      <td className="px-4 py-2.5 font-medium text-slate-800">{tipo?.nombre ?? r.tipoVencimientoId}</td>
                                      <td className="px-4 py-2.5 text-slate-400 text-xs">{r.notas || "—"}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Diálogo renovación */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Registrar renovación
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tipo <span className="text-red-500">*</span></Label>
              <select
                value={formRen.tipoVencimientoId}
                onChange={(e) => setFormRen((f) => ({ ...f, tipoVencimientoId: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Seleccioná...</option>
                {vencimientosChoferAsignados
                  .filter((v) => v.choferId === dialogChoferId && v.activo)
                  .map((v) => {
                    const tipo = tiposVencimientoChofer.find((t) => t.id === v.tipoVencimientoId)!;
                    return <option key={v.tipoVencimientoId} value={v.tipoVencimientoId}>{tipo.nombre}</option>;
                  })}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Fecha <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formRen.fecha}
                max={HOY}
                onChange={(e) => setFormRen((f) => ({ ...f, fecha: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notas <span className="text-slate-400 font-normal">(opcional)</span></Label>
              <Input
                placeholder="ej: Aprobado, renovación en trámite..."
                value={formRen.notas}
                onChange={(e) => setFormRen((f) => ({ ...f, notas: e.target.value }))}
              />
            </div>
            {errorRen && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorRen}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAbierto(false)}>Cancelar</Button>
            <Button onClick={guardarRenovacion} className="bg-blue-600 hover:bg-blue-700 text-white">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
