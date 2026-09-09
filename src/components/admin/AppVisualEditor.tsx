import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  RotateCcw,
  CheckCircle,
  Sparkles,
  Eye,
  Type,
  Layers,
  Save,
  Palette,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Check,
  X,
  Play,
  Car,
  Package,
  Calendar,
  Sliders,
  Maximize2,
  BookOpen
} from 'lucide-react';
import { AppSettings } from '../../types';
import { PachaStorage } from '../../services/storage';
import { PachaIcon } from '../common/PachaIcon';
import { PachaWordmark } from '../common/PachaWordmark';
import { PachaLogo } from '../common/PachaLogo';
import { GuideStepsEditor } from './GuideStepsEditor';

interface AppVisualEditorProps {
  onNotify?: (msg: string) => void;
}

export const AppVisualEditor: React.FC<AppVisualEditorProps> = ({ onNotify }) => {
  const [settings, setSettings] = useState<AppSettings>(() => PachaStorage.getSettings());
  const [activeSection, setActiveSection] = useState<'IMAGES' | 'THEME' | 'TEXTS' | 'GUIDE_STEPS' | 'PREVIEW'>('IMAGES');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Hidden file input refs for each visual asset
  const iconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const splashBgInputRef = useRef<HTMLInputElement>(null);
  const splashLogoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const bookingBannerInputRef = useRef<HTMLInputElement>(null);
  const shipmentBannerInputRef = useRef<HTMLInputElement>(null);
  const vehicleInputRef = useRef<HTMLInputElement>(null);

  // Optimize and convert uploaded file into high-quality base64 data URL
  const processImageFile = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality = 0.88
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      // If it's an SVG, read directly as data URL to preserve crisp vector paths
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Scale down proportionally if larger than maximum limits
          if (width > maxWidth || height > maxHeight) {
            if (width / maxWidth > height / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('No se pudo decodificar la imagen'));
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof AppSettings,
    maxWidth: number,
    maxHeight: number,
    assetName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-uploading the same file triggers onChange
    e.target.value = '';

    setIsProcessing(true);
    try {
      const dataUrl = await processImageFile(file, maxWidth, maxHeight);
      const updated = { ...settings, [field]: dataUrl };
      setSettings(updated);
      PachaStorage.saveSettings(updated);

      const msg = `¡${assetName} actualizado y guardado con éxito!`;
      if (onNotify) onNotify(msg);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error procesando imagen:', err);
      alert('Hubo un error al procesar el archivo. Por favor intente con otra imagen JPG o PNG.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveAsset = (field: keyof AppSettings, assetName: string) => {
    if (window.confirm(`¿Desea eliminar la imagen personalizada de "${assetName}" y volver a la opción predeterminada?`)) {
      const updated = { ...settings, [field]: '' };
      setSettings(updated);
      PachaStorage.saveSettings(updated);

      const msg = `Se eliminó la imagen personalizada de "${assetName}". Ahora se usa el elemento predeterminado.`;
      if (onNotify) onNotify(msg);
    }
  };

  const handleTextChange = (field: keyof AppSettings, value: any) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
  };

  const handleSaveAll = () => {
    PachaStorage.saveSettings(settings);
    setSaveSuccess(true);
    if (onNotify) onNotify('¡Todos los cambios visuales y textos han sido guardados y sincronizados!');
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleTestSplashLive = () => {
    PachaStorage.saveSettings(settings);
    window.dispatchEvent(new CustomEvent('pacha_trigger_splash'));
    if (onNotify) onNotify('⚡ Probando Pantalla de Carga (Splash Screen) en tiempo real...');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('¿Está seguro de restaurar todas las imágenes, íconos y textos a sus valores originales de fábrica?')) {
      const resetSettings: AppSettings = {
        ...settings,
        appIconUrl: '',
        appLogoUrl: '',
        splashBgUrl: '/splash-taxi.jpg',
        splashLogoUrl: '',
        splashOverlayOpacity: 65,
        splashLogoSize: 'md',
        splashLogoStyle: 'framed',
        splashShowRouteBadge: true,
        heroBgUrl: '',
        bookingBannerUrl: '',
        shipmentBannerUrl: '',
        defaultVehiclePhotoUrl: '',
        appAccentTheme: 'gold',
        brandTitle: 'PACHA',
        brandSubtitle: 'TRANSPORTE EJECUTIVO',
        brandRouteOrigin: 'Portoviejo',
        brandRouteDestination: 'Pedernales',
        brandBadgeText: 'Ida y Vuelta',
        heroSubtitle: 'Viaja con comodidad, máxima seguridad y puntualidad en Manabí.',
        splashLoadingText: 'Cargando aplicación...',
        splashSubtext: 'Portoviejo ↔ Pedernales • Confort y Puntualidad',
        loginTitle: 'Iniciar Sesión',
        loginSubtitle: 'Acceso a plataforma PACHA Transporte Ejecutivo',
        guideTravelStep1Img: '',
        guideTravelStep2Img: '',
        guideTravelStep3Img: '',
        guideTravelStep4Img: '',
        guideShipmentStep1Img: '',
        guideShipmentStep2Img: '',
        guideShipmentStep3Img: ''
      };
      setSettings(resetSettings);
      PachaStorage.saveSettings(resetSettings);
      if (onNotify) onNotify('Valores visuales restaurados a los predeterminados de fábrica.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Hidden File Inputs */}
      <input
        ref={iconInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'appIconUrl', 600, 600, 'Ícono de la App')}
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'appLogoUrl', 1200, 400, 'Logotipo PACHA')}
      />
      {/* Splash Screen Background Photo */}
      <input
        ref={splashBgInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'splashBgUrl', 1600, 1200, 'Fondo de Pantalla de Carga')}
      />
      {/* Splash Screen Custom Logo/Badge */}
      <input
        ref={splashLogoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'splashLogoUrl', 1200, 800, 'Logotipo del Splash Screen')}
      />
      {/* Hero Banner */}
      <input
        ref={heroInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'heroBgUrl', 1600, 900, 'Banner de Portada')}
      />
      {/* Booking Form Banner */}
      <input
        ref={bookingBannerInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'bookingBannerUrl', 1400, 600, 'Banner de Reservas')}
      />
      {/* Shipment Form Banner */}
      <input
        ref={shipmentBannerInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'shipmentBannerUrl', 1400, 600, 'Banner de Encomiendas')}
      />
      {/* Vehicle Fleet Official Photo */}
      <input
        ref={vehicleInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'defaultVehiclePhotoUrl', 1000, 750, 'Foto de Vehículo')}
      />

      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/90 via-[#0B192C] to-[#0A192F] border-2 border-purple-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Palette className="w-8 h-8 drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 px-2.5 py-0.5 rounded-full bg-purple-900/80 border border-purple-500/50">
                EXCLUSIVO SUPER ADMIN
              </span>
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> En tiempo real
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-brand mt-1">
              Edición y Personalización de la App
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Sube tus fotos, fondos e íconos favoritos. La aplicación reemplaza de inmediato los gráficos originales y usa <strong>exactamente las imágenes y textos</strong> que tú configures.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            id="btn-app-editor-test-splash"
            onClick={handleTestSplashLive}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            title="Probar pantalla de carga completa"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Probar Splash en Vivo</span>
          </button>

          <button
            id="btn-app-editor-save-all"
            onClick={handleSaveAll}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Todo</span>
          </button>

          <button
            id="btn-app-editor-reset-defaults"
            onClick={handleResetToDefaults}
            title="Restaurar imágenes y textos por defecto"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-in fade-in shadow-lg">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>¡Configuración visual guardada! La aplicación ahora utiliza tus imágenes y textos en todas las pantallas.</span>
        </div>
      )}

      {/* Subnav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          id="btn-tab-images"
          onClick={() => setActiveSection('IMAGES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'IMAGES'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Fotos, Fondos e Íconos</span>
        </button>

        <button
          id="btn-tab-theme"
          onClick={() => setActiveSection('THEME')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'THEME'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Colores y Tema</span>
        </button>

        <button
          id="btn-tab-texts"
          onClick={() => setActiveSection('TEXTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'TEXTS'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Textos y Mensajes de la App</span>
        </button>

        <button
          id="btn-tab-guide-steps"
          onClick={() => setActiveSection('GUIDE_STEPS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'GUIDE_STEPS'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/30'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Guía de Clientes (Paso a Paso)</span>
        </button>

        <button
          id="btn-tab-preview"
          onClick={() => setActiveSection('PREVIEW')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'PREVIEW'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Previsualización en Vivo</span>
        </button>
      </div>

      {/* ================= SECTION 1: IMAGES & ICONS ================= */}
      {activeSection === 'IMAGES' && (
        <div className="space-y-6">
          {/* Banner de Acceso Directo al Gestor de Pasos */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#0B192C] to-purple-950/40 border-2 border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    NUEVO MÓDULO SUPER ADMIN
                  </span>
                </div>
                <h4 className="text-sm font-black text-white mt-0.5">
                  ¿Deseas personalizar las imágenes de la Guía Paso a Paso para Clientes?
                </h4>
                <p className="text-xs text-slate-300">
                  Sube tus propios diseños hechos en Canva o Photoshop para cada paso de <strong>Viajes</strong> y <strong>Encomiendas</strong>.
                </p>
              </div>
            </div>

            <button
              id="btn-quick-goto-guide-steps"
              type="button"
              onClick={() => setActiveSection('GUIDE_STEPS')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shrink-0 transition-all shadow-md active:scale-95 flex items-center gap-2 self-start sm:self-auto"
            >
              <span>Abrir Gestor de Pasos</span>
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 1. ÍCONO DE LA APP (ISOTIPO) */}
            <div className="p-5 rounded-3xl bg-[#0B192C]/90 border border-purple-500/30 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        1. Ícono de la Aplicación (Isotipo)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Se muestra en la pantalla de carga, barra superior, menú y modal de inicio.
                      </p>
                    </div>
                  </div>

                  {settings.appIconUrl ? (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Subido por ti
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Vector Oficial
                    </span>
                  )}
                </div>

                {/* Visual Preview Box */}
                <div className="p-4 rounded-2xl bg-black/40 border border-slate-800/80 flex items-center justify-center gap-6 my-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="p-2 rounded-2xl bg-black/50 border border-amber-500/30">
                      <PachaIcon size={72} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Principal (72px)</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <div className="p-1 rounded-xl bg-black/50 border border-slate-700">
                      <PachaIcon size={40} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Navbar (40px)</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <div className="p-1 rounded-lg bg-black/50 border border-slate-700">
                      <PachaIcon size={28} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Pill (28px)</span>
                  </div>
                </div>
              </div>

              {/* Upload & Delete Controls */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  id="btn-upload-app-icon"
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{settings.appIconUrl ? 'Cambiar Ícono' : 'Subir Ícono Nuevo'}</span>
                </button>

                {settings.appIconUrl && (
                  <button
                    id="btn-remove-app-icon"
                    type="button"
                    onClick={() => handleRemoveAsset('appIconUrl', 'Ícono de la App')}
                    className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-all"
                    title="Eliminar y volver al isotipo original"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. LOGOTIPO "PACHA" (WORDMARK) */}
            <div className="p-5 rounded-3xl bg-[#0B192C]/90 border border-purple-500/30 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Type className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        2. Logotipo Tipográfico "PACHA"
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Letras con inclinación aerodinámica, cortes y triángulos dorados.
                      </p>
                    </div>
                  </div>

                  {settings.appLogoUrl ? (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Subido por ti
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Vector Oro/Blanco
                    </span>
                  )}
                </div>

                {/* Visual Preview Box */}
                <div className="p-4 rounded-2xl bg-black/40 border border-slate-800/80 flex flex-col items-center justify-center gap-3 my-4 min-h-[120px]">
                  <div className="p-3 w-full max-w-sm flex items-center justify-center">
                    <PachaWordmark className="h-10 sm:h-12 w-auto max-w-full drop-shadow-lg" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {settings.appLogoUrl ? 'Visualizando imagen personalizada subida' : 'Visualizando vector oficial blanco y oro'}
                  </span>
                </div>
              </div>

              {/* Upload & Delete Controls */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  id="btn-upload-app-logo"
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{settings.appLogoUrl ? 'Cambiar Logotipo' : 'Subir Logotipo Nuevo'}</span>
                </button>

                {settings.appLogoUrl && (
                  <button
                    id="btn-remove-app-logo"
                    type="button"
                    onClick={() => handleRemoveAsset('appLogoUrl', 'Logotipo PACHA')}
                    className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-all"
                    title="Eliminar y volver al logo tipográfico oficial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 3. PANTALLA DE CARGA (SPLASH SCREEN) - SECCIÓN COMPLETA CON FONDO Y LOGO */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-[#0B192C] via-[#071322] to-[#0D1B2A] border-2 border-amber-500/40 shadow-2xl space-y-6">
              {/* Header of Section 3 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white uppercase tracking-wider font-brand">
                        3. Pantalla de Carga (Splash Screen) - Fondo y Logotipo
                      </h3>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Prioridad
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Personaliza tanto la <strong>foto de fondo</strong> como el <strong>logotipo o emblema</strong> que se muestra sobre ella durante los 3 segundos de carga.
                    </p>
                  </div>
                </div>

                <button
                  id="btn-trigger-splash-preview-now"
                  type="button"
                  onClick={handleTestSplashLive}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all self-start sm:self-auto"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Probar en Pantalla Completa</span>
                </button>
              </div>

              {/* Two sub-cards: 3A Fondo del Splash, 3B Logotipo sobre el Fondo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 3A: FOTOGRAFÍA DE FONDO DEL SPLASH */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center">
                          A
                        </span>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                          Foto de Fondo del Splash
                        </h4>
                      </div>
                      {settings.splashBgUrl && settings.splashBgUrl !== '/splash-taxi.jpg' ? (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Foto Subida
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Taxi Original
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 mb-3">
                      Foto panorámica o del taxi ejecutivo en resolución completa.
                    </p>

                    {/* Preview box */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 h-40 bg-black group">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${settings.splashBgUrl || '/splash-taxi.jpg'}')` }}
                      />
                      <div
                        className="absolute inset-0 bg-[#020817]"
                        style={{ opacity: (settings.splashOverlayOpacity ?? 65) / 100 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
                        <span className="font-medium truncate">
                          {settings.splashBgUrl && settings.splashBgUrl !== '/splash-taxi.jpg'
                            ? 'Fondo Personalizado'
                            : 'Fondo Taxi Ejecutivo'}
                        </span>
                        <span className="font-mono text-amber-400 font-bold">
                          Oscuridad: {settings.splashOverlayOpacity ?? 65}%
                        </span>
                      </div>
                    </div>

                    {/* Darkness/Overlay Opacity Selector */}
                    <div className="mt-3 space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Nivel de Oscuridad del Fondo:</span>
                        <span className="text-amber-400 font-mono font-black">{settings.splashOverlayOpacity ?? 65}%</span>
                      </label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[30, 50, 65, 80, 90].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              const updated = { ...settings, splashOverlayOpacity: val };
                              setSettings(updated);
                              PachaStorage.saveSettings(updated);
                            }}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                              (settings.splashOverlayOpacity ?? 65) === val
                                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                          >
                            {val}%
                          </button>
                        ))}
                      </div>
                      <span className="text-[9px] text-slate-500 block">
                        Valores menores dejan ver más la foto; 65% es el ideal para lectura clara.
                      </span>
                    </div>
                  </div>

                  {/* Actions for Background */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                    <button
                      id="btn-upload-splash-bg"
                      type="button"
                      onClick={() => splashBgInputRef.current?.click()}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition active:scale-95 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{settings.splashBgUrl && settings.splashBgUrl !== '/splash-taxi.jpg' ? 'Cambiar Foto de Fondo' : 'Subir Foto de Fondo'}</span>
                    </button>

                    {settings.splashBgUrl && settings.splashBgUrl !== '/splash-taxi.jpg' && (
                      <button
                        id="btn-remove-splash-bg"
                        type="button"
                        onClick={() => handleRemoveAsset('splashBgUrl', 'Fondo de Pantalla de Carga')}
                        className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition"
                        title="Restablecer fondo al taxi ejecutivo original"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3B: LOGOTIPO / EMBLEMA SOBRE EL FONDO */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center">
                          B
                        </span>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                          Identidad Central: Ícono + Logotipo "PACHA" (Punto 2)
                        </h4>
                      </div>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Sincronizado con Punto 2
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-3">
                      En la pantalla de carga, sobre la foto de fondo, se muestra el <strong>Ícono de la App</strong> y justo debajo el <strong>Logotipo Tipográfico "PACHA"</strong> cargado en el Punto 2.
                    </p>

                    {/* Preview of logo composition */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 h-44 bg-gradient-to-b from-[#061533] to-[#020817] flex flex-col items-center justify-center p-3 text-center">
                      <div className="p-2.5 rounded-2xl bg-black/60 border-2 border-amber-500/40 shadow-xl mb-2 flex items-center justify-center">
                        <PachaIcon size={48} className="drop-shadow-lg" />
                      </div>

                      {/* Logotipo Tipográfico PACHA de Punto 2 */}
                      <div className="my-0.5 flex flex-col items-center">
                        <PachaWordmark className="h-6 sm:h-7 w-auto max-w-[160px] drop-shadow-md" />
                        <div className="mt-0.5 w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
                      </div>

                      <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                        {settings.brandSubtitle || 'Transporte Ejecutivo'}
                      </p>
                    </div>

                    {/* Logo Size and Style Controls */}
                    <div className="mt-3 space-y-2.5">
                      {/* Size selector */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Tamaño del Logo en Splash:
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { id: 'sm', label: 'Pequeño' },
                            { id: 'md', label: 'Mediano' },
                            { id: 'lg', label: 'Grande' },
                            { id: 'xl', label: 'X-Grande' }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                const updated = { ...settings, splashLogoSize: item.id as any };
                                setSettings(updated);
                                PachaStorage.saveSettings(updated);
                              }}
                              className={`py-1 px-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                (settings.splashLogoSize || 'md') === item.id
                                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Style selector */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Estilo del Marco:
                          </label>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = { ...settings, splashLogoStyle: 'framed' as any };
                                setSettings(updated);
                                PachaStorage.saveSettings(updated);
                              }}
                              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                (settings.splashLogoStyle || 'framed') === 'framed'
                                  ? 'bg-purple-600 text-white font-black'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              Cristal Dorado
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = { ...settings, splashLogoStyle: 'floating' as any };
                                setSettings(updated);
                                PachaStorage.saveSettings(updated);
                              }}
                              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                settings.splashLogoStyle === 'floating'
                                  ? 'bg-purple-600 text-white font-black'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              Flotante
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Insignia de Ruta:
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...settings, splashShowRouteBadge: !(settings.splashShowRouteBadge !== false) };
                              setSettings(updated);
                              PachaStorage.saveSettings(updated);
                            }}
                            className={`w-full py-1 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                              settings.splashShowRouteBadge !== false
                                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {settings.splashShowRouteBadge !== false ? '✓ Mostrar Ruta' : '✕ Ocultar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Logo */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                    <button
                      id="btn-upload-splash-logo"
                      type="button"
                      onClick={() => splashLogoInputRef.current?.click()}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition active:scale-95 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{settings.splashLogoUrl ? 'Cambiar Logotipo del Splash' : 'Subir Logotipo del Splash'}</span>
                    </button>

                    {settings.splashLogoUrl && (
                      <button
                        id="btn-remove-splash-logo"
                        type="button"
                        onClick={() => handleRemoveAsset('splashLogoUrl', 'Logotipo del Splash Screen')}
                        className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition"
                        title="Eliminar logo personalizado y volver al isotipo original"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* 4. BANNER DE PORTADA PRINCIPAL (HERO BANNER) */}
            <div className="p-5 rounded-3xl bg-[#0B192C]/90 border border-purple-500/30 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        4. Banner de Portada Principal
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Imagen decorativa de fondo en la sección de bienvenida pública.
                      </p>
                    </div>
                  </div>

                  {settings.heroBgUrl ? (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Subido por ti
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Degradado Marino
                    </span>
                  )}
                </div>

                {/* Visual Preview Box */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 h-44 my-4 bg-gradient-to-b from-[#071322] to-[#0B192C] flex items-center justify-center">
                  {settings.heroBgUrl ? (
                    <>
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${settings.heroBgUrl}')` }}
                      />
                      <div className="absolute inset-0 bg-slate-950/60" />
                    </>
                  ) : null}

                  <div className="relative z-10 text-center px-4">
                    <PachaLogo variant="compact" size="sm" showRoute={false} className="justify-center mb-1.5" />
                    <p className="text-[11px] text-slate-300 line-clamp-2 max-w-xs">
                      {settings.heroSubtitle || 'Viaja con comodidad, máxima seguridad y puntualidad en Manabí.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload & Delete Controls */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  id="btn-upload-hero-bg"
                  type="button"
                  onClick={() => heroInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{settings.heroBgUrl ? 'Cambiar Banner' : 'Subir Banner de Portada'}</span>
                </button>

                {settings.heroBgUrl && (
                  <button
                    id="btn-remove-hero-bg"
                    type="button"
                    onClick={() => handleRemoveAsset('heroBgUrl', 'Banner de Portada')}
                    className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-all"
                    title="Eliminar banner de portada"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 5. BANNERS DE RESERVAS Y ENCOMIENDAS */}
            <div className="p-5 rounded-3xl bg-[#0B192C]/90 border border-purple-500/30 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        5. Banners de Servicios (Reservas / Encomiendas)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Imágenes decorativas en los flujos de viaje y envíos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 my-4">
                  {/* Booking banner preview */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase block">Reserva de Viajes</span>
                    <div className="h-20 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 relative">
                      {settings.bookingBannerUrl ? (
                        <img src={settings.bookingBannerUrl} alt="Banner Reservas" className="w-full h-full object-cover" />
                      ) : (
                        <Car className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => bookingBannerInputRef.current?.click()}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase transition"
                    >
                      {settings.bookingBannerUrl ? 'Cambiar' : 'Subir'}
                    </button>
                  </div>

                  {/* Shipment banner preview */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase block">Encomiendas</span>
                    <div className="h-20 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 relative">
                      {settings.shipmentBannerUrl ? (
                        <img src={settings.shipmentBannerUrl} alt="Banner Encomiendas" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => shipmentBannerInputRef.current?.click()}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase transition"
                    >
                      {settings.shipmentBannerUrl ? 'Cambiar' : 'Subir'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                Se muestran como cabecera visual al reservar viajes o registrar encomiendas.
              </div>
            </div>

            {/* 6. FOTO OFICIAL DE LA FLOTA DE TAXIS */}
            <div className="p-5 rounded-3xl bg-[#0B192C]/90 border border-purple-500/30 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        6. Fotografía Oficial de Taxis / Flota
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Foto predeterminada mostrada en tarjetas de vehículos y asignación.
                      </p>
                    </div>
                  </div>

                  {settings.defaultVehiclePhotoUrl ? (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Subido por ti
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Auto Estándar
                    </span>
                  )}
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-slate-800 h-44 my-4 bg-slate-950 flex items-center justify-center">
                  {settings.defaultVehiclePhotoUrl ? (
                    <img
                      src={settings.defaultVehiclePhotoUrl}
                      alt="Taxi Oficial"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Car className="w-10 h-10 text-amber-500/50" />
                      <span className="text-xs font-mono">Sedán Ejecutivo PACHA</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload & Delete Controls */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  id="btn-upload-vehicle-photo"
                  type="button"
                  onClick={() => vehicleInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{settings.defaultVehiclePhotoUrl ? 'Cambiar Foto de Taxi' : 'Subir Foto de Vehículo'}</span>
                </button>

                {settings.defaultVehiclePhotoUrl && (
                  <button
                    id="btn-remove-vehicle-photo"
                    type="button"
                    onClick={() => handleRemoveAsset('defaultVehiclePhotoUrl', 'Foto de Vehículo')}
                    className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-all"
                    title="Eliminar foto de vehículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= SECTION 2: TEXTS & BRAND MESSAGING ================= */}
      {activeSection === 'TEXTS' && (
        <div className="p-6 rounded-3xl bg-[#0B192C]/90 border border-purple-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Type className="w-5 h-5 text-amber-400" />
                <span>Textos, Titulares y Eslóganes de la Aplicación</span>
              </h3>
              <p className="text-xs text-slate-400">
                Edita los textos de marca y mensajes institucionales. Se actualizan al instante en botones, encabezados y pantallas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Brand Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nombre de Marca Principal
              </label>
              <input
                id="input-text-brand-title"
                type="text"
                value={settings.brandTitle || 'PACHA'}
                onChange={(e) => handleTextChange('brandTitle', e.target.value)}
                placeholder="PACHA"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Ejemplo: PACHA</span>
            </div>

            {/* Brand Subtitle */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Subtítulo de Marca
              </label>
              <input
                id="input-text-brand-subtitle"
                type="text"
                value={settings.brandSubtitle || 'TRANSPORTE EJECUTIVO'}
                onChange={(e) => handleTextChange('brandSubtitle', e.target.value)}
                placeholder="TRANSPORTE EJECUTIVO"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Acompaña al logo en todas las pantallas</span>
            </div>

            {/* Main Route Origin */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Ciudad Origen Principal
              </label>
              <input
                id="input-text-route-origin"
                type="text"
                value={settings.brandRouteOrigin || 'Portoviejo'}
                onChange={(e) => handleTextChange('brandRouteOrigin', e.target.value)}
                placeholder="Portoviejo"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Main Route Destination */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Ciudad Destino Principal
              </label>
              <input
                id="input-text-route-dest"
                type="text"
                value={settings.brandRouteDestination || 'Pedernales'}
                onChange={(e) => handleTextChange('brandRouteDestination', e.target.value)}
                placeholder="Pedernales"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Badge Text */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Texto de Insignia de Servicio
              </label>
              <input
                id="input-text-badge-text"
                type="text"
                value={settings.brandBadgeText || 'Ida y Vuelta'}
                onChange={(e) => handleTextChange('brandBadgeText', e.target.value)}
                placeholder="Ida y Vuelta"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Insignia dorada bajo la ruta</span>
            </div>

            {/* Hero Slogan */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Slogan de Portada Pública
              </label>
              <input
                id="input-text-hero-slogan"
                type="text"
                value={settings.heroSubtitle || 'Viaja con comodidad, máxima seguridad y puntualidad en Manabí.'}
                onChange={(e) => handleTextChange('heroSubtitle', e.target.value)}
                placeholder="Viaja con comodidad, máxima seguridad y puntualidad en Manabí."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Splash Loading Text */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Texto de Carga (Pantalla Splash)
              </label>
              <input
                id="input-text-splash-loading"
                type="text"
                value={settings.splashLoadingText || 'Cargando aplicación...'}
                onChange={(e) => handleTextChange('splashLoadingText', e.target.value)}
                placeholder="Cargando aplicación..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Splash Subtext */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Subtexto de Pantalla de Carga
              </label>
              <input
                id="input-text-splash-subtext"
                type="text"
                value={settings.splashSubtext || 'Portoviejo ↔ Pedernales • Confort y Puntualidad'}
                onChange={(e) => handleTextChange('splashSubtext', e.target.value)}
                placeholder="Portoviejo ↔ Pedernales • Confort y Puntualidad"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Login Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Título en Modal de Inicio de Sesión
              </label>
              <input
                id="input-text-login-title"
                type="text"
                value={settings.loginTitle || 'Iniciar Sesión'}
                onChange={(e) => handleTextChange('loginTitle', e.target.value)}
                placeholder="Iniciar Sesión"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Login Subtitle */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Subtítulo en Modal de Inicio de Sesión
              </label>
              <input
                id="input-text-login-subtitle"
                type="text"
                value={settings.loginSubtitle || 'Acceso a plataforma PACHA Transporte Ejecutivo'}
                onChange={(e) => handleTextChange('loginSubtitle', e.target.value)}
                placeholder="Acceso a plataforma PACHA Transporte Ejecutivo"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              id="btn-save-texts"
              type="button"
              onClick={handleSaveAll}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Todos los Textos</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= SECTION: THEME & COLOR ACCENT ================= */}
      {activeSection === 'THEME' && (
        <div className="p-6 rounded-3xl bg-[#0B192C]/90 border border-purple-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" />
                <span>Paleta de Color y Tema de Acento de la App</span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona la tonalidad insignia que acompañará a la marca y los detalles luminosos de la interfaz.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                id: 'gold',
                name: 'Oro Manabita',
                desc: 'Predeterminado oficial PACHA',
                hex: '#F59E0B',
                gradient: 'from-amber-500 to-yellow-300',
                border: 'border-amber-500'
              },
              {
                id: 'blue',
                name: 'Azul Zafiro Ejecutivo',
                desc: 'Tonos corporativos y nocturnos',
                hex: '#3B82F6',
                gradient: 'from-blue-600 to-cyan-400',
                border: 'border-blue-500'
              },
              {
                id: 'emerald',
                name: 'Esmeralda Costero',
                desc: 'Estilo fresco y natural',
                hex: '#10B981',
                gradient: 'from-emerald-500 to-teal-300',
                border: 'border-emerald-500'
              },
              {
                id: 'purple',
                name: 'Púrpura Imperial',
                desc: 'Elegancia y distinción VIP',
                hex: '#A855F7',
                gradient: 'from-purple-600 to-pink-400',
                border: 'border-purple-500'
              },
              {
                id: 'rose',
                name: 'Rubí Platino',
                desc: 'Alta energía y deportividad',
                hex: '#F43F5E',
                gradient: 'from-rose-600 to-amber-400',
                border: 'border-rose-500'
              }
            ].map((theme) => {
              const isSelected = (settings.appAccentTheme || 'gold') === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    const updated = { ...settings, appAccentTheme: theme.id as any };
                    setSettings(updated);
                    PachaStorage.saveSettings(updated);
                    if (onNotify) onNotify(`Tema visual cambiado a: ${theme.name}`);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-36 ${
                    isSelected
                      ? 'bg-slate-900 border-2 ' + theme.border + ' shadow-xl shadow-amber-500/10 scale-102'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${theme.gradient} shadow-md`} />
                      {isSelected && (
                        <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                          Activo
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-white">{theme.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{theme.desc}</p>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500">
                    Acento: {theme.hex}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>¿Deseas aplicar los cambios en todo el sistema?</span>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase transition"
            >
              Guardar Tema
            </button>
          </div>
        </div>
      )}

      {/* ================= SECTION: CLIENT GUIDE STEPS EDITOR ================= */}
      {activeSection === 'GUIDE_STEPS' && (
        <GuideStepsEditor
          settings={settings}
          onUpdateSettings={(updated) => setSettings(updated)}
          onNotify={onNotify}
        />
      )}

      {/* ================= SECTION 3: LIVE PREVIEW ================= */}
      {activeSection === 'PREVIEW' && (
        <div className="p-6 rounded-3xl bg-[#0B192C]/90 border border-purple-500/30 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <span>Simulador en Vivo de la Aplicación</span>
              </h3>
              <p className="text-xs text-slate-400">
                Así es exactamente como los usuarios y clientes ven tu aplicación ahora mismo con tus imágenes, logos y textos configurados.
              </p>
            </div>

            <button
              id="btn-preview-trigger-splash"
              type="button"
              onClick={handleTestSplashLive}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Probar Splash Completo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Mobile Phone Mockup 1: Splash Loading Screen */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black uppercase text-amber-400 mb-3 tracking-widest flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" /> Pantalla de Carga (Splash Screen)
              </span>

              <div className="w-[280px] h-[520px] rounded-[36px] bg-black border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col justify-between p-5">
                {/* Custom Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${settings.splashBgUrl || '/splash-taxi.jpg'}')` }}
                />
                <div
                  className="absolute inset-0 bg-[#020817]"
                  style={{ opacity: (settings.splashOverlayOpacity ?? 65) / 100 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />

                {/* Simulated Top Bar */}
                <div className="relative z-10 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>9:41 AM</span>
                  <span className="text-amber-400">5G • 100%</span>
                </div>

                {/* Centered Identity: Icono de la App + Logotipo Tipográfico debajo del Icono */}
                <div className="relative z-10 flex flex-col items-center text-center my-auto">
                  <div className="p-3 rounded-2xl bg-black/65 border-2 border-amber-500/40 shadow-xl mb-2 flex items-center justify-center">
                    <PachaIcon size={52} />
                  </div>

                  {/* Logotipo Tipográfico PACHA de Punto 2 (Wordmark) */}
                  <div className="my-1 flex flex-col items-center">
                    <PachaWordmark className="h-7 w-auto max-w-[170px] drop-shadow-md" />
                    <div className="mt-0.5 w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
                  </div>

                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-0.5 drop-shadow">
                    {settings.brandSubtitle || 'Transporte Ejecutivo'}
                  </p>

                  {settings.splashShowRouteBadge !== false && (
                    <div className="mt-2 text-[9px] px-2.5 py-0.5 rounded-full bg-black/70 border border-amber-500/40 text-slate-200 backdrop-blur-sm">
                      {settings.brandRouteOrigin || 'Portoviejo'} ↔ {settings.brandRouteDestination || 'Pedernales'}
                    </div>
                  )}
                </div>

                {/* Bottom Loading Progress */}
                <div className="relative z-10 space-y-1.5 mb-2">
                  <div className="flex justify-between text-[10px] text-amber-300 font-bold">
                    <span>{settings.splashLoadingText || 'Cargando aplicación...'}</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full h-3 bg-black/90 rounded-full p-0.5 border border-amber-500/60">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 w-full" />
                  </div>
                  <p className="text-[9px] text-slate-400 text-center line-clamp-1">
                    {settings.splashSubtext || 'Portoviejo ↔ Pedernales • Confort y Puntualidad'}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Phone Mockup 2: Header & Main Portal */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-black uppercase text-purple-400 mb-3 tracking-widest flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Portada Pública & Encabezado
              </span>

              <div className="w-[280px] h-[520px] rounded-[36px] bg-[#071322] border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4">
                {/* Custom Hero Background if set */}
                {settings.heroBgUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url('${settings.heroBgUrl}')` }}
                  />
                )}

                {/* Simulated Header Bar */}
                <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800">
                  <PachaLogo variant="compact" size="sm" showRoute={false} />
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] text-amber-400 font-bold">
                    ≡
                  </div>
                </div>

                {/* Hero Center Identity */}
                <div className="relative z-10 flex flex-col items-center text-center my-auto px-2">
                  <PachaLogo variant="full" size="md" showRoute={true} />
                  <p className="text-[10px] text-slate-300 mt-2 line-clamp-2">
                    {settings.heroSubtitle || 'Viaja con comodidad, máxima seguridad y puntualidad en Manabí.'}
                  </p>

                  <div className="w-full mt-4 space-y-2">
                    <div className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider text-center shadow-md">
                      Reservar Viaje
                    </div>
                    <div className="w-full py-2 rounded-xl bg-[#1E3E62] text-amber-300 font-bold text-[11px] uppercase tracking-wider text-center border border-amber-500/40">
                      Enviar Encomienda
                    </div>
                  </div>
                </div>

                {/* Simulated Bottom Nav */}
                <div className="relative z-10 flex items-center justify-around py-2 border-t border-slate-800 text-[9px] text-slate-400">
                  <span className="text-amber-400 font-bold">Inicio</span>
                  <span>Viajes</span>
                  <span>Encomienda</span>
                  <span>Perfil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
