import {
  camiones,
  mantenimientosAsignados,
  tiposMantenimiento,
  calcularEstadoAlerta,
  getUltimoRegistro,
  EstadoAlerta,
} from "@/lib/mock-data";
import { EstadoBadge } from "@/components/estado-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";

export default function CamionesPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Camiones</h1>
          <p className="text-slate-500 text-sm mt-1">{camiones.length} vehículos registrados</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nuevo camión
        </Button>
      </div>

      <div className="grid gap-4">
        {camiones.map((camion) => {
          const asignados = mantenimientosAsignados.filter(
            (ma) => ma.camionId === camion.id && ma.activo
          );

          const estados = asignados.map((ma) => {
            const tipo = tiposMantenimiento.find((t) => t.id === ma.tipoMantenimientoId)!;
            const ultimo = getUltimoRegistro(camion.id, ma.tipoMantenimientoId);
            const calculo = calcularEstadoAlerta(ma, camion, ultimo);
            return { tipo, calculo };
          });

          const prioridad: Record<EstadoAlerta, number> = { vencido: 3, proximo: 2, sin_historial: 1, ok: 0 };
          const peorEstado = estados.reduce<EstadoAlerta>((acc, e) => {
            return prioridad[e.calculo.estado] > prioridad[acc] ? e.calculo.estado : acc;
          }, "ok");

          const vencidos = estados.filter((e) => e.calculo.estado === "vencido").length;
          const proximos = estados.filter((e) => e.calculo.estado === "proximo").length;
          const kmDiff = camion.kmEstimados - camion.kmReales;

          return (
            <Card key={camion.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Indicador de estado */}
                  <div
                    className={`w-1.5 rounded-l-lg flex-shrink-0 ${
                      peorEstado === "vencido"
                        ? "bg-red-500"
                        : peorEstado === "proximo"
                        ? "bg-yellow-400"
                        : peorEstado === "sin_historial"
                        ? "bg-slate-300"
                        : "bg-green-400"
                    }`}
                  />
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-slate-900 text-lg">{camion.patente}</span>
                          <EstadoBadge estado={peorEstado} />
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          {camion.marca} {camion.modelo} · {camion.anio} · {camion.descripcion}
                        </p>

                        {/* KM info */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">KM reales: </span>
                            <span className="font-semibold text-slate-800">{camion.kmReales.toLocaleString()} km</span>
                          </div>
                          <div>
                            <span className="text-slate-500">KM estimados: </span>
                            <span className="font-semibold text-slate-800">{camion.kmEstimados.toLocaleString()} km</span>
                          </div>
                          {kmDiff > 0 && (
                            <div className="text-yellow-600 text-xs font-medium flex items-center gap-1">
                              ⚠ {kmDiff.toLocaleString()} km sin confirmar
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-center flex-shrink-0">
                        {vencidos > 0 && (
                          <div>
                            <p className="text-xl font-bold text-red-600">{vencidos}</p>
                            <p className="text-xs text-slate-500">vencido{vencidos > 1 ? "s" : ""}</p>
                          </div>
                        )}
                        {proximos > 0 && (
                          <div>
                            <p className="text-xl font-bold text-yellow-600">{proximos}</p>
                            <p className="text-xs text-slate-500">próximo{proximos > 1 ? "s" : ""}</p>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                      </div>
                    </div>

                    {/* Mantenimientos asignados */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Mantenimientos asignados
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {estados.map(({ tipo, calculo }) => (
                          <div
                            key={tipo.id}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                              calculo.estado === "vencido"
                                ? "bg-red-50 border-red-200 text-red-700"
                                : calculo.estado === "proximo"
                                ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                                : calculo.estado === "sin_historial"
                                ? "bg-slate-50 border-slate-200 text-slate-500"
                                : "bg-green-50 border-green-200 text-green-700"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                calculo.estado === "vencido"
                                  ? "bg-red-500"
                                  : calculo.estado === "proximo"
                                  ? "bg-yellow-500"
                                  : calculo.estado === "sin_historial"
                                  ? "bg-slate-400"
                                  : "bg-green-500"
                              }`}
                            />
                            {tipo.nombre}
                          </div>
                        ))}
                        <button className="text-xs px-2.5 py-1 rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
                          + Asignar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
