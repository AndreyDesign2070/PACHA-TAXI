import React, { useState } from 'react';
import { X, Phone, KeyRound, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { PachaStorage } from '../../services/storage';

interface RecoverPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const RecoverPasswordModal: React.FC<RecoverPasswordModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin
}) => {
  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'SUCCESS'>('REQUEST');
  const [identifier, setIdentifier] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<any>(null);

  if (!isOpen) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const users = PachaStorage.getUsers();
    const clean = identifier.trim();
    const user = users.find((u) => u.cedula === clean || u.phone.includes(clean) || u.username === clean);

    if (!user) {
      setError('No encontramos ninguna cuenta asociada a este número de cédula o teléfono.');
      return;
    }

    setMatchedUser(user);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(code);
    setEnteredCode(code); // Pre-fill for ease of demonstration
    setStep('VERIFY');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (enteredCode.trim() !== sentCode.trim()) {
      setError('El código de verificación ingresado no es correcto.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (matchedUser) {
      const storedPasswords = JSON.parse(localStorage.getItem('pacha_passwords_v1') || '{}');
      storedPasswords[matchedUser.id] = newPassword.trim();
      storedPasswords[matchedUser.username] = newPassword.trim();
      localStorage.setItem('pacha_passwords_v1', JSON.stringify(storedPasswords));
    }

    setStep('SUCCESS');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#0B192C] border border-amber-500/30 p-6 sm:p-8 text-white shadow-2xl relative">
        <button
          id="btn-close-recover"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white font-brand">Recuperar Contraseña</h2>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'REQUEST' && 'Te enviaremos un código de seguridad al número registrado'}
            {step === 'VERIFY' && 'Ingresa el código enviado por mensaje de texto o WhatsApp'}
            {step === 'SUCCESS' && 'Tu contraseña ha sido actualizada correctamente'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {step === 'REQUEST' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Cédula o Teléfono Registrado
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="input-recover-id"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ej. 1305544332 o 0981122334"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              id="btn-send-recover-code"
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase shadow-md transition-all active:scale-95"
            >
              ENVIAR CÓDIGO AL CELULAR
            </button>
          </form>
        )}

        {step === 'VERIFY' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <span className="font-semibold">Código enviado a:</span> {matchedUser?.phone}
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                (Código simulado: <span className="text-amber-400 font-bold">{sentCode}</span>)
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Código de 6 dígitos
              </label>
              <input
                id="input-verify-code"
                type="text"
                required
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                maxLength={6}
                className="w-full py-3 text-center tracking-[0.5em] font-mono text-lg rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nueva Contraseña
              </label>
              <input
                id="input-new-pass"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              id="btn-confirm-new-pass"
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase shadow-md transition-all active:scale-95"
            >
              RESTABLECER CONTRASEÑA
            </button>
          </form>
        )}

        {step === 'SUCCESS' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-200">
              Tu contraseña ha sido restablecida. Ahora puedes iniciar sesión con tu cédula y tu nueva clave.
            </p>
            <button
              id="btn-return-login-success"
              type="button"
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase"
            >
              IR A INICIAR SESIÓN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
