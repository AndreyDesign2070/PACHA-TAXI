import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Package,
  Car,
  Users,
  MapPin,
  CreditCard,
  FileText,
  Settings,
  Plus,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  Search,
  UserPlus,
  ShieldAlert,
  ArrowUpDown,
  Download,
  Check,
  X,
  Building,
  Save,
  MessageSquare,
  Shield,
  Navigation
} from 'lucide-react';
import { User, Booking, Shipment, City, RouteFare, Vehicle, BookingStatus, AppSettings } from '../../types';
import { PachaStorage } from '../../services/storage';
import { PachaAuth } from '../../services/auth';
import { GpsLocationModal } from '../common/GpsLocationModal';

interface AdminDashboardProps {
  currentUser: User;
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  currentTab = 'admin-dashboard',
  onSelectTab
}) => {
  // Dynamic storage data
  const [bookings, setBookings] = useState<Booking[]>(() => PachaStorage.getBookings());
  const [shipments, setShipments] = useState<Shipment[]>(() => PachaStorage.getShipments());
  const [users, setUsers] = useState<User[]>(() => PachaStorage.getUsers());
  const [cities, setCities] = useState<City[]>(() => PachaStorage.getCities());
  const [fares, setFares] = useState<RouteFare[]>(() => PachaStorage.getFares());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => PachaStorage.getVehicles());
  const [settings, setSettings] = useState<AppSettings>(() => PachaStorage.getSettings());

  // Forms modal states
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverCedula, setDriverCedula] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverUsername, setDriverUsername] = useState('');
  const [driverPassword, setDriverPassword] = useState('pacha2026');
  const [driverVehicleMode, setDriverVehicleMode] = useState<'MANUAL' | 'EXISTING'>('MANUAL');
  const [driverVehicleId, setDriverVehicleId] = useState('');

  // Manual vehicle inputs requested by user:
  // "COMO ADMIN, EN NUEVO CONDUCTOR, PODER ESCRIBIR LAS CARACTERISTICAS DEL CARRO MANUALMENTE"
  const [manualMake, setManualMake] = useState('Toyota');
  const [manualModel, setManualModel] = useState('Fortuner');
  const [manualColor, setManualColor] = useState('Negro');
  const [manualPlate, setManualPlate] = useState('');
  const [manualYear, setManualYear] = useState<number>(2024);
  const [manualCapacity, setManualCapacity] = useState<number>(4);

  const [driverError, setDriverError] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Settings form state (Prompt: "COMO ADMIN PODER EDITAR TODA LA INFORMACION DE LA APP PARA EL CLIENTE")
  const [appSettingsForm, setAppSettingsForm] = useState<AppSettings>(() => PachaStorage.getSettings());
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);

  // Filter & Search
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('ALL');

  // New city form
  const [showCityModal, setShowCityModal] = useState(false);
  const [newCityName, setNewCityName] = useState('');

  // Fare editing modal
  const [editingFare, setEditingFare] = useState<RouteFare | null>(null);
  const [editPassengerPrice, setEditPassengerPrice] = useState(0);
  const [editShipmentPrice, setEditShipmentPrice] = useState(0);

  // Assign Driver Modal
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');

  // Assign Driver Modal (Shipments) - Requested by user
  const [assigningShipment, setAssigningShipment] = useState<Shipment | null>(null);
  const [selectedShipmentDriverId, setSelectedShipmentDriverId] = useState('');

  // GPS Location Modal state
  const [gpsModalData, setGpsModalData] = useState<{
    cityName: string;
    address: string;
    reference?: string;
    type: 'ORIGIN' | 'DESTINATION' | 'SHIPMENT';
    title?: string;
  } | null>(null);

  const refreshData = () => {
    setBookings(PachaStorage.getBookings());
    setShipments(PachaStorage.getShipments());
    setUsers(PachaStorage.getUsers());
    setCities(PachaStorage.getCities());
    setFares(PachaStorage.getFares());
    setVehicles(PachaStorage.getVehicles());
    const latestSettings = PachaStorage.getSettings();
    setSettings(latestSettings);
  };

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Determine active view from currentTab
  const activeTab = (() => {
    if (currentTab === 'admin-bookings') return 'BOOKINGS';
    if (currentTab === 'admin-shipments') return 'SHIPMENTS';
    if (currentTab === 'admin-drivers') return 'DRIVERS';
    if (currentTab === 'admin-customers') return 'CUSTOMERS';
    if (currentTab === 'admin-routes') return 'ROUTES';
    if (currentTab === 'admin-payments') return 'PAYMENTS';
    if (currentTab === 'admin-reports') return 'REPORTS';
    if (currentTab === 'admin-settings') return 'SETTINGS';
    return 'OVERVIEW';
  })();

  const handleSwitchTab = (tabId: string) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
  };

  // Metrics calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.travelDate === todayStr || b.createdAt.startsWith(todayStr));
  const todayShipments = shipments.filter((s) => s.createdAt.startsWith(todayStr));
  const totalIncome = bookings
    .filter((b) => b.status === 'FINALIZADO' || b.paymentStatus === 'PAID')
    .reduce((acc, curr) => acc + curr.totalPrice, 0) +
    shipments
      .filter((s) => s.status === 'ENTREGADO' || s.paymentStatus === 'PAID')
      .reduce((acc, curr) => acc + curr.price, 0);

  // Handle Driver Creation with Manual Vehicle characteristics option
  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    setDriverError(null);

    let assignedVehId: string | undefined = undefined;

    // If manual vehicle entry is selected, create vehicle first
    if (driverVehicleMode === 'MANUAL') {
      if (!manualPlate.trim()) {
        setDriverError('Por favor ingrese la placa del vehículo asignado.');
        return;
      }

      const newVeh = PachaStorage.addVehicle({
        make: manualMake.trim() || 'Toyota',
        model: manualModel.trim() || 'Fortuner',
        color: manualColor.trim() || 'Negro',
        plate: manualPlate.trim().toUpperCase(),
        year: manualYear || 2024,
        capacity: manualCapacity || 4,
        photoUrl: '',
        status: 'DISPONIBLE'
      });

      assignedVehId = newVeh.id;
    } else {
      assignedVehId = driverVehicleId || undefined;
    }

    const res = PachaAuth.createDriverAccount({
      fullName: driverName,
      cedula: driverCedula,
      phone: driverPhone,
      username: driverUsername,
      password: driverPassword,
      vehicleId: assignedVehId
    });

    if (res.success) {
      // If we created a vehicle, link driver to it
      if (assignedVehId && res.driver) {
        PachaStorage.updateVehicle(assignedVehId, { assignedDriverId: res.driver.id });
      }

      setShowDriverModal(false);
      setDriverName('');
      setDriverCedula('');
      setDriverPhone('');
      setDriverUsername('');
      setManualPlate('');
      refreshData();
      showNotification(`¡Conductor "${driverName}" registrado exitosamente con su unidad vehicular!`);
    } else {
      setDriverError(res.error || 'Error al crear conductor');
    }
  };

  // Handle Save App Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    PachaStorage.saveSettings(appSettingsForm);
    setSettings(appSettingsForm);
    setSettingsSavedMsg('¡Toda la información y datos bancarios fueron actualizados y ya son visibles para los clientes!');
    setTimeout(() => setSettingsSavedMsg(null), 4000);
  };

  // Handle Assign Driver to Booking
  const handleAssignDriverToBooking = () => {
    if (!assigningBooking || !selectedDriverId) return;

    const driver = users.find((u) => u.id === selectedDriverId);
    const vehicle = vehicles.find((v) => v.assignedDriverId === selectedDriverId) || vehicles[0];

    PachaStorage.assignDriverToBooking(
      assigningBooking.id,
      selectedDriverId,
      driver?.fullName || 'Conductor PACHA',
      driver?.phone || '0999999999',
      vehicle?.plate || 'MBA-3921',
      vehicle ? `${vehicle.model} (${vehicle.color})` : 'Toyota Corolla'
    );

    setAssigningBooking(null);
    setSelectedDriverId('');
    refreshData();
    showNotification(`Viaje ${assigningBooking.code} asignado al conductor ${driver?.fullName}.`);
  };

  // Handle Assign Driver to Shipment (Encomiendas)
  const handleAssignDriverToShipment = () => {
    if (!assigningShipment || !selectedShipmentDriverId) return;

    const driver = users.find((u) => u.id === selectedShipmentDriverId);
    const vehicle = vehicles.find((v) => v.assignedDriverId === selectedShipmentDriverId) || vehicles[0];

    PachaStorage.assignDriverToShipment(
      assigningShipment.id,
      selectedShipmentDriverId,
      driver?.fullName || 'Conductor PACHA',
      driver?.phone || '0999999999',
      vehicle?.plate || 'MBA-3921'
    );

    setAssigningShipment(null);
    setSelectedShipmentDriverId('');
    refreshData();
    showNotification(`Encomienda ${assigningShipment.code || assigningShipment.id} asignada al conductor ${driver?.fullName}.`);
  };

  // Handle Save Edited Fare
  const handleSaveFare = () => {
    if (!editingFare) return;
    PachaStorage.updateFare(editingFare.originCityName, editingFare.destinationCityName, {
      price: editPassengerPrice
    });
    setEditingFare(null);
    refreshData();
    showNotification('Tarifa actualizada correctamente.');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 text-white pb-28 space-y-6">
      {/* Admin Title Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B192C] to-[#0A192F] border border-amber-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              Administración Central
            </span>
            <span className="text-xs text-slate-400">Operador: {currentUser.fullName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-brand mt-1">
            Panel de Operaciones PACHA
          </h2>
          <p className="text-xs text-slate-300">
            Despacho de viajes, encomiendas, choferes, flota y configuración general.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-admin-add-driver-quick"
            onClick={() => setShowDriverModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Nuevo Conductor</span>
          </button>
          <button
            onClick={() => handleSwitchTab('admin-settings')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-amber-500/30"
          >
            <Settings className="w-4 h-4" />
            <span>Editar Datos de App</span>
          </button>
        </div>
      </div>

      {/* Global alert banner */}
      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Inner Synchronized Tab Bar */}
      <div className="bg-[#0B192C] p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 overflow-x-auto">
        <button
          id="tab-admin-dashboard"
          onClick={() => handleSwitchTab('admin-dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'OVERVIEW' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          id="tab-admin-bookings"
          onClick={() => handleSwitchTab('admin-bookings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'BOOKINGS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Viajes ({bookings.length})</span>
        </button>

        <button
          id="tab-admin-shipments"
          onClick={() => handleSwitchTab('admin-shipments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'SHIPMENTS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Encomiendas ({shipments.length})</span>
        </button>

        <button
          id="tab-admin-drivers"
          onClick={() => handleSwitchTab('admin-drivers')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'DRIVERS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Conductores & Flota</span>
        </button>

        <button
          id="tab-admin-customers"
          onClick={() => handleSwitchTab('admin-customers')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'CUSTOMERS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes</span>
        </button>

        <button
          id="tab-admin-routes"
          onClick={() => handleSwitchTab('admin-routes')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ROUTES' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Tarifas & Rutas</span>
        </button>

        <button
          id="tab-admin-payments"
          onClick={() => handleSwitchTab('admin-payments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'PAYMENTS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Control de Pagos</span>
        </button>

        <button
          id="tab-admin-reports"
          onClick={() => handleSwitchTab('admin-reports')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'REPORTS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reportes</span>
        </button>

        <button
          id="tab-admin-settings"
          onClick={() => handleSwitchTab('admin-settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'SETTINGS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Editar Info App</span>
        </button>
      </div>

      {/* 1. OVERVIEW DASHBOARD TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => handleSwitchTab('admin-bookings')}
              className="p-5 rounded-2xl bg-[#0B192C] border border-amber-500/20 shadow-lg cursor-pointer hover:border-amber-400 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Viajes Hoy</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">
                {todayBookings.length}
              </div>
              <p className="text-[11px] text-amber-400 mt-1">
                {bookings.filter((b) => b.status === 'SOLICITADA').length} pendientes de chofer →
              </p>
            </div>

            <div
              onClick={() => handleSwitchTab('admin-shipments')}
              className="p-5 rounded-2xl bg-[#0B192C] border border-sky-500/20 shadow-lg cursor-pointer hover:border-sky-400 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Encomiendas Hoy</span>
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">
                {todayShipments.length}
              </div>
              <p className="text-[11px] text-sky-400 mt-1">
                {shipments.filter((s) => s.status === 'REGISTRADO').length} listas para despacho →
              </p>
            </div>

            <div
              onClick={() => handleSwitchTab('admin-drivers')}
              className="p-5 rounded-2xl bg-[#0B192C] border border-emerald-500/20 shadow-lg cursor-pointer hover:border-emerald-400 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Conductores Activos</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Car className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">
                {users.filter((u) => u.role === 'DRIVER').length}
              </div>
              <p className="text-[11px] text-emerald-400 mt-1">Flota ejecutiva disponible →</p>
            </div>

            <div
              onClick={() => handleSwitchTab('admin-payments')}
              className="p-5 rounded-2xl bg-[#0B192C] border border-amber-500/20 shadow-lg cursor-pointer hover:border-amber-400 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Ingresos Totales</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 font-mono">
                ${totalIncome.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Servicios completados</p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-[#0B192C] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                  Últimas Reservas de Clientes
                </h3>
                <button
                  onClick={() => handleSwitchTab('admin-bookings')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Ver todas ({bookings.length})
                </button>
              </div>

              <div className="space-y-2">
                {bookings.slice(0, 4).map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{b.customerName}</span>
                      <p className="text-slate-400">{b.originCityName} → {b.destinationCityName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400">${b.totalPrice.toFixed(2)}</span>
                      <span className="block text-[10px] text-slate-400">{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#0B192C] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">
                  Últimas Encomiendas
                </h3>
                <button
                  onClick={() => handleSwitchTab('admin-shipments')}
                  className="text-xs text-sky-400 hover:underline"
                >
                  Ver todas ({shipments.length})
                </button>
              </div>

              <div className="space-y-2">
                {shipments.slice(0, 4).map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">De {s.senderName} a {s.receiverName}</span>
                      <p className="text-slate-400">{s.packageDescription} ({s.destinationCityName})</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-sky-400">${s.price.toFixed(2)}</span>
                      <span className="block text-[10px] text-amber-400 font-mono">Clave: {s.securityCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BOOKINGS MANAGEMENT */}
      {activeTab === 'BOOKINGS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Despacho y Asignación de Viajes</h3>
              <p className="text-xs text-slate-400">Asigna conductores a las reservas de los clientes</p>
            </div>

            {/* Status Filter */}
            <div className="flex gap-1 overflow-x-auto text-xs">
              {['ALL', 'SOLICITADA', 'ASIGNADA', 'EN_RUTA', 'FINALIZADO'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBookingFilterStatus(st)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    bookingFilterStatus === st
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'Todos' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {bookings
              .filter((b) => bookingFilterStatus === 'ALL' || b.status === bookingFilterStatus)
              .map((b) => (
                <div
                  key={b.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0B192C] border border-slate-800 hover:border-amber-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{b.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-white font-mono">${b.totalPrice.toFixed(2)}</span>
                      <span className="block text-[10px] text-slate-400">{b.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Pasajero</span>
                      <p className="font-bold text-white">{b.customerName}</p>
                      <p className="text-slate-400">{b.customerPhone}</p>
                      <p className="text-slate-400">{b.passengerCount} pasajero(s)</p>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Ruta & Horario</span>
                      <p className="font-bold text-amber-300">{b.originCityName} → {b.destinationCityName}</p>
                      <p className="text-slate-300">Fecha: {b.travelDate} ({b.travelTime})</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-slate-400 truncate text-[11px]">Dir: {b.pickupAddress}</p>
                        <button
                          onClick={() => setGpsModalData({
                            cityName: b.originCityName,
                            address: b.pickupAddress,
                            type: 'ORIGIN',
                            title: `Punto de Recogida - Viaje ${b.code || b.id}`
                          })}
                          className="shrink-0 px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition"
                          title="Ver ubicación exacta en GPS"
                        >
                          <Navigation className="w-2.5 h-2.5" />
                          <span>GPS</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Conductor Asignado</span>
                      {b.assignedDriverName ? (
                        <div>
                          <p className="font-bold text-emerald-400">{b.assignedDriverName}</p>
                          <p className="text-slate-400">Placa: {b.assignedVehiclePlate || 'Toyota'}</p>
                        </div>
                      ) : (
                        <span className="text-amber-400 font-bold">⚠️ Sin asignar</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      id={`btn-assign-driver-${b.id}`}
                      onClick={() => setAssigningBooking(b)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                    >
                      {b.assignedDriverName ? 'Cambiar Conductor' : 'Asignar Conductor'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 3. SHIPMENTS (ENCOMIENDAS) */}
      {activeTab === 'SHIPMENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Todas las Encomiendas Registradas</h3>
            <span className="text-xs text-slate-400">Total: {shipments.length} paquetes</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {shipments.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{s.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {s.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 font-mono">${s.price.toFixed(2)}</span>
                    <div className="text-[11px] text-amber-300 font-mono font-bold">
                      Código de 4 dígitos: <span className="underline bg-slate-900 px-2 py-0.5 rounded text-amber-400">{s.securityCode}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Remitente:</span>
                    <p className="font-semibold text-white">{s.senderName}</p>
                    <p className="text-slate-400">{s.senderPhone}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-amber-300 font-medium">{s.originCityName}</span>
                      <button
                        onClick={() => setGpsModalData({
                          cityName: s.originCityName,
                          address: s.pickupAddress || `${s.originCityName}, Centro`,
                          type: 'ORIGIN',
                          title: `Origen Encomienda ${s.id}`
                        })}
                        className="px-1.5 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[10px] font-bold flex items-center gap-0.5 transition"
                        title="Ver GPS de Origen"
                      >
                        <Navigation className="w-2.5 h-2.5" />
                        <span>GPS</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Destinatario:</span>
                    <p className="font-semibold text-white">{s.receiverName}</p>
                    <p className="text-slate-400">{s.receiverPhone}</p>
                    <p className="text-slate-300 truncate">{s.destinationCityName}: {s.deliveryAddress}</p>
                    <div className="mt-1">
                      <button
                        onClick={() => setGpsModalData({
                          cityName: s.destinationCityName,
                          address: s.deliveryAddress,
                          type: 'DESTINATION',
                          title: `Destino Encomienda ${s.id}`
                        })}
                        className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition"
                        title="Ver GPS de Entrega"
                      >
                        <Navigation className="w-2.5 h-2.5" />
                        <span>GPS</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Contenido:</span>
                    <p className="text-slate-300">{s.packageDescription}</p>
                    <p className="text-slate-400 font-mono">Peso: {s.approxWeightKg} kg</p>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Conductor Asignado:</span>
                    {s.assignedDriverId && s.driverName ? (
                      <div className="space-y-0.5">
                        <p className="font-bold text-emerald-400">{s.driverName}</p>
                        <p className="text-[11px] text-slate-400">Tel: {s.driverPhone || '0999999999'}</p>
                        <p className="text-[11px] text-slate-400">Placa: {s.vehiclePlate || 'Toyota'}</p>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <span className="text-amber-400 text-[11px] font-bold block">⚠️ Sin conductor asignado</span>
                        <span className="text-[10px] text-slate-400 block">El conductor no podrá realizar la entrega hasta ser asignado</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Estado: <strong className="text-amber-300 uppercase">{s.status.replace(/_/g, ' ')}</strong>
                  </span>

                  {/* ASIGNAR CONDUCTOR BUTTON FOR SHIPMENTS (Requested by user) */}
                  <button
                    id={`btn-assign-driver-shipment-${s.id}`}
                    onClick={() => {
                      setAssigningShipment(s);
                      setSelectedShipmentDriverId(s.assignedDriverId || '');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition"
                  >
                    <span>{s.assignedDriverId ? 'Cambiar Conductor' : 'Asignar Conductor'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DRIVERS & FLEET (Prompt: "COMO ADMIN, EN NUEVO CONDUCTOR, PODER ESCRIBIR LAS CARACTERISTICAS DEL CARRO MANUALMENTE") */}
      {activeTab === 'DRIVERS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Conductores y Flota Ejecutiva</h3>
              <p className="text-xs text-slate-400">
                Registra choferes y escribe los datos del carro manualmente o asigna de la flota
              </p>
            </div>
            <button
              id="btn-open-create-driver"
              onClick={() => setShowDriverModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>NUEVO CONDUCTOR (INGRESAR CARRO)</span>
            </button>
          </div>

          {/* Drivers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.filter((u) => u.role === 'DRIVER').map((driver) => {
              const assignedVeh = vehicles.find((v) => v.assignedDriverId === driver.id);
              return (
                <div
                  key={driver.id}
                  className="p-5 rounded-2xl bg-[#0B192C] border border-amber-500/20 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{driver.fullName}</h4>
                        <p className="text-xs text-slate-400 font-mono">
                          Usuario: <span className="text-amber-400 font-bold">{driver.username}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {driver.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 text-xs space-y-1.5">
                    <p className="text-slate-300">
                      <span className="text-slate-500">Cédula:</span> {driver.cedula || driver.username}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-500">Teléfono:</span> {driver.phone}
                    </p>
                    <div className="pt-1.5 border-t border-slate-800">
                      <span className="text-amber-400 text-[10px] uppercase font-bold block mb-0.5">
                        Características del Vehículo Asignado:
                      </span>
                      {assignedVeh ? (
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">
                            {assignedVeh.make} {assignedVeh.model} ({assignedVeh.year}) • Color {assignedVeh.color}
                          </span>
                          <span className="font-mono text-amber-300 font-bold px-2 py-0.5 rounded bg-slate-950 border border-amber-500/40">
                            {assignedVeh.plate}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Sin unidad asignada</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. CUSTOMERS */}
      {activeTab === 'CUSTOMERS' && (
        <div className="p-5 rounded-3xl bg-[#0B192C] border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Directorio de Clientes Registrados</h3>
              <p className="text-xs text-slate-400">Historial y contacto de usuarios</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o cédula..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Cédula</th>
                  <th className="p-3">Teléfono</th>
                  <th className="p-3">Viajes Realizados</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users
                  .filter((u) => u.role === 'CUSTOMER')
                  .filter((c) =>
                    c.fullName.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                    (c.cedula && c.cedula.includes(clientSearchQuery))
                  )
                  .map((c) => {
                    const clientTrips = bookings.filter((b) => b.customerId === c.id || b.customerPhone === c.phone);
                    return (
                      <tr key={c.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-semibold text-white">{c.fullName}</td>
                        <td className="p-3 font-mono">{c.cedula || c.username}</td>
                        <td className="p-3">{c.phone}</td>
                        <td className="p-3 font-bold text-amber-400 font-mono">{clientTrips.length} viajes</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            {c.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CITIES & FARES */}
      {activeTab === 'ROUTES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Ciudades Habilitadas y Tarifario Oficial</h3>
              <p className="text-xs text-slate-400">
                Los clientes únicamente pueden seleccionar estas paradas. Precios editables en tiempo real.
              </p>
            </div>
            <button
              onClick={() => setShowCityModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Ciudad</span>
            </button>
          </div>

          {/* Active Cities Chips */}
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <div
                key={city.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-white">{city.name}</span>
                <button
                  onClick={() => {
                    PachaStorage.toggleCityActive(city.id);
                    refreshData();
                  }}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    city.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {city.isActive ? 'Habilitada' : 'Deshabilitada'}
                </button>
              </div>
            ))}
          </div>

          {/* Fare Matrix Table */}
          <div className="p-5 rounded-3xl bg-[#0B192C] border border-slate-800 shadow-xl">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">
              Tabla de Tarifas por Ruta
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Ruta (Origen ↔ Destino)</th>
                    <th className="p-3">Precio Pasajero</th>
                    <th className="p-3">Base Encomienda</th>
                    <th className="p-3">Tiempo Estimado</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {fares.map((fare, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-white">
                        {fare.originCityName} ↔ {fare.destinationCityName}
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-400">
                        ${fare.passengerPrice.toFixed(2)}
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        ${fare.shipmentBasePrice.toFixed(2)}
                      </td>
                      <td className="p-3 text-slate-400">
                        {Math.round(fare.estimatedMinutes / 60)}h {fare.estimatedMinutes % 60}m
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setEditingFare(fare);
                            setEditPassengerPrice(fare.passengerPrice);
                            setEditShipmentPrice(fare.shipmentBasePrice);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold"
                        >
                          Modificar Tarifa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. PAYMENTS & TRANSFER RECEIPTS REVIEW */}
      {activeTab === 'PAYMENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Control de Pagos y Transferencias Bancarias</h3>
              <p className="text-xs text-slate-400">Revisa comprobantes y aprueba pagos de clientes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {bookings
              .filter((b) => b.paymentMethod === 'TRANSFER')
              .map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{b.id}</span>
                    <span className="text-xs font-bold text-white font-mono">${b.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-xs flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{b.customerName}</p>
                      <p className="text-slate-400">{b.originCityName} → {b.destinationCityName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {b.paymentStatus}
                      </span>
                      {b.paymentStatus !== 'PAID' && (
                        <button
                          onClick={() => {
                            PachaStorage.approveBookingPayment(b.id);
                            refreshData();
                            showNotification(`Pago del viaje ${b.id} aprobado exitosamente.`);
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Aprobar Pago
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 8. REPORTS */}
      {activeTab === 'REPORTS' && (
        <div className="p-6 rounded-3xl bg-[#0B192C] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Métricas y Reportes de Operación</h3>
          <p className="text-xs text-slate-400">Consolidado general de PACHA en Manabí</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Pasajeros Transportados</span>
              <p className="text-2xl font-black text-amber-400 mt-1 font-mono">
                {bookings.reduce((acc, curr) => acc + curr.passengerCount, 0)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Encomiendas Movilizadas</span>
              <p className="text-2xl font-black text-sky-400 mt-1 font-mono">
                {shipments.length}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Ruta Principal Más Solicitada</span>
              <p className="text-sm font-bold text-white mt-1">
                Portoviejo ↔ Pedernales
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 9. SETTINGS & APP CUSTOMIZATION (Prompt: "COMO ADMIN PODER EDITAR TODA LA INFORMACION DE LA APP PARA EL CLIENTE, COMO POR EJEMPLO, CUENTA DEL BANCO Y TODOS LOS TEXTOS QUE SEAN IMPORTANTES EDITARLOS EN TAL CASO") */}
      {activeTab === 'SETTINGS' && (
        <div className="p-5 sm:p-7 rounded-3xl bg-[#0B192C] border border-amber-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Personalización General y Datos Bancarios
              </span>
              <h3 className="text-xl font-black text-white font-brand">
                Editar Información de la App para Clientes
              </h3>
              <p className="text-xs text-slate-400">
                Los cambios guardados aquí se reflejarán inmediatamente en toda la app para los usuarios.
              </p>
            </div>
          </div>

          {settingsSavedMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{settingsSavedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            {/* Section 1: Official Bank Account */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-black uppercase tracking-wider">
                <Building className="w-4 h-4" />
                <span>1. Cuenta Bancaria Oficial para Transferencias de Clientes</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Esta información se mostrará al cliente cuando seleccione pagar por transferencia bancaria.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nombre del Banco *</label>
                  <input
                    type="text"
                    required
                    value={appSettingsForm.bankName}
                    onChange={(e) => setAppSettingsForm({ ...appSettingsForm, bankName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tipo de Cuenta *</label>
                  <input
                    type="text"
                    required
                    value={appSettingsForm.bankAccountType}
                    onChange={(e) => setAppSettingsForm({ ...appSettingsForm, bankAccountType: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Número de Cuenta *</label>
                  <input
                    type="text"
                    required
                    value={appSettingsForm.bankAccountNumber}
                    onChange={(e) => setAppSettingsForm({ ...appSettingsForm, bankAccountNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Titular de la Cuenta *</label>
                  <input
                    type="text"
                    required
                    value={appSettingsForm.bankAccountHolder}
                    onChange={(e) => setAppSettingsForm({ ...appSettingsForm, bankAccountHolder: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">RUC o Cédula del Titular *</label>
                  <input
                    type="text"
                    required
                    value={appSettingsForm.bankIdNumber || ''}
                    onChange={(e) => setAppSettingsForm({ ...appSettingsForm, bankIdNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Correo para Envío de Comprobantes *</label>
                  <input
                    type="email"
                    required
                    value={appSettingsForm.bankEmail || ''}
                    onChange={(e) => setAppSettingsForm({ ...appSettingsForm, bankEmail: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Important Texts & App Labels */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sky-400 font-black uppercase tracking-wider">
                <MessageSquare className="w-4 h-4" />
                <span>2. Textos Importantes y Contacto Visible en la App</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nombre Comercial de la App</label>
                  <input
                    type="text"
                    required
                    value={appSettingsForm.appName}
                    onChange={(e) => setAppSettingsForm({ ...appSettingsForm, appName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Razón Social / Eslogan Oficial</label>
                  <input
                    type="text"
                    required
                    value={appSettingsForm.appTagline}
                    onChange={(e) => setAppSettingsForm({ ...appSettingsForm, appTagline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Texto de Ruta Principal</label>
                  <input
                    type="text"
                    required
                    value={appSettingsForm.primaryRouteText}
                    onChange={(e) => setAppSettingsForm({ ...appSettingsForm, primaryRouteText: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">WhatsApp de Atención al Cliente</label>
                  <input
                    type="text"
                    required
                    value={appSettingsForm.supportWhatsapp}
                    onChange={(e) => setAppSettingsForm({ ...appSettingsForm, supportWhatsapp: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-sky-400 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Mensaje de Bienvenida / Aviso para el Cliente</label>
                  <textarea
                    rows={2}
                    value={appSettingsForm.welcomeNotice || ''}
                    onChange={(e) => setAppSettingsForm({ ...appSettingsForm, welcomeNotice: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Terms & Policies */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>3. Políticas del Servicio Mostradas al Cliente</span>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Política de Cancelación de Viajes</label>
                <textarea
                  rows={2}
                  value={appSettingsForm.cancellationPolicy}
                  onChange={(e) => setAppSettingsForm({ ...appSettingsForm, cancellationPolicy: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Condiciones para Envío de Encomiendas</label>
                <textarea
                  rows={2}
                  value={appSettingsForm.shipmentTerms}
                  onChange={(e) => setAppSettingsForm({ ...appSettingsForm, shipmentTerms: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>GUARDAR CAMBIOS EN LA APLICACIÓN</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL: CREATE DRIVER WITH MANUAL VEHICLE CHARACTERISTICS */}
      {showDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#0B192C] border-2 border-amber-500/40 p-6 text-white shadow-2xl relative my-8">
            <button
              onClick={() => setShowDriverModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-400 font-brand">Registrar Nuevo Conductor</h3>
                <p className="text-xs text-slate-400">
                  Crea credenciales y escribe los datos del carro manualmente
                </p>
              </div>
            </div>

            {driverError && (
              <div className="mb-3 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{driverError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDriver} className="space-y-4 text-xs">
              {/* Personal Data */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  1. Datos del Conductor
                </span>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza Vera"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Cédula *</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={driverCedula}
                      onChange={(e) => setDriverCedula(e.target.value.replace(/\D/g, ''))}
                      placeholder="1310857063"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Teléfono Móvil *</label>
                    <input
                      type="tel"
                      required
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="0998877665"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Usuario de Acceso *</label>
                    <input
                      type="text"
                      required
                      value={driverUsername}
                      onChange={(e) => setDriverUsername(e.target.value)}
                      placeholder="chofer4"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Contraseña *</label>
                    <input
                      type="text"
                      required
                      value={driverPassword}
                      onChange={(e) => setDriverPassword(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Assignment Mode: Manual entry requested by user */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    2. Características del Carro Asignado
                  </span>
                  <div className="flex gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setDriverVehicleMode('MANUAL')}
                      className={`px-2 py-1 rounded-lg font-bold ${
                        driverVehicleMode === 'MANUAL' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Escribir Manualmente
                    </button>
                    <button
                      type="button"
                      onClick={() => setDriverVehicleMode('EXISTING')}
                      className={`px-2 py-1 rounded-lg font-bold ${
                        driverVehicleMode === 'EXISTING' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Seleccionar de Flota
                    </button>
                  </div>
                </div>

                {driverVehicleMode === 'MANUAL' ? (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-slate-400">
                      Escriba manualmente las especificaciones del automóvil ejecutivo:
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Marca *</label>
                        <input
                          type="text"
                          required
                          value={manualMake}
                          onChange={(e) => setManualMake(e.target.value)}
                          placeholder="Ej. Toyota"
                          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Modelo *</label>
                        <input
                          type="text"
                          required
                          value={manualModel}
                          onChange={(e) => setManualModel(e.target.value)}
                          placeholder="Ej. Fortuner / Hilux"
                          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Color *</label>
                        <input
                          type="text"
                          required
                          value={manualColor}
                          onChange={(e) => setManualColor(e.target.value)}
                          placeholder="Ej. Negro Ejecutivo"
                          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Placa del Carro *</label>
                        <input
                          type="text"
                          required
                          value={manualPlate}
                          onChange={(e) => setManualPlate(e.target.value.toUpperCase())}
                          placeholder="MBA-4589"
                          className="w-full p-2 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-300 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Año del Carro</label>
                        <input
                          type="number"
                          value={manualYear}
                          onChange={(e) => setManualYear(parseInt(e.target.value) || 2024)}
                          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Capacidad Pasajeros</label>
                        <input
                          type="number"
                          value={manualCapacity}
                          onChange={(e) => setManualCapacity(parseInt(e.target.value) || 4)}
                          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Seleccionar Unidad Existente</label>
                    <select
                      value={driverVehicleId}
                      onChange={(e) => setDriverVehicleId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    >
                      <option value="">-- Sin vehículo de lista --</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.make} {v.model} ({v.plate}) - {v.color}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-wider shadow-lg"
              >
                REGISTRAR CONDUCTOR Y VINCULAR VEHÍCULO
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN DRIVER TO BOOKING */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0B192C] border border-amber-500/30 p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setAssigningBooking(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-amber-400 mb-1">Asignar Conductor</h3>
            <p className="text-xs text-slate-400 mb-4">
              Viaje {assigningBooking.id} • {assigningBooking.originCityName} → {assigningBooking.destinationCityName}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Seleccionar Conductor Disponible:
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                >
                  <option value="">-- Seleccione un conductor --</option>
                  {users.filter((u) => u.role === 'DRIVER').map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAssignDriverToBooking}
                disabled={!selectedDriverId}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider disabled:opacity-40"
              >
                CONFIRMAR ASIGNACIÓN Y NOTIFICAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FARE */}
      {editingFare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0B192C] border border-amber-500/30 p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setEditingFare(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-amber-400 mb-1">Modificar Tarifa Oficial</h3>
            <p className="text-xs text-slate-400 mb-4">
              {editingFare.originCityName} ↔ {editingFare.destinationCityName}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Precio por Pasajero (USD) *</label>
                <input
                  type="number"
                  step="0.50"
                  value={editPassengerPrice}
                  onChange={(e) => setEditPassengerPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Tarifa Base Encomienda (USD) *</label>
                <input
                  type="number"
                  step="0.50"
                  value={editShipmentPrice}
                  onChange={(e) => setEditShipmentPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
                />
              </div>

              <button
                onClick={handleSaveFare}
                className="w-full mt-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-wider"
              >
                GUARDAR CAMBIOS EN TABLA DE TARIFAS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CITY */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0B192C] border border-amber-500/30 p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowCityModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-amber-400 mb-1">Habilitar Nueva Ciudad</h3>
            <p className="text-xs text-slate-400 mb-4">
              Agrega una parada autorizada para el recorrido de PACHA
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="Ej. Tosagua o Chone"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
              />

              <button
                onClick={() => {
                  if (newCityName.trim()) {
                    PachaStorage.addCity(newCityName.trim());
                    setNewCityName('');
                    setShowCityModal(false);
                    refreshData();
                    showNotification(`Ciudad "${newCityName.trim()}" habilitada.`);
                  }
                }}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase"
              >
                HABILITAR CIUDAD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN DRIVER TO SHIPMENT (Requested by user) */}
      {assigningShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0B192C] border border-amber-500/40 p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setAssigningShipment(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Package className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-white">Asignar Conductor</h3>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  Encomienda {assigningShipment.id}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs mb-4 space-y-1">
              <p className="text-slate-300">
                <span className="text-slate-500">Ruta:</span> <strong>{assigningShipment.originCityName} → {assigningShipment.destinationCityName}</strong>
              </p>
              <p className="text-slate-300 truncate">
                <span className="text-slate-500">Destinatario:</span> {assigningShipment.receiverName} ({assigningShipment.receiverPhone})
              </p>
              <p className="text-slate-300 truncate">
                <span className="text-slate-500">Dirección:</span> {assigningShipment.deliveryAddress}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-500">Paquete:</span> {assigningShipment.packageDescription} ({assigningShipment.approxWeightKg} kg)
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Seleccionar Conductor Responsable:
                </label>
                <select
                  id="select-shipment-driver"
                  value={selectedShipmentDriverId}
                  onChange={(e) => setSelectedShipmentDriverId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Seleccione un conductor --</option>
                  {users
                    .filter((u) => u.role === 'DRIVER')
                    .map((d) => {
                      const veh = vehicles.find((v) => v.assignedDriverId === d.id);
                      return (
                        <option key={d.id} value={d.id}>
                          {d.fullName} ({d.phone}) {veh ? `• ${veh.model} (${veh.plate})` : ''}
                        </option>
                      );
                    })}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Al asignar, la encomienda pasará a "EN TRÁNSITO" y el chofer la verá en su lista de entregas activas.
                </p>
              </div>

              <button
                id="btn-confirm-assign-shipment"
                onClick={handleAssignDriverToShipment}
                disabled={!selectedShipmentDriverId}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider disabled:opacity-40 shadow-lg active:scale-95 transition"
              >
                CONFIRMAR Y ASIGNAR ENCOMIENDA
              </button>
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
