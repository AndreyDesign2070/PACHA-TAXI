import React, { useState } from 'react';
import {
  CheckCircle2,
  Car,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Sparkles,
  QrCode,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface InteractiveSimulatorProps {
  onGoRealBooking?: () => void;
}

export const InteractiveSimulator: React.FC<InteractiveSimulatorProps> = ({
  onGoRealBooking
}) => {
  const [step, setStep] = useState<number>(1);
  const [origin, setOrigin] = useState<string>('Portoviejo');
  const [destination, setDestination] = useState<string>('Pedernales');
  const [passengers, setPassengers] = useState<number>(1);
  const [serviceType, setServiceType] = useState<'ESTANDAR' | 'VIP'>('ESTANDAR');
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA'>('EFECTIVO');

  const pricePerSeat = serviceType === 'VIP' ? 25 : 12;
  const totalPrice = pricePerSeat * (serviceType === 'VIP' ? 1 : passengers);

  const handleReset = () => {
    setStep(1);
    setOrigin('Portoviejo');
    setDestination('Pedernales');
    setPassengers(1);
    setServiceType('ESTANDAR');
    setPaymentMethod('EFECTIVO');
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-[#081527] border border-amber-500/40 text-white shadow-xl space-y-6">
      {/* Simulator Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Modo Simulador Interactivo
            </span>
            <span className="text-xs text-slate-400 font-medium">Prueba sin compromiso</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Simula tu viaje en 30 segundos</span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Descubre lo fácil y rápido que es reservar tu asiento en la flota ejecutiva de PACHA.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-500/50 transition-colors flex items-center gap-1.5 text-xs font-bold"
          title="Reiniciar simulador"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reiniciar</span>
        </button>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, label: '1. Ruta y Direcciones' },
          { num: 2, label: '2. Horario y Pasajeros' },
          { num: 3, label: '3. Pago y Confirmación' },
          { num: 4, label: '4. Boleto QR' }
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            className={`p-2 rounded-xl text-center text-xs font-black transition-all border ${
              step === s.num
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : step > s.num
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* STEP 1: RUTA Y DIRECCIONES */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Paso 1: Seleccionar tu Ruta y Direcciones</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Ciudad de Origen</span>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-amber-500 focus:outline-none"
                >
                  <option value="Portoviejo">Portoviejo (Terminal / Domicilio)</option>
                  <option value="Manta">Manta</option>
                  <option value="Bahía de Caráquez">Bahía de Caráquez</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Ciudad de Destino</span>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-amber-500 focus:outline-none"
                >
                  <option value="Pedernales">Pedernales (Centro / Domicilio)</option>
                  <option value="Jama">Jama</option>
                  <option value="Canoa">Canoa</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              💡 <strong>Dato clave:</strong> Te recogemos directamente en la puerta de tu domicilio o punto de referencia en {origin}.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
          >
            <span>Continuar a Fecha y Pasajeros</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: FECHA, HORA Y PASAJEROS */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Paso 2: Seleccionar Fecha, Hora del Viaje y Cantidad de Pasajeros</span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPassengers(num)}
                  className={`py-2.5 rounded-xl font-black text-xs transition-all border ${
                    passengers === num
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-102'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {num} {num === 1 ? 'Pasajero' : 'Pasajeros'}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-2 font-bold uppercase tracking-wider">
                Modalidad del Servicio:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setServiceType('ESTANDAR')}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    serviceType === 'ESTANDAR'
                      ? 'bg-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black text-white">Estándar Compartido</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">$12 / asiento</div>
                  <div className="text-[10px] text-emerald-400 mt-1">Confort total con otros clientes</div>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceType('VIP')}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    serviceType === 'VIP'
                      ? 'bg-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black text-amber-300">Ejecutivo VIP Exclusivo</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">$25 vehículo completo</div>
                  <div className="text-[10px] text-amber-400 mt-1">Viaje directo sin paradas</div>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Calculado:</span>
              <span className="text-base font-black text-amber-400">${totalPrice.toFixed(2)} USD</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-2/3 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>Continuar a Pago y Confirmación</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TIPO DE PAGO Y CONFIRMACION */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>Paso 3: Seleccionar el Tipo de Pago (Efectivo o Transferencia) y Confirmar el Viaje</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('EFECTIVO')}
                className={`p-4 rounded-xl text-left border transition-all ${
                  paymentMethod === 'EFECTIVO'
                    ? 'bg-slate-950 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-black text-emerald-400">Efectivo al Chofer</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Más Usado</span>
                </div>
                <p className="text-[11px] text-slate-300">Pagas directamente al chofer al momento de subir a la unidad.</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFERENCIA')}
                className={`p-4 rounded-xl text-left border transition-all ${
                  paymentMethod === 'TRANSFERENCIA'
                    ? 'bg-slate-950 border-amber-500 shadow-md ring-1 ring-amber-500'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-black text-amber-300">Transferencia Bancaria</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Pichincha / Guayaquil</span>
                </div>
                <p className="text-[11px] text-slate-300">Transfiere con anticipación y adjunta tu comprobante digital.</p>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex justify-between items-center">
              <span>Monto a cancelar al chofer:</span>
              <span className="text-sm font-black text-emerald-400">${totalPrice.toFixed(2)} USD</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="w-2/3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Generar Boleto Simulado</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RESULTADO SIMULADO (BOLETO DIGITAL) */}
      {step === 4 && (
        <div className="space-y-4 animate-in zoom-in-95 duration-500">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B1E38] to-[#081527] border-2 border-amber-500/50 shadow-2xl relative overflow-hidden">
            {/* Boleto Watermark */}
            <div className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SIMULACIÓN EXITOSA
            </div>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider font-brand">
                  Boleto Digital PACHA • Confirmado
                </h4>
                <p className="text-[11px] text-amber-400 font-bold">
                  {origin} ➔ {destination}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-3 border-y border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">Pasajeros</span>
                <span className="font-bold text-white">{passengers} asiento(s)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Servicio</span>
                <span className="font-bold text-amber-300">{serviceType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total</span>
                <span className="font-black text-emerald-400">${totalPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Pago</span>
                <span className="font-bold text-slate-200">{paymentMethod}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white text-slate-950">
                  <QrCode className="w-12 h-12" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Código de Abordaje QR</div>
                  <div className="text-[11px] text-slate-400">Escaneado por el chofer al subir</div>
                  <div className="text-[11px] text-amber-400 font-bold">Unidad M-045 asignada</div>
                </div>
              </div>

              {onGoRealBooking && (
                <button
                  type="button"
                  onClick={onGoRealBooking}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition"
                >
                  ¡Hacer Reserva Real Ahora!
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
            <span>¿Quieres simular otra ruta o servicio?</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-amber-400 hover:text-amber-300 font-bold underline"
            >
              Reiniciar Simulador
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
