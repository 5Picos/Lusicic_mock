import { clientes, pedidos } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Mail, Package, MapPin } from "lucide-react";

export default function ClientesPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">{clientes.length} clientes registrados</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nuevo cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientes.map((cliente) => {
          const pedidosSolicitante = pedidos.filter((p) => p.clienteSolicitanteId === cliente.id).length;
          const pedidosDestino = pedidos.filter((p) => p.clienteDestinoId === cliente.id).length;
          const iniciales = cliente.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("");

          return (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                    {iniciales}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">{cliente.nombre}</h3>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        {cliente.telefono}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        {cliente.email}
                      </div>
                    </div>

                    <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Package className="w-3.5 h-3.5 text-blue-500" />
                        <span><strong>{pedidosSolicitante}</strong> pedido{pedidosSolicitante !== 1 ? "s" : ""} solicitado{pedidosSolicitante !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-green-500" />
                        <span><strong>{pedidosDestino}</strong> como destino</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
