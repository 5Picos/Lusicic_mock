import { tiposMantenimiento } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Gauge, Bell } from "lucide-react";

export default function MantenimientosPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tipos de mantenimiento</h1>
          <p className="text-slate-500 text-sm mt-1">
            Catálogo de mantenimientos con intervalos por defecto
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nuevo tipo
        </Button>
      </div>

      <div className="grid gap-3">
        {tiposMantenimiento.map((tipo) => (
          <Card key={tipo.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{tipo.nombre}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{tipo.descripcion}</p>

                  <div className="flex flex-wrap gap-4 mt-3">
                    {tipo.intervaloKm !== null && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Gauge className="w-3.5 h-3.5 text-blue-500" />
                        <span>Cada <strong>{tipo.intervaloKm.toLocaleString()} km</strong></span>
                      </div>
                    )}
                    {tipo.intervaloDias !== null && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        <span>Cada <strong>{tipo.intervaloDias % 365 === 0 ? `${tipo.intervaloDias / 365} año${tipo.intervaloDias / 365 > 1 ? "s" : ""}` : `${tipo.intervaloDias} días`}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-2">
                    {tipo.alertaKmAntes !== null && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Bell className="w-3 h-3" />
                        Avisar {tipo.alertaKmAntes.toLocaleString()} km antes
                      </div>
                    )}
                    {tipo.alertaDiasAntes !== null && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Bell className="w-3 h-3" />
                        Avisar {tipo.alertaDiasAntes} días antes
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
