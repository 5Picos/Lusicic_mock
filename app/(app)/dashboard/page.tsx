import {
  camiones, choferes,
  mantenimientosAsignados, tiposMantenimiento,
  calcularEstadoAlerta, getUltimoRegistro,
  vencimientosChoferAsignados, tiposVencimientoChofer,
  calcularEstadoAlertaChofer, getUltimoRegistroVencimiento,
  EstadoAlerta,
} from "@/lib/mock-data";
import { EstadoBadge } from "@/components/estado-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Clock, HelpCircle, Truck, Users } from "lucide-react";

type AlertaCamion = {
  camion: string; patente: string; mantenimiento: string;
  estado: EstadoAlerta; kmRestantes: number | null;
  diasRestantes: number | null; proximoKm: number | null; proximaFecha: string | null;
};

type AlertaChofer = {
  chofer: string; vencimiento: string;
  estado: EstadoAlerta; diasRestantes: number | null; proximaFecha: string | null;
};

const prioridad: Record<EstadoAlerta, number> = { vencido: 3, proximo: 2, ok: 1, sin_historial: 0 };

export default function DashboardPage() {
  // ── Alertas camiones ──────────────────────────────────────────────────────
  const alertasCamiones: AlertaCamion[] = [];
  for (const asignado of mantenimientosAsignados) {
    if (!asignado.activo) continue;
    const camion = camiones.find((c) => c.id === asignado.camionId)!;
    const tipo   = tiposMantenimiento.find((t) => t.id === asignado.tipoMantenimientoId)!;
    const ultimo = getUltimoRegistro(asignado.camionId, asignado.tipoMantenimientoId);
    const calc   = calcularEstadoAlerta(asignado, camion, ultimo);
    alertasCamiones.push({
      camion: `${camion.marca} ${camion.modelo}`, patente: camion.patente,
      mantenimiento: tipo.nombre, estado: calc.estado,
      kmRestantes: calc.kmRestantes, diasRestantes: calc.diasRestantes,
      proximoKm: calc.proximoKm, proximaFecha: calc.proximaFecha,
    });
  }
  alertasCamiones.sort((a, b) => prioridad[b.estado] - prioridad[a.estado]);

  // ── Alertas choferes ──────────────────────────────────────────────────────
  const alertasChoferes: AlertaChofer[] = [];
  for (const asignado of vencimientosChoferAsignados) {
    if (!asignado.activo) continue;
    const chofer = choferes.find((c) => c.id === asignado.choferId)!;
    const tipo   = tiposVencimientoChofer.find((t) => t.id === asignado.tipoVencimientoId)!;
    const ultimo = getUltimoRegistroVencimiento(asignado.choferId, asignado.tipoVencimientoId);
    const calc   = calcularEstadoAlertaChofer(asignado, ultimo);
    alertasChoferes.push({
      chofer: chofer.nombre, vencimiento: tipo.nombre,
      estado: calc.estado, diasRestantes: calc.diasRestantes, proximaFecha: calc.proximaFecha,
    });
  }
  alertasChoferes.sort((a, b) => prioridad[b.estado] - prioridad[a.estado]);

  // ── Conteos combinados ────────────────────────────────────────────────────
  const todas = [...alertasCamiones, ...alertasChoferes];
  const conteos = {
    vencido:      todas.filter((a) => a.estado === "vencido").length,
    proximo:      todas.filter((a) => a.estado === "proximo").length,
    ok:           todas.filter((a) => a.estado === "ok").length,
    sin_historial:todas.filter((a) => a.estado === "sin_historial").length,
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Estado general · flota y choferes</p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{conteos.vencido}</p>
                <p className="text-xs text-red-600 font-medium">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{conteos.proximo}</p>
                <p className="text-xs text-yellow-600 font-medium">Próximos</p>
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
                <p className="text-2xl font-bold text-green-700">{conteos.ok}</p>
                <p className="text-xs text-green-600 font-medium">Al día</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700">{conteos.sin_historial}</p>
                <p className="text-xs text-slate-500 font-medium">Sin historial</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabla camiones ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-500" />
            Mantenimientos — camiones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Camión</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mantenimiento</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Próximo KM</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Próxima fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alertasCamiones.map((alerta, i) => (
                  <tr key={i} className={
                    alerta.estado === "vencido" ? "bg-red-50/50" :
                    alerta.estado === "proximo" ? "bg-yellow-50/50" : ""
                  }>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-900">{alerta.patente}</div>
                      <div className="text-xs text-slate-500">{alerta.camion}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{alerta.mantenimiento}</td>
                    <td className="px-6 py-3.5"><EstadoBadge estado={alerta.estado} /></td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {alerta.proximoKm ? `${alerta.proximoKm.toLocaleString()} km` : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {alerta.proximaFecha
                        ? new Date(alerta.proximaFecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {alerta.estado === "sin_historial" ? (
                        <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> Sin registros</span>
                      ) : (
                        <span>
                          {alerta.kmRestantes !== null && (
                            <span className={alerta.kmRestantes <= 0 ? "text-red-600 font-medium" : ""}>
                              {alerta.kmRestantes <= 0
                                ? `${Math.abs(alerta.kmRestantes).toLocaleString()} km pasados`
                                : `${alerta.kmRestantes.toLocaleString()} km restantes`}
                            </span>
                          )}
                          {alerta.kmRestantes !== null && alerta.diasRestantes !== null && " · "}
                          {alerta.diasRestantes !== null && (
                            <span className={alerta.diasRestantes <= 0 ? "text-red-600 font-medium" : ""}>
                              {alerta.diasRestantes <= 0
                                ? `${Math.abs(alerta.diasRestantes)} días pasados`
                                : `${alerta.diasRestantes} días restantes`}
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabla choferes ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            Vencimientos — choferes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Chofer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vencimiento</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Próxima fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alertasChoferes.map((alerta, i) => (
                  <tr key={i} className={
                    alerta.estado === "vencido" ? "bg-red-50/50" :
                    alerta.estado === "proximo" ? "bg-yellow-50/50" : ""
                  }>
                    <td className="px-6 py-3.5 font-medium text-slate-900">{alerta.chofer}</td>
                    <td className="px-6 py-3.5 text-slate-700">{alerta.vencimiento}</td>
                    <td className="px-6 py-3.5"><EstadoBadge estado={alerta.estado} /></td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {alerta.proximaFecha
                        ? new Date(alerta.proximaFecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {alerta.estado === "sin_historial" ? (
                        <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> Sin registros</span>
                      ) : alerta.diasRestantes !== null ? (
                        <span className={alerta.diasRestantes <= 0 ? "text-red-600 font-medium" : ""}>
                          {alerta.diasRestantes <= 0
                            ? `${Math.abs(alerta.diasRestantes)} días pasados`
                            : `${alerta.diasRestantes} días restantes`}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
