import { viajes, camiones, choferes } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Gauge } from "lucide-react";

export default function ViajesPage() {
  const viajesOrdenados = [...viajes].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const totalKm = viajes.reduce((acc, v) => acc + v.kmViaje, 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Viajes</h1>
          <p className="text-slate-500 text-sm mt-1">
            {viajes.length} viajes · {totalKm.toLocaleString()} km totales registrados
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Registrar viaje
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Camión</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Chofer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ruta</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">KM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viajesOrdenados.map((viaje) => {
                  const camion = camiones.find((c) => c.id === viaje.camionId)!;
                  const chofer = choferes.find((c) => c.id === viaje.choferId)!;
                  return (
                    <tr key={viaje.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 text-slate-700">
                        {new Date(viaje.fecha + "T00:00:00").toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-slate-900">{camion.patente}</div>
                        <div className="text-xs text-slate-500">{camion.marca} {camion.modelo}</div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-700">{chofer.nombre}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{viaje.origen}</span>
                          <span className="text-slate-300">→</span>
                          <span>{viaje.destino}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-slate-700">
                          <Gauge className="w-3.5 h-3.5 text-blue-400" />
                          <span className="font-medium">{viaje.kmViaje.toLocaleString()} km</span>
                        </div>
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
