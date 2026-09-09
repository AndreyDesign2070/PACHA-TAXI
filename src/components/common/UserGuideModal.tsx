import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Car,
  Package,
  MapPin,
  ShieldCheck,
  CreditCard,
  Key,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
  Info,
  Phone,
  Eye
} from 'lucide-react';
import {
  RouteSelectionIllustration,
  CarComfortIllustration,
  DoorToDoorIllustration,
  TicketAndQRIllustration,
  SecurityCodeIllustration,
  PackageDeliveryIllustration
} from './guide/GuideIllustrations';
import { InteractiveSimulator } from './guide/InteractiveSimulator';
import { PachaStorage } from '../../services/storage';
import { AppSettings } from '../../types';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBooking?: () => void;
  onStartShipment?: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onStartBooking,
  onStartShipment
}) => {
  const [settings, setSettings] = useState<AppSettings>(() => PachaStorage.getSettings());
  const [mainTab, setMainTab] = useState<'VIAJES' | 'ENCOMIENDAS' | 'SIMULADOR' | 'FAQ'>('VIAJES');
  const [viewMode, setViewMode] = useState<'SLIDER' | 'PANORAMA'>('SLIDER');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  useEffect(() => {
    const unsub = PachaStorage.subscribe(() => {
      setSettings(PachaStorage.getSettings());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  // ==========================================
  // DATOS DE PASOS ILUSTRADOS - VIAJES (3 PASOS)
  // ==========================================
  const travelSteps = [
    {
      step: 1,
      title: settings.guideTravelStep1Title || 'SELECCIONAR TU RUTA Y DIRECCIONES',
      subtitle: settings.guideTravelStep1Subtitle || 'Elige tu ciudad de origen, destino y tu dirección exacta puerta a puerta',
      desc: settings.guideTravelStep1Desc || 'Selecciona tu ruta entre Portoviejo, Pedernales u otros cantones. Escribe tu dirección de recogida o fija tu ubicación exacta con el botón GPS para que el taxi llegue a tu puerta sin ir a terminales.',
      isCustomImage: Boolean(settings.guideTravelStep1Img),
      illustration: settings.guideTravelStep1Img ? (
        <div className="w-full flex items-center justify-center p-2">
          <img
            src={settings.guideTravelStep1Img}
            alt={settings.guideTravelStep1Title || 'Paso 1: SELECCIONAR TU RUTA Y DIRECCIONES'}
            className="w-full max-h-72 object-contain rounded-2xl shadow-2xl border border-amber-500/20 bg-slate-900/60"
          />
        </div>
      ) : (
        <RouteSelectionIllustration
          activeHotspot={selectedHotspot || undefined}
          onSelectHotspot={(id) => setSelectedHotspot(id)}
        />
      ),
      hotspots: [
        { id: 'portoviejo', label: 'Portoviejo ↔ Pedernales', tip: 'Salidas frecuentes y rutas directas entre cantones.' },
        { id: 'gps', label: 'Ubicación GPS', tip: 'Fijación de dirección exacta para recogida puerta a puerta.' }
      ]
    },
    {
      step: 2,
      title: settings.guideTravelStep2Title || 'SELECCIONAR FECHA, HORA DEL VIAJE Y CANTIDAD DE PASAJEROS',
      subtitle: settings.guideTravelStep2Subtitle || 'Programa la fecha y hora de salida y elige entre 1 a 4 asientos confortables',
      desc: settings.guideTravelStep2Desc || 'Selecciona el día y la hora de tu viaje (salidas continuas cada 30 minutos). Elige la cantidad de pasajeros (de 1 a 4) y si prefieres viaje Estándar compartido ($12) o Ejecutivo VIP exclusivo para tu grupo.',
      isCustomImage: Boolean(settings.guideTravelStep2Img),
      illustration: settings.guideTravelStep2Img ? (
        <div className="w-full flex items-center justify-center p-2">
          <img
            src={settings.guideTravelStep2Img}
            alt={settings.guideTravelStep2Title || 'Paso 2: FECHA, HORA Y PASAJEROS'}
            className="w-full max-h-72 object-contain rounded-2xl shadow-2xl border border-amber-500/20 bg-slate-900/60"
          />
        </div>
      ) : (
        <CarComfortIllustration
          activeHotspot={selectedHotspot || undefined}
          onSelectHotspot={(id) => setSelectedHotspot(id)}
        />
      ),
      hotspots: [
        { id: 'asiento1', label: '1 a 4 Pasajeros', tip: 'Asientos confortables y reclinables con cinturón de seguridad.' },
        { id: 'aire', label: 'Aire Acondicionado', tip: 'Cabina 100% climatizada durante todo el trayecto.' },
        { id: 'maletero', label: 'Maletero Amplio', tip: 'Espacio protegido para equipaje de mano y maletas.' }
      ]
    },
    {
      step: 3,
      title: settings.guideTravelStep3Title || 'SELECCIONAR EL TIPO DE PAGO (EFECTIVO O TRANSFERENCIA) Y CONFIRMAR EL VIAJE',
      subtitle: settings.guideTravelStep3Subtitle || 'Elige tu método de pago y recibe tu boleto digital con código QR al instante',
      desc: settings.guideTravelStep3Desc || 'Elige pagar en efectivo al chofer al subir a la unidad o por transferencia bancaria directa. Al confirmar tu viaje recibirás tu boleto digital con la placa del vehículo, chofer asignado y código QR de abordaje.',
      isCustomImage: Boolean(settings.guideTravelStep3Img),
      illustration: settings.guideTravelStep3Img ? (
        <div className="w-full flex items-center justify-center p-2">
          <img
            src={settings.guideTravelStep3Img}
            alt={settings.guideTravelStep3Title || 'Paso 3: TIPO DE PAGO Y CONFIRMAR'}
            className="w-full max-h-72 object-contain rounded-2xl shadow-2xl border border-amber-500/20 bg-slate-900/60"
          />
        </div>
      ) : (
        <TicketAndQRIllustration
          activeHotspot={selectedHotspot || undefined}
          onSelectHotspot={(id) => setSelectedHotspot(id)}
        />
      ),
      hotspots: [
        { id: 'qr', label: 'Boleto Digital QR', tip: 'Identificador único que presentas al chofer al subir.' },
        { id: 'chofer', label: 'Chofer y Placa', tip: 'Datos del conductor verificado y contacto directo.' }
      ]
    }
  ];

  // ==========================================
  // DATOS DE PASOS ILUSTRADOS - ENCOMIENDAS (3 PASOS)
  // ==========================================
  const shipmentSteps = [
    {
      step: 1,
      title: settings.guideShipmentStep1Title || 'REGISTRA TU PAQUETE Y REMITENTE',
      subtitle: settings.guideShipmentStep1Subtitle || 'Sobres de documentos, paquetes medianos o bultos protegidos',
      desc: settings.guideShipmentStep1Desc || 'Ingresa a "Enviar Encomienda", elige la ciudad de destino y especifica el tipo de contenido y datos de quien recibe. Si contiene artículos delicados, márcalo como frágil para trato preferencial.',
      isCustomImage: Boolean(settings.guideShipmentStep1Img),
      illustration: settings.guideShipmentStep1Img ? (
        <div className="w-full flex items-center justify-center p-2">
          <img
            src={settings.guideShipmentStep1Img}
            alt={settings.guideShipmentStep1Title || 'Paso 1: REGISTRA TU PAQUETE Y REMITENTE'}
            className="w-full max-h-72 object-contain rounded-2xl shadow-2xl border border-amber-500/20 bg-slate-900/60"
          />
        </div>
      ) : (
        <SecurityCodeIllustration
          activeHotspot={selectedHotspot || undefined}
          onSelectHotspot={(id) => setSelectedHotspot(id)}
        />
      ),
      hotspots: [
        { id: 'notificacion', label: 'Aviso WhatsApp', tip: 'Remitente y destinatario reciben confirmación inmediata en su celular.' }
      ]
    },
    {
      step: 2,
      title: settings.guideShipmentStep2Title || 'GENERACION DEL CODIGO SECRETO DE 4 DIGITOS',
      subtitle: settings.guideShipmentStep2Subtitle || '¡Blindaje total! Tu paquete no puede ser entregado a otra persona',
      desc: settings.guideShipmentStep2Desc || 'La app crea automáticamente un código de 4 números secretos (ejemplo: 4829). Este código solo lo conoces tú y debes compartirlo con la persona que recibirá el paquete en destino.',
      isCustomImage: Boolean(settings.guideShipmentStep2Img),
      illustration: settings.guideShipmentStep2Img ? (
        <div className="w-full flex items-center justify-center p-2">
          <img
            src={settings.guideShipmentStep2Img}
            alt={settings.guideShipmentStep2Title || 'Paso 2: GENERACION DEL CODIGO SECRETO'}
            className="w-full max-h-72 object-contain rounded-2xl shadow-2xl border border-amber-500/20 bg-slate-900/60"
          />
        </div>
      ) : (
        <SecurityCodeIllustration
          activeHotspot={selectedHotspot || undefined}
          onSelectHotspot={(id) => setSelectedHotspot(id)}
        />
      ),
      hotspots: [
        { id: 'codigo4', label: 'Clave Anti-Robo', tip: 'El chofer tiene bloqueada la entrega hasta que se ingrese este código exacto.' }
      ]
    },
    {
      step: 3,
      title: settings.guideShipmentStep3Title || 'ENTREGA VERIFICADA EN MANO Y CIERRE SEGURO',
      subtitle: settings.guideShipmentStep3Subtitle || 'El destinatario dicta el código al chofer y se libera el paquete',
      desc: settings.guideShipmentStep3Desc || 'Al llegar a la dirección de entrega, el chofer solicita el código secreto de 4 dígitos. La app valida la clave en el teléfono del chofer y entrega el paquete con total tranquilidad.',
      isCustomImage: Boolean(settings.guideShipmentStep3Img),
      illustration: settings.guideShipmentStep3Img ? (
        <div className="w-full flex items-center justify-center p-2">
          <img
            src={settings.guideShipmentStep3Img}
            alt={settings.guideShipmentStep3Title || 'Paso 3: ENTREGA VERIFICADA EN MANO'}
            className="w-full max-h-72 object-contain rounded-2xl shadow-2xl border border-amber-500/20 bg-slate-900/60"
          />
        </div>
      ) : (
        <PackageDeliveryIllustration
          activeHotspot={selectedHotspot || undefined}
          onSelectHotspot={(id) => setSelectedHotspot(id)}
        />
      ),
      hotspots: [
        { id: 'entregaok', label: 'Entrega Validada', tip: 'Recibes comprobante digital de que tu paquete fue entregado con éxito.' }
      ]
    }
  ];

  const currentStepsList = mainTab === 'ENCOMIENDAS' ? shipmentSteps : travelSteps;
  const activeStepData = currentStepsList[currentStep - 1] || currentStepsList[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-3xl rounded-3xl bg-[#091526] border-2 border-amber-500/50 text-white shadow-2xl relative flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* ================= TOP HEADER ================= */}
        <div className="p-4 sm:p-5 border-b border-slate-800/90 flex items-center justify-between gap-3 bg-gradient-to-r from-[#0C1E38] via-[#091526] to-[#071120]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Infografía Interactiva
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium hidden xs:inline">
                  Portoviejo ↔ Pedernales
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white font-brand tracking-wide mt-0.5">
                GUÍA ILUSTRADA DE USO PARA CLIENTES
              </h2>
            </div>
          </div>

          <button
            id="btn-close-guide"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Cerrar guía"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= MAIN TABS NAVIGATION ================= */}
        <div className="flex border-b border-slate-800 bg-[#071120] px-3 pt-2 gap-1.5 overflow-x-auto scrollbar-none">
          <button
            id="btn-tab-guide-viajes"
            onClick={() => {
              setMainTab('VIAJES');
              setCurrentStep(1);
              setSelectedHotspot(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
              mainTab === 'VIAJES'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>1. Viajes de Pasajeros</span>
          </button>

          <button
            id="btn-tab-guide-encomiendas"
            onClick={() => {
              setMainTab('ENCOMIENDAS');
              setCurrentStep(1);
              setSelectedHotspot(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
              mainTab === 'ENCOMIENDAS'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>2. Encomiendas Seguras</span>
          </button>

          <button
            id="btn-tab-guide-simulador"
            onClick={() => setMainTab('SIMULADOR')}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
              mainTab === 'SIMULADOR'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Simulador de Prueba</span>
          </button>

          <button
            id="btn-tab-guide-faq"
            onClick={() => setMainTab('FAQ')}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
              mainTab === 'FAQ'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Preguntas Frecuentes</span>
            <span className="sm:hidden">FAQ</span>
          </button>
        </div>

        {/* ================= CONTROLES DE MODO DE VISTA (SOLO PARA VIAJES Y ENCOMIENDAS) ================= */}
        {(mainTab === 'VIAJES' || mainTab === 'ENCOMIENDAS') && (
          <div className="px-4 py-2.5 bg-[#050D18] border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="font-bold text-white">Modo Infografía:</span>
              <span className="hidden sm:inline text-[11px]">Toca las ilustraciones para explorar detalles</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('SLIDER')}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition ${
                  viewMode === 'SLIDER'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Paso a Paso</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('PANORAMA')}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition ${
                  viewMode === 'PANORAMA'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Panorama Completo</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= SCROLLABLE CONTENT BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ================= VISTA INTERACTIVA PASO A PASO (SLIDER) ================= */}
          {(mainTab === 'VIAJES' || mainTab === 'ENCOMIENDAS') && viewMode === 'SLIDER' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Stepper Header Pills */}
              <div className="flex items-center justify-between gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
                {currentStepsList.map((item) => (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      setCurrentStep(item.step);
                      setSelectedHotspot(null);
                    }}
                    className={`flex-1 py-2 px-2 rounded-xl text-center font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                      currentStep === item.step
                        ? 'bg-amber-500 text-slate-950 shadow-lg scale-102'
                        : currentStep > item.step
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Paso {item.step}</span>
                    <span className="hidden md:inline font-normal truncate">
                      • {item.title.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Contenedor Principal de la Ilustración */}
              <div className="relative rounded-3xl bg-[#061222] border-2 border-amber-500/40 p-4 sm:p-5 shadow-2xl overflow-hidden">
                {/* Glow decorativo de fondo */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Título y Resumen del Paso */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                        {activeStepData.step}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white font-brand uppercase tracking-wide">
                        {activeStepData.title}
                      </h3>
                    </div>
                    <p className="text-xs text-amber-300 font-medium mt-0.5">
                      {activeStepData.subtitle}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
                    {activeStepData.step} de {currentStepsList.length}
                  </span>
                </div>

                {/* Dibujo Vectorial / Ilustración Activa */}
                <div className="my-2 rounded-2xl overflow-hidden border border-slate-800/80 bg-[#040A14]/60 p-2 sm:p-3 flex items-center justify-center">
                  {activeStepData.illustration}
                </div>

                {/* Explicación Guiada del Paso */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-3">
                  {activeStepData.desc}
                </p>

                {/* Puntos Interactivos (Hotspots) para hacer clic */}
                {activeStepData.hotspots && activeStepData.hotspots.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Toca un elemento de la ilustración para ver detalles clave:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeStepData.hotspots.map((hs) => {
                        const isSelected = selectedHotspot === hs.id;
                        return (
                          <button
                            key={hs.id}
                            type="button"
                            onClick={() => setSelectedHotspot(isSelected ? null : hs.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-amber-500/50 hover:bg-slate-800'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-amber-400'}`} />
                            <span>{hs.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Tarjeta de Detalle del Hotspot seleccionado */}
                    {selectedHotspot && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2 animate-in fade-in">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block mb-0.5">
                            {activeStepData.hotspots.find((h) => h.id === selectedHotspot)?.label}:
                          </strong>
                          <span>{activeStepData.hotspots.find((h) => h.id === selectedHotspot)?.tip}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botones de Navegación del Slider */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  disabled={currentStep === 1}
                  onClick={() => {
                    setCurrentStep((prev) => Math.max(1, prev - 1));
                    setSelectedHotspot(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition ${
                    currentStep === 1
                      ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                {/* Botón de Acción Principal o Siguiente */}
                {currentStep < currentStepsList.length ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep((prev) => Math.min(currentStepsList.length, prev + 1));
                      setSelectedHotspot(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition"
                  >
                    <span>Siguiente Paso</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (mainTab === 'VIAJES' && onStartBooking) onStartBooking();
                      if (mainTab === 'ENCOMIENDAS' && onStartShipment) onStartShipment();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Listo para {mainTab === 'VIAJES' ? 'Viajar' : 'Enviar'}!</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ================= VISTA INFOGRAFÍA PANORÁMICA COMPLETA ================= */}
          {(mainTab === 'VIAJES' || mainTab === 'ENCOMIENDAS') && viewMode === 'PANORAMA' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
                <span>Infografía panorámica completa: recorrido paso a paso de la experiencia PACHA.</span>
                <button
                  type="button"
                  onClick={() => setViewMode('SLIDER')}
                  className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px]"
                >
                  Volver a Interactivo
                </button>
              </div>

              {currentStepsList.map((item, idx) => (
                <div
                  key={item.step}
                  className="p-5 rounded-3xl bg-[#071322] border-2 border-slate-800 hover:border-amber-500/40 transition-all shadow-xl space-y-3 relative"
                >
                  {/* Conector visual entre pasos */}
                  {idx < currentStepsList.length - 1 && (
                    <div className="absolute -bottom-6 left-10 w-0.5 h-6 bg-gradient-to-b from-amber-500 to-transparent z-10" />
                  )}

                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-base font-black text-white">{item.title}</h4>
                      <p className="text-xs text-amber-400">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#040913] p-3 flex items-center justify-center">
                    {item.illustration}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ================= VISTA MODO SIMULADOR ================= */}
          {mainTab === 'SIMULADOR' && (
            <div className="animate-in fade-in">
              <InteractiveSimulator
                onGoRealBooking={() => {
                  onClose();
                  if (onStartBooking) onStartBooking();
                }}
              />
            </div>
          )}

          {/* ================= VISTA PREGUNTAS FRECUENTES (FAQ) ================= */}
          {mainTab === 'FAQ' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <h4 className="text-sm font-black text-amber-300 uppercase flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Preguntas Frecuentes y Consejos para Clientes</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Todo lo que necesitas saber antes de iniciar tu viaje o envío en Manabí.
                </p>
              </div>

              {[
                {
                  q: '¿Cuánto equipaje puedo llevar en un viaje de pasajeros?',
                  a: 'Cada pasajero tiene derecho a una maleta de mano y una maleta mediana en el maletero sin costo adicional. Si llevas equipaje extra o cajas grandes, te sugerimos solicitar servicio VIP o reportarlo en las observaciones.'
                },
                {
                  q: '¿Qué pasa si el destinatario no tiene el código de 4 dígitos?',
                  a: 'Por seguridad estricta de PACHA, el chofer tiene bloqueada la entrega hasta digitar el código correcto. El destinatario debe consultarlo con la persona que envió el paquete en la sección "Mis Viajes".'
                },
                {
                  q: '¿En qué horarios operan los viajes Portoviejo ↔ Pedernales?',
                  a: 'Contamos con frecuencias diarias continuas desde las 05:00 AM hasta las 20:00 PM. Los viajes VIP ejecutivos pueden programarse a la hora exacta que el cliente requiera.'
                },
                {
                  q: '¿Cómo me comunico con el chofer asignado a mi viaje?',
                  a: 'Al confirmarse tu boleto, en la sección "Mis Viajes" podrás ver el nombre del chofer, la placa del auto y un botón verde de WhatsApp para llamarlo o escribirle directamente.'
                },
                {
                  q: '¿Cuáles son las formas de pago aceptadas?',
                  a: 'Aceptamos efectivo al momento de subir a la unidad y transferencias bancarias directas (Banco Pichincha y Banco de Guayaquil).'
                }
              ].map((faq, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <h5 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black flex items-center justify-center">
                      ?
                    </span>
                    <span>{faq.q}</span>
                  </h5>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* ================= FOOTER ACTIONS ================= */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800/90 bg-[#06101E] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">Soporte Central Activo 24/7 en Manabí</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onStartBooking && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartBooking();
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md active:scale-95"
              >
                Pedir Viaje
              </button>
            )}

            {onStartShipment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartShipment();
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition shadow-md active:scale-95"
              >
                Enviar Encomienda
              </button>
            )}

            <button
              id="btn-close-guide-footer"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase transition"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
