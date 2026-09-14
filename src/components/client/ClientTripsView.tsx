import React, { useState, useEffect, useMemo } from 'react';
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
  Navigation,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Archive,
  History,
  X
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

  // Search and Filter states (User requirement: "AGREGAS UNA BARRA DE BUSQUEDA Y FILTRO PARA CUANDO EXISTEN MUCHOS")
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [shipmentFilter, setShipmentFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'>('ALL');

  // Older items toggle (User requirement: "LOS VIAJES HECHOS O ENVIOS DE ENCOMIENDAS MAS VIEJOS SE VAN ESCONDIENDO (PERO NO DESAPARECEN)")
  const [showOlderBookings, setShowOlderBookings] = useState(false);
  const [showOlderShipments, setShowOlderShipments] = useState(false);

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
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  // Strictly filter by currentUser.id to preserve user privacy
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

  // Helper to check if a booking is active (in progress)
  const isBookingActive = (status: BookingStatus) =>
    status !== 'FINALIZADO' && status !== 'CANCELADA';

  // Helper to check if a shipment is active (in transit/registered)
  const isShipmentActive = (status: string) =>
    status !== 'ENTREGADO' && status !== 'CANCELADA';

  // ==================== FILTERED & SEARCHED BOOKINGS ====================
  const filteredBookings = useMemo(() => {
    return myBookings.filter((b) => {
      // 1. Status Filter
      if (bookingFilter === 'ACTIVE' && !isBookingActive(b.status)) return false;
      if (bookingFilter === 'COMPLETED' && b.status !== 'FINALIZADO') return false;
      if (bookingFilter === 'CANCELLED' && b.status !== 'CANCELADA') return false;

      // 2. Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.originCityName.toLowerCase().includes(q) ||
        b.destinationCityName.toLowerCase().includes(q) ||
        b.pickupAddress.toLowerCase().includes(q) ||
        b.destinationAddress.toLowerCase().includes(q) ||
        b.travelDate.includes(q) ||
        b.travelTime.includes(q) ||
        (b.assignedDriverName && b.assignedDriverName.toLowerCase().includes(q)) ||
        (b.driverName && b.driverName.toLowerCase().includes(q)) ||
        (b.vehiclePlate && b.vehiclePlate.toLowerCase().includes(q))
      );
    });
  }, [myBookings, bookingFilter, searchQuery]);

  // Split bookings into active vs past
  // Active bookings are always shown.
  // For past bookings: recent 2 are shown, older ones are folded into collapsible section
  const { activeBookingsList, recentPastBookings, olderPastBookings } = useMemo(() => {
    const isSearchingOrFiltering = searchQuery.trim().length > 0 || bookingFilter !== 'ALL';

    const activeList = filteredBookings.filter((b) => isBookingActive(b.status));
    const pastList = filteredBookings.filter((b) => !isBookingActive(b.status));

    // If searching or filtering, don't hide older ones so search finds everything
    if (isSearchingOrFiltering) {
      return {
        activeBookingsList: activeList,
        recentPastBookings: pastList,
        olderPastBookings: []
      };
    }

    // Default view: Show first 2 completed trips, hide the rest under collapsible history
    const recent = pastList.slice(0, 2);
    const older = pastList.slice(2);
    return {
      activeBookingsList: activeList,
      recentPastBookings: recent,
      olderPastBookings: older
    };
  }, [filteredBookings, searchQuery, bookingFilter]);

  // ==================== FILTERED & SEARCHED SHIPMENTS ====================
  const filteredShipments = useMemo(() => {
    return myShipments.filter((s) => {
      // 1. Status Filter
      if (shipmentFilter === 'ACTIVE' && !isShipmentActive(s.status)) return false;
      if (shipmentFilter === 'DELIVERED' && s.status !== 'ENTREGADO') return false;
      if (shipmentFilter === 'CANCELLED' && s.status !== 'CANCELADA') return false;

      // 2. Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.originCityName.toLowerCase().includes(q) ||
        s.destinationCityName.toLowerCase().includes(q) ||
        s.deliveryAddress.toLowerCase().includes(q) ||
        s.receiverName.toLowerCase().includes(q) ||
        s.receiverPhone.includes(q) ||
        s.securityCode.includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.assignedDriverName && s.assignedDriverName.toLowerCase().includes(q))
      );
    });
  }, [myShipments, shipmentFilter, searchQuery]);

  // Split shipments into active vs past
  const { activeShipmentsList, recentPastShipments, olderPastShipments } = useMemo(() => {
    const isSearchingOrFiltering = searchQuery.trim().length > 0 || shipmentFilter !== 'ALL';

    const activeList = filteredShipments.filter((s) => isShipmentActive(s.status));
    const pastList = filteredShipments.filter((s) => !isShipmentActive(s.status));

    if (isSearchingOrFiltering) {
      return {
        activeShipmentsList: activeList,
        recentPastShipments: pastList,
        olderPastShipments: []
      };
    }

    const recent = pastList.slice(0, 2);
    const older = pastList.slice(2);
    return {
      activeShipmentsList: activeList,
      recentPastShipments: recent,
      olderPastShipments: older
    };
  }, [filteredShipments, searchQuery, shipmentFilter]);

  // Helper render for single booking card
  const renderBookingCard = (booking: Booking, isOlder = false) => {
    const status = getStatusBadge(booking.status);
    return (
      <div
        key={booking.id}
        className={`bg-[#0B192C] rounded-2xl border p-4 sm:p-5 shadow-lg space-y-3 transition-all ${
          isOlder
            ? 'border-slate-800/80 bg-slate-900/40 opacity-95 hover:opacity-100 hover:border-amber-500/30'
            : 'border-amber-500/20'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400">{booking.id}</span>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${status.class}`}>
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
              onClick={() =>
                setGpsModalData({
                  cityName: booking.originCityName,
                  address: booking.pickupAddress,
                  type: 'ORIGIN',
                  title: `Tu Punto de Recogida (${booking.originCityName})`
                })
              }
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
              onClick={() =>
                setGpsModalData({
                  cityName: booking.destinationCityName,
                  address: booking.destinationAddress,
                  type: 'DESTINATION',
                  title: `Tu Destino (${booking.destinationCityName})`
                })
              }
              className="shrink-0 p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
              title="Ver ubicación GPS de destino"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Assigned Driver & Vehicle Details if available */}
        {booking.assignedDriverName || booking.driverName ? (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">
                  Conductor Asignado
                </span>
                <p className="text-xs font-bold text-white">
                  {booking.assignedDriverName || booking.driverName}
                </p>
                {(booking.assignedVehiclePlate || booking.vehiclePlate) && (
                  <p className="text-[11px] text-slate-400">
                    {booking.vehicleModel} • Placa:{' '}
                    <span className="font-mono font-bold text-amber-300">
                      {booking.assignedVehiclePlate || booking.vehiclePlate}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {booking.driverPhone && (
              <a
                href={`https://wa.me/593${booking.driverPhone.replace(/\D/g, '').replace(/^0/, '')}?text=Hola%20${encodeURIComponent(booking.assignedDriverName || booking.driverName || 'Conductor')},%20soy%20el%20pasajero%20del%20viaje%20${booking.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/40 flex items-center gap-1.5 shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contactar</span>
              </a>
            )}
          </div>
        ) : isBookingActive(booking.status) ? (
          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/90 flex items-center justify-between">
            <span>Despacho asignando conductor disponible...</span>
            <span className="text-[10px] text-slate-400">Por favor espere</span>
          </div>
        ) : null}

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
              className="text-xs text-red-400 hover:text-red-300 hover:underline font-semibold"
            >
              Cancelar Reserva
            </button>
          )}
        </div>
      </div>
    );
  };

  // Helper render for single shipment card
  const renderShipmentCard = (shipment: Shipment, isOlder = false) => {
    return (
      <div
        key={shipment.id}
        className={`bg-[#0B192C] rounded-2xl border p-4 sm:p-5 shadow-lg space-y-3 transition-all ${
          isOlder
            ? 'border-slate-800/80 bg-slate-900/40 opacity-95 hover:opacity-100 hover:border-sky-500/30'
            : 'border-amber-500/20'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400">{shipment.id}</span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                shipment.status === 'ENTREGADO'
                  ? 'bg-slate-700/50 text-slate-300 border-slate-600'
                  : shipment.status === 'CANCELADA'
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}
            >
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
              <span className="text-slate-400 text-[10px] block font-bold uppercase">Ruta:</span>
              <button
                onClick={() =>
                  setGpsModalData({
                    cityName: shipment.destinationCityName,
                    address: shipment.deliveryAddress,
                    type: 'SHIPMENT',
                    title: `Entrega Encomienda: ${shipment.receiverName}`
                  })
                }
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
              >
                <Navigation className="w-3 h-3" />
                <span>Ver GPS</span>
              </button>
            </div>
            <p className="font-semibold text-white">
              {shipment.originCityName} → {shipment.destinationCityName}
            </p>
            <p className="text-slate-400 text-[11px] mt-1 truncate">{shipment.deliveryAddress}</p>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block font-bold uppercase">Destinatario:</span>
            <p className="font-semibold text-white">{shipment.receiverName}</p>
            <p className="text-slate-400 text-[11px]">{shipment.receiverPhone}</p>
          </div>
        </div>

        {/* Assigned Driver Information for Shipment */}
        {shipment.assignedDriverName || shipment.driverName ? (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-400 font-bold block">
                  Conductor Oficial Asignado
                </span>
                <p className="text-xs font-bold text-white">
                  {shipment.assignedDriverName || shipment.driverName}
                </p>
                <p className="text-[11px] text-slate-400">
                  {shipment.assignedVehiclePlate || shipment.vehiclePlate ? (
                    <>
                      Placa:{' '}
                      <span className="font-mono font-bold text-amber-300">
                        {shipment.assignedVehiclePlate || shipment.vehiclePlate}
                      </span>{' '}
                      •{' '}
                    </>
                  ) : null}
                  Solo este conductor puede validar la entrega con tu código.
                </p>
              </div>
            </div>

            {shipment.driverPhone && (
              <a
                href={`https://wa.me/593${shipment.driverPhone.replace(/\D/g, '').replace(/^0/, '')}?text=Hola%20${encodeURIComponent(shipment.assignedDriverName || shipment.driverName || 'Conductor')},%20tengo%20una%20consulta%20sobre%20mi%20encomienda%20${shipment.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/40 flex items-center gap-1.5 shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contactar</span>
              </a>
            )}
          </div>
        ) : isShipmentActive(shipment.status) ? (
          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/90 flex items-center justify-between">
            <span>Despacho asignando conductor para tu encomienda...</span>
            <span className="text-[10px] text-slate-400">Por favor espere</span>
          </div>
        ) : null}

        {/* 4-digit secret key display */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase block">
                Código Secreto de Entrega
              </span>
              <span className="font-mono text-base font-black text-white tracking-widest">
                {shipment.securityCode}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 max-w-[130px] text-right">
            Entregar solo al recibir el paquete
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 text-white pb-24">
      {/* Header & Main Tabs */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
            Panel de Cliente
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-brand">
            Mis Solicitudes y Encomiendas
          </h2>
          <p className="text-xs text-slate-400">
            Historial de servicios con búsqueda y organización automática.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 self-start">
          <button
            id="tab-client-trips"
            onClick={() => {
              setActiveTab('BOOKINGS');
              setSearchQuery('');
            }}
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
            id="tab-client-shipments"
            onClick={() => {
              setActiveTab('SHIPMENTS');
              setSearchQuery('');
            }}
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

      {/* ================= SEARCH BAR & FILTER TOOLBAR ================= */}
      {/* (User requirement: "AGREGAS UNA BARRA DE BUSQUEDA Y FILTRO PARA CUANDO EXISTEN MUCHOS") */}
      <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-[#0B192C] border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="input-client-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'BOOKINGS'
                  ? 'Buscar por código, ciudad, dirección o chofer...'
                  : 'Buscar por código, destinatario, ciudad o guía...'
              }
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title="Borrar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* New service action button */}
          {activeTab === 'BOOKINGS' ? (
            <button
              onClick={onBookNew}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shrink-0 transition"
            >
              <Car className="w-3.5 h-3.5" />
              <span>+ Nuevo Viaje</span>
            </button>
          ) : (
            <button
              onClick={onShipNew}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shrink-0 transition"
            >
              <Package className="w-3.5 h-3.5" />
              <span>+ Nueva Encomienda</span>
            </button>
          )}
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Filtro:
          </span>

          {activeTab === 'BOOKINGS' ? (
            <>
              <button
                onClick={() => setBookingFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                  bookingFilter === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Todos ({myBookings.length})
              </button>
              <button
                onClick={() => setBookingFilter('ACTIVE')}
                className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                  bookingFilter === 'ACTIVE'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                En Curso ({myBookings.filter((b) => isBookingActive(b.status)).length})
              </button>
              <button
                onClick={() => setBookingFilter('COMPLETED')}
                className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                  bookingFilter === 'COMPLETED'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Finalizados ({myBookings.filter((b) => b.status === 'FINALIZADO').length})
              </button>
              <button
                onClick={() => setBookingFilter('CANCELLED')}
                className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                  bookingFilter === 'CANCELLED'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Cancelados ({myBookings.filter((b) => b.status === 'CANCELADA').length})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShipmentFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                  shipmentFilter === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Todas ({myShipments.length})
              </button>
              <button
                onClick={() => setShipmentFilter('ACTIVE')}
                className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                  shipmentFilter === 'ACTIVE'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                En Tránsito ({myShipments.filter((s) => isShipmentActive(s.status)).length})
              </button>
              <button
                onClick={() => setShipmentFilter('DELIVERED')}
                className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                  shipmentFilter === 'DELIVERED'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Entregadas ({myShipments.filter((s) => s.status === 'ENTREGADO').length})
              </button>
              <button
                onClick={() => setShipmentFilter('CANCELLED')}
                className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                  shipmentFilter === 'CANCELLED'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Canceladas ({myShipments.filter((s) => s.status === 'CANCELADA').length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* ================= TAB 1: BOOKINGS ================= */}
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
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase shadow-md hover:bg-amber-400 transition"
              >
                Solicitar mi primer viaje
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-10 bg-[#0B192C] rounded-2xl border border-slate-800 p-6">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-semibold">No se encontraron viajes</p>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                No hay viajes que coincidan con la búsqueda o filtro seleccionado.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setBookingFilter('ALL');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <>
              {/* 1. Active / Ongoing Trips Section */}
              {activeBookingsList.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Viajes en Curso ({activeBookingsList.length})
                    </h3>
                  </div>
                  {activeBookingsList.map((b) => renderBookingCard(b))}
                </div>
              )}

              {/* 2. Recent Past Trips Section */}
              {recentPastBookings.length > 0 && (
                <div className="space-y-3 pt-2">
                  {activeBookingsList.length > 0 && (
                    <div className="flex items-center gap-2 px-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Viajes Recientes
                      </h3>
                    </div>
                  )}
                  {recentPastBookings.map((b) => renderBookingCard(b))}
                </div>
              )}

              {/* 3. Older Trips (Hidden by default, expandable - Requirement: "LOS VIAJES HECHOS MAS VIEJOS SE VAN ESCONDIENDO (PERO NO DESAPARECEN)") */}
              {olderPastBookings.length > 0 && (
                <div className="pt-2">
                  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                          <History className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">
                            Historial de Viajes Anteriores ({olderPastBookings.length})
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Los viajes más viejos se ocultan para mantener tu pantalla ordenada, pero siguen guardados.
                          </p>
                        </div>
                      </div>

                      <button
                        id="btn-toggle-older-trips"
                        onClick={() => setShowOlderBookings((prev) => !prev)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition self-start sm:self-auto border border-slate-700/60"
                      >
                        <span>
                          {showOlderBookings
                            ? 'Ocultar viajes anteriores'
                            : `Ver viajes anteriores (${olderPastBookings.length})`}
                        </span>
                        {showOlderBookings ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Collapsible list of older bookings */}
                    {showOlderBookings && (
                      <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in duration-300">
                        {olderPastBookings.map((b) => renderBookingCard(b, true))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ================= TAB 2: SHIPMENTS ================= */}
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
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase shadow-md hover:bg-amber-400 transition"
              >
                Enviar mi primera encomienda
              </button>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="text-center py-10 bg-[#0B192C] rounded-2xl border border-slate-800 p-6">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-semibold">No se encontraron encomiendas</p>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                No hay encomiendas que coincidan con la búsqueda o filtro seleccionado.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShipmentFilter('ALL');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <>
              {/* 1. Active / In-Transit Shipments */}
              {activeShipmentsList.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-sky-400">
                      Encomiendas en Tránsito ({activeShipmentsList.length})
                    </h3>
                  </div>
                  {activeShipmentsList.map((s) => renderShipmentCard(s))}
                </div>
              )}

              {/* 2. Recent Delivered Shipments */}
              {recentPastShipments.length > 0 && (
                <div className="space-y-3 pt-2">
                  {activeShipmentsList.length > 0 && (
                    <div className="flex items-center gap-2 px-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Entregas Recientes
                      </h3>
                    </div>
                  )}
                  {recentPastShipments.map((s) => renderShipmentCard(s))}
                </div>
              )}

              {/* 3. Older Shipments (Hidden by default, expandable - Requirement: "ENVIOS DE ENCOMIENDAS MAS VIEJOS SE VAN ESCONDIENDO (PERO NO DESAPARECEN)") */}
              {olderPastShipments.length > 0 && (
                <div className="pt-2">
                  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                          <Archive className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">
                            Historial de Encomiendas Anteriores ({olderPastShipments.length})
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Los envíos más antiguos se ocultan para mantener tu lista limpia, pero continúan disponibles.
                          </p>
                        </div>
                      </div>

                      <button
                        id="btn-toggle-older-shipments"
                        onClick={() => setShowOlderShipments((prev) => !prev)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition self-start sm:self-auto border border-slate-700/60"
                      >
                        <span>
                          {showOlderShipments
                            ? 'Ocultar encomiendas anteriores'
                            : `Ver encomiendas anteriores (${olderPastShipments.length})`}
                        </span>
                        {showOlderShipments ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Collapsible list of older shipments */}
                    {showOlderShipments && (
                      <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in duration-300">
                        {olderPastShipments.map((s) => renderShipmentCard(s, true))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
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
