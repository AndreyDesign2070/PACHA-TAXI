import React, { useState } from 'react';
import { X, User, Phone, Lock, CreditCard, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { PachaAuth } from '../../services/auth';
import { User as UserType } from '../../types';
import { PachaLogo } from '../common/PachaLogo';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  onOpenLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenLogin
}) => {
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !cedula.trim() || !phone.trim() || !password.trim()) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (cedula.trim().length < 10) {
      setError('La cédula de identidad debe tener al menos 10 dígitos.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = PachaAuth.registerCustomer({
        fullName,
        cedula,
        phone,
        email,
        password
      });
      setIsLoading(false);

      if (result.success && result.user) {
        onSuccess(result.user);
        onClose();
      } else {
        setError(result.error || 'Error al registrar la cuenta.');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-[#0B192C] border border-amber-500/30 p-6 sm:p-8 text-white shadow-2xl relative my-6">
        <button
          id="btn-close-register"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <PachaLogo variant="full" size="sm" showSubtitle={true} showRoute={true} className="mb-2" />
          <h2 className="text-xl sm:text-2xl font-black text-white font-brand mt-1">Registro de Cliente</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tu número de cédula será tu usuario de acceso
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="input-reg-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Juan Pérez Mendoza"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Cédula de Identidad (Usuario) *
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="input-reg-cedula"
                type="text"
                required
                value={cedula}
                onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej. 1312345678"
                maxLength={10}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Teléfono Celular (WhatsApp) *
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="input-reg-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 0991234567"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Correo Electrónico (Opcional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="input-reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  id="input-reg-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 6 carácteres"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Confirmar *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  id="input-reg-pass-confirm"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir clave"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            id="btn-submit-register"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Creando cuenta...' : 'CREAR CUENTA Y CONTINUAR'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <button
              id="btn-return-login"
              type="button"
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="font-bold text-amber-400 hover:underline"
            >
              Iniciar sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
