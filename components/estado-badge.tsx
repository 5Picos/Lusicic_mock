import { Badge } from "@/components/ui/badge";
import { EstadoAlerta } from "@/lib/mock-data";

const config: Record<EstadoAlerta, { label: string; className: string }> = {
  vencido: { label: "Vencido", className: "bg-red-100 text-red-700 border-red-200" },
  proximo: { label: "Próximo", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  ok: { label: "Al día", className: "bg-green-100 text-green-700 border-green-200" },
  sin_historial: { label: "Sin historial", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export function EstadoBadge({ estado }: { estado: EstadoAlerta }) {
  const { label, className } = config[estado];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
