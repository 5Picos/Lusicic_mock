"use client";

import { useState } from "react";
import {
  listasPrecio as listasInicial,
  preciosLocalidad as preciosInicial,
  localidades,
  ListaPrecio,
  PrecioLocalidad,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Tag, MapPin, Pencil, Check, X, TrendingUp, Hash,
} from "lucide-react";

type TipoAjuste = "porcentaje" | "monto";

export default function PreciosPage() {
  const [listas, setListas]           = useState<ListaPrecio[]>(listasInicial);
  const [precios, setPrecios]         = useState<PrecioLocalidad[]>(preciosInicial);
  const [listaId, setListaId]         = useState<string>(listasInicial[0]?.id ?? "");
  const [editandoId, setEditandoId]   = useState<string | null>(null);
  const [precioEdit, setPrecioEdit]   = useState<string>("");
  const [ajusteAbierto, setAjusteAbierto] = useState(false);
  const [tipoAjuste, setTipoAjuste]   = useState<TipoAjuste>("porcentaje");
  const [valorAjuste, setValorAjuste] = useState<string>("");

  const preciosLista = precios.filter((p) => p.listaPrecioId === listaId);
  const listaActual  = listas.find((l) => l.id === listaId);

  function iniciarEdicion(p: PrecioLocalidad) {
    setPrecioEdit(String(p.precio));
    setEditandoId(p.id);
  }

  function guardarPrecio(id: string) {
    setPrecios((prev) =>
      prev.map((p) => p.id === id ? { ...p, precio: Number(precioEdit) || p.precio } : p)
    );
    setEditandoId(null);
  }

  function aplicarAjuste() {
    const valor = parseFloat(valorAjuste);
    if (isNaN(valor)) return;
    setPrecios((prev) =>
      prev.map((p) => {
        if (p.listaPrecioId !== listaId) return p;
        const nuevo = tipoAjuste === "porcentaje"
          ? Math.round(p.precio * (1 + valor / 100))
          : Math.round(p.precio + valor);
        return { ...p, precio: Math.max(0, nuevo) };
      })
    );
    setValorAjuste("");
    setAjusteAbierto(false);
  }

  const totalLista = preciosLista.reduce((acc, p) => acc + p.precio, 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Listas de precio</h1>
          <p className="text-slate-500 text-sm mt-1">{listas.length} listas · precio por localidad</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nueva lista
        </Button>
      </div>

      {/* Selector de lista */}
      <div className="flex flex-wrap gap-2">
        {listas.map((lista) => (
          <button
            key={lista.id}
            onClick={() => { setListaId(lista.id); setEditandoId(null); setAjusteAbierto(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              lista.id === listaId
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            {lista.nombre}
          </button>
        ))}
      </div>

      {/* Tabla de precios */}
      <Card>
        <CardHeader className="pb-0 pt-4 px-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{listaActual?.nombre}</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                {preciosLista.length} localidades · suma total ${totalLista.toLocaleString("es-AR")}
              </p>
            </div>

            {/* Ajuste global */}
            {ajusteAbierto ? (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <span className="text-xs font-medium text-amber-700">Ajuste global:</span>
                <div className="flex rounded-md overflow-hidden border border-amber-200 text-xs">
                  <button
                    onClick={() => setTipoAjuste("porcentaje")}
                    className={`px-2 py-1 ${tipoAjuste === "porcentaje" ? "bg-amber-500 text-white" : "bg-white text-slate-600"}`}
                  >
                    <Hash className="w-3 h-3 inline" /> %
                  </button>
                  <button
                    onClick={() => setTipoAjuste("monto")}
                    className={`px-2 py-1 ${tipoAjuste === "monto" ? "bg-amber-500 text-white" : "bg-white text-slate-600"}`}
                  >
                    $ monto
                  </button>
                </div>
                <Input
                  type="number"
                  placeholder={tipoAjuste === "porcentaje" ? "ej: 10 o -5" : "ej: 5000 o -2000"}
                  value={valorAjuste}
                  onChange={(e) => setValorAjuste(e.target.value)}
                  className="w-36 h-7 text-sm"
                />
                <Button
                  size="sm"
                  className="h-7 bg-amber-500 hover:bg-amber-600 text-white gap-1 px-3"
                  onClick={aplicarAjuste}
                >
                  <Check className="w-3 h-3" />
                  Aplicar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-slate-400 hover:text-slate-600"
                  onClick={() => { setAjusteAbierto(false); setValorAjuste(""); }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-slate-600 border-slate-200"
                onClick={() => setAjusteAbierto(true)}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Ajuste global
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Localidad</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Precio</th>
                <th className="px-6 py-3 w-32" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {preciosLista.map((p) => {
                const loc = localidades.find((l) => l.id === p.localidadId);
                const editando = editandoId === p.id;

                return (
                  <tr key={p.id} className={editando ? "bg-blue-50/40" : "hover:bg-slate-50"}>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-900">{loc?.nombre ?? "—"}</span>
                      </div>
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      {editando ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-slate-400 text-xs">$</span>
                          <Input
                            type="number"
                            value={precioEdit}
                            onChange={(e) => setPrecioEdit(e.target.value)}
                            className="w-32 h-7 text-sm text-right"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-800">
                          ${p.precio.toLocaleString("es-AR")}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-3.5">
                      {editando ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            className="h-7 bg-blue-600 hover:bg-blue-700 text-white gap-1 px-3"
                            onClick={() => guardarPrecio(p.id)}
                          >
                            <Check className="w-3 h-3" />
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-slate-400 hover:text-slate-600"
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
                          onClick={() => iniciarEdicion(p)}
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
        </CardContent>
      </Card>
    </div>
  );
}
