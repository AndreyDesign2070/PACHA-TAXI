import React, { useState } from 'react';
import { User as UserIcon, Phone, CreditCard, Mail, Shield, LogOut, CheckCircle, Smartphone } from 'lucide-react';
import { User } from '../../types';
import { PachaStorage } from '../../services/storage';
import { PWAInstallButton } from './PWAInstallButton';

interface UserProfileViewProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onOpenLogin,
  onLogout
}) => {
  const settings = PachaStorage.getSettings();

  if (!currentUser) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center text-white my-12 bg-[#0B192C] rounded-3xl border border-amber-500/20 shadow-xl">
        <UserIcon className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold font-brand">Perfil de Usuario</h3>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          Inicia sesión para gestionar tus datos de contacto y tus solicitudes en PACHA.
        </p>
        <button
          onClick={onOpenLogin}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 text-white pb-24 space-y-5">
      <div className="bg-[#0B192C] p-6 rounded-3xl border border-amber-500/30 text-center shadow-xl relative overflow-hidden">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg mb-3">
          {currentUser.fullName.charAt(0)}
        </div>
        <h3 className="text-xl font-extrabold text-white">{currentUser.fullName}</h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          {currentUser.cedula ? `C.I: ${currentUser.cedula}` : `Usuario: ${currentUser.username}`}
        </p>
        <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
          Rol: {currentUser.role}
        </div>
      </div>

      {/* Account Info Details */}
      <div className="p-5 rounded-3xl bg-[#0B192C] border border-slate-800 shadow-lg space-y-3 text-xs">
        <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-2">
          Datos de la Cuenta
        </h4>

        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <span className="text-slate-400">Teléfono / WhatsApp:</span>
          <span className="font-semibold text-white">{currentUser.phone}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <span className="text-slate-400">Estado de Cuenta:</span>
          <span className="font-bold text-emerald-400 uppercase">{currentUser.status}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <span className="text-slate-400">Acceso Móvil Directo:</span>
          <PWAInstallButton variant="compact" />
        </div>
      </div>

      {/* PACHA Information & Support */}
      <div className="p-5 rounded-3xl bg-[#0B192C] border border-slate-800 text-xs space-y-2 text-slate-400">
        <h4 className="font-bold text-white uppercase tracking-wider">Acerca de PACHA Transporte Ejecutivo</h4>
        <p>Servicio exclusivo y seguro cubriendo las rutas intercantonales en la provincia de Manabí.</p>
        <p className="pt-2 text-amber-400 font-medium">Soporte y Central de Radio: {settings.supportPhone}</p>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-3.5 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>CERRAR SESIÓN</span>
      </button>
    </div>
  );
};
