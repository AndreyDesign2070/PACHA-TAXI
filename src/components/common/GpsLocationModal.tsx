import React, { useState } from 'react';
import { X, Navigation, Copy, Check, ExternalLink, MapPin } from 'lucide-react';
import { getAddressCoordinates, getGoogleMapsUrl } from '../../utils/geo';

interface GpsLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  address: string;
  reference?: string;
  type?: 'ORIGIN' | 'DESTINATION' | 'SHIPMENT';
  title?: string;
}

export const GpsLocationModal: React.FC<GpsLocationModalProps> = ({
  isOpen,
  onClose,
  cityName,
  address,
  reference,
  type = 'DESTINATION',
  title
}) => {
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  if (!isOpen) return null;

  const coords = getAddressCoordinates(cityName, address);
  const isOrigin = type === 'ORIGIN';
  const label = `${isOrigin ? 'Recogida' : 'Destino'}: ${cityName} - ${address}`;
  const gmapsUrl = getGoogleMapsUrl(coords.lat, coords.lng, label);

  // OpenStreetMap bbox around coordinate
  const delta = 0.007; // Zoom level ~16
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - delta}%2C${coords.lat - delta}%2C${coords.lng + delta}%2C${coords.lat + delta}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${coords.lat}, ${coords.lng}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${address}, ${cityName}, Manabí, Ecuador`);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-[#0B192C] border border-amber-500/40 p-5 sm:p-6 text-white shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden">
        {/* Close Button */}
        <button
          id="btn-close-gps-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isOrigin
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isOrigin ? '📍 PUNTO DE RECOGIDA' : '🏁 PUNTO DE LLEGADA / DESTINO'}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {cityName}, Manabí
            </span>
          </div>
          <h3 className="text-lg font-black text-white mt-1 font-brand">
            {title || (isOrigin ? 'Ubicación de Salida' : 'Ubicación de Destino')}
          </h3>
        </div>

        {/* Address Card */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 mb-3 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <MapPin
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isOrigin ? 'text-amber-400' : 'text-blue-400'
                }`}
              />
              <div>
                <p className="text-xs font-bold text-white leading-snug">{address}</p>
                {reference && (
                  <p className="text-[11px] text-amber-300/90 mt-0.5">
                    Ref: {reference}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleCopyAddress}
              className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition"
              title="Copiar dirección"
            >
              {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedAddress ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          {/* Exact Coordinates info */}
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-sky-400 font-bold">📍 Coordenadas GPS:</span>
              <span className="font-mono text-slate-300">{coords.lat}, {coords.lng}</span>
            </div>
            <button
              onClick={handleCopyCoords}
              className="text-amber-400 hover:underline flex items-center gap-1 text-[10px] font-bold"
            >
              {copiedCoords ? '¡Coordenadas copiadas!' : 'Copiar Coordenadas'}
            </button>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-700 shadow-inner bg-slate-950 mb-4">
          {/* OpenStreetMap iframe */}
          <iframe
            title="Mapa de Ubicación GPS"
            src={osmEmbedUrl}
            className="w-full h-full border-0 pointer-events-auto"
            loading="lazy"
          />

          {/* Location Marker Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Tooltip badge floating above marker */}
            <div className="mb-1 px-3 py-1 rounded-xl bg-[#0B192C]/95 border border-sky-400 text-white shadow-2xl text-[11px] font-extrabold flex items-center gap-1.5 animate-bounce">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>UBICACIÓN EXACTA</span>
            </div>

            {/* Marker */}
            <div className="relative flex items-center justify-center">
              <div className="absolute -bottom-1 w-10 h-10 rounded-full bg-sky-500/40 animate-ping" />
              <div className="absolute -bottom-0.5 w-6 h-6 rounded-full bg-blue-600/60 animate-pulse" />

              <svg
                viewBox="0 0 384 512"
                className="w-10 h-10 drop-shadow-[0_8px_16px_rgba(14,165,233,0.7)] text-sky-500 fill-current z-10 -translate-y-4"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" />
              </svg>

              <div className="absolute -bottom-1 w-3 h-3 rounded-full bg-sky-400 ring-2 ring-white shadow-md z-20" />
            </div>
          </div>

          {/* Informational overlay notice */}
          <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between pointer-events-none">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Dirección exacta y georreferenciada del servicio
            </span>
            <span className="font-mono text-amber-400">PACHA GPS</span>
          </div>
        </div>

        {/* Action Button: Google Maps Only */}
        <div>
          <a
            id="btn-open-google-maps"
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Navigation className="w-4 h-4" />
            <span>NAVEGAR CON GOOGLE MAPS</span>
            <ExternalLink className="w-4 h-4 opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
};
