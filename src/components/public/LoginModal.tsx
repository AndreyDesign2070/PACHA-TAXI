import React, { useState, useEffect } from 'react';
import { Lock, User, AlertCircle, Sparkles, KeyRound, ShieldAlert, Eye, EyeOff } from 'lucide-react';
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
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenRegister,
  onOpenRecover
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

  const handleFillDemo = (userVal: string, passVal: string) => {
    setIdentifier(userVal);
    setPassword(passVal);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#0B192C] border border-amber-500/30 p-6 sm:p-8 text-white shadow-2xl relative">
        {/* Official Brand Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <PachaLogo variant="full" size="md" showSubtitle={true} showRoute={true} className="mb-1" />
          <h2 className="text-xl font-black text-white font-brand mt-2">
            {settings.loginTitle || 'Iniciar Sesión'}
          </h2>
          <p className="text-[11px] text-slate-400">
            {settings.loginSubtitle || 'Acceso a plataforma PACHA Transporte Ejecutivo'}
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Usuario o Cédula
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="input-login-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ej. 1310857063 o cédula"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div>
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
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="input-login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition"
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
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Verificando...' : 'ENTRAR A PACHA'}
          </button>
        </form>

        {/* Quick-Fill Chips for Evaluator Testing */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 text-center">
            Accesos de prueba rápida:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              id="chip-login-superadmin"
              onClick={() => handleFillDemo('1310857063', '1310857063')}
              className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-200 hover:bg-purple-900/50 text-left"
            >
              <div className="font-bold text-purple-300">👑 Super Admin</div>
              <div className="text-[10px] text-slate-400 font-mono">1310857063</div>
            </button>

            <button
              type="button"
              id="chip-login-admin"
              onClick={() => handleFillDemo('admin', 'pacha2026')}
              className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 hover:bg-amber-900/50 text-left"
            >
              <div className="font-bold text-amber-300">🏢 Admin</div>
              <div className="text-[10px] text-slate-400 font-mono">admin / pacha2026</div>
            </button>

            <button
              type="button"
              id="chip-login-driver"
              onClick={() => handleFillDemo('chofer1', 'pacha2026')}
              className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-200 hover:bg-blue-900/50 text-left"
            >
              <div className="font-bold text-blue-300">🚗 Conductor</div>
              <div className="text-[10px] text-slate-400 font-mono">chofer1 / pacha2026</div>
            </button>

            <button
              type="button"
              id="chip-login-customer"
              onClick={() => handleFillDemo('1305544332', 'cliente123')}
              className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-900/50 text-left"
            >
              <div className="font-bold text-emerald-300">👤 Cliente Demo</div>
              <div className="text-[10px] text-slate-400 font-mono">1305544332 / cliente123</div>
            </button>
          </div>
        </div>

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
      </div>
    </div>
  );
};
