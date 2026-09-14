import React, { useState } from 'react';
import { QrCode, Building2, Copy, Check, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { AppSettings } from '../../types';

interface BankTransferQrSectionProps {
  settings: AppSettings;
  amount?: number;
  onReceiptUploaded?: (receiptDataUrl: string) => void;
  receiptDataUrl?: string | null;
}

export const BankTransferQrSection: React.FC<BankTransferQrSectionProps> = ({
  settings,
  amount,
  onReceiptUploaded,
  receiptDataUrl
}) => {
  const [activeBank, setActiveBank] = useState<'pichincha' | 'guayaquil'>('pichincha');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const hasPichinchaQr = Boolean(settings.bankQrPichincha);
  const hasGuayaquilQr = Boolean(settings.bankQrGuayaquil);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#071322] border border-amber-500/40 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wide">
              Pagar con Transferencia o Código QR
            </h5>
            <p className="text-[11px] text-slate-400">
              Escanea el QR oficial desde tu aplicación de banco para pagar de inmediato.
            </p>
          </div>
        </div>
        {amount && (
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total a Transferir</span>
            <span className="text-sm sm:text-base font-black text-white font-mono text-amber-300">
              ${amount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Bank Selector Tabs: Pichincha (DeUna) vs Guayaquil */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveBank('pichincha')}
          className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeBank === 'pichincha'
              ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950"></span>
          <span>Pichincha / DeUna</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveBank('guayaquil')}
          className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeBank === 'guayaquil'
              ? 'bg-pink-600 text-white shadow-md scale-[1.02]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-pink-400 border border-white"></span>
          <span>Banco Guayaquil</span>
        </button>
      </div>

      {/* Tab 1: Banco Pichincha (DeUna QR) */}
      {activeBank === 'pichincha' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-slate-950 border border-amber-500/20">
            {/* QR Box */}
            <div className="shrink-0 flex flex-col items-center">
              {hasPichinchaQr ? (
                <div className="p-2 rounded-2xl bg-white shadow-lg border-2 border-amber-400">
                  <img
                    src={settings.bankQrPichincha}
                    alt="QR Banco Pichincha DeUna"
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
                  />
                </div>
              ) : (
                /* Fallback stylized DeUna / Pichincha visual badge if not uploaded yet */
                <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border-2 border-dashed border-amber-400/50 flex flex-col items-center justify-center p-3 text-center">
                  <QrCode className="w-10 h-10 text-amber-400 mb-1" />
                  <span className="text-[10px] font-black text-amber-300 uppercase">QR DeUna Pichincha</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Sube el QR en el panel de Admin</span>
                </div>
              )}
              <span className="text-[10px] font-bold text-amber-400 mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>QR Oficial DeUna</span>
              </span>
            </div>

            {/* Instructions & Bank Data */}
            <div className="space-y-2 text-xs flex-1 w-full">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <span className="font-black text-amber-300 block text-[11px] uppercase tracking-wide">
                  📱 ¿Cómo pagar con DeUna o Pichincha?
                </span>
                <p className="text-[11px] text-slate-300 mt-1">
                  1. Abre tu aplicación <strong>DeUna</strong> o <strong>Banca Móvil Pichincha</strong>.<br />
                  2. Selecciona la opción <strong>Escanear QR</strong> y enfoca este código.<br />
                  3. Confirma el monto exacto {amount ? `($${amount.toFixed(2)})` : ''} y toma captura del comprobante.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[9px] uppercase block font-bold">Banco</span>
                  <span className="font-bold text-white">Banco Pichincha</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[9px] uppercase block font-bold">Tipo</span>
                  <span className="font-bold text-white">{settings.bankType || 'Cuenta Corriente'}</span>
                </div>
                <div className="col-span-2 p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase block font-bold">Número de Cuenta</span>
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      {settings.bankAccount || '2100889922'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settings.bankAccount || '2100889922', 'pichincha-acc')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    {copiedField === 'pichincha-acc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'pichincha-acc' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Banco Guayaquil QR */}
      {activeBank === 'guayaquil' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-slate-950 border border-pink-500/20">
            {/* QR Box */}
            <div className="shrink-0 flex flex-col items-center">
              {hasGuayaquilQr ? (
                <div className="p-2 rounded-2xl bg-white shadow-lg border-2 border-pink-500">
                  <img
                    src={settings.bankQrGuayaquil}
                    alt="QR Banco Guayaquil"
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
                  />
                </div>
              ) : (
                /* Fallback stylized Guayaquil QR badge if not uploaded yet */
                <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/10 border-2 border-dashed border-pink-500/50 flex flex-col items-center justify-center p-3 text-center">
                  <QrCode className="w-10 h-10 text-pink-400 mb-1" />
                  <span className="text-[10px] font-black text-pink-300 uppercase">QR Banco Guayaquil</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Sube el QR en el panel de Admin</span>
                </div>
              )}
              <span className="text-[10px] font-bold text-pink-400 mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>QR Banco Guayaquil</span>
              </span>
            </div>

            {/* Instructions & Bank Data */}
            <div className="space-y-2 text-xs flex-1 w-full">
              <div className="p-2.5 rounded-lg bg-pink-500/10 border border-pink-500/30">
                <span className="font-black text-pink-300 block text-[11px] uppercase tracking-wide">
                  📱 ¿Cómo pagar con Banco Guayaquil?
                </span>
                <p className="text-[11px] text-slate-300 mt-1">
                  1. Abre tu aplicación <strong>Banco Guayaquil Móvil</strong>.<br />
                  2. Entra a <strong>Pagos QR</strong> o <strong>Transferencias</strong>.<br />
                  3. Escanea este código, ingresa el valor {amount ? `($${amount.toFixed(2)})` : ''} y guarda tu comprobante.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[9px] uppercase block font-bold">Banco</span>
                  <span className="font-bold text-white">Banco Guayaquil</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[9px] uppercase block font-bold">Tipo</span>
                  <span className="font-bold text-white">Cuenta de Ahorros / Cte.</span>
                </div>
                <div className="col-span-2 p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase block font-bold">Beneficiario</span>
                    <span className="font-bold text-white text-xs truncate">
                      {settings.bankHolder || 'PACHA TRANSPORTE EJECUTIVO'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">RUC: {settings.bankIdNumber || '1391827364001'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
