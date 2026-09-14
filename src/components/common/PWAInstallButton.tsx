import React, { useState } from 'react';
import { Smartphone, Download, Check, CheckCircle2, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { PachaLogo } from './PachaLogo';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'gold' | 'compact' | 'badge';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'gold'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleAction = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  const handleConfirmInstructions = () => {
    localStorage.setItem('pacha_pwa_installed', 'true');
    setShowInstructions(false);
  };

  return (
    <>
      {/* Botón CREAR ICONO con visto verde si ya está instalado, pero siempre activo y funcional */}
      <button
        id="btn-crear-icono"
        onClick={handleAction}
        className={`group relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 shadow-md active:scale-95 ${
          variant === 'compact'
            ? 'bg-[#1E3E62] hover:bg-[#2A5280] text-amber-300 border border-amber-500/30'
            : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-amber-500/20 hover:shadow-amber-500/40'
        } ${className}`}
        title={
          isInstalled
            ? 'App ya instalada (Púlsalo si deseas reinstalarla o volver a crear el icono)'
            : 'Instalar acceso directo en la pantalla del celular'
        }
      >
        <Smartphone className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
        <span>CREAR ICONO</span>

        {/* Visto verde que indica que ya se instaló */}
        {isInstalled && (
          <span
            className="inline-flex items-center justify-center w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-emerald-500 text-slate-950 shadow-sm ml-0.5 animate-in zoom-in-50 duration-300"
            title="Icono instalado en tu pantalla de inicio"
          >
            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3.5] text-slate-950" />
          </span>
        )}
      </button>

      {/* Modal de Guía de Instalación para iOS o instalación manual */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0B192C] border border-amber-500/30 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <PachaLogo variant="compact" size="sm" showSubtitle={true} showRoute={true} />
              <button
                id="btn-close-install-modal"
                onClick={() => setShowInstructions(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-300">
              {isInstalled && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Tu aplicación ya tiene un icono creado. Puedes volver a crearlo si lo habías borrado.</span>
                </div>
              )}

              {isIOS ? (
                <>
                  <p className="text-amber-200/90 font-medium">
                    Sigue estos sencillos pasos desde el navegador Safari de tu iPhone:
                  </p>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <Share2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Paso 1:</span> Presiona el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba en la barra de Safari).
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <PlusSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Paso 2:</span> Desliza hacia abajo y pulsa <strong>"Agregar al inicio"</strong> o <strong>"Añadir a pantalla de inicio"</strong>.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-amber-200/90 font-medium">
                    Para instalar el icono de PACHA en tu pantalla de inicio:
                  </p>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <Download className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Opción 1:</span> Si tu navegador muestra la opción <strong>"Instalar aplicación"</strong> en la barra superior o menú (⋮), pulsa en <strong>Instalar</strong>.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <PlusSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Opción 2:</span> En el menú de opciones (tres puntos ⋮ de Chrome), selecciona <strong>"Añadir a pantalla de inicio"</strong>.
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              id="btn-understand-install"
              onClick={handleConfirmInstructions}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:from-amber-400 hover:to-amber-500 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Entendido</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
