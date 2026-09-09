import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Package,
  Car,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Navigation
} from 'lucide-react';
import { User, Booking, Shipment, BookingStatus } from '../../types';
import { PachaStorage } from '../../services/storage';
import { GpsLocationModal } from '../common/GpsLocationModal';

interface ClientTripsViewProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onBookNew: () => void;
  onShipNew: () => void;
}

export const ClientTripsView: React.FC<ClientTripsViewProps> = ({
  currentUser,
  onOpenLogin,
  onBookNew,
  onShipNew
}) => {
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'SHIPMENTS'>('BOOKINGS');
  const [bookings, setBookings] = useState<Booking[]>(() => PachaStorage.getBookings());
  const [shipments, setShipments] = useState<Shipment[]>(() => PachaStorage.getShipments());

  const [gpsModalData, setGpsModalData] = useState<{
    cityName: string;
    address: string;
    reference?: string;
    type: 'ORIGIN' | 'DESTINATION' | 'SHIPMENT';
    title?: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = PachaStorage.subscribe(() => {
      setBookings(PachaStorage.getBookings());
      setShipments(PachaStorage.getShipments());
    });
    return () => unsubscribe();
  }, []);

  if (!currentUser) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center text-white my-12 bg-[#0B192C] rounded-3xl border border-amber-500/20 shadow-xl">
        <Car className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold font-brand">Consulta tus Viajes y Encomiendas</h3>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          Inicia sesión con tu número de cédula para ver el estado en tiempo real de tus servicios contratados.
        </p>
        <button
          onClick={onOpenLogin}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  // Strictly filter by currentUser.id to preserve privacy!
  const myBookings = bookings.filter((b) => b.customerId === currentUser.id);
  const myShipments = shipments.filter((s) => s.customerId === currentUser.id);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'SOLICITADA':
        return { label: 'SOLICITADA', class: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'ASIGNADA':
        return { label: 'CONDUCTOR ASIGNADO', class: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'CONDUCTOR_EN_CAMINO':
        return { label: 'CHOFER EN CAMINO', class: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'EN_PUNTO_RECOGIDA':
        return { label: 'EN TU PUERTA', class: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' };
      case 'VIAJE_INICIADO':
      case 'EN_RUTA':
        return { label: 'EN VIAJE', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'FINALIZADO':
        return { label: 'FINALIZADO', class: 'bg-slate-700/50 text-slate-300 border-slate-600' };
      case 'CANCELADA':
        return { label: 'CANCELADA', class: 'bg-red-500/20 text-red-300 border-red-500/40' };
      default:
        return { label: status, class: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('¿Seguro que deseas cancelar esta reserva?')) {
      PachaStorage.updateBookingStatus(bookingId, 'CANCELADA');
      setBookings(PachaStorage.getBookings());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 text-white pb-24">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
            Panel de Cliente
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-brand">
            Mis Solicitudes y Encomiendas
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'BOOKINGS'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Viajes ({myBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SHIPMENTS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'SHIPMENTS'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Encomiendas ({myShipments.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BOOKINGS */}
      {activeTab === 'BOOKINGS' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="text-center py-12 bg-[#0B192C] rounded-3xl border border-slate-800 p-6">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-semibold">No tienes viajes solicitados aún</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Reserva un viaje ejecutivo entre Portoviejo, Pedernales o paradas intermedias.
              </p>
              <button
                onClick={onBookNew}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase"
              >
                Solicitar mi primer viaje
              </button>
            </div>
          ) : (
            myBookings.map((booking) => {
              const status = getStatusBadge(booking.status);
              return (
                <div
                  key={booking.id}
                  className="bg-[#0B192C] rounded-2xl border border-amber-500/20 p-4 sm:p-5 shadow-lg space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{booking.id}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {booking.travelDate} • {booking.travelTime}
                    </span>
                  </div>

                  {/* Route & Addresses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">
                            Recogida en {booking.originCityName}
                          </span>
                          <p className="text-slate-200">{booking.pickupAddress}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setGpsModalData({
                          cityName: booking.originCityName,
                          address: booking.pickupAddress,
                          type: 'ORIGIN',
                          title: `Tu Punto de Recogida (${booking.originCityName})`
                        })}
                        className="shrink-0 p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition"
                        title="Ver ubicación GPS de recogida"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">
                            Destino en {booking.destinationCityName}
                          </span>
                          <p className="text-slate-200">{booking.destinationAddress}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setGpsModalData({
                          cityName: booking.destinationCityName,
                          address: booking.destinationAddress,
                          type: 'DESTINATION',
                          title: `Tu Destino (${booking.destinationCityName})`
                        })}
                        className="shrink-0 p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
                        title="Ver ubicación GPS de destino"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Assigned Driver & Vehicle Details if available */}
                  {booking.assignedDriverId && booking.driverName ? (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">
                            Conductor Asignado
                          </span>
                          <p className="text-xs font-bold text-white">{booking.driverName}</p>
                          {booking.vehiclePlate && (
                            <p className="text-[11px] text-slate-400">
                              {booking.vehicleModel} • Placa: <span className="font-mono font-bold text-amber-300">{booking.vehiclePlate}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {booking.driverPhone && (
                        <a
                          href={`https://wa.me/593${booking.driverPhone.replace(/\D/g, '').replace(/^0/, '')}?text=Hola%20${encodeURIComponent(booking.driverName)},%20soy%20el%20pasajero%20del%20viaje%20${booking.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/40 flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Contactar</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/90 flex items-center justify-between">
                      <span>Despacho asignando conductor disponible...</span>
                      <span className="text-[10px] text-slate-400">Por favor espere</span>
                    </div>
                  )}

                  {/* Price & Action footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400">Total: </span>
                      <span className="font-bold text-amber-400 font-mono text-sm">
                        ${booking.totalPrice.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">
                        ({booking.paymentMethod === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'})
                      </span>
                    </div>

                    {booking.status === 'SOLICITADA' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-xs text-red-400 hover:text-red-300 hover:underline"
                      >
                        Cancelar Reserva
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: SHIPMENTS */}
      {activeTab === 'SHIPMENTS' && (
        <div className="space-y-4">
          {myShipments.length === 0 ? (
            <div className="text-center py-12 bg-[#0B192C] rounded-3xl border border-slate-800 p-6">
              <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-semibold">No tienes encomiendas registradas</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Envía paquetes o documentos con entrega segura y código secreto.
              </p>
              <button
                onClick={onShipNew}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase"
              >
                Enviar mi primera encomienda
              </button>
            </div>
          ) : (
            myShipments.map((shipment) => (
              <div
                key={shipment.id}
                className="bg-[#0B192C] rounded-2xl border border-amber-500/20 p-4 sm:p-5 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{shipment.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {shipment.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    ${shipment.price.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] block">Ruta:</span>
                      <button
                        onClick={() => setGpsModalData({
                          cityName: shipment.destinationCityName,
                          address: shipment.deliveryAddress,
                          type: 'SHIPMENT',
                          title: `Entrega Encomienda: ${shipment.receiverName}`
                        })}
                        className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Ver GPS</span>
                      </button>
                    </div>
                    <p className="font-semibold text-white">{shipment.originCityName} → {shipment.destinationCityName}</p>
                    <p className="text-slate-400 text-[11px] mt-1 truncate">{shipment.deliveryAddress}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">Destinatario:</span>
                    <p className="font-semibold text-white">{shipment.receiverName}</p>
                    <p className="text-slate-400 text-[11px]">{shipment.receiverPhone}</p>
                  </div>
                </div>

                {/* 4-digit secret key display */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase block">Código Secreto de Entrega</span>
                      <span className="font-mono text-base font-black text-white tracking-widest">{shipment.securityCode}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 max-w-[130px] text-right">
                    Entregar solo al recibir el paquete
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* GPS Location Modal with Red Marker */}
      {gpsModalData && (
        <GpsLocationModal
          isOpen={true}
          onClose={() => setGpsModalData(null)}
          cityName={gpsModalData.cityName}
          address={gpsModalData.address}
          reference={gpsModalData.reference}
          type={gpsModalData.type}
          title={gpsModalData.title}
        />
      )}
    </div>
  );
};
