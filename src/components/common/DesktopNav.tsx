import React from 'react';
import {
  Home,
  Calendar,
  Package,
  Clock,
  User,
  Car,
  DollarSign,
  LayoutDashboard,
  Users,
  Shield,
  MapPin,
  FileText,
  CreditCard,
  Settings,
  BookOpen,
  Palette
} from 'lucide-react';
import { UserRole } from '../../types';
import { PachaLogo } from './PachaLogo';

interface DesktopNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  role: UserRole | 'PUBLIC';
  onOpenGuide?: () => void;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ currentTab, onSelectTab, role, onOpenGuide }) => {
  const getNavItems = () => {
    switch (role) {
      case 'DRIVER':
        return [
          { id: 'driver-services', label: 'Mis Servicios Asignados', icon: Car },
          { id: 'driver-active', label: 'Servicio en Curso', icon: MapPin },
          { id: 'driver-shipments', label: 'Entrega de Encomiendas', icon: Package },
          { id: 'driver-earnings', label: 'Mis Ganancias', icon: DollarSign },
          { id: 'driver-profile', label: 'Mi Perfil de Conductor', icon: User }
        ];

      case 'ADMIN':
        return [
          { id: 'admin-dashboard', label: 'Panel Dashboard', icon: LayoutDashboard },
          { id: 'admin-bookings', label: 'Gestión de Viajes', icon: Calendar },
          { id: 'admin-shipments', label: 'Gestión de Encomiendas', icon: Package },
          { id: 'admin-routes', label: 'Ciudades y Tarifas', icon: MapPin },
          { id: 'admin-customers', label: 'Clientes Registrados', icon: Users },
          { id: 'admin-drivers', label: 'Conductores y Flota', icon: Car },
          { id: 'admin-payments', label: 'Control de Pagos', icon: CreditCard },
          { id: 'admin-reports', label: 'Reportes y Métricas', icon: FileText },
          { id: 'admin-settings', label: 'Configuración General', icon: Settings }
        ];

      case 'SUPER_ADMIN':
        return [
          { id: 'super-dashboard', label: 'Panel Super Admin', icon: LayoutDashboard },
          { id: 'super-visual-editor', label: 'Edición Visual de la App', icon: Palette },
          { id: 'super-admins', label: 'Cuentas de ADMIN', icon: Shield },
          { id: 'super-customers', label: 'Reportes y Clientes', icon: Users },
          { id: 'super-drivers', label: 'Reportes y Conductores', icon: Car },
          { id: 'super-reports', label: 'Métricas Globales', icon: FileText }
        ];

      default:
        return [
          { id: 'home', label: 'Inicio', icon: Home },
          { id: 'book', label: 'Reservar Viaje', icon: Calendar },
          { id: 'shipment', label: 'Enviar Encomienda', icon: Package },
          { id: 'my-trips', label: 'Mis Viajes y Encomiendas', icon: Clock },
          { id: 'profile', label: 'Mi Perfil', icon: User }
        ];
    }
  };

  const items = getNavItems();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#071322] border-r border-amber-500/20 p-4 min-h-[calc(100vh-4rem)]">
      <div className="mb-4 px-2">
        <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
          Menú de Navegación
        </span>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`desktop-nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all text-left ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Guia de uso button for all roles */}
      {onOpenGuide && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            id="desktop-nav-guia-uso"
            onClick={onOpenGuide}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>GUIA DE USO</span>
          </button>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-slate-800 px-1">
        <PachaLogo variant="compact" size="sm" showSubtitle={true} showRoute={true} />
      </div>
    </aside>
  );
};
