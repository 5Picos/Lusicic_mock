"use client";

import { useState } from "react";
import { localidades as localidadesInicial, pedidos, Localidad } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, Route, CircleDollarSign, Package, Pencil, Check, X } from "lucide-react";

type FilaEdicion = { kmIdaVuelta: string; peaje: string };

export default function LocalidadesPage() {
  const [localidades, setLocalidades] = useState<Localidad[]>(localidadesInicial);
  const [editandoId, setEditandoId]   = useState<string | null>(null);
  const [fila, setFila]               = useState<FilaEdicion>({ kmIdaVuelta: "", peaje: "" });

  function iniciarEdicion(loc: Localidad) {
    setFila({ kmIdaVuelta: String(loc.kmIdaVuelta), peaje: String(loc.peaje) });
    setEditandoId(loc.id);
  }

  function guardar(id: string) {
    setLocalidades((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, kmIdaVuelta: Number(fila.kmIdaVuelta) || l.kmIdaVuelta, peaje: Number(fila.peaje) || l.peaje }
          : l
      )
    );
    setEditandoId(null);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Localidades</h1>
          <p className="text-slate-500 text-sm mt-1">{localidades.length} localidades registradas</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nueva localidad
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Localidades de destino</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Localidad</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">KM ida y vuelta</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Peaje</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pedidos</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localidades.map((loc) => {
                  const totalPedidos = pedidos.filter((p) => p.localidadId === loc.id).length;
                  const editando = editandoId === loc.id;

                  return (
                    <tr key={loc.id} className={editando ? "bg-blue-50/40" : "hover:bg-slate-50"}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-medium text-slate-900">{loc.nombre}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {editando ? (
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              value={fila.kmIdaVuelta}
                              onChange={(e) => setFila((f) => ({ ...f, kmIdaVuelta: e.target.value }))}
                              className="w-24 h-7 text-sm"
                            />
                            <span className="text-slate-400 text-xs">km</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Route className="w-3.5 h-3.5 text-slate-400" />
                            {loc.kmIdaVuelta.toLocaleString("es-AR")} km
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {editando ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 text-xs">$</span>
                            <Input
                              type="number"
                              value={fila.peaje}
                              onChange={(e) => setFila((f) => ({ ...f, peaje: e.target.value }))}
                              className="w-28 h-7 text-sm"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <CircleDollarSign className="w-3.5 h-3.5 text-slate-400" />
                            ${loc.peaje.toLocaleString("es-AR")}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Package className="w-3.5 h-3.5" />
                          {totalPedidos} pedido{totalPedidos !== 1 ? "s" : ""}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {editando ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              className="h-7 bg-blue-600 hover:bg-blue-700 text-white gap-1 px-3"
                              onClick={() => guardar(loc.id)}
                            >
                              <Check className="w-3 h-3" />
                              Guardar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-slate-400 hover:text-slate-600 px-2"
                              onClick={() => setEditandoId(null)}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-slate-400 hover:text-slate-600 gap-1.5"
                            onClick={() => iniciarEdicion(loc)}
                          >
                            <Pencil className="w-3 h-3" />
                            Editar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
