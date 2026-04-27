import { remitos, clientes } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, CheckCircle2, DollarSign } from "lucide-react";

const facturasMock = [
  {
    id: "f1",
    clienteId: "cl1",
    fecha: "2026-04-20",
    total: 176000,
    estado: "pending" as const,
    remitosIds: ["rem3", "rem2"],
    pagos: [] as { id: string; monto: number; fecha: string; formaPago: "cash" | "transfer" | "check" }[],
  },
  {
    id: "f2",
    clienteId: "cl4",
    fecha: "2026-04-13",
    total: 155000,
    estado: "paid" as const,
    remitosIds: ["rem4"],
    pagos: [{ id: "pago1", monto: 155000, fecha: "2026-04-15", formaPago: "transfer" as const }],
  },
];

const ESTADO_FACTURA = {
  pending:        { label: "Pendiente",   className: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  partially_paid: { label: "Pago parcial",className: "bg-blue-50 text-blue-700 border-blue-200",      icon: Clock },
  paid:           { label: "Cobrada",     className: "bg-green-50 text-green-700 border-green-200",   icon: CheckCircle2 },
} as const;

const FORMA_PAGO: Record<string, string> = {
  cash: "Efectivo", transfer: "Transferencia", check: "Cheque",
};

export default function FacturacionPage() {
  const totalPendiente = facturasMock
    .filter((f) => f.estado !== "paid")
    .reduce((acc, f) => acc + f.total, 0);

  const totalCobrado = facturasMock
    .filter((f) => f.estado === "paid")
    .reduce((acc, f) => acc + f.total, 0);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facturación</h1>
          <p className="text-slate-500 text-sm mt-1">Cuenta corriente de clientes</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nueva factura
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-yellow-700">${totalPendiente.toLocaleString("es-AR")}</p>
                <p className="text-xs text-yellow-600 font-medium">Pendiente de cobro</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-700">${totalCobrado.toLocaleString("es-AR")}</p>
                <p className="text-xs text-green-600 font-medium">Cobrado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-700">{facturasMock.length}</p>
                <p className="text-xs text-slate-500 font-medium">Facturas emitidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de facturas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Facturas emitidas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Remitos</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Forma de pago</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facturasMock.map((factura) => {
                  const cliente = clientes.find((c) => c.id === factura.clienteId)!;
                  const cfg     = ESTADO_FACTURA[factura.estado];
                  const Icon    = cfg.icon;
                  const remitosLinked = factura.remitosIds
                    .map((rid) => remitos.find((r) => r.id === rid))
                    .filter(Boolean);

                  return (
                    <tr key={factura.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 text-slate-600 whitespace-nowrap">
                        {new Date(factura.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-900">{cliente.nombre}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {remitosLinked.map((r) => (
                            <span key={r!.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                              {r!.numeroRemito}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {factura.pagos.length > 0
                          ? factura.pagos.map((p) => FORMA_PAGO[p.formaPago]).join(", ")
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-800">
                        ${factura.total.toLocaleString("es-AR")}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
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
