import React, { useState, useEffect } from 'react';
import { Shield, Clock, Award, MapPin, ArrowRight, Smartphone, Sparkles, CheckCircle, ChevronRight, Phone, BookOpen } from 'lucide-react';
import { PachaLogo } from '../common/PachaLogo';
import { PachaStorage } from '../../services/storage';

interface LandingPageProps {
  onStartBooking: () => void;
  onStartShipment: () => void;
  onOpenLogin: () => void;
  onOpenGuide?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartBooking,
  onStartShipment,
  onOpenLogin,
  onOpenGuide
}) => {
  const [settings, setSettings] = useState(() => PachaStorage.getSettings());
  const [cities, setCities] = useState(() => PachaStorage.getActiveCities());

  useEffect(() => {
    return PachaStorage.subscribe(() => {
      setSettings(PachaStorage.getSettings());
      setCities(PachaStorage.getActiveCities());
    });
  }, []);

  return (
    <div className="flex flex-col w-full pb-20 md:pb-12 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:py-16 px-4 bg-gradient-to-b from-[#071322] via-[#0B192C] to-[#0A192F]">
        {/* Custom Hero Background if uploaded by Super Admin */}
        {settings.heroBgUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none"
            style={{ backgroundImage: `url('${settings.heroBgUrl}')` }}
          />
        )}

        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-gradient-to-b from-amber-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Main PACHA Official Logo & Identity */}
          <div className="mb-4 scale-95 sm:scale-100 transition-transform">
            <PachaLogo variant="full" size="lg" showSubtitle={true} showRoute={true} />
          </div>

          {/* Slogan */}
          <div className="max-w-xl mx-auto space-y-1.5 mb-8">
            <p className="text-slate-300 text-sm sm:text-base font-medium">
              {settings.heroSubtitle || 'Viaja con comodidad, máxima seguridad y puntualidad en Manabí.'}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="w-full max-w-md flex flex-col sm:flex-row gap-3 sm:gap-4 px-2">
            <button
              id="btn-hero-reservar"
              onClick={onStartBooking}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base tracking-wider uppercase shadow-xl shadow-amber-500/25 transition-all transform active:scale-95"
            >
              <span>RESERVAR VIAJE</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="btn-hero-encomienda"
              onClick={onStartShipment}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#1E3E62] hover:bg-[#274F7E] text-amber-300 font-bold text-sm sm:text-base tracking-wider uppercase border border-amber-500/40 shadow-lg transition-all active:scale-95"
            >
              <span>ENVIAR ENCOMIENDA</span>
            </button>
          </div>

          {/* Guía de Uso quick access button */}
          {onOpenGuide && (
            <div className="mt-4">
              <button
                id="btn-hero-guia-uso"
                onClick={onOpenGuide}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>GUIA DE USO: CÓMO PEDIR VIAJES Y ENVIAR ENCOMIENDAS</span>
              </button>
            </div>
          )}

          {/* Login prompt for unregistered/unauthenticated */}
          <div className="mt-5">
            <button
              id="btn-hero-iniciar-sesion"
              onClick={onOpenLogin}
              className="text-xs sm:text-sm text-slate-400 hover:text-amber-400 transition-colors font-medium underline underline-offset-4"
            >
              ¿Ya tienes una cuenta? Iniciar Sesión aquí
            </button>
          </div>
        </div>
      </section>

      {/* Available Authorized Cities & Routes Section */}
      <section className="py-10 px-4 bg-[#0A192F]/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
              Rutas Autorizadas
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-3">
              Ciudades Habilitadas por PACHA
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Servicio exclusivo con recogida y entrega en puntos acordados en las principales ciudades de Manabí.
            </p>
          </div>

          {/* City Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {cities.map((city, idx) => (
              <div
                key={city.id}
                className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#112240] to-[#0A192F] border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-md flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm sm:text-base font-bold text-white truncate">
                      {city.name}
                    </h4>
                    {city.isMainRoute && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Parada habilitada</p>
                </div>
              </div>
            ))}
          </div>

          {/* Typical Journey Highlights */}
          <div className="mt-6 p-4 rounded-2xl bg-[#0B192C] border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Conexiones directas e intermedias: Portoviejo, Jama, San Vicente, Bahía, Sucre, Pedernales.</span>
            </div>
            <button
              onClick={onStartBooking}
              className="text-amber-400 font-bold hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Consultar tarifas de ruta</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Pillars: Elegancia, Confianza, Seguridad, Puntualidad */}
      <section className="py-12 px-4 max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            La Experiencia de Transporte Ejecutivo
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Diferente a cualquier taxi convencional: servicio VIP puerta a puerta.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#112240] border border-slate-800 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Seguridad y Confianza</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vehículos particulares de alta gama inspeccionados periódicamente con conductores profesionales asignados por PACHA.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#112240] border border-slate-800 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Puntualidad Garantizada</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recogida en tu dirección y hora exacta pactada, sin esperas innecesarias ni desvíos fuera de ruta.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#112240] border border-slate-800 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Encomiendas Seguras</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistema con código secreto de entrega de 4 dígitos. Tu paquete solo se entrega cuando el destinatario presenta la clave.
            </p>
          </div>
        </div>
      </section>

      {/* Footer information */}
      <footer className="mt-8 pt-8 border-t border-slate-800 px-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400">{settings.fullBusinessName}</p>
        <p className="mt-1">Servicio de transporte intercantonal ejecutivo en la provincia de Manabí.</p>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-amber-400/80">
          <span>Atención 24/7</span>
          <span>•</span>
          <span>WhatsApp: {settings.supportPhone}</span>
        </div>
      </footer>
    </div>
  );
};
