import { gastos, pedidos, proveedores, localidades, camiones } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark } from "lucide-react";

function fmt(n: number) { return `$${n.toLocaleString("es-AR")}`; }
function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// Solo gastos vinculados a un pedido (peajes de remito)
const gastosPeaje = gastos.filter((g) => g.pedidoId !== null);

export default function InformePeajesPage() {
  const total = gastosPeaje.reduce((a, g) => a + g.monto, 0);

  // Por localidad
  const porLocalidad = localidades.map((loc) => {
    const items = gastosPeaje.filter((g) => {
      const pedido = pedidos.find((p) => p.id === g.pedidoId);
      return pedido?.localidadId === loc.id;
    });
    return { localidad: loc, items, total: items.reduce((a, g) => a + g.monto, 0) };
  }).filter((x) => x.items.length > 0).sort((a, b) => b.total - a.total);

  // Por proveedor
  const porProveedor = proveedores.map((pv) => ({
    proveedor: pv,
    total: gastosPeaje.filter((g) => g.proveedorId === pv.id).reduce((a, g) => a + g.monto, 0),
    count: gastosPeaje.filter((g) => g.proveedorId === pv.id).length,
  })).filter((x) => x.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Peajes pagados</h1>
        <p className="text-slate-500 text-sm mt-1">Gastos de peaje generados desde remitos</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center">
                <Landmark className="w-4 h-4 text-slate-200" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{fmt(total)}</p>
                <p className="text-xs text-slate-300 font-medium">Total peajes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-5 pb-4">
            <p className="text-2xl font-bold text-slate-800">{gastosPeaje.length}</p>
            <p className="text-xs text-slate-500 font-medium">Registros de peaje</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-5 pb-4">
            <p className="text-2xl font-bold text-slate-800">{porLocalidad.length}</p>
            <p className="text-xs text-slate-500 font-medium">Destinos con peaje</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por localidad */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Por destino</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {porLocalidad.map(({ localidad, items, total: subtotal }) => {
              const pct = total > 0 ? Math.round((subtotal / total) * 100) : 0;
              return (
                <div key={localidad.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{localidad.nombre}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-800">{fmt(subtotal)}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{items.length} viaje{items.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className="h-1.5 rounded-full bg-slate-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Tarifa por viaje: {fmt(localidad.peaje)}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Por proveedor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Por proveedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {porProveedor.map(({ proveedor, total: subtotal, count }) => {
              const pct = total > 0 ? Math.round((subtotal / total) * 100) : 0;
              return (
                <div key={proveedor.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{proveedor.nombre}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-800">{fmt(subtotal)}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{count} pago{count !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className="h-1.5 rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Detalle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Detalle por remito</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Concepto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pedido</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Camión</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Proveedor</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gastosPeaje
                .sort((a, b) => b.fecha.localeCompare(a.fecha))
                .map((g) => {
                  const pedido   = pedidos.find((p) => p.id === g.pedidoId)!;
                  const camion   = g.camionId ? camiones.find((c) => c.id === g.camionId) : null;
                  const proveedor = proveedores.find((p) => p.id === g.proveedorId)!;
                  return (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{fmtFecha(g.fecha)}</td>
                      <td className="px-6 py-3 text-slate-700">{g.concepto}</td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">#{pedido.numeroPedido}</td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">{camion?.patente ?? "—"}</td>
                      <td className="px-6 py-3 text-slate-600">{proveedor.nombre}</td>
                      <td className="px-6 py-3 text-right font-semibold text-slate-800">{fmt(g.monto)}</td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr className="border-t bg-slate-50">
                <td colSpan={5} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</td>
                <td className="px-6 py-3 text-right font-bold text-slate-900">{fmt(total)}</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
