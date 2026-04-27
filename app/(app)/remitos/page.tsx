"use client";

import { useState } from "react";
import {
  remitos as remitosIniciales, pedidos, clientes, localidades, proveedores,
  Remito, Gasto,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, FileText, PackageCheck, AlertCircle, Landmark } from "lucide-react";

const remitosFacturadosIds = ["rem3", "rem2", "rem4"];
const HOY = new Date().toISOString().split("T")[0];

function fmt(n: number) { return `$${n.toLocaleString("es-AR")}`; }
function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function nextNumeroRemito(remitos: Remito[]) {
  const nums = remitos.map((r) => parseInt(r.numeroRemito.replace("R-", ""), 10)).filter(Boolean);
  const max = nums.length > 0 ? Math.max(...nums) : 891;
  return `R-${String(max + 1).padStart(6, "0")}`;
}

const proveedoresEstatal = proveedores.filter((p) => p.tipo === "estatal");

export default function RemitosPage() {
  const [remitos, setRemitos]   = useState<Remito[]>(remitosIniciales);
  const [gastosExtra, setGastosExtra] = useState<Gasto[]>([]);
  const [abierto, setAbierto]   = useState(false);
  const [pedidoPresel, setPedidoPresel] = useState<string>("");

  const [form, setForm] = useState({
    pedidoId: "",
    fecha: HOY,
    notas: "",
    peajeProveedorId: proveedoresEstatal[0]?.id ?? "",
    peajeMonto: "",
  });
  const [error, setError] = useState<string | null>(null);

  const remitosOrdenados = [...remitos].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const pedidosConRemito = new Set(remitos.map((r) => r.pedidoId));
  const pedidosSinRemito = pedidos.filter((p) => p.estado === "delivered" && !pedidosConRemito.has(p.id));

  const totalSinFacturar = remitos.filter((r) => !remitosFacturadosIds.includes(r.id)).length;
  const totalFacturados  = remitos.filter((r) => remitosFacturadosIds.includes(r.id)).length;

  function abrirDialog(pedidoId = "") {
    const pedido    = pedidoId ? pedidos.find((p) => p.id === pedidoId) : null;
    const localidad = pedido ? localidades.find((l) => l.id === pedido.localidadId) : null;
    setForm({
      pedidoId,
      fecha: HOY,
      notas: "",
      peajeProveedorId: proveedoresEstatal[0]?.id ?? "",
      peajeMonto: localidad ? String(localidad.peaje) : "",
    });
    setPedidoPresel(pedidoId);
    setError(null);
    setAbierto(true);
  }

  function onPedidoChange(pedidoId: string) {
    const pedido    = pedidos.find((p) => p.id === pedidoId);
    const localidad = pedido ? localidades.find((l) => l.id === pedido.localidadId) : null;
    setForm((f) => ({
      ...f,
      pedidoId,
      peajeMonto: localidad ? String(localidad.peaje) : "",
    }));
    setError(null);
  }

  function guardar() {
    if (!form.pedidoId || !form.fecha) {
      setError("Pedido y fecha son obligatorios.");
      return;
    }
    const pedido    = pedidos.find((p) => p.id === form.pedidoId)!;
    const localidad = localidades.find((l) => l.id === pedido.localidadId)!;
    const nroRemito = nextNumeroRemito(remitos);

    // Crear remito
    const nuevoRemito: Remito = {
      id: `rem${Date.now()}`,
      pedidoId: form.pedidoId,
      numeroRemito: nroRemito,
      fecha: form.fecha,
      notas: form.notas,
    };
    setRemitos((prev) => [nuevoRemito, ...prev]);

    // Crear gasto de peaje automáticamente
    if (form.peajeProveedorId && form.peajeMonto && Number(form.peajeMonto) > 0) {
      const nuevoGasto: Gasto = {
        id: `g${Date.now()}`,
        proveedorId: form.peajeProveedorId,
        fecha: form.fecha,
        concepto: `Peaje ${nroRemito} — ${localidad.nombre}`,
        camionId: pedido.camionId,
        pedidoId: form.pedidoId,
        monto: Number(form.peajeMonto),
        formaPago: "efectivo",
        referencia: "",
        notas: "",
      };
      setGastosExtra((prev) => [nuevoGasto, ...prev]);
    }

    setAbierto(false);
    setError(null);
  }

  // Pedidos disponibles para crear remito (delivered + sin remito aún)
  const pedidosDisponibles = pedidos.filter(
    (p) => p.estado === "delivered" && !pedidosConRemito.has(p.id)
  );

  const pedidoSeleccionado = form.pedidoId ? pedidos.find((p) => p.id === form.pedidoId) : null;
  const localidadSel       = pedidoSeleccionado ? localidades.find((l) => l.id === pedidoSeleccionado.localidadId) : null;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Remitos</h1>
          <p className="text-slate-500 text-sm mt-1">{remitos.length} remitos registrados</p>
        </div>
        <Button onClick={() => abrirDialog()} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Registrar remito
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700">{remitos.length}</p>
                <p className="text-xs text-slate-500 font-medium">Total remitos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700">{totalSinFacturar}</p>
                <p className="text-xs text-orange-600 font-medium">Sin facturar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <PackageCheck className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{totalFacturados}</p>
                <p className="text-xs text-green-600 font-medium">Facturados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos sin remito */}
      {pedidosSinRemito.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-amber-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Pedidos entregados sin remito registrado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-100 bg-amber-50/60">
                  <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">N° Pedido</th>
                  <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente destino</th>
                  <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Localidad</th>
                  <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Peaje est.</th>
                  <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                  <th className="px-6 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {pedidosSinRemito.map((p) => {
                  const cliente  = clientes.find((c) => c.id === p.clienteDestinoId)!;
                  const loc      = localidades.find((l) => l.id === p.localidadId)!;
                  return (
                    <tr key={p.id} className="hover:bg-amber-50/60">
                      <td className="px-6 py-3 font-mono font-semibold text-slate-900">#{p.numeroPedido}</td>
                      <td className="px-6 py-3 text-slate-700">{cliente.nombre}</td>
                      <td className="px-6 py-3 text-slate-600">{loc.nombre}</td>
                      <td className="px-6 py-3 text-slate-600 font-medium">{fmt(loc.peaje)}</td>
                      <td className="px-6 py-3 text-slate-500">{fmtFecha(p.fecha)}</td>
                      <td className="px-6 py-3 text-right">
                        <Button
                          size="sm" variant="outline"
                          className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100 gap-1"
                          onClick={() => abrirDialog(p.id)}
                        >
                          <Plus className="w-3 h-3" /> Registrar remito
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Tabla remitos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Remitos registrados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">N° Remito</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">N° Pedido</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente destino</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Localidad</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Precio</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Peaje</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {remitosOrdenados.map((remito) => {
                const pedido   = pedidos.find((p) => p.id === remito.pedidoId)!;
                const cliente  = clientes.find((c) => c.id === pedido.clienteDestinoId)!;
                const loc      = localidades.find((l) => l.id === pedido.localidadId)!;
                const facturado = remitosFacturadosIds.includes(remito.id);
                // Buscar gasto de peaje asociado
                const gastosPeaje = [...gastosExtra].filter((g) => g.pedidoId === pedido.id);
                const gastoMockPeaje = remito.id === "rem1" ? 18000 : remito.id === "rem2" ? 9200 : remito.id === "rem3" ? 9200 : remito.id === "rem4" ? 12000 : null;
                const peajeMonto = gastosPeaje[0]?.monto ?? gastoMockPeaje;

                return (
                  <tr key={remito.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">{remito.numeroRemito}</td>
                    <td className="px-6 py-3.5 text-slate-600 whitespace-nowrap">{fmtFecha(remito.fecha)}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">#{pedido.numeroPedido}</td>
                    <td className="px-6 py-3.5 text-slate-700">{cliente.nombre}</td>
                    <td className="px-6 py-3.5 text-slate-600">{loc.nombre}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-slate-800">{fmt(pedido.precioAplicado)}</td>
                    <td className="px-6 py-3.5 text-right">
                      {peajeMonto != null ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                          <Landmark className="w-3 h-3 text-slate-400" />
                          {fmt(peajeMonto)}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-3.5">
                      {facturado ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                          <PackageCheck className="w-3 h-3" /> Facturado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-orange-50 text-orange-700 border-orange-200">
                          <AlertCircle className="w-3 h-3" /> Sin facturar
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Dialog nuevo remito */}
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Registrar remito
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Pedido */}
            <div className="space-y-1.5">
              <Label>Pedido entregado <span className="text-red-500">*</span></Label>
              <select
                value={form.pedidoId}
                onChange={(e) => onPedidoChange(e.target.value)}
                disabled={!!pedidoPresel}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-60"
              >
                <option value="">Seleccioná un pedido...</option>
                {pedidosDisponibles.map((p) => {
                  const loc = localidades.find((l) => l.id === p.localidadId);
                  return (
                    <option key={p.id} value={p.id}>
                      #{p.numeroPedido} — {loc?.nombre} ({p.detalleCarga})
                    </option>
                  );
                })}
              </select>
              {pedidoSeleccionado && localidadSel && (
                <p className="text-xs text-slate-400 mt-1">
                  Destino: <strong>{localidadSel.nombre}</strong> · {localidadSel.kmIdaVuelta} km ida/vuelta
                </p>
              )}
            </div>

            {/* Fecha */}
            <div className="space-y-1.5">
              <Label>Fecha <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={form.fecha}
                max={HOY}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              />
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <Label>Notas <span className="text-slate-400 font-normal">(opcional)</span></Label>
              <Input
                placeholder="Observaciones del remito..."
                value={form.notas}
                onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
              />
            </div>

            {/* Peaje */}
            <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" /> Peaje
                {localidadSel && (
                  <span className="font-normal text-slate-400 normal-case ml-1">
                    — {localidadSel.nombre} ({fmt(localidadSel.peaje)} estimado)
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Monto</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.peajeMonto}
                    onChange={(e) => setForm((f) => ({ ...f, peajeMonto: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Proveedor</Label>
                  <select
                    value={form.peajeProveedorId}
                    onChange={(e) => setForm((f) => ({ ...f, peajeProveedorId: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    {proveedoresEstatal.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                    {proveedores.filter((p) => p.tipo !== "estatal").map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-slate-400">El gasto de peaje se registra automáticamente al guardar.</p>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAbierto(false)}>Cancelar</Button>
            <Button onClick={guardar} className="bg-blue-600 hover:bg-blue-700 text-white">Guardar remito</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
