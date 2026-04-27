"use client";

import { useState } from "react";
import { clientes, cobros as cobrosIniciales, FormaPagoCobro } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Plus,
  Landmark,
  Banknote,
  ArrowRightLeft,
  CheckCircle2,
} from "lucide-react";

type FormaPago = FormaPagoCobro;

interface Cobro {
  id: string;
  clienteId: string;
  fecha: string;
  monto: number;
  formaPago: FormaPago;
  referencia: string;
  notas: string;
}

const HOY = new Date().toISOString().split("T")[0];

const FORMA_CFG: Record<FormaPago, { label: string; icon: React.ElementType; cls: string }> = {
  efectivo:      { label: "Efectivo",      icon: Banknote,       cls: "bg-green-50 text-green-700 border-green-200" },
  transferencia: { label: "Transferencia", icon: ArrowRightLeft,  cls: "bg-blue-50 text-blue-700 border-blue-200" },
  cheque:        { label: "Cheque",        icon: Landmark,        cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
};

const FORM_VACIO = {
  clienteId: "",
  fecha: HOY,
  monto: "",
  formaPago: "transferencia" as FormaPago,
  referencia: "",
  notas: "",
};

function fmt(n: number) { return `$${n.toLocaleString("es-AR")}`; }
function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function CobrosPage() {
  const [cobros, setCobros]   = useState<Cobro[]>(cobrosIniciales);
  const [abierto, setAbierto] = useState(false);
  const [form, setForm]       = useState(FORM_VACIO);
  const [error, setError]     = useState<string | null>(null);

  const cobrosOrdenados = [...cobros].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const totalCobrado = cobros.reduce((a, c) => a + c.monto, 0);

  const porCliente = clientes.map((cl) => ({
    ...cl,
    total: cobros.filter((c) => c.clienteId === cl.id).reduce((a, c) => a + c.monto, 0),
    cantidad: cobros.filter((c) => c.clienteId === cl.id).length,
  })).filter((cl) => cl.total > 0).sort((a, b) => b.total - a.total);

  function set(field: keyof typeof FORM_VACIO, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  function guardar() {
    if (!form.clienteId || !form.fecha || !form.monto || Number(form.monto) <= 0) {
      setError("Completá cliente, fecha y monto.");
      return;
    }
    const nuevo: Cobro = {
      id: `co${Date.now()}`,
      clienteId: form.clienteId,
      fecha: form.fecha,
      monto: Number(form.monto),
      formaPago: form.formaPago,
      referencia: form.referencia,
      notas: form.notas,
    };
    setCobros((prev) => [nuevo, ...prev]);
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
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cobros</h1>
          <p className="text-slate-500 text-sm mt-1">{cobros.length} pagos registrados</p>
        </div>
        <Button onClick={abrir} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Registrar cobro
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50 md:col-span-1">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-700">{fmt(totalCobrado)}</p>
                <p className="text-xs text-green-600 font-medium">Total cobrado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top clientes */}
        {porCliente.slice(0, 2).map((cl) => {
          const iniciales = cl.nombre.split(" ").map((n: string) => n[0]).slice(0, 2).join("");
          return (
            <Card key={cl.id} className="border-slate-200">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0">
                    {iniciales}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{cl.nombre}</p>
                    <p className="text-xs text-slate-500">{cl.cantidad} cobro{cl.cantidad !== 1 ? "s" : ""} · {fmt(cl.total)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Historial de cobros</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Forma de pago</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Referencia</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cobrosOrdenados.map((c) => {
                const cliente = clientes.find((cl) => cl.id === c.clienteId)!;
                const cfg = FORMA_CFG[c.formaPago];
                const Icon = cfg.icon;
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 text-slate-600 whitespace-nowrap">{fmtFecha(c.fecha)}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">{cliente.nombre}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">
                      {c.referencia || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-800">{fmt(c.monto)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Diálogo */}
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Registrar cobro
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Cliente */}
            <div className="space-y-1.5">
              <Label>Cliente <span className="text-red-500">*</span></Label>
              <select
                value={form.clienteId}
                onChange={(e) => set("clienteId", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Seleccioná un cliente...</option>
                {clientes.map((cl) => (
                  <option key={cl.id} value={cl.id}>{cl.nombre}</option>
                ))}
              </select>
            </div>

            {/* Fecha y Monto */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fecha <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.fecha}
                  max={HOY}
                  onChange={(e) => set("fecha", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Monto <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="ej: 50000"
                  value={form.monto}
                  onChange={(e) => set("monto", e.target.value)}
                />
              </div>
            </div>

            {/* Forma de pago */}
            <div className="space-y-1.5">
              <Label>Forma de pago</Label>
              <div className="flex rounded-lg overflow-hidden border border-slate-200 text-sm">
                {(["efectivo", "transferencia", "cheque"] as FormaPago[]).map((fp) => (
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
                  {form.formaPago === "cheque" ? "(banco y nº de cheque)" : form.formaPago === "transferencia" ? "(nº de transferencia)" : "(opcional)"}
                </span>
              </Label>
              <Input
                placeholder={
                  form.formaPago === "cheque"
                    ? "ej: Bco Galicia #00789012"
                    : form.formaPago === "transferencia"
                    ? "ej: TRF-2026-04270001"
                    : ""
                }
                value={form.referencia}
                onChange={(e) => set("referencia", e.target.value)}
              />
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <Label>Notas <span className="text-slate-400 font-normal">(opcional)</span></Label>
              <Input
                placeholder="Observaciones..."
                value={form.notas}
                onChange={(e) => set("notas", e.target.value)}
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
              Guardar cobro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
