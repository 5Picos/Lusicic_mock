"use client";

import { useState } from "react";
import { tiposVencimientoChofer, TipoVencimientoChofer } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Clock, Bell, IdCard } from "lucide-react";

const FORM_VACIO = { nombre: "", descripcion: "", intervaloDias: "", alertaDiasAntes: "" };

function fmtIntervalo(dias: number) {
  if (dias % 365 === 0) return `${dias / 365} año${dias / 365 > 1 ? "s" : ""}`;
  if (dias % 30 === 0)  return `${dias / 30} mes${dias / 30 > 1 ? "es" : ""}`;
  return `${dias} días`;
}

export default function VencimientosChoferPage() {
  const [tipos, setTipos]     = useState<TipoVencimientoChofer[]>(tiposVencimientoChofer);
  const [abierto, setAbierto] = useState(false);
  const [form, setForm]       = useState(FORM_VACIO);
  const [error, setError]     = useState<string | null>(null);

  function set(field: keyof typeof FORM_VACIO, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  function guardar() {
    if (!form.nombre.trim() || !form.intervaloDias || !form.alertaDiasAntes) {
      setError("Nombre, intervalo y alerta son obligatorios.");
      return;
    }
    const nuevo: TipoVencimientoChofer = {
      id: `tv${Date.now()}`,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      intervaloDias: Number(form.intervaloDias),
      alertaDiasAntes: Number(form.alertaDiasAntes),
    };
    setTipos((prev) => [...prev, nuevo]);
    setAbierto(false);
    setForm(FORM_VACIO);
    setError(null);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tipos de vencimiento — Choferes</h1>
          <p className="text-slate-500 text-sm mt-1">Documentación y certificaciones con renovación periódica</p>
        </div>
        <Button onClick={() => { setForm(FORM_VACIO); setError(null); setAbierto(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nuevo tipo
        </Button>
      </div>

      <div className="grid gap-3">
        {tipos.map((tipo) => (
          <Card key={tipo.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IdCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{tipo.nombre}</h3>
                    {tipo.descripcion && (
                      <p className="text-sm text-slate-500 mt-0.5">{tipo.descripcion}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        <span>Cada <strong>{fmtIntervalo(tipo.intervaloDias)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Bell className="w-3 h-3" />
                        Avisar {tipo.alertaDiasAntes} días antes
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-blue-600" />
              Nuevo tipo de vencimiento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombre <span className="text-red-500">*</span></Label>
              <Input placeholder="ej: Licencia de conducir" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea placeholder="Detalle del documento o certificación..." value={form.descripcion}
                onChange={(e) => set("descripcion", e.target.value)} className="resize-none h-16" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Intervalo (días) <span className="text-red-500">*</span></Label>
                <Input type="number" placeholder="365" value={form.intervaloDias} onChange={(e) => set("intervaloDias", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Alertar (días antes) <span className="text-red-500">*</span></Label>
                <Input type="number" placeholder="30" value={form.alertaDiasAntes} onChange={(e) => set("alertaDiasAntes", e.target.value)} />
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAbierto(false)}>Cancelar</Button>
            <Button onClick={guardar} className="bg-blue-600 hover:bg-blue-700 text-white">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
