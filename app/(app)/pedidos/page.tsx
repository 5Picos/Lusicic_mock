import {
  pedidos,
  clientes,
  localidades,
  camiones,
  choferes,
  articulos,
  itemsPedido,
  EstadoPedido,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Clock,
  Truck,
  PackageCheck,
  Receipt,
  CircleDot,
  Package,
} from "lucide-react";

const ESTADO_CONFIG: Record<
  EstadoPedido,
  { label: string; className: string; dot: string }
> = {
  pending:  { label: "Pendiente",  className: "bg-slate-100 text-slate-600 border-slate-200",   dot: "bg-slate-400" },
  assigned: { label: "Asignado",   className: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500" },
  delivered:{ label: "Entregado",  className: "bg-green-50 text-green-700 border-green-200",    dot: "bg-green-500" },
  invoiced: { label: "Facturado",  className: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
};

function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  const cfg = ESTADO_CONFIG[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const PRIORIDAD_ESTADO: Record<EstadoPedido, number> = {
  pending: 3, assigned: 2, delivered: 1, invoiced: 0,
};

export default function PedidosPage() {
  const pedidosOrdenados = [...pedidos].sort((a, b) => {
    const prioridad = PRIORIDAD_ESTADO[b.estado] - PRIORIDAD_ESTADO[a.estado];
    if (prioridad !== 0) return prioridad;
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  const conteos = {
    pending:   pedidos.filter((p) => p.estado === "pending").length,
    assigned:  pedidos.filter((p) => p.estado === "assigned").length,
    delivered: pedidos.filter((p) => p.estado === "delivered").length,
    invoiced:  pedidos.filter((p) => p.estado === "invoiced").length,
  };

  const totalPendienteCobro = pedidos
    .filter((p) => p.estado === "delivered")
    .reduce((acc, p) => acc + p.precioAplicado, 0);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
          <p className="text-slate-500 text-sm mt-1">{pedidos.length} pedidos registrados</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nuevo pedido
        </Button>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700">{conteos.pending}</p>
                <p className="text-xs text-slate-500 font-medium">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{conteos.assigned}</p>
                <p className="text-xs text-blue-600 font-medium">Asignados</p>
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
                <p className="text-2xl font-bold text-green-700">{conteos.delivered}</p>
                <p className="text-xs text-green-600 font-medium">
                  Entregados · ${totalPendienteCobro.toLocaleString("es-AR")} a facturar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">{conteos.invoiced}</p>
                <p className="text-xs text-purple-600 font-medium">Facturados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Listado de pedidos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">N° Pedido</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente destino</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Localidad</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Modalidad</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Precio</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Artículos</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Camión / Chofer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pedidosOrdenados.map((pedido) => {
                  const clienteDestino = clientes.find((c) => c.id === pedido.clienteDestinoId)!;
                  const localidad = localidades.find((l) => l.id === pedido.localidadId)!;
                  const camion = pedido.camionId ? camiones.find((c) => c.id === pedido.camionId) : null;
                  const chofer = pedido.choferId ? choferes.find((c) => c.id === pedido.choferId) : null;
                  const items  = itemsPedido.filter((i) => i.pedidoId === pedido.id);

                  return (
                    <tr
                      key={pedido.id}
                      className={
                        pedido.estado === "pending"
                          ? "hover:bg-slate-50/80"
                          : pedido.estado === "assigned"
                          ? "bg-blue-50/30 hover:bg-blue-50/60"
                          : "hover:bg-slate-50/80"
                      }
                    >
                      <td className="px-6 py-3.5">
                        <span className="font-mono font-semibold text-slate-900">#{pedido.numeroPedido}</span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 whitespace-nowrap">
                        {new Date(pedido.fecha + "T00:00:00").toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-slate-900">{clienteDestino.nombre}</div>
                        {pedido.detalleCarga && (
                          <div className="text-xs text-slate-400 truncate max-w-[180px]">{pedido.detalleCarga}</div>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-slate-700">{localidad.nombre}</td>
                      <td className="px-6 py-3.5">
                        {items.length === 0 ? (
                          <span className="flex items-center gap-1 text-xs text-slate-300">
                            <Package className="w-3 h-3" /> Sin artículos
                          </span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {items.map((item) => {
                              const art = articulos.find((a) => a.id === item.articuloId);
                              return (
                                <span key={item.id} className="inline-flex items-center gap-1 text-xs text-slate-600">
                                  <span className="font-mono text-slate-400">{art?.codigo}</span>
                                  {art?.nombre}
                                  <span className="text-slate-400">×{item.cantidad}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            pedido.modalidad === "CIP"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {pedido.modalidad}
                          {pedido.modalidad === "CIP" && pedido.tonelaje !== null && (
                            <span className="ml-1 font-normal text-orange-500">· {pedido.tonelaje}t</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        ${pedido.precioAplicado.toLocaleString("es-AR")}
                      </td>
                      <td className="px-6 py-3.5">
                        {camion && chofer ? (
                          <div>
                            <div className="font-medium text-slate-900">{camion.patente}</div>
                            <div className="text-xs text-slate-400">{chofer.nombre.split(" ")[0]}</div>
                          </div>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <CircleDot className="w-3 h-3" />
                            Sin asignar
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <EstadoBadge estado={pedido.estado} />
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
