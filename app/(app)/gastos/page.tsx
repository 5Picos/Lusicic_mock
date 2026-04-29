"use client";

import { useState } from "react";
import {
  gastos as gastosIniciales, proveedores, camiones,
  Gasto, FormaPagoGasto, TipoProveedor,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  CreditCard, Plus, Fuel, Building, Wrench, Package,
  Banknote, ArrowRightLeft, Landmark, TrendingDown, Users,
} from "lucide-react";

// ── Config ────────────────────────────────────────────────────────────────────
const TIPO_CFG: Record<TipoProveedor, { label: string; icon: React.ElementType; cls: string }> = {
  combustible: { label: "Combustible", icon: Fuel,     cls: "bg-orange-50 text-orange-700 border-orange-200" },
  estatal:     { label: "Estatal",     icon: Building, cls: "bg-blue-50 text-blue-700 border-blue-200" },
  repuestos:   { label: "Repuestos",   icon: Wrench,   cls: "bg-slate-100 text-slate-700 border-slate-200" },
  sueldos:     { label: "Sueldos",     icon: Users,    cls: "bg-green-50 text-green-700 border-green-200" },
  varios:      { label: "Varios",      icon: Package,  cls: "bg-purple-50 text-purple-700 border-purple-200" },
};

const FORMA_CFG: Record<FormaPagoGasto, { label: string; icon: React.ElementType; cls: string }> = {
  efectivo:      { label: "Efectivo",      icon: Banknote,      cls: "bg-green-50 text-green-700 border-green-200" },
  transferencia: { label: "Transferencia", icon: ArrowRightLeft, cls: "bg-blue-50 text-blue-700 border-blue-200" },
  cheque:        { label: "Cheque",        icon: Landmark,      cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
};

const FORMAS: FormaPagoGasto[] = ["efectivo", "transferencia", "cheque"];

const HOY = new Date().toISOString().split("T")[0];

const FORM_VACIO = {
  proveedorId: "",
  fecha: HOY,
  concepto: "",
  camionId: "",
  monto: "",
  formaPago: "transferencia" as FormaPagoGasto,
  referencia: "",
  notas: "",
};

function fmt(n: number) { return `$${n.toLocaleString("es-AR")}`; }
function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GastosPage() {
  const [gastos, setGastos]     = useState<Gasto[]>(gastosIniciales);
  const [abierto, setAbierto]   = useState(false);
  const [form, setForm]         = useState(FORM_VACIO);
  const [error, setError]       = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<TipoProveedor | "all">("all");

  const gastosOrdenados = [...gastos].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const gastosFiltrados = filtroTipo === "all"
    ? gastosOrdenados
    : gastosOrdenados.filter((g) => {
        const pv = proveedores.find((p) => p.id === g.proveedorId);
        return pv?.tipo === filtroTipo;
      });

  const totalGeneral = gastos.reduce((a, g) => a + g.monto, 0);

  const totalPorTipo = (["combustible", "estatal", "repuestos", "sueldos", "varios"] as TipoProveedor[]).map((t) => ({
    tipo: t,
    total: gastos.filter((g) => proveedores.find((p) => p.id === g.proveedorId)?.tipo === t)
                 .reduce((a, g) => a + g.monto, 0),
  }));

  function set(field: keyof typeof FORM_VACIO, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  function guardar() {
    if (!form.proveedorId || !form.fecha || !form.concepto.trim() || !form.monto || Number(form.monto) <= 0) {
      setError("Proveedor, fecha, concepto y monto son obligatorios.");
      return;
    }
    const nuevo: Gasto = {
      id: `g${Date.now()}`,
      proveedorId: form.proveedorId,
      fecha: form.fecha,
      concepto: form.concepto.trim(),
      camionId: form.camionId || null,
      pedidoId: null,
      monto: Number(form.monto),
      formaPago: form.formaPago,
      referencia: form.referencia.trim(),
      notas: form.notas.trim(),
    };
    setGastos((prev) => [nuevo, ...prev]);
    setAbierto(false);
    setForm(FORM_VACIO);
    setError(null);
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gastos</h1>
          <p className="text-slate-500 text-sm mt-1">{gastos.length} registros · {fmt(totalGeneral)} total</p>
        </div>
        <Button onClick={() => { setForm(FORM_VACIO); setError(null); setAbierto(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Registrar gasto
        </Button>
      </div>

      {/* Resumen por tipo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {totalPorTipo.map(({ tipo, total }) => {
          const cfg = TIPO_CFG[tipo];
          const Icon = cfg.icon;
          return (
            <Card key={tipo} className="border-slate-200">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-800">{fmt(total)}</p>
                    <p className="text-xs text-slate-400">{cfg.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtro por tipo */}
      <div className="flex flex-wrap gap-2">
        {([["all", "Todos"] , ...Object.entries(TIPO_CFG).map(([k, v]) => [k, v.label])] as [string, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFiltroTipo(key as TipoProveedor | "all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filtroTipo === key
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 self-center">
          {gastosFiltrados.length} resultado{gastosFiltrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Proveedor</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Concepto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Camión</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Forma de pago</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Referencia</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gastosFiltrados.map((g) => {
                const pv     = proveedores.find((p) => p.id === g.proveedorId)!;
                const camion = g.camionId ? camiones.find((c) => c.id === g.camionId) : null;
                const tipoCfg  = TIPO_CFG[pv.tipo];
                const formaCfg = FORMA_CFG[g.formaPago];
                const TipoIcon  = tipoCfg.icon;
                const FormaIcon = formaCfg.icon;
                return (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 text-slate-600 whitespace-nowrap">{fmtFecha(g.fecha)}</td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-900">{pv.nombre}</div>
                      <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border mt-0.5 ${tipoCfg.cls}`}>
                        <TipoIcon className="w-2.5 h-2.5" />
                        {tipoCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{g.concepto}</td>
                    <td className="px-6 py-3.5 text-slate-500 text-xs font-mono">
                      {camion ? camion.patente : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${formaCfg.cls}`}>
                        <FormaIcon className="w-3 h-3" />
                        {formaCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">
                      {g.referencia || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-800">{fmt(g.monto)}</td>
                  </tr>
                );
              })}
              {gastosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Sin gastos para el filtro seleccionado
                  </td>
                </tr>
              )}
            </tbody>
            {gastosFiltrados.length > 0 && (
              <tfoot>
                <tr className="border-t bg-slate-50">
                  <td colSpan={6} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-900">
                    {fmt(gastosFiltrados.reduce((a, g) => a + g.monto, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </CardContent>
      </Card>

      {/* Diálogo */}
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Registrar gasto
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Proveedor */}
            <div className="space-y-1.5">
              <Label>Proveedor <span className="text-red-500">*</span></Label>
              <select
                value={form.proveedorId}
                onChange={(e) => set("proveedorId", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Seleccioná un proveedor...</option>
                {(["combustible", "estatal", "repuestos", "sueldos", "varios"] as TipoProveedor[]).map((tipo) => {
                  const pvs = proveedores.filter((p) => p.tipo === tipo);
                  if (pvs.length === 0) return null;
                  return (
                    <optgroup key={tipo} label={TIPO_CFG[tipo].label}>
                      {pvs.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            {/* Concepto */}
            <div className="space-y-1.5">
              <Label>Concepto <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Descripción del gasto..."
                value={form.concepto}
                onChange={(e) => set("concepto", e.target.value)}
              />
            </div>

            {/* Fecha, Monto y Camión */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Fecha <span className="text-red-500">*</span></Label>
                <Input type="date" value={form.fecha} max={HOY} onChange={(e) => set("fecha", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Monto <span className="text-red-500">*</span></Label>
                <Input type="number" placeholder="0" value={form.monto} onChange={(e) => set("monto", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Camión <span className="text-slate-400 font-normal text-xs">(opcional)</span></Label>
                <select
                  value={form.camionId}
                  onChange={(e) => set("camionId", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="">General</option>
                  {camiones.map((c) => (
                    <option key={c.id} value={c.id}>{c.patente}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Forma de pago */}
            <div className="space-y-1.5">
              <Label>Forma de pago</Label>
              <div className="flex rounded-lg overflow-hidden border border-slate-200 text-sm">
                {FORMAS.map((fp) => (
                  <button
                    key={fp}
                    type="button"
                    onClick={() => set("formaPago", fp)}
                    className={`flex-1 py-2 font-medium transition-colors ${
                      form.formaPago === fp
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {FORMA_CFG[fp].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Referencia */}
            <div className="space-y-1.5">
              <Label>
                Referencia{" "}
                <span className="text-slate-400 font-normal text-xs">
                  {form.formaPago === "cheque" ? "(banco y nº)" : form.formaPago === "transferencia" ? "(nº de operación)" : "(opcional)"}
                </span>
              </Label>
              <Input
                placeholder={
                  form.formaPago === "cheque" ? "ej: Bco Nación #00123456"
                  : form.formaPago === "transferencia" ? "ej: TRF-2026-04270001"
                  : ""
                }
                value={form.referencia}
                onChange={(e) => set("referencia", e.target.value)}
              />
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <Label>Notas <span className="text-slate-400 font-normal">(opcional)</span></Label>
              <Textarea
                placeholder="Observaciones..."
                value={form.notas}
                onChange={(e) => set("notas", e.target.value)}
                className="resize-none h-16"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAbierto(false)}>Cancelar</Button>
            <Button onClick={guardar} className="bg-blue-600 hover:bg-blue-700 text-white">Guardar gasto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
