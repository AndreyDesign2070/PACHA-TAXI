import React, { useState } from 'react';
import {
  Package,
  MapPin,
  User,
  Phone,
  KeyRound,
  CreditCard,
  Banknote,
  Building2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { User as UserType, City, PaymentMethod, Shipment } from '../../types';
import { PachaStorage } from '../../services/storage';

interface ShipmentFlowProps {
  currentUser: UserType | null;
  onOpenLogin: () => void;
  onShipmentComplete: (shipment: Shipment) => void;
}

export const ShipmentFlow: React.FC<ShipmentFlowProps> = ({
  currentUser,
  onOpenLogin,
  onShipmentComplete
}) => {
  const cities = PachaStorage.getActiveCities();
  const settings = PachaStorage.getSettings();

  const [originCityId, setOriginCityId] = useState(cities[0]?.id || '');
  const [destinationCityId, setDestinationCityId] = useState(cities[1]?.id || '');
  const [senderName, setSenderName] = useState(currentUser?.fullName || '');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [description, setDescription] = useState('');
  const [approxWeightKg, setApproxWeightKg] = useState(2);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedShipment, setConfirmedShipment] = useState<Shipment | null>(null);

  const originCity = cities.find((c) => c.id === originCityId);
  const destinationCity = cities.find((c) => c.id === destinationCityId);
  const fare = originCityId && destinationCityId ? PachaStorage.getFare(originCityId, destinationCityId) : null;
  const basePrice = fare ? fare.shipmentBasePrice : 6.0;

  // Weight surcharge: $0.50 per kg above 5kg
  const extraWeightFee = approxWeightKg > 5 ? (approxWeightKg - 5) * 0.5 : 0;
  const totalPrice = basePrice + extraWeightFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      onOpenLogin();
      return;
    }

    if (originCityId === destinationCityId) {
      setError('La ciudad de origen y destino deben ser distintas.');
      return;
    }

    if (!senderName.trim() || !senderPhone.trim() || !receiverName.trim() || !receiverPhone.trim()) {
      setError('Por favor complete los datos de contacto de remitente y destinatario.');
      return;
    }

    if (!description.trim() || !deliveryAddress.trim()) {
      setError('Por favor describa el paquete e indique la dirección exacta de entrega.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newShipment = PachaStorage.createShipment({
        customerId: currentUser.id,
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        recipientName: receiverName.trim(),
        recipientPhone: receiverPhone.trim(),
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        origin: originCity?.name || 'Portoviejo',
        destination: destinationCity?.name || 'Pedernales',
        originCityName: originCity?.name || 'Portoviejo',
        destinationCityName: destinationCity?.name || 'Pedernales',
        deliveryAddress: deliveryAddress.trim(),
        description: description.trim(),
        packageDescription: description.trim(),
        packageCount: 1,
        approxSize: approxWeightKg > 10 ? 'GRANDE' : approxWeightKg > 5 ? 'MEDIANO' : 'PEQUEÑO',
        approxWeightKg,
        declaredValue: 50.0,
        price: totalPrice,
        paymentMethod,
        paymentStatus: 'PENDIENTE'
      });

      setIsSubmitting(false);
      setConfirmedShipment(newShipment);
      onShipmentComplete(newShipment);
    }, 400);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 text-white">
      {/* Optional Super Admin Custom Banner */}
      {settings.shipmentBannerUrl && (
        <div className="mb-5 rounded-2xl overflow-hidden border border-amber-500/30 h-32 sm:h-36 relative shadow-lg">
          <img
            src={settings.shipmentBannerUrl}
            alt="Banner de Encomiendas"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
            <p className="text-xs font-bold text-amber-300">
              Transporte seguro y puntual de sobres, bultos y encomiendas en Manabí.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
          Servicio de Encomiendas Seguras PACHA
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white font-brand mt-1">
          {confirmedShipment ? '¡Encomienda Registrada!' : 'Envío de Paquetes y Documentos'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Entregas puerta a puerta con código de seguridad de 4 dígitos.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {!confirmedShipment ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-[#0B192C] p-5 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl">
          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Ciudad de Origen *
              </label>
              <select
                id="select-shipment-origin"
                value={originCityId}
                onChange={(e) => setOriginCityId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Ciudad de Destino *
              </label>
              <select
                id="select-shipment-destination"
                value={destinationCityId}
                onChange={(e) => setDestinationCityId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sender Details */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Datos de Quien Envía (Remitente)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                id="input-sender-name"
                type="text"
                required
                placeholder="Nombre completo *"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
              <input
                id="input-sender-phone"
                type="tel"
                required
                placeholder="Teléfono Celular *"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Receiver Details */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Datos de Quien Recibe (Destinatario)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                id="input-receiver-name"
                type="text"
                required
                placeholder="Nombre de quien recibe *"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
              <input
                id="input-receiver-phone"
                type="tel"
                required
                placeholder="Teléfono de quien recibe *"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Package Description & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Descripción del Paquete *
              </label>
              <input
                id="input-package-desc"
                type="text"
                required
                placeholder="Ej. Sobre con documentos legales, o caja de ropa"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Peso Aprox. (Kg) *
              </label>
              <input
                id="input-package-weight"
                type="number"
                min={0.5}
                max={30}
                step={0.5}
                required
                value={approxWeightKg}
                onChange={(e) => setApproxWeightKg(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Dirección Exacta de Entrega *
            </label>
            <textarea
              id="input-package-address"
              rows={2}
              required
              placeholder="Ej. Calle Eloy Alfaro, casa de dos pisos color crema, frente al parque"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Método de Pago *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-shipment-cash"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                  paymentMethod === 'CASH'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                id="btn-shipment-transfer"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                  paymentMethod === 'TRANSFER'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Transferencia</span>
              </button>
            </div>

            {/* Transfer Details Card */}
            {paymentMethod === 'TRANSFER' && (
              <div className="mt-3 p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Datos Bancarios Oficiales de PACHA</span>
                  </h5>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                    Verificada
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Banco</span>
                    <span className="font-bold text-white text-xs">{settings.bankName || 'Banco Pichincha'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Tipo de Cuenta</span>
                    <span className="font-bold text-white text-xs">{settings.bankType || 'Cuenta Corriente'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Número de Cuenta</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">{settings.bankAccount || '2100889922'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Titular / Empresa</span>
                    <span className="font-semibold text-white text-xs">{settings.bankHolder || 'PACHA TRANSPORTE EJECUTIVO CIA. LTDA.'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">RUC de la Empresa</span>
                    <span className="font-mono font-bold text-white text-xs">{settings.bankIdNumber || '1391827364001'}</span>
                  </div>
                </div>

                <p className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  ℹ️ Realiza la transferencia de <strong>${totalPrice.toFixed(2)}</strong>. Al entregar el paquete o entregárselo al conductor, muestra tu comprobante digital de transferencia.
                </p>
              </div>
            )}
          </div>

          {/* Fare summary badge */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#112240] border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Total Encomienda</span>
              <p className="text-xs text-slate-200">Tarifa oficial PACHA</p>
            </div>
            <span className="text-2xl font-black text-amber-400 font-mono">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <button
            id="btn-submit-shipment"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <Package className="w-4 h-4" />
            <span>{isSubmitting ? 'Registrando...' : 'CONFIRMAR Y GENERAR CÓDIGOS'}</span>
          </button>
        </form>
      ) : (
        /* Confirmation Screen with Security Code */
        <div className="bg-[#0B192C] p-6 sm:p-8 rounded-3xl border border-amber-500/30 text-center shadow-2xl space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Estado: PENDIENTE DE RECOGIDA
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              ¡Encomienda Registrada Exitosamente!
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              Guarda o comparte este código de seguridad con la persona que recibirá el paquete.
            </p>
          </div>

          {/* 4-digit Secret Code Highlight Box */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-400/80 max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <KeyRound className="w-4 h-4" />
              <span>Código Secreto de Entrega</span>
            </div>
            <div className="text-4xl font-black text-white tracking-[0.4em] font-mono select-all">
              {confirmedShipment.securityCode}
            </div>
            <p className="text-[11px] text-amber-300/80 mt-2">
              El conductor solicitará este código de 4 dígitos al destinatario para validar la entrega.
            </p>
          </div>

          {/* Shipment Details */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Código de Envío:</span>
              <span className="font-mono font-bold text-amber-400">{confirmedShipment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ruta:</span>
              <span className="font-bold text-white">
                {confirmedShipment.originCityName} → {confirmedShipment.destinationCityName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Destinatario:</span>
              <span className="font-semibold text-white">
                {confirmedShipment.receiverName} ({confirmedShipment.receiverPhone})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dirección de Entrega:</span>
              <span className="text-white text-right max-w-[200px] truncate">{confirmedShipment.deliveryAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total:</span>
              <span className="font-bold text-amber-400 font-mono text-sm">
                ${confirmedShipment.price.toFixed(2)} ({confirmedShipment.paymentMethod})
              </span>
            </div>

            {confirmedShipment.paymentMethod === 'TRANSFERENCIA' && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-[11px] space-y-1">
                <span className="text-amber-400 font-bold block uppercase tracking-wider">
                  Recordatorio Datos Bancarios para Transferencia:
                </span>
                <p className="text-slate-300">
                  {settings.bankName} • {settings.bankType}: <span className="font-mono font-bold text-white">{settings.bankAccount}</span>
                </p>
                <p className="text-slate-400 text-[10px]">
                  Titular: {settings.bankHolder} (RUC: {settings.bankIdNumber || '1391827364001'})
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                setConfirmedShipment(null);
                setDescription('');
                setDeliveryAddress('');
              }}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase"
            >
              Enviar otro paquete
            </button>
            <a
              href={`https://wa.me/?text=Hola%20${encodeURIComponent(confirmedShipment.receiverName)},%20te%20envié%20un%20paquete%20por%20PACHA%20Transporte%20Ejecutivo.%20Tu%20código%20secreto%20de%20entrega%20es:%20${confirmedShipment.securityCode}%20(Envío%20${confirmedShipment.id})`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-2"
            >
              <span>Compartir Código por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
