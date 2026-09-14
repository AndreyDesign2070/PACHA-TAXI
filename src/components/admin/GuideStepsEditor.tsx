import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Trash2,
  CheckCircle2,
  Sparkles,
  Eye,
  Car,
  Package,
  Info,
  RotateCcw,
  BookOpen,
  Image as ImageIcon,
  Save,
  Check,
  Loader2
} from 'lucide-react';
import { AppSettings } from '../../types';
import { PachaStorage } from '../../services/storage';
import { optimizeImageFile } from '../../utils/imageOptimizer';
import {
  RouteSelectionIllustration,
  CarComfortIllustration,
  DoorToDoorIllustration,
  TicketAndQRIllustration,
  SecurityCodeIllustration,
  PackageDeliveryIllustration
} from '../common/guide/GuideIllustrations';

interface GuideStepsEditorProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onNotify?: (msg: string) => void;
}

export const GuideStepsEditor: React.FC<GuideStepsEditorProps> = ({
  settings,
  onUpdateSettings,
  onNotify
}) => {
  const [activeTab, setActiveTab] = useState<'VIAJES' | 'ENCOMIENDAS' | 'CONSEJOS'>('VIAJES');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadingField, setUploadingField] = useState<keyof AppSettings | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Hidden file inputs for each step
  const travel1Ref = useRef<HTMLInputElement>(null);
  const travel2Ref = useRef<HTMLInputElement>(null);
  const travel3Ref = useRef<HTMLInputElement>(null);
  const shipment1Ref = useRef<HTMLInputElement>(null);
  const shipment2Ref = useRef<HTMLInputElement>(null);
  const shipment3Ref = useRef<HTMLInputElement>(null);

  // Sync latest settings when storage changes remotely or locally
  useEffect(() => {
    const unsub = PachaStorage.subscribe(() => {
      onUpdateSettings(PachaStorage.getSettings());
    });
    return unsub;
  }, [onUpdateSettings]);

  const processAndSaveStepImage = async (
    file: File,
    field: keyof AppSettings,
    stepName: string
  ) => {
    if (!file) return;

    // Validate that the file is an image
    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen válido (JPG, PNG, WebP o SVG).');
      return;
    }

    setUploadingField(field);
    setIsProcessing(true);
    try {
      console.info(`[PACHA GuideSteps] Procesando imagen para "${stepName}" (${file.name}, ${(file.size / 1024).toFixed(1)} KB)...`);
      const dataUrl = await optimizeImageFile(file, 850, 540, 0.78);
      const latest = PachaStorage.getSettings();
      const updated = { ...latest, ...settings, [field]: dataUrl };
      onUpdateSettings(updated);
      const saved = await PachaStorage.saveSettings(updated);
      onUpdateSettings(saved);

      const msg = `¡Imagen para "${stepName}" subida y sincronizada en tiempo real!`;
      if (onNotify) onNotify(msg);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error('[PACHA GuideSteps] Error subiendo imagen de paso:', err);
      const errMsg = err?.message || 'Error desconocido al procesar la imagen.';
      alert(`No se pudo procesar la imagen: ${errMsg}\nIntente con otra imagen JPG o PNG.`);
    } finally {
      setIsProcessing(false);
      setUploadingField(null);
    }
  };

  const handleUploadStepImage = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof AppSettings,
    stepName: string
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      processAndSaveStepImage(file, field, stepName);
    }
  };

  const handleRemoveStepImage = async (field: keyof AppSettings, stepName: string) => {
    if (window.confirm(`¿Desea eliminar la imagen personalizada de "${stepName}" y restaurar la ilustración vectorial original?`)) {
      const latest = PachaStorage.getSettings();
      const updated = { ...latest, ...settings, [field]: '' };
      onUpdateSettings(updated);
      const saved = await PachaStorage.saveSettings(updated);
      onUpdateSettings(saved);
      const msg = `Se restauró la ilustración original para "${stepName}".`;
      if (onNotify) onNotify(msg);
    }
  };

  const handleTextChange = (field: keyof AppSettings, value: string) => {
    const updated = { ...settings, [field]: value };
    onUpdateSettings(updated);
  };

  const handleSaveAll = async () => {
    setIsProcessing(true);
    try {
      const latest = PachaStorage.getSettings();
      const merged = { ...latest, ...settings };
      const saved = await PachaStorage.saveSettings(merged);
      onUpdateSettings(saved);
      setSavedSuccess(true);
      if (onNotify) onNotify('¡Guía de clientes actualizada y sincronizada en toda la aplicación!');
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('[PACHA GuideSteps] Error guardando guía:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenLiveGuide = () => {
    PachaStorage.saveSettings(settings);
    window.dispatchEvent(new CustomEvent('pacha_trigger_guide'));
    if (onNotify) onNotify('👁️ Abriendo Guía de Clientes para previsualización...');
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs for Steps */}
      <input
        ref={travel1Ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleUploadStepImage(e, 'guideTravelStep1Img', 'Viajes - Paso 1 (SELECCIONAR TU RUTA Y DIRECCIONES)')}
      />
      <input
        ref={travel2Ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleUploadStepImage(e, 'guideTravelStep2Img', 'Viajes - Paso 2 (FECHA, HORA Y PASAJEROS)')}
      />
      <input
        ref={travel3Ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleUploadStepImage(e, 'guideTravelStep3Img', 'Viajes - Paso 3 (TIPO DE PAGO Y CONFIRMAR)')}
      />

      <input
        ref={shipment1Ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleUploadStepImage(e, 'guideShipmentStep1Img', 'Encomiendas - Paso 1 (REGISTRA TU PAQUETE Y REMITENTE)')}
      />
      <input
        ref={shipment2Ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleUploadStepImage(e, 'guideShipmentStep2Img', 'Encomiendas - Paso 2 (GENERACION DEL CODIGO SECRETO)')}
      />
      <input
        ref={shipment3Ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleUploadStepImage(e, 'guideShipmentStep3Img', 'Encomiendas - Paso 3 (ENTREGA VERIFICADA EN MANO)')}
      />

      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-[#0B192C] to-purple-950/60 border-2 border-amber-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-900/60 border border-amber-500/40">
                EDITOR DE INFOGRAFÍA
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Respaldado por Ilustraciones Originales
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-brand mt-1">
              Editor de Imágenes y Pasos: Guía de Clientes
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Sube tus propios diseños hechos en Canva, Photoshop o Illustrator para cada paso de la guía. Si aún no tienes un diseño propio para algún paso, la app utilizará automáticamente la ilustración original.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            id="btn-guide-editor-open-live"
            onClick={handleOpenLiveGuide}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            title="Abrir la guía tal como la ven los clientes"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Guía en Vivo</span>
          </button>

          <button
            id="btn-guide-editor-save"
            onClick={handleSaveAll}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Textos</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-in fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>¡Guía de uso actualizada con éxito! Tus clientes ya pueden ver los nuevos cambios e imágenes.</span>
        </div>
      )}

      {/* Tabs for Viajes vs Encomiendas vs Consejos */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          id="btn-tab-guide-editor-viajes"
          onClick={() => setActiveTab('VIAJES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'VIAJES'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Pasos para Pedir un Viaje (3 Pasos)</span>
        </button>

        <button
          id="btn-tab-guide-editor-encomiendas"
          onClick={() => setActiveTab('ENCOMIENDAS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ENCOMIENDAS'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Paso para Enviar una Encomienda (3 Pasos)</span>
        </button>

        <button
          id="btn-tab-guide-editor-consejos"
          onClick={() => setActiveTab('CONSEJOS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'CONSEJOS'
              ? 'bg-purple-600 text-white shadow-md font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Guía de Diseño & Medidas</span>
        </button>
      </div>

      {/* ================= SECCIÓN 1: PASOS DE VIAJES ================= */}
      {activeTab === 'VIAJES' && (
        <div className="space-y-6">
          {/* PASO 1: SELECCIONAR TU RUTA Y DIRECCIONES */}
          <StepCard
            stepNumber={1}
            stepCategory="VIAJES"
            defaultTitle="SELECCIONAR TU RUTA Y DIRECCIONES"
            defaultSubtitle="Elige tu ciudad de origen, destino y tu dirección exacta puerta a puerta"
            defaultDesc="Selecciona tu ruta entre Portoviejo, Pedernales u otros cantones. Escribe tu dirección de recogida o fija tu ubicación exacta con el botón GPS para que el taxi llegue a tu puerta sin ir a terminales."
            customImgUrl={settings.guideTravelStep1Img}
            titleValue={settings.guideTravelStep1Title ?? ''}
            subtitleValue={settings.guideTravelStep1Subtitle ?? ''}
            descValue={settings.guideTravelStep1Desc ?? ''}
            isUploading={uploadingField === 'guideTravelStep1Img'}
            onTitleChange={(v) => handleTextChange('guideTravelStep1Title', v)}
            onSubtitleChange={(v) => handleTextChange('guideTravelStep1Subtitle', v)}
            onDescChange={(v) => handleTextChange('guideTravelStep1Desc', v)}
            onUploadClick={() => travel1Ref.current?.click()}
            onDropFile={(file) => processAndSaveStepImage(file, 'guideTravelStep1Img', 'Viajes - Paso 1')}
            onRemoveClick={() => handleRemoveStepImage('guideTravelStep1Img', 'Paso 1: SELECCIONAR TU RUTA Y DIRECCIONES')}
            defaultIllustration={<RouteSelectionIllustration />}
            designTip="Diseña una imagen mostrando el mapa de Manabí con la selección de ciudades y la dirección exacta de recogida con GPS."
          />

          {/* PASO 2: SELECCIONAR FECHA, HORA DEL VIAJE Y CANTIDAD DE PASAJEROS */}
          <StepCard
            stepNumber={2}
            stepCategory="VIAJES"
            defaultTitle="SELECCIONAR FECHA, HORA DEL VIAJE Y CANTIDAD DE PASAJEROS"
            defaultSubtitle="Programa la fecha y hora de salida y elige entre 1 a 4 asientos confortables"
            defaultDesc="Selecciona el día y la hora de tu viaje (salidas continuas cada 30 minutos). Elige la cantidad de pasajeros (de 1 a 4) y si prefieres viaje Estándar compartido ($12) o Ejecutivo VIP exclusivo para tu grupo."
            customImgUrl={settings.guideTravelStep2Img}
            titleValue={settings.guideTravelStep2Title ?? ''}
            subtitleValue={settings.guideTravelStep2Subtitle ?? ''}
            descValue={settings.guideTravelStep2Desc ?? ''}
            isUploading={uploadingField === 'guideTravelStep2Img'}
            onTitleChange={(v) => handleTextChange('guideTravelStep2Title', v)}
            onSubtitleChange={(v) => handleTextChange('guideTravelStep2Subtitle', v)}
            onDescChange={(v) => handleTextChange('guideTravelStep2Desc', v)}
            onUploadClick={() => travel2Ref.current?.click()}
            onDropFile={(file) => processAndSaveStepImage(file, 'guideTravelStep2Img', 'Viajes - Paso 2')}
            onRemoveClick={() => handleRemoveStepImage('guideTravelStep2Img', 'Paso 2: SELECCIONAR FECHA, HORA DEL VIAJE Y CANTIDAD DE PASAJEROS')}
            defaultIllustration={<CarComfortIllustration />}
            designTip="Muestra el calendario y reloj de horarios, los asientos reclinables, el aire acondicionado y la opción de 1 a 4 pasajeros."
          />

          {/* PASO 3: SELECCIONAR EL TIPO DE PAGO (EFECTIVO O TRANSFERENCIA) Y CONFIRMAR EL VIAJE */}
          <StepCard
            stepNumber={3}
            stepCategory="VIAJES"
            defaultTitle="SELECCIONAR EL TIPO DE PAGO (EFECTIVO O TRANSFERENCIA) Y CONFIRMAR EL VIAJE"
            defaultSubtitle="Elige tu método de pago y recibe tu boleto digital con código QR al instante"
            defaultDesc="Elige pagar en efectivo al chofer al subir a la unidad o por transferencia bancaria directa. Al confirmar tu viaje recibirás tu boleto digital con la placa del vehículo, chofer asignado y código QR de abordaje."
            customImgUrl={settings.guideTravelStep3Img}
            titleValue={settings.guideTravelStep3Title ?? ''}
            subtitleValue={settings.guideTravelStep3Subtitle ?? ''}
            descValue={settings.guideTravelStep3Desc ?? ''}
            isUploading={uploadingField === 'guideTravelStep3Img'}
            onTitleChange={(v) => handleTextChange('guideTravelStep3Title', v)}
            onSubtitleChange={(v) => handleTextChange('guideTravelStep3Subtitle', v)}
            onDescChange={(v) => handleTextChange('guideTravelStep3Desc', v)}
            onUploadClick={() => travel3Ref.current?.click()}
            onDropFile={(file) => processAndSaveStepImage(file, 'guideTravelStep3Img', 'Viajes - Paso 3')}
            onRemoveClick={() => handleRemoveStepImage('guideTravelStep3Img', 'Paso 3: SELECCIONAR EL TIPO DE PAGO Y CONFIRMAR EL VIAJE')}
            defaultIllustration={<TicketAndQRIllustration />}
            designTip="Diseña una imagen con los métodos de pago (efectivo y transferencia), el botón de confirmación de viaje y el boleto digital con código QR."
          />
        </div>
      )}

      {/* ================= SECCIÓN 2: PASOS DE ENCOMIENDAS ================= */}
      {activeTab === 'ENCOMIENDAS' && (
        <div className="space-y-6">
          {/* PASO 1: REGISTRA TU PAQUETE Y REMITENTE */}
          <StepCard
            stepNumber={1}
            stepCategory="ENCOMIENDAS"
            defaultTitle="REGISTRA TU PAQUETE Y REMITENTE"
            defaultSubtitle="Sobres de documentos, paquetes medianos o bultos protegidos"
            defaultDesc="Ingresa a 'Enviar Encomienda', elige la ciudad de destino y especifica el tipo de contenido y datos de quien recibe. Si contiene artículos delicados, márcalo como frágil para trato preferencial."
            customImgUrl={settings.guideShipmentStep1Img}
            titleValue={settings.guideShipmentStep1Title ?? ''}
            subtitleValue={settings.guideShipmentStep1Subtitle ?? ''}
            descValue={settings.guideShipmentStep1Desc ?? ''}
            isUploading={uploadingField === 'guideShipmentStep1Img'}
            onTitleChange={(v) => handleTextChange('guideShipmentStep1Title', v)}
            onSubtitleChange={(v) => handleTextChange('guideShipmentStep1Subtitle', v)}
            onDescChange={(v) => handleTextChange('guideShipmentStep1Desc', v)}
            onUploadClick={() => shipment1Ref.current?.click()}
            onDropFile={(file) => processAndSaveStepImage(file, 'guideShipmentStep1Img', 'Encomiendas - Paso 1')}
            onRemoveClick={() => handleRemoveStepImage('guideShipmentStep1Img', 'Paso 1: REGISTRA TU PAQUETE Y REMITENTE')}
            defaultIllustration={<SecurityCodeIllustration />}
            designTip="Muestra paquetes empaquetados cuidadosamente, sobres de documentos y el formulario de registro de remitente y destinatario."
          />

          {/* PASO 2: GENERACION DEL CODIGO SECRETO DE 4 DIGITOS */}
          <StepCard
            stepNumber={2}
            stepCategory="ENCOMIENDAS"
            defaultTitle="GENERACION DEL CODIGO SECRETO DE 4 DIGITOS"
            defaultSubtitle="¡Blindaje total! Tu paquete no puede ser entregado a otra persona"
            defaultDesc="La app crea automáticamente un código de 4 números secretos (ejemplo: 4829). Este código solo lo conoces tú y debes compartirlo con la persona que recibirá el paquete en destino."
            customImgUrl={settings.guideShipmentStep2Img}
            titleValue={settings.guideShipmentStep2Title ?? ''}
            subtitleValue={settings.guideShipmentStep2Subtitle ?? ''}
            descValue={settings.guideShipmentStep2Desc ?? ''}
            isUploading={uploadingField === 'guideShipmentStep2Img'}
            onTitleChange={(v) => handleTextChange('guideShipmentStep2Title', v)}
            onSubtitleChange={(v) => handleTextChange('guideShipmentStep2Subtitle', v)}
            onDescChange={(v) => handleTextChange('guideShipmentStep2Desc', v)}
            onUploadClick={() => shipment2Ref.current?.click()}
            onDropFile={(file) => processAndSaveStepImage(file, 'guideShipmentStep2Img', 'Encomiendas - Paso 2')}
            onRemoveClick={() => handleRemoveStepImage('guideShipmentStep2Img', 'Paso 2: GENERACION DEL CODIGO SECRETO DE 4 DIGITOS')}
            defaultIllustration={<SecurityCodeIllustration />}
            designTip="Enfócate en la seguridad: un candado, escudo o caja fuerte destacando los 4 dígitos que protegen la encomienda."
          />

          {/* PASO 3: ENTREGA VERIFICADA EN MANO Y CIERRE SEGURO */}
          <StepCard
            stepNumber={3}
            stepCategory="ENCOMIENDAS"
            defaultTitle="ENTREGA VERIFICADA EN MANO Y CIERRE SEGURO"
            defaultSubtitle="El destinatario dicta el código al chofer y se libera el paquete"
            defaultDesc="Al llegar a la dirección de entrega, el chofer solicita el código secreto de 4 dígitos. La app valida la clave en el teléfono del chofer y entrega el paquete con total tranquilidad."
            customImgUrl={settings.guideShipmentStep3Img}
            titleValue={settings.guideShipmentStep3Title ?? ''}
            subtitleValue={settings.guideShipmentStep3Subtitle ?? ''}
            descValue={settings.guideShipmentStep3Desc ?? ''}
            isUploading={uploadingField === 'guideShipmentStep3Img'}
            onTitleChange={(v) => handleTextChange('guideShipmentStep3Title', v)}
            onSubtitleChange={(v) => handleTextChange('guideShipmentStep3Subtitle', v)}
            onDescChange={(v) => handleTextChange('guideShipmentStep3Desc', v)}
            onUploadClick={() => shipment3Ref.current?.click()}
            onDropFile={(file) => processAndSaveStepImage(file, 'guideShipmentStep3Img', 'Encomiendas - Paso 3')}
            onRemoveClick={() => handleRemoveStepImage('guideShipmentStep3Img', 'Paso 3: ENTREGA VERIFICADA EN MANO Y CIERRE SEGURO')}
            defaultIllustration={<PackageDeliveryIllustration />}
            designTip="Ilustra la entrega formal y segura del chofer al cliente validando el código de 4 dígitos."
          />
        </div>
      )}

      {/* ================= SECCIÓN 3: CONSEJOS DE DISEÑO ================= */}
      {activeTab === 'CONSEJOS' && (
        <div className="p-6 rounded-3xl bg-[#0B192C] border-2 border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Guía de Medidas y Recomendaciones para Crear tus Diseños
              </h3>
              <p className="text-xs text-slate-400">
                Sigue estos consejos sencillos para que tus imágenes luzcan espectaculares en teléfonos, tablets y computadoras.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">1. Dimensiones Ideales</span>
              <h4 className="text-sm font-bold text-white">1200 x 750 píxeles</h4>
              <p className="text-xs text-slate-300">
                Una proporción horizontal de <strong>16:10</strong> o <strong>16:9</strong> ofrece el balance perfecto para verse nítido en el modal del cliente sin distorsionarse.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">2. Formato de Archivo</span>
              <h4 className="text-sm font-bold text-white">PNG o JPG de alta calidad</h4>
              <p className="text-xs text-slate-300">
                Exporta tus diseños en <strong>PNG</strong> para gráficos con fondo transparente o colores planos, o en <strong>JPG (85% calidad)</strong> si son fotografías de autos reales.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">3. Fondo y Colores</span>
              <h4 className="text-sm font-bold text-white">Fondo Oscuro o Transparente</h4>
              <p className="text-xs text-slate-300">
                Dado que la app utiliza un tema nocturno ejecutivo elegante (#040913), los diseños con fondos oscuros, azul marino o dorados se integran de manera impecable.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">¿Qué ocurre si no subo una imagen para todos los pasos?</p>
              <p className="text-slate-300 mt-1">
                No te preocupes: el sistema es inteligente. Si solo diseñas el Paso 1 y el Paso 4, esos dos pasos usarán tus fotos personalizadas, mientras que los Pasos 2 y 3 seguirán mostrando las ilustraciones originales sin ningún error.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// SUB-COMPONENTE: TARJETA DE EDICIÓN DE PASO
// ==========================================
interface StepCardProps {
  stepNumber: number;
  stepCategory: 'VIAJES' | 'ENCOMIENDAS';
  defaultTitle: string;
  defaultSubtitle: string;
  defaultDesc: string;
  customImgUrl?: string;
  titleValue: string;
  subtitleValue: string;
  descValue: string;
  isUploading?: boolean;
  onTitleChange: (v: string) => void;
  onSubtitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onUploadClick: () => void;
  onDropFile?: (file: File) => void;
  onRemoveClick: () => void;
  defaultIllustration: React.ReactNode;
  designTip: string;
}

const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  stepCategory,
  defaultTitle,
  defaultSubtitle,
  defaultDesc,
  customImgUrl,
  titleValue,
  subtitleValue,
  descValue,
  isUploading,
  onTitleChange,
  onSubtitleChange,
  onDescChange,
  onUploadClick,
  onDropFile,
  onRemoveClick,
  defaultIllustration,
  designTip
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#071322] border-2 border-slate-800 hover:border-amber-500/30 transition-all shadow-xl space-y-5">
      {/* Header del Paso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shrink-0">
            {stepNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Paso {stepNumber} • {stepCategory === 'VIAJES' ? 'Viajes de Pasajeros' : 'Encomiendas Seguras'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {titleValue || defaultTitle}
            </h3>
          </div>
        </div>

        <div>
          {isUploading ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              Guardando imagen...
            </span>
          ) : customImgUrl ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Diseño Personalizado Subido
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Ilustración Vectorial Original
            </span>
          )}
        </div>
      </div>

      {/* Grid Principal: Vista Previa y Controles a la izquierda, Textos a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Visual (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
            <span>Visualización Actual en el Paso {stepNumber}:</span>
            <span className="text-[10px] text-amber-400/80">Recomendado: 1200x750 px</span>
          </div>

          <div
            onClick={onUploadClick}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped && onDropFile) {
                onDropFile(dropped);
              }
            }}
            className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer min-h-[210px] flex items-center justify-center p-3 group ${
              isDragOver
                ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                : 'border-slate-800 hover:border-amber-500/50 bg-[#040913]'
            }`}
            title="Haz clic o arrastra una imagen para actualizar este paso"
          >
            {customImgUrl ? (
              <img
                src={customImgUrl}
                alt={`Paso ${stepNumber}`}
                className="w-full h-auto max-h-56 object-contain rounded-xl drop-shadow-md"
              />
            ) : (
              <div className="w-full flex items-center justify-center">
                {defaultIllustration}
              </div>
            )}

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none p-4 text-center">
              <Upload className="w-8 h-8 text-amber-400 animate-bounce" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {customImgUrl ? 'Clic o arrastra para cambiar' : 'Clic o arrastra para subir diseño'}
              </span>
              <span className="text-[10px] text-slate-300">
                Soporta PNG, JPG, WebP
              </span>
            </div>

            {/* Overlay hover badge */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[9px] font-bold text-slate-300 border border-slate-700 pointer-events-none">
              {customImgUrl ? 'Tu Diseño' : 'Vector Original'}
            </div>

            {/* Uploading loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                <Loader2 className="w-9 h-9 text-amber-400 animate-spin" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Optimizando y Guardando...
                </span>
                <span className="text-[10px] text-slate-400">
                  Sincronizando con todos los usuarios
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons for this Image */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onUploadClick}
              disabled={isUploading}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{customImgUrl ? 'Cambiar Imagen' : 'Subir Mi Diseño'}</span>
                </>
              )}
            </button>

            {customImgUrl && (
              <button
                type="button"
                onClick={onRemoveClick}
                disabled={isUploading}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                title="Restaurar ilustración vectorial original"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Restaurar</span>
              </button>
            )}
          </div>

          {/* Tip de diseño para el paso */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>Idea para tu diseño:</strong> {designTip}</span>
          </div>
        </div>

        {/* Columna Derecha: Edición de Textos (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Título del Paso:
            </label>
            <input
              type="text"
              value={titleValue}
              placeholder={defaultTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-bold focus:border-amber-400 focus:outline-none transition"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Texto predeterminado: <em>"{defaultTitle}"</em>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Subtítulo / Resumen Breve:
            </label>
            <input
              type="text"
              value={subtitleValue}
              placeholder={defaultSubtitle}
              onChange={(e) => onSubtitleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none transition"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Texto predeterminado: <em>"{defaultSubtitle}"</em>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Explicación / Instrucciones del Paso:
            </label>
            <textarea
              rows={3}
              value={descValue}
              placeholder={defaultDesc}
              onChange={(e) => onDescChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-amber-400 focus:outline-none transition leading-relaxed resize-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Texto predeterminado: <em>"{defaultDesc}"</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
