import React, { useEffect, useState } from 'react';
import { PachaIcon } from './PachaIcon';
import { PachaWordmark } from './PachaWordmark';
import { PachaStorage } from '../../services/storage';
import { AppSettings } from '../../types';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'ICON' | 'LOADING'>('ICON');
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<AppSettings>(() => PachaStorage.getSettings());

  useEffect(() => {
    return PachaStorage.subscribe(() => {
      setSettings(PachaStorage.getSettings());
    });
  }, []);

  // Phase 1: Exactly 4 seconds showing the second framed icon with typography
  useEffect(() => {
    const iconTimer = setTimeout(() => {
      setStage('LOADING');
    }, 4000);

    return () => clearTimeout(iconTimer);
  }, []);

  // Phase 2: Exactly 6 seconds loading bar to reach 100% with executive taxi background
  useEffect(() => {
    if (stage !== 'LOADING') return;

    const duration = 6000; // Exactly 6 seconds as requested
    const intervalTime = 30; // 30ms intervals for smooth animation
    const step = 100 / (duration / intervalTime);

    const loadTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(loadTimer);
          setTimeout(onComplete, 250);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(loadTimer);
  }, [stage, onComplete]);

  const splashBgImage = settings.splashBgUrl || '/splash-taxi.jpg';
  const splashLogo = settings.splashLogoUrl || '';
  const splashLogoSize = settings.splashLogoSize || 'md';
  const splashLogoStyle = settings.splashLogoStyle || 'framed';
  const overlayOpacity = typeof settings.splashOverlayOpacity === 'number' ? settings.splashOverlayOpacity : 65;
  const showRouteBadge = settings.splashShowRouteBadge !== false;

  const brandTitle = settings.brandTitle || 'PACHA';
  const brandSubtitle = settings.brandSubtitle || 'Transporte Ejecutivo';
  const originCity = settings.brandRouteOrigin || 'Portoviejo';
  const destCity = settings.brandRouteDestination || 'Pedernales';
  const loadingLabel = settings.splashLoadingText || 'Cargando aplicación...';
  const subtextLabel = settings.splashSubtext || 'Portoviejo ↔ Pedernales • Confort y Puntualidad';

  // Splash Logo size classes
  const getLogoSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'h-16 sm:h-20 max-w-[200px] sm:max-w-[240px]';
      case 'lg':
        return 'h-28 sm:h-36 max-w-[320px] sm:max-w-[380px]';
      case 'xl':
        return 'h-36 sm:h-44 max-w-[380px] sm:max-w-[460px]';
      case 'md':
      default:
        return 'h-20 sm:h-28 max-w-[260px] sm:max-w-[320px]';
    }
  };

  return (
    <div
      id="pacha-splash-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between text-white select-none transition-all duration-700 overflow-hidden"
    >
      {/* ================= STAGE 1: SECOND FRAMED ICON (4 SECONDS) ================= */}
      {stage === 'ICON' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0B254E] via-[#061533] to-[#020A1A] animate-in fade-in duration-500 p-6">
          {/* Subtle ambient light aura */}
          <div className="absolute w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-pulse" />

          {/* Centered Second Icon (Framed with Gold Aura) */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
            {/* Framed Icon */}
            <div className="relative">
              <div className="absolute -inset-2 bg-amber-500/30 rounded-3xl blur-md opacity-90" />
              <div className="relative z-10 p-3.5 sm:p-4 rounded-3xl bg-black/75 backdrop-blur-xl border-2 border-amber-500/50 shadow-[0_14px_45px_rgba(0,0,0,0.9)] flex items-center justify-center">
                <PachaIcon size={72} className="drop-shadow-2xl" />
              </div>
            </div>
          </div>

          {/* Skip button top right */}
          <div className="absolute top-6 right-6">
            <button
              id="btn-skip-splash-icon"
              onClick={onComplete}
              className="text-xs text-slate-400 hover:text-white px-3.5 py-1.5 rounded-full border border-slate-700/60 bg-black/30 backdrop-blur-sm tracking-wider uppercase transition"
            >
              Saltar
            </button>
          </div>
        </div>
      )}

      {/* ================= STAGE 2: LOADING BAR WITH EXECUTIVE TAXI IMAGE ================= */}
      {stage === 'LOADING' && (
        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 animate-in fade-in duration-700">
          {/* Background image: Super Admin custom image or default executive taxi */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-3000 ease-out"
            style={{ backgroundImage: `url('${splashBgImage}')` }}
          />

          {/* Dynamic dark luxury overlay controlled by Super Admin (default 65% opacity) */}
          <div
            className="absolute inset-0 bg-[#020817] transition-opacity duration-300"
            style={{ opacity: overlayOpacity / 100 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-black/40 backdrop-blur-[0.5px]" />

          {/* Top skip button */}
          <div className="relative z-10 w-full flex justify-end">
            <button
              id="btn-skip-splash-loading"
              onClick={onComplete}
              className="text-xs sm:text-sm text-slate-300 hover:text-amber-400 px-4 py-2 rounded-full border border-white/20 bg-black/50 backdrop-blur-md tracking-widest uppercase transition-colors"
            >
              Saltar
            </button>
          </div>

          {/* Center Brand Badge: App Icon + Logotipo Tipográfico PACHA (Punto 2) Debajo del Ícono */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
            {/* 1. Ícono de la App (Punto 1: Isotipo) */}
            <div className="relative mb-2 sm:mb-3 animate-in zoom-in-95 duration-500">
              <div className="absolute -inset-2 bg-amber-500/25 rounded-3xl blur-md opacity-80" />
              <div className="relative z-10 p-2.5 sm:p-3 rounded-3xl bg-black/65 backdrop-blur-xl border-2 border-amber-500/40 shadow-[0_14px_45px_rgba(0,0,0,0.9)] flex items-center justify-center">
                <PachaIcon size={72} className="drop-shadow-2xl" />
              </div>
            </div>
            
            {/* 2. Debajo del ícono de la app: EL MISMO "PACHA" DEL LOGOTIPO TIPOGRÁFICO DE PUNTO 2 */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 w-full max-w-md px-4 my-1 sm:my-2 animate-in fade-in duration-700">
              {/* Left subtle golden wing */}
              <div className="hidden xs:flex flex-col items-end gap-0.5 opacity-90 shrink-0">
                <div className="w-5 sm:w-8 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-amber-500 rounded-full" />
                <div className="w-3 sm:w-5 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-amber-500 rounded-full" />
                <div className="w-1.5 sm:w-3 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-amber-500 rounded-full" />
              </div>

              {/* El mismo Logotipo Tipográfico "PACHA" de Punto 2 (Wordmark o imagen subida) */}
              <div className="relative px-2 flex flex-col items-center">
                <PachaWordmark
                  className="h-10 sm:h-14 md:h-16 w-auto max-w-[260px] sm:max-w-[340px] drop-shadow-[0_6px_16px_rgba(0,0,0,0.95)] filter transition-transform hover:scale-105"
                />
                {/* Gold underline glow */}
                <div className="mt-1.5 w-full max-w-[200px] sm:max-w-[260px] h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-85" />
              </div>

              {/* Right subtle golden wing */}
              <div className="hidden xs:flex flex-col items-start gap-0.5 opacity-90 shrink-0">
                <div className="w-5 sm:w-8 h-0.5 bg-gradient-to-l from-transparent via-amber-400 to-amber-500 rounded-full" />
                <div className="w-3 sm:w-5 h-0.5 bg-gradient-to-l from-transparent via-amber-400 to-amber-500 rounded-full" />
                <div className="w-1.5 sm:w-3 h-0.5 bg-gradient-to-l from-transparent via-amber-400 to-amber-500 rounded-full" />
              </div>
            </div>

            {/* 3. Subtitle: TRANSPORTE EJECUTIVO */}
            <p className="text-xs sm:text-sm md:text-base text-amber-400 font-extrabold tracking-[0.25em] uppercase mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {brandSubtitle}
            </p>

            {/* 4. Insignia de Ruta */}
            {showRouteBadge && (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-xs sm:text-sm font-bold text-slate-200 shadow-lg">
                <span className="text-amber-400">{originCity}</span>
                <span className="text-amber-400">↔</span>
                <span className="text-amber-400">{destCity}</span>
              </div>
            )}
          </div>

          {/* Bottom: 3-Second Loading Bar (0% to 100%) - Significantly enlarged */}
          <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center mb-8 px-2">
            <div className="w-full flex justify-between items-center text-slate-200 mb-2.5 font-mono">
              <span className="text-sm sm:text-base text-amber-300 font-bold tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                {loadingLabel}
              </span>
              <span className="text-amber-400 font-black text-lg sm:text-xl drop-shadow">{Math.min(100, Math.round(progress))}%</span>
            </div>

            {/* Enlarged Outer Bar Container */}
            <div className="w-full h-5 sm:h-6 bg-black/85 rounded-full overflow-hidden p-1 border-2 border-amber-500/60 shadow-[0_0_24px_rgba(245,158,11,0.5)] backdrop-blur-md">
              {/* Active Filling Bar */}
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-75 ease-out shadow-[0_0_20px_rgba(245,158,11,1)]"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-3.5 text-center drop-shadow font-medium tracking-wide">
              {subtextLabel}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
