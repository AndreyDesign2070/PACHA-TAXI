import React, { useState, useEffect } from 'react';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { PachaAuth } from '../../services/auth';
import { PachaStorage } from '../../services/storage';
import { User as UserType } from '../../types';
import { PachaLogo } from '../common/PachaLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  onOpenRegister: () => void;
  onOpenRecover: () => void;
  promptMessage?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenRegister,
  onOpenRecover,
  promptMessage
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(() => PachaStorage.getSettings());

  useEffect(() => {
    return PachaStorage.subscribe(() => {
      setSettings(PachaStorage.getSettings());
    });
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      setError('Por favor complete su usuario/cédula y contraseña.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = PachaAuth.login(identifier, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onSuccess(result.user);
        onClose();
      } else {
        setError(result.error || 'Credenciales inválidas');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#0B192C] border-2 border-amber-500/30 p-5 sm:p-7 text-white shadow-2xl relative my-auto">
        {/* Sleek, centered brand header with reduced height */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <PachaLogo variant="compact" size="sm" showRoute={false} />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white font-brand mt-1">
            {settings.loginTitle || 'Iniciar Sesión'}
          </h2>
          <p className="text-[11px] text-slate-400">
            {settings.loginSubtitle || 'Acceso a plataforma PACHA Transporte Ejecutivo'}
          </p>
        </div>

        {/* Custom prompt message (e.g. "POR FAVOR, INICIE SESION PARA PODER VIAJAR O ENVIAR UNA ENCOMIENDA") */}
        {promptMessage && (
          <div className="mb-3.5 p-3 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-200 text-xs font-black tracking-wide flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
            <span className="leading-snug">{promptMessage}</span>
          </div>
        )}

        {/* Error alert */}
        {error && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form - full width inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Usuario o Cédula
            </label>
            <div className="relative w-full">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="input-login-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ingresa tu usuario o cédula"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Contraseña
              </label>
              <button
                type="button"
                id="btn-forgot-password"
                onClick={() => {
                  onClose();
                  onOpenRecover();
                }}
                className="text-[11px] text-amber-400 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative w-full">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="input-login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition"
              />
              <button
                type="button"
                id="btn-toggle-login-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="btn-submit-login"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Verificando...' : 'ENTRAR A PACHA'}
          </button>
        </form>

        {/* Register footer */}
        <div className="mt-5 text-center">
          <p className="text-xs text-slate-400">
            ¿No tienes cuenta de cliente?{' '}
            <button
              id="btn-open-register-modal"
              type="button"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="font-bold text-amber-400 hover:underline"
            >
              Regístrate gratis aquí
            </button>
          </p>
        </div>

        {/* User Required Branding (Requested: "ASI MISMO EN LA PANTALLA DE INICIAR SESION HASTA EL FINAL, DEBE APARECER ESE MISMO TEXTO APP BY: ANDREY DESIGN 2026") */}
        <div className="mt-5 pt-3 border-t border-slate-800 text-center">
          <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold">
            APP BY: ANDREY DESIGN 2026
          </p>
        </div>
      </div>
    </div>
  );
};
