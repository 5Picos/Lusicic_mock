"use client";

import { useState, useMemo } from "react";
import { gastos, pedidos, remitos, proveedores, clientes, TipoProveedor } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";

const MES_ACTUAL_DESDE = new Date().toISOString().slice(0, 7) + "-01";
const HOY = new Date().toISOString().split("T")[0];

function fmt(n: number) { return `$${n.toLocaleString("es-AR")}`; }

const TIPO_LABEL: Record<TipoProveedor, string> = {
  combustible: "Combustible",
  estatal:     "Estatal / Impuestos",
  repuestos:   "Repuestos",
  sueldos:     "Sueldos",
  varios:      "Varios",
};

const TIPO_COLOR: Record<TipoProveedor, string> = {
  combustible: "bg-orange-400",
  estatal:     "bg-blue-400",
  repuestos:   "bg-slate-400",
  sueldos:     "bg-green-400",
  varios:      "bg-purple-400",
};

export default function InformeComparativoPage() {
  const [desde, setDesde] = useState(MES_ACTUAL_DESDE);
  const [hasta, setHasta] = useState(HOY);

  const { totalGastos, gastosPorTipo, totalIngresos, ingresosPorCliente } = useMemo(() => {
    // Expenses in period
    const gastosEnPeriodo = gastos.filter((g) => g.fecha >= desde && g.fecha <= hasta);
    const totalGastos = gastosEnPeriodo.reduce((a, g) => a + g.monto, 0);

    const gastosPorTipo = (["combustible", "estatal", "repuestos", "sueldos", "varios"] as TipoProveedor[]).map((tipo) => ({
      tipo,
      total: gastosEnPeriodo
        .filter((g) => proveedores.find((p) => p.id === g.proveedorId)?.tipo === tipo)
        .reduce((a, g) => a + g.monto, 0),
    })).filter((x) => x.total > 0);

    // Income: orders with receipts in period (using receipt date as income date)
    const remitosEnPeriodo = remitos.filter((r) => r.fecha >= desde && r.fecha <= hasta);
    const pedidosConRemito = remitosEnPeriodo
      .map((r) => pedidos.find((p) => p.id === r.pedidoId))
      .filter((p): p is NonNullable<typeof p> => p !== null);

    const totalIngresos = pedidosConRemito.reduce((a, p) => a + p.precioAplicado, 0);

    const ingresosPorCliente = clientes.map((cl) => ({
      cliente: cl,
      total: pedidosConRemito
        .filter((p) => p.clienteSolicitanteId === cl.id)
        .reduce((a, p) => a + p.precioAplicado, 0),
      viajes: pedidosConRemito.filter((p) => p.clienteSolicitanteId === cl.id).length,
    })).filter((x) => x.total > 0).sort((a, b) => b.total - a.total);

    return { totalGastos, gastosPorTipo, totalIngresos, ingresosPorCliente };
  }, [desde, hasta]);

  const resultado = totalIngresos - totalGastos;
  const positivo  = resultado >= 0;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Comparativo de período</h1>
        <p className="text-slate-500 text-sm mt-1">Ingresos vs. gastos para el rango seleccionado</p>
      </div>

      {/* Filtro de fechas */}
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
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-700">{fmt(totalIngresos)}</p>
                <p className="text-xs text-green-600 font-medium">Total ingresos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-red-700">{fmt(totalGastos)}</p>
                <p className="text-xs text-red-600 font-medium">Total gastos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={positivo ? "border-green-300 bg-green-100" : "border-red-300 bg-red-100"}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${positivo ? "bg-green-200" : "bg-red-200"}`}>
                <Scale className={`w-4 h-4 ${positivo ? "text-green-700" : "text-red-700"}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${positivo ? "text-green-800" : "text-red-800"}`}>
                  {positivo ? "+" : ""}{fmt(resultado)}
                </p>
                <p className={`text-xs font-medium ${positivo ? "text-green-700" : "text-red-700"}`}>
                  Resultado neto
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra visual ingresos vs gastos */}
      {(totalIngresos > 0 || totalGastos > 0) && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">Proporción</p>
            <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
              {totalIngresos > 0 && (
                <div
                  className="bg-green-400 h-full transition-all"
                  style={{ width: `${(totalIngresos / (totalIngresos + totalGastos)) * 100}%` }}
                />
              )}
              {totalGastos > 0 && (
                <div
                  className="bg-red-400 h-full transition-all"
                  style={{ width: `${(totalGastos / (totalIngresos + totalGastos)) * 100}%` }}
                />
              )}
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" />
                Ingresos {totalIngresos > 0 ? Math.round((totalIngresos / (totalIngresos + totalGastos)) * 100) : 0}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />
                Gastos {totalGastos > 0 ? Math.round((totalGastos / (totalIngresos + totalGastos)) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gastos por tipo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Gastos por categoría
              <span className="ml-2 text-xs font-normal text-slate-400">{fmt(totalGastos)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gastosPorTipo.length === 0 && <p className="text-slate-400 text-sm">Sin gastos en el período</p>}
            {gastosPorTipo.map(({ tipo, total }) => {
              const pct = totalGastos > 0 ? Math.round((total / totalGastos) * 100) : 0;
              return (
                <div key={tipo}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{TIPO_LABEL[tipo]}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-800">{fmt(total)}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className={`h-2 rounded-full ${TIPO_COLOR[tipo]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Ingresos por cliente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Ingresos por cliente
              <span className="ml-2 text-xs font-normal text-slate-400">{fmt(totalIngresos)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ingresosPorCliente.length === 0 && <p className="text-slate-400 text-sm">Sin ingresos en el período</p>}
            {ingresosPorCliente.map(({ cliente, total, viajes }) => {
              const pct = totalIngresos > 0 ? Math.round((total / totalIngresos) * 100) : 0;
              const iniciales = cliente.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("");
              return (
                <div key={cliente.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {iniciales}
                    </div>
                    <span className="text-sm font-medium text-slate-800 flex-1 truncate">{cliente.nombre}</span>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-800">{fmt(total)}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{viajes} viaje{viajes !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full ml-8">
                    <div className="h-2 rounded-full bg-green-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
