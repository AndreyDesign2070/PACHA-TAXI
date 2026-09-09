import React, { useState, useEffect } from 'react';
import {
  Car,
  MapPin,
  Phone,
  Navigation,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  AlertCircle,
  KeyRound,
  ExternalLink,
  Users,
  ChevronRight,
  Shield,
  User as UserIcon,
  Check,
  Headphones
} from 'lucide-react';
import { User, Booking, Shipment, BookingStatus, Vehicle } from '../../types';
import { PachaStorage } from '../../services/storage';
import { GpsLocationModal } from '../common/GpsLocationModal';
import { getAddressCoordinates, getGoogleMapsUrl } from '../../utils/geo';

interface DriverDashboardProps {
  currentUser: User;
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  currentUser,
  currentTab = 'driver-services',
  onSelectTab
}) => {
  const [bookings, setBookings] = useState<Booking[]>(() => PachaStorage.getBookings());
  const [shipments, setShipments] = useState<Shipment[]>(() => PachaStorage.getShipments());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => PachaStorage.getVehicles());
  const [selectedTrip, setSelectedTrip] = useState<Booking | null>(null);

  // GPS Location Modal state
  const [gpsModalData, setGpsModalData] = useState<{
    cityName: string;
    address: string;
    reference?: string;
    type: 'ORIGIN' | 'DESTINATION' | 'SHIPMENT';
    title?: string;
  } | null>(null);

  // Delivery code confirmation state
  const [deliveryShipmentId, setDeliveryShipmentId] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [deliverySuccess, setDeliverySuccess] = useState<string | null>(null);

  // Subscribe to storage changes for real-time reactivity without page reloads
  const refreshData = () => {
    setBookings(PachaStorage.getBookings());
    setShipments(PachaStorage.getShipments());
    setVehicles(PachaStorage.getVehicles());
  };

  useEffect(() => {
    const unsubscribe = PachaStorage.subscribe(refreshData);
    return () => unsubscribe();
  }, []);

  // Determine active sub-tab from currentTab
  const activeTab = (() => {
    if (currentTab === 'driver-active') return 'ACTIVE_TRIP';
    if (currentTab === 'driver-shipments') return 'SHIPMENTS';
    if (currentTab === 'driver-earnings') return 'EARNINGS';
    if (currentTab === 'driver-profile') return 'PROFILE';
    return 'SERVICES';
  })();

  const handleSwitchTab = (tabKey: string) => {
    if (onSelectTab) {
      onSelectTab(tabKey);
    }
  };

  // Trips assigned to this driver
  const driverBookings = bookings.filter(
    (b) =>
      b.assignedDriverId === currentUser.id ||
      b.assignedDriverId === 'usr-chofer1' ||
      b.driverId === currentUser.id
  );

  // Active in-progress trip (not finalized or cancelled)
  const activeBooking = driverBookings.find(
    (b) => b.status !== 'FINALIZADO' && b.status !== 'CANCELADA' && b.status !== 'SOLICITADA'
  );

  // Shipments assigned to driver
  const driverShipments = shipments.filter(
    (s) =>
      s.assignedDriverId === currentUser.id ||
      s.assignedDriverId === 'usr-chofer1' ||
      s.driverId === currentUser.id
  );

  // Assigned vehicle
  const assignedVehicle = vehicles.find((v) => v.assignedDriverId === currentUser.id) || vehicles[0];

  // Calculate earnings
  const completedTrips = driverBookings.filter((b) => b.status === 'FINALIZADO');
  const completedShipments = driverShipments.filter((s) => s.status === 'ENTREGADO');
  const totalTripsRevenue = completedTrips.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalShipmentsRevenue = completedShipments.reduce((acc, curr) => acc + curr.price, 0);
  const driverShare = (totalTripsRevenue + totalShipmentsRevenue) * 0.8; // 80% driver share

  // 8 Specific Driver Trip States
  const tripStatesOrder: { status: BookingStatus; label: string; stepNum: number }[] = [
    { status: 'ASIGNADA', label: '1. Asignado', stepNum: 1 },
    { status: 'CONDUCTOR_EN_CAMINO', label: '2. En camino', stepNum: 2 },
    { status: 'EN_PUNTO_RECOGIDA', label: '3. En punto de recogida', stepNum: 3 },
    { status: 'ESPERANDO_CLIENTE', label: '4. Esperando al cliente', stepNum: 4 },
    { status: 'PASAJERO_A_BORDO', label: '5. Pasajero a bordo', stepNum: 5 },
    { status: 'VIAJE_INICIADO', label: '6. Viaje iniciado', stepNum: 6 },
    { status: 'EN_RUTA', label: '7. En ruta', stepNum: 7 },
    { status: 'FINALIZADO', label: '8. Finalizado', stepNum: 8 }
  ];

  // Fix for the user bug: NEVER reload window! Update state seamlessly in place
  const handleUpdateTripState = (bookingId: string, newStatus: BookingStatus) => {
    PachaStorage.updateBookingStatus(bookingId, newStatus, currentUser.fullName);
    refreshData();
    if (selectedTrip && selectedTrip.id === bookingId) {
      setSelectedTrip((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleOpenNavigation = (
    address: string,
    cityName: string,
    type: 'ORIGIN' | 'DESTINATION' | 'SHIPMENT' = 'DESTINATION',
    customTitle?: string
  ) => {
    setGpsModalData({
      cityName,
      address,
      type,
      title: customTitle || (type === 'ORIGIN' ? `Punto de Recogida (${cityName})` : `Punto de Destino (${cityName})`)
    });
  };

  const handleOpenDirectGoogleMaps = (address: string, cityName: string) => {
    const coords = getAddressCoordinates(cityName, address);
    const label = `${cityName} - ${address}`;
    const url = getGoogleMapsUrl(coords.lat, coords.lng, label);
    window.open(url, '_blank');
  };

  const handleVerifyDeliveryCode = (shipment: Shipment) => {
    setDeliveryError(null);
    setDeliverySuccess(null);

    if (inputCode.trim() !== shipment.securityCode) {
      setDeliveryError('El código de 4 dígitos ingresado es incorrecto. Solicite el código correcto al destinatario.');
      return;
    }

    const ok = PachaStorage.verifyAndDeliverShipment(shipment.id, inputCode.trim());
    if (ok) {
      setDeliverySuccess('¡Entrega confirmada y registrada con éxito en PACHA!');
      refreshData();
      setTimeout(() => {
        setDeliveryShipmentId(null);
        setInputCode('');
        setDeliverySuccess(null);
      }, 1500);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6 text-white pb-28">
      {/* Driver Header Banner */}
      <div className="bg-[#0B192C] p-4 sm:p-5 rounded-3xl border border-amber-500/30 mb-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black flex items-center justify-center text-lg shadow-inner shrink-0">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              Modo Conductor Ejecutivo
            </span>
            <h3 className="text-base font-extrabold text-white leading-tight">{currentUser.fullName}</h3>
            <p className="text-[11px] text-slate-400 font-mono">
              C.I: {currentUser.cedula || currentUser.username} • Tel: {currentUser.phone}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-medium">Estado</span>
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>En Servicio</span>
          </div>
        </div>
      </div>

      {/* Driver Synchronized Sub-tabs */}
      <div className="grid grid-cols-5 gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 mb-5 text-center text-xs">
        <button
          id="btn-driver-tab-services"
          onClick={() => handleSwitchTab('driver-services')}
          className={`py-2 px-1 rounded-xl font-bold transition-all ${
            activeTab === 'SERVICES'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Viajes ({driverBookings.length})
        </button>

        <button
          id="btn-driver-tab-active"
          onClick={() => handleSwitchTab('driver-active')}
          className={`py-2 px-1 rounded-xl font-bold transition-all relative ${
            activeTab === 'ACTIVE_TRIP'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {activeBooking && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
          En Curso
        </button>

        <button
          id="btn-driver-tab-shipments"
          onClick={() => handleSwitchTab('driver-shipments')}
          className={`py-2 px-1 rounded-xl font-bold transition-all ${
            activeTab === 'SHIPMENTS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Paquetes ({driverShipments.length})
        </button>

        <button
          id="btn-driver-tab-earnings"
          onClick={() => handleSwitchTab('driver-earnings')}
          className={`py-2 px-1 rounded-xl font-bold transition-all ${
            activeTab === 'EARNINGS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Ganancias
        </button>

        <button
          id="btn-driver-tab-profile"
          onClick={() => handleSwitchTab('driver-profile')}
          className={`py-2 px-1 rounded-xl font-bold transition-all ${
            activeTab === 'PROFILE'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Mi Perfil
        </button>
      </div>

      {/* 1. ASSIGNED SERVICES TAB */}
      {activeTab === 'SERVICES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Viajes Asignados a tu Unidad
            </h3>
            <span className="text-xs text-slate-400 font-mono">{driverBookings.length} asignados</span>
          </div>

          {driverBookings.length === 0 ? (
            <div className="text-center py-12 bg-[#0B192C] rounded-2xl border border-slate-800 p-6">
              <Car className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-semibold">No tienes viajes asignados en este momento</p>
              <p className="text-xs text-slate-500 mt-1">
                La administración de PACHA te notificará en cuanto te sea asignado un nuevo servicio.
              </p>
            </div>
          ) : (
            driverBookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#0B192C] rounded-2xl border border-amber-500/20 p-4 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{b.id}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    ${b.totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Client info & phone */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Pasajero</span>
                    <p className="text-xs font-bold text-white">{b.customerName}</p>
                    <p className="text-[11px] text-slate-400">{b.customerPhone}</p>
                  </div>

                  <a
                    href={`tel:${b.customerPhone}`}
                    className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
                    title="Llamar al cliente"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

                  {/* Origin and Destination with Big Navigation Buttons */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-amber-400 font-bold uppercase block">PUNTO DE RECOGIDA:</span>
                          <p className="text-white font-medium">{b.originCityName}: {b.pickupAddress}</p>
                        </div>
                      </div>
                      <button
                        id={`btn-driver-gps-origin-${b.id}`}
                        onClick={() => handleOpenNavigation(b.pickupAddress, b.originCityName, 'ORIGIN', `Recogida: ${b.customerName} (${b.originCityName})`)}
                        className="shrink-0 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black flex items-center gap-1 shadow transition"
                        title="Ver ubicación GPS de recogida"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>GPS</span>
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase block">PUNTO DE DESTINO:</span>
                          <p className="text-white font-medium">{b.destinationCityName}: {b.destinationAddress}</p>
                        </div>
                      </div>
                      <button
                        id={`btn-driver-gps-destination-${b.id}`}
                        onClick={() => handleOpenNavigation(b.destinationAddress, b.destinationCityName, 'DESTINATION', `Destino: ${b.destinationCityName}`)}
                        className="shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1 shadow transition"
                        title="Ver mapa con GPS de destino"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>GPS</span>
                      </button>
                    </div>
                  </div>

                {/* Open in Active Trip button */}
                <button
                  onClick={() => {
                    setSelectedTrip(b);
                    handleSwitchTab('driver-active');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>CONTROLAR ESTADOS DEL VIAJE</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. ACTIVE TRIP: 8 STEP STATE CONTROLLER (NO RESTART / NO RELOAD) */}
      {activeTab === 'ACTIVE_TRIP' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Control de Estados del Viaje
            </h3>
            <span className="text-xs text-slate-400">8 Etapas Oficiales</span>
          </div>

          {!activeBooking && !selectedTrip ? (
            <div className="text-center py-12 bg-[#0B192C] rounded-2xl border border-slate-800 p-6">
              <Car className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-semibold">No hay ningún viaje activo en este instante</p>
              <p className="text-xs text-slate-500 mt-1">Selecciona un viaje asignado en la pestaña 'Viajes'.</p>
              <button
                onClick={() => handleSwitchTab('driver-services')}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold uppercase"
              >
                Ver Viajes Asignados
              </button>
            </div>
          ) : (
            (() => {
              const trip = selectedTrip || activeBooking!;
              const currentStepIndex = tripStatesOrder.findIndex((s) => s.status === trip.status);

              return (
                <div className="bg-[#0B192C] rounded-3xl border border-amber-500/30 p-5 shadow-2xl space-y-4">
                  {/* Passenger & Route Card */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] text-amber-400 font-bold uppercase block">Pasajero:</span>
                        <h4 className="text-base font-extrabold text-white">{trip.customerName}</h4>
                      </div>
                      <a
                        href={`tel:${trip.customerPhone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Llamar</span>
                      </a>
                    </div>

                    <div className="mt-2 text-xs space-y-1">
                      <p className="text-slate-300">
                        <span className="text-amber-400 font-semibold">Recogida:</span> {trip.originCityName} - {trip.pickupAddress}
                      </p>
                      <p className="text-slate-300">
                        <span className="text-emerald-400 font-semibold">Destino:</span> {trip.destinationCityName} - {trip.destinationAddress}
                      </p>
                    </div>

                    {/* GPS Navigation Actions */}
                    <div className="mt-3 pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        id="btn-active-trip-gps-pickup"
                        onClick={() => handleOpenNavigation(trip.pickupAddress, trip.originCityName, 'ORIGIN', `Recogida: ${trip.customerName}`)}
                        className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>GPS Recogida</span>
                      </button>
                      <button
                        id="btn-active-trip-gps-dest"
                        onClick={() => handleOpenNavigation(trip.destinationAddress, trip.destinationCityName, 'DESTINATION', `Destino: ${trip.destinationCityName}`)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>GPS Destino</span>
                      </button>
                    </div>
                  </div>

                  {/* 8 Specific Status Steps Required by User */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Presione el estado según el avance del servicio:
                      </label>
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        Estado Actual: {trip.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tripStatesOrder.map((stepItem, idx) => {
                        const isCurrent = trip.status === stepItem.status;
                        const isPast = currentStepIndex > idx;

                        return (
                          <button
                            key={stepItem.status}
                            id={`btn-driver-step-${stepItem.stepNum}`}
                            onClick={() => handleUpdateTripState(trip.id, stepItem.status)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                              isCurrent
                                ? 'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-lg scale-102 ring-2 ring-amber-400/50'
                                : isPast
                                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 font-semibold'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-xs">{stepItem.label}</span>
                            {isPast && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-amber-400 font-bold uppercase">
                                En este paso
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* 3. SHIPMENTS & 4-DIGIT CODE CONFIRMATION */}
      {activeTab === 'SHIPMENTS' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            Encomiendas para Entrega
          </h3>

          {driverShipments.length === 0 ? (
            <div className="text-center py-12 bg-[#0B192C] rounded-2xl border border-slate-800 p-6">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-semibold">No tienes encomiendas asignadas</p>
              <p className="text-xs text-slate-500 mt-1">
                Las encomiendas que te asigne la administración se mostrarán aquí.
              </p>
            </div>
          ) : (
            driverShipments.map((s) => (
              <div
                key={s.id}
                className="bg-[#0B192C] rounded-2xl border border-amber-500/20 p-4 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{s.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {s.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    ${s.price.toFixed(2)}
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-slate-500 block">Destinatario:</span>
                      <strong className="text-white">{s.receiverName}</strong> ({s.receiverPhone})
                    </div>
                    <a
                      href={`tel:${s.receiverPhone}`}
                      className="shrink-0 p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
                      title="Llamar al destinatario"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Punto de Entrega:</span>
                      <p className="text-white font-medium">{s.destinationCityName}: {s.deliveryAddress}</p>
                    </div>
                    <button
                      id={`btn-shipment-gps-${s.id}`}
                      onClick={() => handleOpenNavigation(s.deliveryAddress, s.destinationCityName, 'SHIPMENT', `Entrega Encomienda: ${s.receiverName}`)}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1 shadow transition"
                      title="Ver ubicación GPS de entrega"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>GPS</span>
                    </button>
                  </div>

                  <p className="text-slate-300">
                    <span className="text-slate-500">Contenido:</span> {s.packageDescription} ({s.approxWeightKg} kg)
                  </p>
                </div>

                {s.status === 'ENTREGADO' ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>ENCOMIENDA ENTREGADA CON ÉXITO</span>
                  </div>
                ) : (
                  <div>
                    {deliveryShipmentId === s.id ? (
                      <div className="p-4 rounded-2xl bg-slate-900 border border-amber-400 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                          <KeyRound className="w-4 h-4" />
                          <span>Solicite el código de 4 dígitos al destinatario:</span>
                        </div>

                        {deliveryError && (
                          <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
                            {deliveryError}
                          </div>
                        )}

                        {deliverySuccess && (
                          <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs">
                            {deliverySuccess}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input
                            id="input-driver-verify-code"
                            type="text"
                            maxLength={4}
                            placeholder="0000"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                            className="w-32 py-2 text-center tracking-[0.5em] font-mono text-xl font-black rounded-xl bg-slate-950 border border-amber-400 text-amber-300 focus:outline-none"
                          />
                          <button
                            id="btn-confirm-delivery-code"
                            onClick={() => handleVerifyDeliveryCode(s)}
                            className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                          >
                            VALIDAR Y ENTREGAR
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        id={`btn-deliver-shipment-${s.id}`}
                        onClick={() => {
                          setDeliveryShipmentId(s.id);
                          setInputCode('');
                          setDeliveryError(null);
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>REGISTRAR ENTREGA (INGRESAR CÓDIGO)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. EARNINGS */}
      {activeTab === 'EARNINGS' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#112240] to-[#0A192F] border border-amber-500/40 shadow-xl text-center">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Ganancias Netas del Conductor
            </span>
            <div className="text-4xl font-black text-amber-400 font-mono my-2">
              ${driverShare.toFixed(2)}
            </div>
            <p className="text-xs text-slate-300">
              Total acumulado en servicios y encomiendas finalizadas
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Viajes Completados</span>
              <p className="text-xl font-bold text-white mt-1">{completedTrips.length}</p>
              <p className="text-xs text-amber-400 font-mono mt-0.5">${totalTripsRevenue.toFixed(2)}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Encomiendas Entregadas</span>
              <p className="text-xl font-bold text-white mt-1">{completedShipments.length}</p>
              <p className="text-xs text-amber-400 font-mono mt-0.5">${totalShipmentsRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. DRIVER PROFILE */}
      {activeTab === 'PROFILE' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0B192C] border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Perfil de Conductor Activo
                </span>
                <h3 className="text-lg font-black text-white">{currentUser.fullName}</h3>
                <p className="text-xs text-slate-400 font-mono">Usuario: {currentUser.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Cédula de Identidad</span>
                <p className="text-white font-mono font-bold mt-0.5">{currentUser.cedula || '1310857063'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Teléfono de Contacto</span>
                <p className="text-white font-bold mt-0.5">{currentUser.phone || '0999999999'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 sm:col-span-2">
                <span className="text-amber-400 text-[10px] uppercase font-bold block mb-1">
                  Vehículo de Flota Asignado:
                </span>
                {assignedVehicle ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {assignedVehicle.make} {assignedVehicle.model} ({assignedVehicle.year})
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Color: {assignedVehicle.color} • Capacidad: {assignedVehicle.capacity} pasajeros
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 font-mono font-black text-amber-300 text-sm">
                      {assignedVehicle.plate}
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Unidad Toyota Corolla (MBA-3921)</p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <a
                href="https://wa.me/593987654321?text=Hola%20central%20PACHA,%20reporto%20novedad%20de%20servicio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-2"
              >
                <Headphones className="w-4 h-4" />
                <span>Contactar Despacho Central PACHA</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* GPS LOCATION MODAL */}
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
