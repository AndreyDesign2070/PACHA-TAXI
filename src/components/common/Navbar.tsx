import React, { useState } from 'react';
import { User, Bell, LogOut, ShieldCheck, UserCheck, Car, MessageCircle, ChevronDown, BookOpen } from 'lucide-react';
import { User as UserType } from '../../types';
import { PachaLogo } from './PachaLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { PachaStorage } from '../../services/storage';

interface NavbarProps {
  currentUser: UserType | null;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onSelectRoleDemo?: (role: string) => void;
  onOpenGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  unreadCount,
  onOpenNotifications,
  onOpenLogin,
  onLogout,
  onSelectRoleDemo,
  onOpenGuide
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const settings = PachaStorage.getSettings();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'SUPER ADMIN', color: 'bg-purple-600/30 text-purple-300 border-purple-500/40' };
      case 'ADMIN':
        return { label: 'ADMIN', color: 'bg-amber-500/30 text-amber-300 border-amber-500/40' };
      case 'DRIVER':
        return { label: 'CONDUCTOR', color: 'bg-blue-600/30 text-blue-300 border-blue-500/40' };
      default:
        return { label: 'CLIENTE', color: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40' };
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#071322]/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg">
      {/* PRIMERA LÍNEA: Logotipo oficial a la izquierda e "IDA Y VUELTA" en la parte superior derecha */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 border-b border-slate-800/60">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2">
          <PachaLogo variant="compact" size="sm" showBadge={false} />
        </div>

        {/* Right: "IDA Y VUELTA" Badge filling the top-right space */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            id="badge-navbar-ida-vuelta"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-[10px] sm:text-xs tracking-wider uppercase shadow-md shadow-amber-500/20 select-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
            <span>{settings.brandBadgeText || 'IDA Y VUELTA'}</span>
          </div>
        </div>
      </div>

      {/* SEGUNDA LÍNEA: Botón "Crear Icono", "Notificaciones" y la flechita de roles */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2">
        {/* Left of Second Line: GUIA DE USO (for all roles) + CREAR ICONO */}
        <div className="flex items-center gap-2">
          {onOpenGuide && (
            <button
              id="btn-nav-guia-uso"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider hover:bg-amber-500/30 hover:border-amber-400 transition-all shadow-md active:scale-95"
              title="Guía de Uso: Cómo pedir viajes y enviar encomiendas"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>GUIA DE USO</span>
            </button>
          )}

          {/* PWA Install Button: "CREAR ICONO" */}
          <PWAInstallButton />
        </div>

        {/* Right of Second Line: WhatsApp + Notificaciones + Flechita de Roles / Login */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Direct WhatsApp Contact Button */}
          <a
            id="btn-nav-whatsapp"
            href={`https://wa.me/${settings.supportWhatsApp}?text=Hola%20PACHA%20Transporte%20Ejecutivo,%20deseo%20más%20información`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-600/30 transition-colors"
            title="Contacto directo WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">WhatsApp</span>
          </a>

          {/* Notifications Button */}
          <button
            id="btn-nav-notifications"
            onClick={onOpenNotifications}
            className="relative p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors border border-slate-700/50"
            title="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950 shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile / Quick Role Switcher con la flechita */}
          {currentUser ? (
            <div className="relative">
              <button
                id="btn-user-menu"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl bg-slate-800/90 border border-amber-500/20 hover:border-amber-500/50 transition-colors text-left"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold text-xs shadow-inner">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden xs:flex flex-col pr-1">
                  <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[90px] sm:max-w-[120px]">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  <span className={`text-[8px] font-bold px-1 py-0.2 rounded border inline-block ${getRoleBadge(currentUser.role).color}`}>
                    {getRoleBadge(currentUser.role).label}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Switcher & Account Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0B192C] border border-amber-500/30 p-3 shadow-2xl z-50 text-white animate-in fade-in">
                  <div className="pb-2.5 mb-2.5 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-400">C.I: {currentUser.cedula || currentUser.username}</p>
                    <span className={`mt-1 inline-block text-[9px] font-bold px-2 py-0.5 rounded border ${getRoleBadge(currentUser.role).color}`}>
                      {getRoleBadge(currentUser.role).label}
                    </span>
                  </div>

                  {/* Switch to any role for testing */}
                  {onSelectRoleDemo && (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 mb-1.5">
                        Probar otro rol (Demostración):
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <button
                          onClick={() => { onSelectRoleDemo('SUPER_ADMIN'); setShowRoleMenu(false); }}
                          className="px-2 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-[11px] font-medium flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                          <span>Super Admin</span>
                        </button>
                        <button
                          onClick={() => { onSelectRoleDemo('ADMIN'); setShowRoleMenu(false); }}
                          className="px-2 py-1.5 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 border border-amber-500/30 text-amber-200 text-[11px] font-medium flex items-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Admin</span>
                        </button>
                        <button
                          onClick={() => { onSelectRoleDemo('DRIVER'); setShowRoleMenu(false); }}
                          className="px-2 py-1.5 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 text-blue-200 text-[11px] font-medium flex items-center gap-1.5"
                        >
                          <Car className="w-3.5 h-3.5 text-blue-400" />
                          <span>Conductor</span>
                        </button>
                        <button
                          onClick={() => { onSelectRoleDemo('CUSTOMER'); setShowRoleMenu(false); }}
                          className="px-2 py-1.5 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-200 text-[11px] font-medium flex items-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Cliente</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    id="btn-logout"
                    onClick={() => {
                      setShowRoleMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-semibold border border-red-500/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-nav-login"
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold tracking-wider uppercase shadow-md transition-all active:scale-95"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
