import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  CreditCard,
  Banknote,
  Building2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  UploadCloud,
  FileText,
  Sparkles
} from 'lucide-react';
import { User, City, PaymentMethod, Booking } from '../../types';
import { PachaStorage } from '../../services/storage';
import { BankTransferQrSection } from '../common/BankTransferQrSection';

interface BookingFlowProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onBookingComplete: (booking: Booking) => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  currentUser,
  onOpenLogin,
  onBookingComplete
}) => {
  const [cities, setCities] = useState(() => PachaStorage.getActiveCities());
  const [settings, setSettings] = useState(() => PachaStorage.getSettings());

  useEffect(() => {
    const unsub = PachaStorage.subscribe(() => {
      setCities(PachaStorage.getActiveCities());
      setSettings(PachaStorage.getSettings());
    });
    return () => unsub();
  }, []);

  // Form State for 10-step flow
  const [originCityId, setOriginCityId] = useState<string>(cities[0]?.id || '');
  const [destinationCityId, setDestinationCityId] = useState<string>(cities[1]?.id || '');
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [travelDate, setTravelDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [travelTime, setTravelTime] = useState('08:00');
  const [passengerCount, setPassengerCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [transferReceipt, setTransferReceipt] = useState<string | null>(null);
  const [passengerNotes, setPassengerNotes] = useState('');

  // UI state
  const [step, setStep] = useState(1); // 1: Rutas y Direcciones, 2: Fecha, Hora y Pasajeros, 3: Tarifa y Pago, 4: Confirmación
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Dynamic Fare Calculation from Storage Table
  const originCity = cities.find((c) => c.id === originCityId);
  const destinationCity = cities.find((c) => c.id === destinationCityId);
  const currentFare = originCityId && destinationCityId
    ? PachaStorage.getFare(originCityId, destinationCityId)
    : null;

  const basePrice = currentFare ? currentFare.passengerPrice : 0;
  // Requirement 1: The fare assigned by admin is unique for 1 single passenger.
  // For each extra passenger, $3 is automatically added:
  const extraPassengers = Math.max(0, passengerCount - 1);
  const extraPassengerFee = extraPassengers * 3;
  const totalPrice = basePrice > 0 ? basePrice + extraPassengerFee : 0;

  const handleNextStep1 = () => {
    setError(null);
    if (!currentUser) {
      setError('DEBE INICIAR SESIÓN PARA PODER CONTINUAR CON EL VIAJE');
      onOpenLogin();
      return;
    }
    if (!originCityId || !destinationCityId) {
      setError('Seleccione ciudad de origen y ciudad de destino habilitadas.');
      return;
    }
    if (originCityId === destinationCityId) {
      setError('La ciudad de origen y destino no pueden ser la misma.');
      return;
    }
    if (!pickupAddress.trim()) {
      setError('Por favor ingrese la dirección exacta de recogida (calle, número o referencia).');
      return;
    }
    if (!destinationAddress.trim()) {
      setError('Por favor ingrese la dirección exacta de destino.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    setError(null);
    if (!currentUser) {
      setError('DEBE INICIAR SESIÓN PARA PODER CONTINUAR CON EL VIAJE');
      onOpenLogin();
      return;
    }
    if (!travelDate) {
      setError('Seleccione una fecha de viaje válida.');
      return;
    }
    if (!travelTime) {
      setError('Seleccione la hora aproximada de recogida.');
      return;
    }
    if (passengerCount < 1 || passengerCount > 4) {
      setError('El número de pasajeros debe ser entre 1 y 4 (capacidad máxima por vehículo ejecutivo).');
      return;
    }
    setStep(3);
  };

  const handleConfirmReservation = () => {
    setError(null);

    // Require client login (User Prompt: "COMO CLIENTE NO DEBO PODER ENVIAR ENCOMIENDA NI RESERVAR VIAJE SI NO ME HE REGISTRADO/INICIADO SESION")
    if (!currentUser) {
      setError('DEBE INICIAR SESIÓN PARA PODER CONTINUAR CON EL VIAJE');
      onOpenLogin();
      return;
    }

    if (currentUser.role !== 'CUSTOMER' && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      setError('Debe estar identificado como cliente para solicitar un viaje.');
      return;
    }

    if (!originCity || !destinationCity) {
      setError('Error al validar las ciudades.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newBooking = PachaStorage.createBooking({
        customerId: currentUser.id,
        customerName: currentUser.fullName,
        customerPhone: currentUser.phone,
        customerCedula: currentUser.cedula || currentUser.username,
        tripType: 'IDA',
        origin: originCity.name,
        destination: destinationCity.name,
        originCityName: originCity.name,
        destinationCityName: destinationCity.name,
        pickupAddress: pickupAddress.trim(),
        pickupReference: 'Punto de recogida coordinado',
        destAddress: destinationAddress.trim(),
        destinationAddress: destinationAddress.trim(),
        destReference: 'Punto de llegada coordinado',
        passengers: passengerCount,
        passengerCount,
        departureDate: travelDate,
        travelDate,
        departureTime: travelTime,
        travelTime,
        totalPrice,
        paymentMethod: paymentMethod === 'TRANSFER' ? 'TRANSFERENCIA' : 'EFECTIVO',
        paymentStatus: paymentMethod === 'TRANSFER' && transferReceipt ? 'CONFIRMADO' : 'PENDIENTE'
      });

      setIsSubmitting(false);
      setConfirmedBooking(newBooking);
      setStep(4);
      onBookingComplete(newBooking);
    }, 400);
  };

  // Mock file upload for transfer receipt
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTransferReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 text-white">
      {/* Optional Super Admin Custom Banner */}
      {settings.bookingBannerUrl && (
        <div className="mb-5 rounded-2xl overflow-hidden border border-amber-500/30 h-32 sm:h-36 relative shadow-lg">
          <img
            src={settings.bookingBannerUrl}
            alt="Banner de Reservas"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
            <p className="text-xs font-bold text-amber-300">
              {settings.heroSubtitle || 'Viaja con comodidad y puntualidad en Manabí.'}
            </p>
          </div>
        </div>
      )}

      {/* Title & Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
            Reserva de Servicio Ejecutivo
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {step === 4 ? 'Confirmado' : `Fase ${step} de 3`}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white font-brand">
          {step === 1 && 'Origen, Destino y Direcciones'}
          {step === 2 && 'Fecha, Horario y Pasajeros'}
          {step === 3 && 'Tarifa Oficial y Pago'}
          {step === 4 && '¡Reserva Solicitada con Éxito!'}
        </h2>
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Unauthenticated User Warning (User requirement: "DEBE APARECER EL AVISO QUE DEBO INICIAR SESION PARA PODER CONTINUAR CON EL VIAJE/ENCOMIENDA") */}
      {!currentUser && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-200 text-xs font-black flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>DEBE INICIAR SESIÓN PARA PODER CONTINUAR CON SU RESERVA DE VIAJE</span>
          </div>
          <button
            type="button"
            onClick={onOpenLogin}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase shrink-0 transition"
          >
            Iniciar Sesión
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: CITIES & EXACT ADDRESSES */}
      {step === 1 && (
        <div className="space-y-4 bg-[#0B192C] p-5 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl">
          {/* Origin Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Ciudad de Origen (Autorizada) *</span>
            </label>
            <select
              id="select-booking-origin"
              value={originCityId}
              onChange={(e) => setOriginCityId(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} (Manabí)
                </option>
              ))}
            </select>
          </div>

          {/* Destination Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Ciudad de Destino (Autorizada) *</span>
            </label>
            <select
              id="select-booking-destination"
              value={destinationCityId}
              onChange={(e) => setDestinationCityId(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} (Manabí)
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Address */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              3. Dirección Exacta de Recogida *
            </label>
            <textarea
              id="input-booking-pickup-address"
              rows={2}
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Ej. Calle Pedro Gual y 10 de Agosto, frente a la farmacia, Portoviejo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-amber-400 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">El conductor llegará a esta dirección.</p>
          </div>

          {/* Destination Address */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              4. Dirección Exacta de Destino *
            </label>
            <textarea
              id="input-booking-dest-address"
              rows={2}
              required
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder="Ej. Malecón de Pedernales, Hotel Costa Azul, Pedernales"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-amber-400 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">Punto final donde serás dejado.</p>
          </div>

          <button
            id="btn-next-step1"
            type="button"
            onClick={handleNextStep1}
            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>CONTINUAR A FECHA Y PASAJEROS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: DATE, TIME & PASSENGERS */}
      {step === 2 && (
        <div className="space-y-4 bg-[#0B192C] p-5 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Travel Date */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>5. Fecha del Viaje *</span>
              </label>
              <input
                id="input-booking-date"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Travel Time */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>6. Hora Aproximada *</span>
              </label>
              <input
                id="input-booking-time"
                type="time"
                required
                value={travelTime}
                onChange={(e) => setTravelTime(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Passenger Count (Max 4 passengers) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>7. Cantidad de Pasajeros (Máximo 4 por vehículo) *</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  id={`btn-passengers-${num}`}
                  type="button"
                  onClick={() => setPassengerCount(num)}
                  className={`py-3 rounded-xl border text-center font-bold text-sm transition-all ${
                    passengerCount === num
                      ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {num} {num === 1 ? 'Persona' : 'Personas'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Todos los vehículos ejecutivos de PACHA cuentan con aire acondicionado y capacidad máxima para 4 pasajeros para asegurar comodidad total.
            </p>
            <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Tarifa única:</strong> La tarifa fijada cubre 1 pasajero. Por cada pasajero adicional se suman automáticamente solo <strong>$3.00</strong>.
              </span>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Instrucciones adicionales para el conductor (Opcional)
            </label>
            <input
              id="input-booking-notes"
              type="text"
              value={passengerNotes}
              onChange={(e) => setPassengerNotes(e.target.value)}
              placeholder="Ej. Llevo una maleta grande, o portón color negro"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            <button
              id="btn-next-step2"
              type="button"
              onClick={handleNextStep2}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>VER TARIFA Y PAGOS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AUTOMATIC FARE CALCULATION & PAYMENT METHOD */}
      {step === 3 && (
        <div className="space-y-5 bg-[#0B192C] p-5 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl">
          {/* Automatic Fare Breakdown Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#112240] to-[#0A192F] border border-amber-500/40">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                  8. Cálculo Automático de Tarifa
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {originCity?.name} ↔ {destinationCity?.name}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  ${totalPrice.toFixed(2)}
                </span>
                <p className="text-[10px] text-slate-400">Total a Pagar (USD)</p>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Tarifa de viaje (1 solo pasajero):</span>
                <span className="font-semibold text-white">${basePrice.toFixed(2)}</span>
              </div>
              {extraPassengers > 0 ? (
                <div className="flex justify-between text-amber-300">
                  <span>Pasajeros adicionales ({extraPassengers} × $3.00 c/u):</span>
                  <span className="font-bold font-mono">+${extraPassengerFee.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Pasajeros adicionales:</span>
                  <span>Sin costo extra (1 pasajero)</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Total de pasajeros:</span>
                <span className="font-semibold text-white">{passengerCount} {passengerCount === 1 ? 'persona' : 'personas'}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Tiempo estimado de viaje:</span>
                <span>{currentFare?.estimatedMinutes ? `${Math.round(currentFare.estimatedMinutes / 60)}h ${currentFare.estimatedMinutes % 60}m` : 'Ruta directa'}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>9. Método de Pago *</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-payment-cash"
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Efectivo al Conductor</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Paga directamente al chofer en efectivo al iniciar o culminar tu viaje.
                  </p>
                </div>
              </button>

              <button
                id="btn-payment-transfer"
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  paymentMethod === 'TRANSFER'
                    ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Transferencia Bancaria</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Transfiere a la cuenta oficial de PACHA y sube el comprobante.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* If Transfer: Show Bank QR Section and Bank Details (User requirement: "ESOS QR DEBEN APARECERLE AL CLIENTE CUANDO SELECCIONA LA OPCION TRANSFERENCIA PARA QUE PUEDA ESCANEAR Y LO LLEVE DIRECTO A PAGAR") */}
          {paymentMethod === 'TRANSFER' && (
            <div className="space-y-4">
              <BankTransferQrSection
                settings={settings}
                amount={totalPrice}
              />

              {/* Upload Receipt Input */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Comprobante de Transferencia (Foto o Captura)
                </label>
                <p className="text-[11px] text-slate-400">
                  Adjunta el comprobante emitido por tu banco tras realizar la transferencia o escaneo del código QR.
                </p>
                <input
                  id="input-transfer-receipt"
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                />
                {transferReceipt && (
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Comprobante adjuntado correctamente</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* User Status Notice */}
          {!currentUser && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
              <span>Debes identificarte con tu cédula para confirmar la reserva.</span>
              <button
                type="button"
                onClick={onOpenLogin}
                className="font-bold underline text-white hover:text-amber-400"
              >
                Identificarme
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            <button
              id="btn-confirm-booking-step10"
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmReservation}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all disabled:opacity-50 active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Procesando...' : '10. CONFIRMAR RESERVA'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRMATION & SUMMARY */}
      {step === 4 && confirmedBooking && (
        <div className="bg-[#0B192C] p-6 sm:p-8 rounded-3xl border border-amber-500/30 text-center shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Estado: SOLICITADA
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              ¡Tu viaje ha sido registrado!
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              Nuestro equipo de despacho de PACHA asignará un conductor ejecutivo a la brevedad. Recibirás una notificación en la app y por WhatsApp.
            </p>
          </div>

          {/* Ticket Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Código de Reserva:</span>
              <span className="font-mono font-bold text-amber-400">{confirmedBooking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ruta:</span>
              <span className="font-bold text-white">
                {confirmedBooking.originCityName} → {confirmedBooking.destinationCityName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fecha y Hora:</span>
              <span className="font-semibold text-white">
                {confirmedBooking.travelDate} a las {confirmedBooking.travelTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recogida:</span>
              <span className="text-white text-right max-w-[200px] truncate">{confirmedBooking.pickupAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total:</span>
              <span className="font-bold text-amber-400 font-mono text-sm">
                ${confirmedBooking.totalPrice.toFixed(2)} ({confirmedBooking.passengerCount} pas.)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="btn-new-booking"
              onClick={() => {
                setStep(1);
                setConfirmedBooking(null);
                setPickupAddress('');
                setDestinationAddress('');
              }}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase"
            >
              Hacer otra reserva
            </button>
            <a
              id="btn-whatsapp-booking"
              href={`https://wa.me/${settings.supportWhatsApp}?text=Hola%20PACHA,%20acabo%20de%20solicitar%20el%20viaje%20${confirmedBooking.id}%20desde%20${confirmedBooking.originCityName}%20hacia%20${confirmedBooking.destinationCityName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase shadow-md flex items-center justify-center gap-2"
            >
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
