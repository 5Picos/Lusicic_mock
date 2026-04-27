"use client";

import { useState } from "react";
import {
  registrosMantenimiento as registrosIniciales,
  camiones,
  choferes,
  tiposMantenimiento,
  mantenimientosAsignados,
  RegistroMantenimiento,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, FileText, Wrench } from "lucide-react";

const HOY = new Date().toISOString().split("T")[0];

type Form = {
  camionId: string;
  tipoMantenimientoId: string;
  choferId: string;
  fecha: string;
  kmAlMomento: string;
  notas: string;
};

const FORM_VACIO: Form = {
  camionId: "",
  tipoMantenimientoId: "",
  choferId: "",
  fecha: HOY,
  kmAlMomento: "",
  notas: "",
};

function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function HistorialPage() {
  const [registros, setRegistros] = useState<RegistroMantenimiento[]>(registrosIniciales);
  const [abierto, setAbierto]     = useState(false);
  const [form, setForm]           = useState<Form>(FORM_VACIO);
  const [error, setError]         = useState<string | null>(null);

  const registrosOrdenados = [...registros].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  // Tipos asignados al camión seleccionado
  const tiposDelCamion = form.camionId
    ? mantenimientosAsignados
        .filter((ma) => ma.camionId === form.camionId && ma.activo)
        .map((ma) => tiposMantenimiento.find((t) => t.id === ma.tipoMantenimientoId)!)
        .filter(Boolean)
    : [];

  function set(field: keyof Form, value: string) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      // Al cambiar el camión: pre-rellenar km y limpiar tipo
      if (field === "camionId") {
        const camion = camiones.find((c) => c.id === value);
        next.kmAlMomento = camion ? String(camion.kmReales) : "";
        next.tipoMantenimientoId = "";
      }
      return next;
    });
    setError(null);
  }

  function guardar() {
    if (!form.camionId || !form.tipoMantenimientoId || !form.choferId || !form.fecha || !form.kmAlMomento) {
      setError("Completá todos los campos obligatorios.");
      return;
    }
    const nuevo: RegistroMantenimiento = {
      id: `rm${Date.now()}`,
      camionId: form.camionId,
      tipoMantenimientoId: form.tipoMantenimientoId,
      choferId: form.choferId,
      fecha: form.fecha,
      kmAlMomento: Number(form.kmAlMomento),
      notas: form.notas,
    };
    setRegistros((prev) => [nuevo, ...prev]);
    setAbierto(false);
    setForm(FORM_VACIO);
    setError(null);
  }

  function abrir() {
    setForm(FORM_VACIO);
    setError(null);
    setAbierto(true);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial de mantenimientos</h1>
          <p className="text-slate-500 text-sm mt-1">{registros.length} registros en total</p>
        </div>
        <Button onClick={abrir} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Registrar mantenimiento
        </Button>
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Camión</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mantenimiento</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">KM al momento</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Responsable</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrosOrdenados.map((r) => {
                  const camion = camiones.find((c) => c.id === r.camionId)!;
                  const chofer = choferes.find((c) => c.id === r.choferId)!;
                  const tipo   = tiposMantenimiento.find((t) => t.id === r.tipoMantenimientoId)!;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 text-slate-700 whitespace-nowrap">{fmtFecha(r.fecha)}</td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-slate-900">{camion.patente}</div>
                        <div className="text-xs text-slate-500">{camion.marca} {camion.modelo}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Wrench className="w-3.5 h-3.5 text-slate-400" />
                          {tipo.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">
                        {r.kmAlMomento.toLocaleString("es-AR")} km
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{chofer.nombre}</td>
                      <td className="px-6 py-3.5 text-slate-500 max-w-xs">
                        {r.notas ? (
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                            {r.notas}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
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

      {/* Diálogo */}
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              Registrar mantenimiento
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Camión */}
            <div className="space-y-1.5">
              <Label>Camión <span className="text-red-500">*</span></Label>
              <select
                value={form.camionId}
                onChange={(e) => set("camionId", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Seleccioná un camión...</option>
                {camiones.map((c) => (
                  <option key={c.id} value={c.id}>{c.patente} — {c.marca} {c.modelo}</option>
                ))}
              </select>
            </div>

            {/* Tipo de mantenimiento */}
            <div className="space-y-1.5">
              <Label>Tipo de mantenimiento <span className="text-red-500">*</span></Label>
              <select
                value={form.tipoMantenimientoId}
                onChange={(e) => set("tipoMantenimientoId", e.target.value)}
                disabled={!form.camionId}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {form.camionId ? "Seleccioná el tipo..." : "Primero seleccioná un camión"}
                </option>
                {tiposDelCamion.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              {form.camionId && tiposDelCamion.length === 0 && (
                <p className="text-xs text-slate-400">Este camión no tiene mantenimientos asignados.</p>
              )}
            </div>

            {/* Fecha y KM */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fecha <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => set("fecha", e.target.value)}
                  max={HOY}
                />
              </div>
              <div className="space-y-1.5">
                <Label>KM al momento <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="ej: 98500"
                  value={form.kmAlMomento}
                  onChange={(e) => set("kmAlMomento", e.target.value)}
                />
              </div>
            </div>

            {/* Chofer */}
            <div className="space-y-1.5">
              <Label>Responsable <span className="text-red-500">*</span></Label>
              <select
                value={form.choferId}
                onChange={(e) => set("choferId", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Seleccioná un chofer...</option>
                {choferes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <Label>Notas <span className="text-slate-400 font-normal">(opcional)</span></Label>
              <Textarea
                placeholder="Observaciones del servicio..."
                value={form.notas}
                onChange={(e) => set("notas", e.target.value)}
                className="resize-none h-20"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={guardar} className="bg-blue-600 hover:bg-blue-700 text-white">
              Guardar registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
