import { pedidos, remitos, clientes, localidades } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";

// Facturas mock (mismas que en cuenta-corriente y facturación)
const facturas = [
  { id: "f1", clienteId: "cl1", total: 176000, estado: "pending"  as const, remitosNros: ["R-00887"] },
  { id: "f2", clienteId: "cl4", total: 155000, estado: "paid"     as const, remitosNros: ["R-00882"] },
  { id: "f3", clienteId: "cl1", total: 250000, estado: "partially_paid" as const, remitosNros: ["R-00871"], pagado: 100000 },
  { id: "f4", clienteId: "cl2", total: 88000,  estado: "pending"  as const, remitosNros: ["R-00878"] },
  { id: "f5", clienteId: "cl3", total: 30000,  estado: "paid"     as const, remitosNros: ["R-00875"] },
];

const ESTADO_CFG = {
  pending:        { label: "Pendiente",    cls: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  partially_paid: { label: "Pago parcial", cls: "bg-blue-50 text-blue-700 border-blue-200",       icon: Clock },
  paid:           { label: "Cobrada",      cls: "bg-green-50 text-green-700 border-green-200",     icon: CheckCircle2 },
} as const;

function fmt(n: number) { return `$${n.toLocaleString("es-AR")}`; }
function fmtFecha(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// Para cada pedido invoiced, encontrar la factura correspondiente via remito
function saldoFactura(f: typeof facturas[0]) {
  const pagado = "pagado" in f ? (f as { pagado: number }).pagado : (f.estado === "paid" ? f.total : 0);
  return f.total - pagado;
}

export default function FacturasDestinoPage() {
  // Pedidos facturados con su clienteDestino
  const pedidosFacturados = pedidos.filter((p) => p.estado === "invoiced");

  // Agrupar por clienteDestino
  const grupos = clientes.map((cl) => {
    const items = pedidosFacturados
      .filter((p) => p.clienteDestinoId === cl.id)
      .map((p) => {
        const remito  = remitos.find((r) => r.pedidoId === p.id);
        const factura = remito
          ? facturas.find((f) => f.remitosNros.includes(remito.numeroRemito))
          : undefined;
        return { pedido: p, remito, factura };
      });
    return { cliente: cl, items };
  }).filter((g) => g.items.length > 0);

  const totalSinCobrar = grupos.reduce((a, g) =>
    a + g.items.reduce((b, { factura }) =>
      b + (factura && factura.estado !== "paid" ? saldoFactura(factura) : 0), 0), 0);

  const totalFacturado = grupos.reduce((a, g) =>
    a + g.items.reduce((b, { pedido }) => b + pedido.precioAplicado, 0), 0);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Facturas por cliente destino</h1>
        <p className="text-slate-500 text-sm mt-1">Pedidos facturados agrupados por el cliente que recibió la mercadería</p>
      </div>

      {/* Cards resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-5 pb-4">
            <p className="text-2xl font-bold text-slate-800">{grupos.length}</p>
            <p className="text-xs text-slate-500 font-medium">Clientes destino con entregas</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-5 pb-4">
            <p className="text-xl font-bold text-slate-800">{fmt(totalFacturado)}</p>
            <p className="text-xs text-slate-500 font-medium">Total facturado a destinos</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-xl font-bold text-red-700">{fmt(totalSinCobrar)}</p>
                <p className="text-xs text-red-600 font-medium">Sin cobrar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Por cliente destino */}
      <div className="space-y-4">
        {grupos.map(({ cliente, items }) => {
          const iniciales = cliente.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("");
          const saldoTotal = items.reduce((a, { factura }) =>
            a + (factura && factura.estado !== "paid" ? saldoFactura(factura) : 0), 0);

          return (
            <Card key={cliente.id} className={saldoTotal > 0 ? "border-red-100" : ""}>
              <CardContent className="p-0">
                {/* Cabecera cliente */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${saldoTotal > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {iniciales}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{cliente.nombre}</p>
                    <p className="text-xs text-slate-400">{items.length} entrega{items.length !== 1 ? "s" : ""} facturada{items.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Saldo pendiente</p>
                    <p className={`text-base font-bold ${saldoTotal > 0 ? "text-red-600" : "text-green-600"}`}>
                      {saldoTotal > 0 ? fmt(saldoTotal) : "Al día"}
                    </p>
                  </div>
                </div>

                {/* Tabla de entregas */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pedido</th>
                      <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Remito</th>
                      <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Destino</th>
                      <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha remito</th>
                      <th className="text-right px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Precio</th>
                      <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Factura</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map(({ pedido, remito, factura }) => {
                      const localidad = localidades.find((l) => l.id === pedido.localidadId);
                      const cfg = factura ? ESTADO_CFG[factura.estado] : null;
                      const Icon = cfg?.icon;
                      return (
                        <tr key={pedido.id} className="hover:bg-slate-50/60">
                          <td className="px-6 py-3 font-mono text-xs text-slate-600">#{pedido.numeroPedido}</td>
                          <td className="px-6 py-3">
                            {remito
                              ? <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">{remito.numeroRemito}</span>
                              : <span className="text-xs text-amber-600">Sin remito</span>}
                          </td>
                          <td className="px-6 py-3 text-slate-700">{localidad?.nombre ?? "—"}</td>
                          <td className="px-6 py-3 text-slate-500 text-xs">
                            {remito ? fmtFecha(remito.fecha) : "—"}
                          </td>
                          <td className="px-6 py-3 text-right font-semibold text-slate-800">{fmt(pedido.precioAplicado)}</td>
                          <td className="px-6 py-3">
                            {cfg && Icon
                              ? <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                                  <Icon className="w-3 h-3" />{cfg.label}
                                </span>
                              : <span className="text-xs text-slate-300">Sin factura</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          );
        })}

        {grupos.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">No hay pedidos facturados aún</p>
        )}
      </div>
    </div>
  );
}
