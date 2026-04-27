"use client";

import { useState } from "react";
import { proveedores as proveedoresIniciales, Proveedor, TipoProveedor } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Store, Plus, Fuel, Building, Wrench, Package } from "lucide-react";

const TIPO_CFG: Record<TipoProveedor, { label: string; icon: React.ElementType; cls: string }> = {
  combustible: { label: "Combustible", icon: Fuel,     cls: "bg-orange-50 text-orange-700 border-orange-200" },
  estatal:     { label: "Estatal",     icon: Building, cls: "bg-blue-50 text-blue-700 border-blue-200" },
  repuestos:   { label: "Repuestos",   icon: Wrench,   cls: "bg-slate-100 text-slate-700 border-slate-200" },
  varios:      { label: "Varios",      icon: Package,  cls: "bg-purple-50 text-purple-700 border-purple-200" },
};

const TIPOS: TipoProveedor[] = ["combustible", "estatal", "repuestos", "varios"];

const FORM_VACIO = { nombre: "", tipo: "varios" as TipoProveedor, cuit: "", telefono: "" };

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>(proveedoresIniciales);
  const [abierto, setAbierto]         = useState(false);
  const [form, setForm]               = useState(FORM_VACIO);
  const [error, setError]             = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo]   = useState<TipoProveedor | "all">("all");

  const filtrados = filtroTipo === "all"
    ? proveedores
    : proveedores.filter((p) => p.tipo === filtroTipo);

  function set(field: keyof typeof FORM_VACIO, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  function guardar() {
    if (!form.nombre.trim() || !form.cuit.trim()) {
      setError("Nombre y CUIT son obligatorios.");
      return;
    }
    const nuevo: Proveedor = {
      id: `pv${Date.now()}`,
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      cuit: form.cuit.trim(),
      telefono: form.telefono.trim(),
    };
    setProveedores((prev) => [...prev, nuevo]);
    setAbierto(false);
    setForm(FORM_VACIO);
    setError(null);
  }

  const counts = TIPOS.reduce((acc, t) => {
    acc[t] = proveedores.filter((p) => p.tipo === t).length;
    return acc;
  }, {} as Record<TipoProveedor, number>);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-slate-500 text-sm mt-1">{proveedores.length} proveedores registrados</p>
        </div>
        <Button onClick={() => { setForm(FORM_VACIO); setError(null); setAbierto(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nuevo proveedor
        </Button>
      </div>

      {/* Filtro por tipo */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroTipo("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            filtroTipo === "all"
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Todos ({proveedores.length})
        </button>
        {TIPOS.map((t) => {
          const cfg = TIPO_CFG[t];
          const Icon = cfg.icon;
          return (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                filtroTipo === t
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cfg.label} ({counts[t]})
            </button>
          );
        })}
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">CUIT</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Teléfono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((p) => {
                const cfg = TIPO_CFG[p.tipo];
                const Icon = cfg.icon;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Store className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="font-medium text-slate-900">{p.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-600 text-xs">{p.cuit}</td>
                    <td className="px-6 py-3.5 text-slate-500">{p.telefono || "—"}</td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Sin proveedores para el filtro seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Diálogo */}
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-600" />
              Nuevo proveedor
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombre <span className="text-red-500">*</span></Label>
              <Input placeholder="Razón social..." value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS.map((t) => {
                  const cfg = TIPO_CFG[t];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set("tipo", t)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                        form.tipo === t
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>CUIT <span className="text-red-500">*</span></Label>
                <Input placeholder="20-12345678-9" value={form.cuit} onChange={(e) => set("cuit", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <Input placeholder="011-..." value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
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
