"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  Users,
  Building2,
  MapPin,
  Tag,
  Wrench,
  ClipboardList,
  Package,
  FileText,
  Receipt,
  Wallet,
  Landmark,
  ChevronDown,
  LogOut,
  Store,
  CreditCard,
  BarChart3,
  TrendingDown,
  TrendingUp,
  ClipboardX,
  FileWarning,
  Route,
  Scale,
} from "lucide-react";

type NavItem  = { href: string; label: string; icon: React.ElementType };
type NavGroup = { label: string; icon: React.ElementType; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    label: "Maestros",
    icon: Truck,
    items: [
      { href: "/camiones",    label: "Camiones",         icon: Truck },
      { href: "/choferes",    label: "Choferes",         icon: Users },
      { href: "/clientes",    label: "Clientes",         icon: Building2 },
      { href: "/proveedores", label: "Proveedores",      icon: Store },
      { href: "/localidades", label: "Localidades",      icon: MapPin },
      { href: "/precios",     label: "Listas de precio", icon: Tag },
    ],
  },
  {
    label: "Mantenimiento",
    icon: Wrench,
    items: [
      { href: "/dashboard",            label: "Dashboard",          icon: LayoutDashboard },
      { href: "/mantenimientos",       label: "Tipos camión",        icon: Wrench },
      { href: "/historial",            label: "Historial camiones",  icon: ClipboardList },
      { href: "/vencimientos-chofer",  label: "Tipos chofer",        icon: Users },
    ],
  },
  {
    label: "Administración",
    icon: Package,
    items: [
      { href: "/pedidos",          label: "Pedidos",          icon: Package },
      { href: "/remitos",          label: "Remitos",          icon: FileText },
      { href: "/facturacion",      label: "Facturación",      icon: Receipt },
      { href: "/cuenta-corriente", label: "Cuenta corriente", icon: Wallet },
      { href: "/cobros",           label: "Cobros",           icon: Receipt },
      { href: "/cheques",          label: "Cheques",          icon: Landmark },
      { href: "/gastos",           label: "Gastos",           icon: CreditCard },
    ],
  },
  {
    label: "Informes",
    icon: BarChart3,
    items: [
      { href: "/informes/comparativo",     label: "Comparativo",              icon: Scale },
      { href: "/informes/gastos",          label: "Gastos por período",       icon: TrendingDown },
      { href: "/informes/ingresos",        label: "Ingresos por período",     icon: TrendingUp },
      { href: "/informes/viajes",          label: "Viajes / km por chofer",   icon: Route },
      { href: "/informes/peajes",          label: "Peajes pagados",           icon: Landmark },
      { href: "/informes/facturas-destino",label: "Facturas destino",         icon: Building2 },
      { href: "/remitos",                  label: "Pedidos sin remito",       icon: ClipboardX },
      { href: "/pedidos",                  label: "Pedidos sin asignar",      icon: Package },
      { href: "/cuenta-corriente",         label: "Remitos sin facturar",     icon: FileWarning },
      { href: "/cheques",                  label: "Cheques a depositar",      icon: Landmark },
    ],
  },
];

function groupContains(group: NavGroup, pathname: string) {
  return group.items.some((item) => pathname === item.href);
}

export function Sidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GROUPS.map((g) => [g.label, groupContains(g, pathname)]))
  );

  // Auto-expand the group of the active route on navigation
  useEffect(() => {
    const activeGroup = GROUPS.find((g) => groupContains(g, pathname));
    if (activeGroup) {
      setOpen((prev) => ({ ...prev, [activeGroup.label]: true }));
    }
  }, [pathname]);

  function toggle(label: string) {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">Lusicic</p>
            <p className="text-xs text-slate-400">Gestión de flota</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-1">
        {/* Grupos acordeón */}
        {GROUPS.map((group) => {
          const isOpen   = open[group.label];
          const isActive = groupContains(group, pathname);

          return (
            <div key={group.label}>
              {/* Cabecera del grupo */}
              <button
                onClick={() => toggle(group.label)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-1",
                  isActive
                    ? "text-white bg-slate-800"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <group.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0",
                    isOpen ? "rotate-180" : ""
                  )}
                />
              </button>

              {/* Ítems del grupo */}
              {isOpen && (
                <div className="mt-0.5 ml-3 pl-3 border-l border-slate-700 space-y-0.5">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                          active
                            ? "bg-blue-600 text-white font-medium"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Usuario */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
            JG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Juan García</p>
            <p className="text-xs text-slate-400 truncate">Encargado</p>
          </div>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </Link>
      </div>
    </aside>
  );
}
