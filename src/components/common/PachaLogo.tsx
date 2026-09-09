import React, { useState, useEffect } from 'react';
import { PachaIcon } from './PachaIcon';
import { PachaWordmark } from './PachaWordmark';
import { PachaStorage } from '../../services/storage';
import { AppSettings } from '../../types';

interface PachaLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'horizontal' | 'badge';
  showSubtitle?: boolean;
  showRoute?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PachaLogo: React.FC<PachaLogoProps> = ({
  className = '',
  variant = 'full',
  showSubtitle = true,
  showRoute = true,
  size = 'md'
}) => {
  const [settings, setSettings] = useState<AppSettings>(() => PachaStorage.getSettings());

  useEffect(() => {
    return PachaStorage.subscribe(() => {
      setSettings(PachaStorage.getSettings());
    });
  }, []);

  const subtitleText = settings.brandSubtitle || 'TRANSPORTE EJECUTIVO';
  const originText = settings.brandRouteOrigin || 'Portoviejo';
  const destText = settings.brandRouteDestination || 'Pedernales';
  const badgeText = settings.brandBadgeText || 'Ida y Vuelta';

  // COMPACT / HORIZONTAL: Information JUNTO y DEBAJO del icono
  if (variant === 'compact' || variant === 'horizontal') {
    const iconSize = size === 'sm' ? 36 : size === 'lg' ? 52 : 44;

    return (
      <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
        {/* Exact Official App Icon */}
        <div className="relative shrink-0">
          <div className="absolute -inset-1 bg-amber-500/20 rounded-2xl blur-xs" />
          <PachaIcon size={iconSize} className="relative z-10 shadow-lg" />
        </div>

        {/* Information alongside and underneath */}
        <div className="flex flex-col justify-center text-left">
          {/* PACHA Brand Image with subtle golden wings */}
          <div className="flex items-center gap-1.5">
            {/* Left mini wing */}
            <div className="hidden sm:flex flex-col items-end gap-0.5 opacity-90">
              <div className="w-2.5 h-[1.5px] bg-gradient-to-r from-transparent to-amber-400 rounded-full" />
              <div className="w-1.5 h-[1.5px] bg-gradient-to-r from-transparent to-amber-400 rounded-full" />
            </div>

            <div className="py-0.5">
              <PachaWordmark className="h-5 sm:h-6 w-auto drop-shadow-md" />
            </div>

            {/* Right mini wing */}
            <div className="hidden sm:flex flex-col items-start gap-0.5 opacity-90">
              <div className="w-2.5 h-[1.5px] bg-gradient-to-l from-transparent to-amber-400 rounded-full" />
              <div className="w-1.5 h-[1.5px] bg-gradient-to-l from-transparent to-amber-400 rounded-full" />
            </div>
          </div>

          {/* Underneath: TRANSPORTE EJECUTIVO */}
          {showSubtitle && (
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-amber-400 font-extrabold leading-tight">
              {subtitleText}
            </span>
          )}

          {/* Underneath: PORTOVIEJO <-> PEDERNALES • IDA Y VUELTA */}
          {showRoute && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[8px] sm:text-[9px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="text-amber-400 font-bold">{originText}</span>
                <span className="text-amber-400">↔</span>
                <span className="text-amber-400 font-bold">{destText}</span>
              </span>
              <span className="text-[7px] sm:text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black uppercase tracking-wider border border-amber-500/30">
                {badgeText}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // FULL / STACKED: Information DEBAJO del icono
  const mainIconSize = size === 'sm' ? 60 : size === 'lg' ? 96 : 80;

  return (
    <div className={`flex flex-col items-center select-none text-center ${className}`}>
      {/* 1. Official App Isotype Icon */}
      <div className="mb-3 relative">
        <div className="absolute -inset-2.5 bg-amber-500/20 rounded-3xl blur-md opacity-80" />
        <PachaIcon size={mainIconSize} className="relative z-10 shadow-2xl" />
      </div>

      {/* 2. Golden Wings & Exact Official PACHA 3D Chrome Image */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-sm">
        {/* Left Golden Wing */}
        <div className="flex flex-col items-end gap-0.5 opacity-90">
          <div className="w-6 sm:w-10 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-amber-500 rounded-full" />
          <div className="w-4 sm:w-7 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-amber-500 rounded-full" />
          <div className="w-2 sm:w-4 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-amber-500 rounded-full" />
        </div>

        {/* PACHA Exact Image Typography without white background */}
        <div className="relative px-2 flex flex-col items-center">
          <PachaWordmark className="h-8 sm:h-12 w-auto max-w-[240px] sm:max-w-[320px] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] filter transition-transform hover:scale-105" />
          {/* Gold underline glow */}
          <div className="mt-1 w-full max-w-[180px] h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
        </div>

        {/* Right Golden Wing */}
        <div className="flex flex-col items-start gap-0.5 opacity-90">
          <div className="w-6 sm:w-10 h-0.5 bg-gradient-to-l from-transparent via-amber-400 to-amber-500 rounded-full" />
          <div className="w-4 sm:w-7 h-0.5 bg-gradient-to-l from-transparent via-amber-400 to-amber-500 rounded-full" />
          <div className="w-2 sm:w-4 h-0.5 bg-gradient-to-l from-transparent via-amber-400 to-amber-500 rounded-full" />
        </div>
      </div>

      {/* 3. Subtitle: TRANSPORTE EJECUTIVO */}
      {showSubtitle && (
        <div className="mt-1.5">
          <p className="text-xs sm:text-sm font-black tracking-[0.25em] text-amber-400 uppercase font-executive drop-shadow">
            {subtitleText}
          </p>
        </div>
      )}

      {/* 4. Route Badge: PORTOVIEJO <-> PEDERNALES & IDA Y VUELTA */}
      {showRoute && (
        <div className="mt-2.5 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B192C] border border-amber-500/40 shadow-inner">
            <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] sm:text-xs font-extrabold tracking-wider text-white uppercase">
              {originText}
            </span>
            <span className="text-amber-400 font-bold text-xs sm:text-sm">↔</span>
            <span className="text-[10px] sm:text-xs font-extrabold tracking-wider text-white uppercase">
              {destText}
            </span>
            <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>

          {/* IDA Y VUELTA Gold Pill */}
          <div className="mt-1 px-4 py-0.5 rounded-md bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-[9px] sm:text-[10px] font-black tracking-widest text-slate-950 uppercase shadow-sm">
            {badgeText}
          </div>
        </div>
      )}
    </div>
  );
};

