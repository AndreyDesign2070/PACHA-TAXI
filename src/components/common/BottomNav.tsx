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
  Settings,
  Palette
} from 'lucide-react';
import { UserRole } from '../../types';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  role: UserRole | 'PUBLIC';
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, role }) => {
  // Define items per role
  const getNavItems = () => {
    switch (role) {
      case 'DRIVER':
        return [
          { id: 'driver-services', label: 'Servicios', icon: Car },
          { id: 'driver-active', label: 'En Curso', icon: MapPin },
          { id: 'driver-shipments', label: 'Encomiendas', icon: Package },
          { id: 'driver-earnings', label: 'Ganancias', icon: DollarSign },
          { id: 'driver-profile', label: 'Perfil', icon: User }
        ];

      case 'ADMIN':
        return [
          { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'admin-bookings', label: 'Viajes', icon: Calendar },
          { id: 'admin-shipments', label: 'Encomiendas', icon: Package },
          { id: 'admin-routes', label: 'Tarifas', icon: MapPin },
          { id: 'admin-customers', label: 'Clientes', icon: Users },
          { id: 'admin-drivers', label: 'Conductores', icon: Car },
          { id: 'admin-settings', label: 'Ajustes', icon: Settings }
        ];

      case 'SUPER_ADMIN':
        return [
          { id: 'super-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'super-visual-editor', label: 'Edición App', icon: Palette },
          { id: 'super-admins', label: 'Admins', icon: Shield },
          { id: 'super-customers', label: 'Clientes', icon: Users },
          { id: 'super-reports', label: 'Auditoría', icon: FileText }
        ];

      default:
        // Customer / Public
        return [
          { id: 'home', label: 'Inicio', icon: Home },
          { id: 'book', label: 'Reservar', icon: Calendar },
          { id: 'shipment', label: 'Encomienda', icon: Package },
          { id: 'my-trips', label: 'Mis Viajes', icon: Clock },
          { id: 'profile', label: 'Perfil', icon: User }
        ];
    }
  };

  const items = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#071322]/98 border-t border-amber-500/20 backdrop-blur-lg shadow-2xl safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
                isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
