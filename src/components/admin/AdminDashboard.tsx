import React, { useState, useRef, useEffect } from 'react';
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
  Navigation,
  Trash2,
  QrCode,
  Upload,
  Phone,
  Filter,
  UserX,
  UserCheck
} from 'lucide-react';
import { User, Booking, Shipment, City, RouteFare, Vehicle, BookingStatus, AppSettings } from '../../types';
import { PachaStorage } from '../../services/storage';
import { PachaAuth } from '../../services/auth';
import { GpsLocationModal } from '../common/GpsLocationModal';
import { optimizeImageFile } from '../../utils/imageOptimizer';

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
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
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

  // QR Code file input refs for official banks
  const pichinchaQrInputRef = useRef<HTMLInputElement>(null);
  const guayaquilQrInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    refreshData();
    const unsub = PachaStorage.subscribe(refreshData);
    return () => unsub();
  }, []);

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

  // Handle Delete Finished Booking (Requested: "COMO ADMIN, DEBE APARECER UN BOTON DE PODER ELIMINAR EL VIAJE UNICAMENTE CUANDO EL ESTADO DEL VIAJE ES FINALIZADO")
  const handleDeleteBooking = (bookingId: string, bookingRef: string) => {
    if (window.confirm(`¿Está seguro de que desea eliminar permanentemente este viaje finalizado (${bookingRef})? Esta acción no se puede deshacer.`)) {
      PachaStorage.deleteBooking(bookingId);
      refreshData();
      showNotification('¡Viaje finalizado eliminado exitosamente!');
    }
  };

  // Handle Delete Delivered Shipment (Requested: "EN LAS ENCOMIENDAS PODER ELIMINARLA UNICAMENTE CUANDO EL ESTADO ES ENTREGADA")
  const handleDeleteShipment = (shipmentId: string, desc: string) => {
    if (window.confirm(`¿Está seguro de que desea eliminar permanentemente esta encomienda entregada "${desc}" (${shipmentId})? Esta acción no se puede deshacer.`)) {
      PachaStorage.deleteShipment(shipmentId);
      refreshData();
      showNotification('¡Encomienda entregada eliminada exitosamente!');
    }
  };

  // Handle Toggle Suspend Customer (User requirement: "COMO ADMIN DEBO PODER SUSPENDER Y ELIMINAR CLIENTES")
  const handleToggleSuspendCustomer = (customer: User) => {
    const isCurrentlyActive = customer.status === 'active';
    const confirmPrompt = isCurrentlyActive
      ? `¿Está seguro de que desea SUSPENDER la cuenta del cliente "${customer.fullName}" (Cédula: ${customer.cedula || customer.username})?\n\nEl usuario no podrá solicitar viajes ni enviar encomiendas mientras esté suspendido.`
      : `¿Desea REACTIVAR la cuenta del cliente "${customer.fullName}" (Cédula: ${customer.cedula || customer.username})?\n\nEl usuario podrá volver a solicitar servicios y acceder a la plataforma.`;

    if (window.confirm(confirmPrompt)) {
      const nextStatus = isCurrentlyActive ? 'suspended' : 'active';
      PachaStorage.updateUserStatus(customer.id, nextStatus);
      refreshData();
      showNotification(
        isCurrentlyActive
          ? `Cliente "${customer.fullName}" ha sido SUSPENDIDO.`
          : `Cliente "${customer.fullName}" ha sido REACTIVADO exitosamente.`
      );
    }
  };

  // Handle Delete Customer (User requirement: "COMO ADMIN DEBO PODER SUSPENDER Y ELIMINAR CLIENTES")
  const handleDeleteCustomer = (customer: User) => {
    if (
      window.confirm(
        `¿Está seguro de que desea ELIMINAR PERMANENTEMENTE al cliente "${customer.fullName}" (Cédula: ${customer.cedula || customer.username})?\n\nEsta acción borrará definitivamente su cuenta del sistema y no se puede deshacer.`
      )
    ) {
      PachaStorage.deleteUser(customer.id);
      refreshData();
      showNotification(`Cliente "${customer.fullName}" eliminado permanentemente.`);
    }
  };

  // Handle Toggle Suspend Driver (User requirement: "COMO ADMIN, DEBO PODER SUSPENDER, ELIMINAR Y REACTIVAR CUENTAS DE CONDUCTORES")
  const handleToggleSuspendDriver = (driver: User) => {
    const isCurrentlyActive = driver.status === 'active';
    const confirmPrompt = isCurrentlyActive
      ? `¿Está seguro de que desea SUSPENDER al conductor "${driver.fullName}" (Cédula: ${driver.cedula || driver.username})?\n\nEl conductor no podrá iniciar sesión ni atender viajes o encomiendas mientras esté suspendido.`
      : `¿Desea REACTIVAR al conductor "${driver.fullName}" (Cédula: ${driver.cedula || driver.username})?\n\nEl conductor podrá volver a iniciar sesión, conectarse y recibir solicitudes de viajes y encomiendas.`;

    if (window.confirm(confirmPrompt)) {
      const nextStatus = isCurrentlyActive ? 'suspended' : 'active';
      PachaStorage.updateUserStatus(driver.id, nextStatus);
      refreshData();
      showNotification(
        isCurrentlyActive
          ? `Conductor "${driver.fullName}" ha sido SUSPENDIDO.`
          : `Conductor "${driver.fullName}" ha sido REACTIVADO exitosamente.`
      );
    }
  };

  // Handle Delete Driver (User requirement: "COMO ADMIN, DEBO PODER SUSPENDER, ELIMINAR Y REACTIVAR CUENTAS DE CONDUCTORES")
  const handleDeleteDriver = (driver: User) => {
    if (
      window.confirm(
        `¿Está seguro de que desea ELIMINAR PERMANENTEMENTE al conductor "${driver.fullName}" (Cédula: ${driver.cedula || driver.username})?\n\nEsta acción eliminará de forma definitiva su cuenta del sistema y liberará cualquier vehículo asociado. No se puede deshacer.`
      )
    ) {
      PachaStorage.deleteUser(driver.id);
      refreshData();
      showNotification(`Conductor "${driver.fullName}" eliminado permanentemente.`);
    }
  };

  // Handle Bank QR Uploads (Requested: "AGREGA UN CUADRO PARA SUBIR UNA IMAGEN DEL QR DEL BANCO, DAME DOS OPCIONES PICHINCHA Y GUAYAQUIL")
  const handleUploadBankQr = async (
    e: React.ChangeEvent<HTMLInputElement>,
    bankType: 'pichincha' | 'guayaquil'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    try {
      const dataUrl = await optimizeImageFile(file, 700, 700, 0.85);
      const field = bankType === 'pichincha' ? 'bankQrPichincha' : 'bankQrGuayaquil';
      const updated = { ...appSettingsForm, [field]: dataUrl };
      setAppSettingsForm(updated);
      PachaStorage.saveSettings(updated);
      showNotification(`¡Código QR de ${bankType === 'pichincha' ? 'Banco Pichincha (DeUna)' : 'Banco Guayaquil'} subido y guardado con éxito!`);
    } catch (err) {
      console.error('Error subiendo QR:', err);
      alert('Error al procesar la imagen del QR. Por favor use una imagen JPG, PNG o WebP.');
    }
  };

  const handleRemoveBankQr = (bankType: 'pichincha' | 'guayaquil') => {
    if (window.confirm(`¿Desea eliminar el código QR de ${bankType === 'pichincha' ? 'Banco Pichincha (DeUna)' : 'Banco Guayaquil'}?`)) {
      const field = bankType === 'pichincha' ? 'bankQrPichincha' : 'bankQrGuayaquil';
      const updated = { ...appSettingsForm, [field]: '' };
      setAppSettingsForm(updated);
      PachaStorage.saveSettings(updated);
      showNotification(`Código QR de ${bankType === 'pichincha' ? 'Banco Pichincha' : 'Banco Guayaquil'} eliminado.`);
    }
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

      {/* 1. OVERVIEW DASHBOARD TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div
              onClick={() => handleSwitchTab('admin-bookings')}
              className="p-4 sm:p-5 rounded-2xl bg-[#0B192C] border border-amber-500/20 shadow-lg cursor-pointer hover:border-amber-400 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Viajes Hoy</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-black text-white mt-2 font-mono">
                {todayBookings.length}
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-400 mt-1">
                {bookings.filter((b) => b.status === 'SOLICITADA').length} pendientes →
              </p>
            </div>

            <div
              onClick={() => handleSwitchTab('admin-shipments')}
              className="p-4 sm:p-5 rounded-2xl bg-[#0B192C] border border-sky-500/20 shadow-lg cursor-pointer hover:border-sky-400 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Encomiendas</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-sky-500/10 text-sky-400">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-black text-white mt-2 font-mono">
                {todayShipments.length}
              </div>
              <p className="text-[10px] sm:text-[11px] text-sky-400 mt-1">
                {shipments.filter((s) => s.status === 'REGISTRADO').length} por despachar →
              </p>
            </div>

            <div
              onClick={() => handleSwitchTab('admin-drivers')}
              className="p-4 sm:p-5 rounded-2xl bg-[#0B192C] border border-emerald-500/20 shadow-lg cursor-pointer hover:border-emerald-400 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Conductores</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-black text-white mt-2 font-mono">
                {users.filter((u) => u.role === 'DRIVER').length}
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-400 mt-1">Flota activa →</p>
            </div>

            <div
              id="card-admin-metric-customers"
              onClick={() => handleSwitchTab('admin-customers')}
              className="p-4 sm:p-5 rounded-2xl bg-[#0B192C] border border-purple-500/30 shadow-lg cursor-pointer hover:border-purple-400 hover:shadow-purple-500/10 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold tracking-wider text-purple-300">Clientes</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/15 text-purple-400 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-black text-white mt-2 font-mono">
                {users.filter((u) => u.role === 'CUSTOMER').length}
              </div>
              <p className="text-[10px] sm:text-[11px] text-purple-400 mt-1">
                {users.filter((u) => u.role === 'CUSTOMER' && u.status === 'suspended').length > 0 ? (
                  <span className="text-red-400 font-semibold">
                    {users.filter((u) => u.role === 'CUSTOMER' && u.status === 'suspended').length} susp. • Gestionar →
                  </span>
                ) : (
                  'Administrar clientes →'
                )}
              </p>
            </div>

            <div
              onClick={() => handleSwitchTab('admin-payments')}
              className="p-4 sm:p-5 rounded-2xl bg-[#0B192C] border border-amber-500/20 shadow-lg cursor-pointer hover:border-amber-400 transition-all col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Ingresos</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-black text-amber-400 mt-2 font-mono">
                ${totalIncome.toFixed(2)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">Total recaudado</p>
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
                      {b.assignedDriverName || b.driverName ? (
                        <div>
                          <p className="font-bold text-emerald-400">{b.assignedDriverName || b.driverName}</p>
                          <p className="text-slate-400">Placa: {b.assignedVehiclePlate || b.vehiclePlate || 'Toyota'}</p>
                        </div>
                      ) : (
                        <span className="text-amber-400 font-bold">⚠️ Sin asignar</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      {/* Delete Trip button: ONLY visible when status is FINALIZADO (Requested by user) */}
                      {b.status === 'FINALIZADO' && (
                        <button
                          id={`btn-delete-trip-${b.id}`}
                          type="button"
                          onClick={() => handleDeleteBooking(b.id, b.code || b.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                          title="Eliminar viaje finalizado"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          <span>Eliminar Viaje</span>
                        </button>
                      )}
                    </div>

                    <button
                      id={`btn-assign-driver-${b.id}`}
                      onClick={() => {
                        setAssigningBooking(b);
                        setSelectedDriverId(b.assignedDriverId || b.driverId || '');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                    >
                      {b.assignedDriverName || b.driverName ? 'Cambiar Conductor' : 'Asignar Conductor'}
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
                    {(s.assignedDriverName || s.driverName) ? (
                      <div className="space-y-0.5">
                        <p className="font-bold text-emerald-400">{s.assignedDriverName || s.driverName}</p>
                        <p className="text-[11px] text-slate-400">Tel: {s.driverPhone || '0999999999'}</p>
                        <p className="text-[11px] text-slate-400">Placa: {s.assignedVehiclePlate || s.vehiclePlate || 'Toyota'}</p>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <span className="text-amber-400 text-[11px] font-bold block">⚠️ Sin conductor asignado</span>
                        <span className="text-[10px] text-slate-400 block">El conductor no podrá realizar la entrega hasta ser asignado</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      Estado: <strong className="text-amber-300 uppercase">{s.status.replace(/_/g, ' ')}</strong>
                    </span>

                    {/* Delete Shipment button: ONLY visible when status is ENTREGADA or ENTREGADO (Requested by user) */}
                    {(s.status === 'ENTREGADA' || s.status === 'ENTREGADO') && (
                      <button
                        id={`btn-delete-shipment-${s.id}`}
                        type="button"
                        onClick={() => handleDeleteShipment(s.id, s.packageDescription)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ml-2"
                        title="Eliminar encomienda entregada"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Eliminar Encomienda</span>
                      </button>
                    )}
                  </div>

                  {/* ASIGNAR CONDUCTOR BUTTON FOR SHIPMENTS (Requested by user) */}
                  <button
                    id={`btn-assign-driver-shipment-${s.id}`}
                    onClick={() => {
                      setAssigningShipment(s);
                      setSelectedShipmentDriverId(s.assignedDriverId || s.driverId || '');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition"
                  >
                    <span>{(s.assignedDriverName || s.driverName) ? 'Cambiar Conductor' : 'Asignar Conductor'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DRIVERS & FLEET (Prompt: "COMO ADMIN, DEBO PODER SUSPENDER, ELIMINAR Y REACTIVAR CUENTAS DE CONDUCTORES") */}
      {activeTab === 'DRIVERS' && (() => {
        const allDrivers = users.filter((u) => u.role === 'DRIVER');
        const activeDriverCount = allDrivers.filter((d) => d.status === 'active').length;
        const suspendedDriverCount = allDrivers.filter((d) => d.status === 'suspended').length;

        const filteredDrivers = allDrivers
          .filter((d) => {
            if (driverStatusFilter === 'ACTIVE') return d.status === 'active';
            if (driverStatusFilter === 'SUSPENDED') return d.status === 'suspended';
            return true;
          })
          .filter((d) => {
            if (!driverSearchQuery.trim()) return true;
            const q = driverSearchQuery.toLowerCase();
            const veh = vehicles.find((v) => v.assignedDriverId === d.id);
            return (
              d.fullName.toLowerCase().includes(q) ||
              (d.cedula && d.cedula.includes(q)) ||
              (d.username && d.username.toLowerCase().includes(q)) ||
              (d.phone && d.phone.includes(q)) ||
              (veh && veh.plate.toLowerCase().includes(q)) ||
              (veh && veh.make.toLowerCase().includes(q)) ||
              (veh && veh.model.toLowerCase().includes(q))
            );
          });

        return (
          <div className="space-y-6">
            {/* Header & Stats Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0B192C] border border-amber-500/20 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                      Flota y Choferes
                    </span>
                    <span className="text-xs text-slate-400">Gestión Operativa de Choferes</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white font-brand mt-1">
                    Directorio y Control de Conductores
                  </h3>
                  <p className="text-xs text-slate-400">
                    Como Administrador puedes registrar choferes, asignar unidades, suspender temporalmente o eliminar cuentas de forma permanente.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick Stats Badges */}
                  <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Total</span>
                      <span className="text-sm font-bold font-mono text-white">{allDrivers.length}</span>
                    </div>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-[10px] text-emerald-300 block uppercase font-bold">Activos</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">{activeDriverCount}</span>
                    </div>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-2">
                    <UserX className="w-4 h-4 text-red-400" />
                    <div>
                      <span className="text-[10px] text-red-300 block uppercase font-bold">Suspendidos</span>
                      <span className="text-sm font-bold font-mono text-red-400">{suspendedDriverCount}</span>
                    </div>
                  </div>

                  {/* Botón Nuevo Conductor */}
                  <button
                    id="btn-open-create-driver"
                    onClick={() => setShowDriverModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>NUEVO CONDUCTOR</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    onClick={() => setDriverStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      driverStatusFilter === 'ALL'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Todos ({allDrivers.length})
                  </button>
                  <button
                    onClick={() => setDriverStatusFilter('ACTIVE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      driverStatusFilter === 'ACTIVE'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Activos ({activeDriverCount})
                  </button>
                  <button
                    onClick={() => setDriverStatusFilter('SUSPENDED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      driverStatusFilter === 'SUSPENDED'
                        ? 'bg-red-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Suspendidos ({suspendedDriverCount})
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={driverSearchQuery}
                    onChange={(e) => setDriverSearchQuery(e.target.value)}
                    placeholder="Buscar chofer, placa, cédula o teléfono..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  {driverSearchQuery && (
                    <button
                      onClick={() => setDriverSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Drivers List */}
            {filteredDrivers.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-[#0B192C] border border-slate-800 text-center space-y-3">
                <Car className="w-12 h-12 text-slate-600 mx-auto opacity-60" />
                <h4 className="text-base font-bold text-white">
                  {driverSearchQuery
                    ? 'No se encontraron conductores con ese criterio'
                    : 'No hay conductores registrados'}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {driverSearchQuery
                    ? 'Intenta con otro término de búsqueda o limpia el filtro.'
                    : 'La base de datos se encuentra limpia en cero de información. Puedes registrar un nuevo conductor y especificar las características del vehículo manualmente.'}
                </p>
                {driverSearchQuery ? (
                  <button
                    onClick={() => setDriverSearchQuery('')}
                    className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-amber-400 text-xs font-bold hover:bg-slate-700"
                  >
                    Limpiar búsqueda
                  </button>
                ) : (
                  <button
                    onClick={() => setShowDriverModal(true)}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>REGISTRAR PRIMER CONDUCTOR</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDrivers.map((driver) => {
                  const assignedVeh = vehicles.find((v) => v.assignedDriverId === driver.id);
                  const isSuspended = driver.status === 'suspended';
                  const driverTrips = bookings.filter((b) => b.driverId === driver.id || b.assignedDriverId === driver.id);
                  const driverShipments = shipments.filter((s) => s.driverId === driver.id || s.assignedDriverId === driver.id);

                  return (
                    <div
                      key={driver.id}
                      className={`p-5 rounded-3xl bg-[#0B192C] border transition-all shadow-lg space-y-4 ${
                        isSuspended
                          ? 'border-red-500/40 opacity-90'
                          : 'border-amber-500/25 hover:border-amber-500/50'
                      }`}
                    >
                      {/* Driver Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 border ${
                              isSuspended
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            <Car className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                              <span>{driver.fullName}</span>
                            </h4>
                            <p className="text-xs text-slate-400 font-mono">
                              Usuario: <span className="text-amber-400 font-bold">{driver.username}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border inline-flex items-center gap-1.5 shrink-0 ${
                            isSuspended
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSuspended ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'
                            }`}
                          />
                          {isSuspended ? 'SUSPENDIDO' : 'ACTIVO'}
                        </span>
                      </div>

                      {/* Driver Details & Vehicle Info */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 text-xs space-y-2 border border-slate-800">
                        <div className="grid grid-cols-2 gap-2 text-slate-300">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Cédula:</span>
                            <span className="font-mono text-white font-semibold">
                              {driver.cedula || driver.username}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Teléfono:</span>
                            {driver.phone ? (
                              <a
                                href={`https://wa.me/593${driver.phone.replace(/\D/g, '').replace(/^0/, '')}?text=Estimado%20conductor%20${encodeURIComponent(driver.fullName)},%20le%20contactamos%20de%20administracion%20PACHA.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{driver.phone}</span>
                              </a>
                            ) : (
                              <span className="text-slate-500 italic">No registrado</span>
                            )}
                          </div>
                        </div>

                        {/* Historial rápido */}
                        <div className="flex items-center gap-3 pt-1 text-[11px]">
                          <span className="text-slate-400">
                            Viajes atendidos: <strong className="text-white font-mono">{driverTrips.length}</strong>
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">
                            Encomiendas: <strong className="text-white font-mono">{driverShipments.length}</strong>
                          </span>
                        </div>

                        {/* Vehículo Asignado */}
                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-amber-400 text-[10px] uppercase font-bold block mb-1">
                            Vehículo y Características:
                          </span>
                          {assignedVeh ? (
                            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                              <div>
                                <span className="font-semibold text-white block">
                                  {assignedVeh.make} {assignedVeh.model} ({assignedVeh.year})
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Color: {assignedVeh.color} • Capacidad: {assignedVeh.capacity} pax
                                </span>
                              </div>
                              <span className="font-mono text-amber-300 font-black px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-xs">
                                {assignedVeh.plate}
                              </span>
                            </div>
                          ) : (
                            <div className="p-2 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-slate-500 text-xs italic">
                              Sin vehículo asignado a este conductor
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botones de Acción de Administrador: Suspender, Reactivar, Eliminar */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                        {/* Botón Suspender o Reactivar */}
                        <button
                          id={`btn-toggle-driver-${driver.id}`}
                          onClick={() => handleToggleSuspendDriver(driver)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                            isSuspended
                              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600 hover:text-white'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500 hover:text-slate-950'
                          }`}
                          title={isSuspended ? 'Reactivar cuenta del conductor' : 'Suspender cuenta del conductor'}
                        >
                          {isSuspended ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>REACTIVAR CUENTA</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>SUSPENDER CHOFER</span>
                            </>
                          )}
                        </button>

                        {/* Botón Eliminar Conductor */}
                        <button
                          id={`btn-delete-driver-${driver.id}`}
                          onClick={() => handleDeleteDriver(driver)}
                          className="py-2 px-3 rounded-xl text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white hover:border-red-600 transition flex items-center gap-1.5"
                          title="Eliminar permanentemente este conductor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ELIMINAR</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* 5. CUSTOMERS (Prompt: "COMO ADMIN DEBO PODER SUSPENDER Y ELIMINAR CLIENTES") */}
      {activeTab === 'CUSTOMERS' && (() => {
        const allCustomers = users.filter((u) => u.role === 'CUSTOMER');
        const activeCount = allCustomers.filter((c) => c.status === 'active').length;
        const suspendedCount = allCustomers.filter((c) => c.status === 'suspended').length;

        const filteredCustomers = allCustomers
          .filter((c) => {
            if (clientStatusFilter === 'ACTIVE') return c.status === 'active';
            if (clientStatusFilter === 'SUSPENDED') return c.status === 'suspended';
            return true;
          })
          .filter((c) => {
            if (!clientSearchQuery.trim()) return true;
            const q = clientSearchQuery.toLowerCase();
            return (
              c.fullName.toLowerCase().includes(q) ||
              (c.cedula && c.cedula.includes(q)) ||
              (c.username && c.username.toLowerCase().includes(q)) ||
              (c.phone && c.phone.includes(q)) ||
              (c.email && c.email.toLowerCase().includes(q))
            );
          });

        return (
          <div className="space-y-5">
            {/* Header & Stats Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0B192C] border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30">
                      Módulo de Control
                    </span>
                    <span className="text-xs text-slate-400">Gestión de Pasajeros y Clientes</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white font-brand mt-1">
                    Directorio y Control de Clientes
                  </h3>
                  <p className="text-xs text-slate-400">
                    Como Administrador puedes suspender el acceso a clientes infractores o eliminar sus cuentas de forma definitiva.
                  </p>
                </div>

                {/* Quick Stats Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Clientes</span>
                      <span className="text-sm font-bold font-mono text-white">{allCustomers.length}</span>
                    </div>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-[10px] text-emerald-300 block uppercase font-bold">Activos</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">{activeCount}</span>
                    </div>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-2">
                    <UserX className="w-4 h-4 text-red-400" />
                    <div>
                      <span className="text-[10px] text-red-300 block uppercase font-bold">Suspendidos</span>
                      <span className="text-sm font-bold font-mono text-red-400">{suspendedCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    onClick={() => setClientStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      clientStatusFilter === 'ALL'
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Todos ({allCustomers.length})
                  </button>
                  <button
                    onClick={() => setClientStatusFilter('ACTIVE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      clientStatusFilter === 'ACTIVE'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Activos ({activeCount})
                  </button>
                  <button
                    onClick={() => setClientStatusFilter('SUSPENDED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      clientStatusFilter === 'SUSPENDED'
                        ? 'bg-red-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Suspendidos ({suspendedCount})
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, cédula o teléfono..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  {clientSearchQuery && (
                    <button
                      onClick={() => setClientSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Customers Table / Cards */}
            <div className="p-5 rounded-3xl bg-[#0B192C] border border-slate-800 shadow-xl">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-2 opacity-60" />
                  <p className="text-sm text-slate-300 font-bold">No se encontraron clientes</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {clientSearchQuery
                      ? 'Ningún cliente coincide con los términos de búsqueda.'
                      : 'No hay clientes registrados en este estado.'}
                  </p>
                  {clientSearchQuery && (
                    <button
                      onClick={() => setClientSearchQuery('')}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 text-amber-400 text-xs font-bold hover:bg-slate-700"
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 text-[10px] uppercase text-slate-400 border-b border-slate-800 font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Cédula / Usuario</th>
                        <th className="p-3">Contacto</th>
                        <th className="p-3">Historial</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-right">Acciones de Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredCustomers.map((c) => {
                        const clientTrips = bookings.filter((b) => b.customerId === c.id || b.customerPhone === c.phone);
                        const clientShipments = shipments.filter((s) => s.customerId === c.id);
                        const isSuspended = c.status === 'suspended';

                        return (
                          <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                            {/* Cliente info */}
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs shrink-0 border border-purple-500/30">
                                  {c.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-bold text-white block text-xs sm:text-sm">
                                    {c.fullName}
                                  </span>
                                  {c.email && (
                                    <span className="text-[11px] text-slate-400 truncate block max-w-[180px]">
                                      {c.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Cédula */}
                            <td className="p-3 font-mono text-slate-200">
                              {c.cedula || c.username}
                            </td>

                            {/* Teléfono & WhatsApp link */}
                            <td className="p-3">
                              {c.phone ? (
                                <a
                                  href={`https://wa.me/593${c.phone.replace(/\D/g, '').replace(/^0/, '')}?text=Estimado%20${encodeURIComponent(c.fullName)},%20le%20escribimos%20desde%20la%20administración%20de%20PACHA%20Transporte%20Ejecutivo.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 transition text-[11px] font-medium"
                                  title="Contactar al cliente por WhatsApp"
                                >
                                  <Phone className="w-3 h-3 text-emerald-400" />
                                  <span>{c.phone}</span>
                                </a>
                              ) : (
                                <span className="text-slate-500">Sin teléfono</span>
                              )}
                            </td>

                            {/* Historial Viajes & Encomiendas */}
                            <td className="p-3">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-amber-400 font-bold font-mono text-[11px]">
                                  {clientTrips.length} {clientTrips.length === 1 ? 'viaje' : 'viajes'}
                                </span>
                                <span className="text-sky-400 font-medium font-mono text-[10px]">
                                  {clientShipments.length} {clientShipments.length === 1 ? 'encomienda' : 'encomiendas'}
                                </span>
                              </div>
                            </td>

                            {/* Estado badge */}
                            <td className="p-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border inline-flex items-center gap-1 ${
                                  isSuspended
                                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isSuspended ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'
                                  }`}
                                />
                                {isSuspended ? 'SUSPENDIDO' : 'ACTIVO'}
                              </span>
                            </td>

                            {/* Acciones de Admin: Suspender y Eliminar */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Botón Suspender / Reactivar */}
                                <button
                                  id={`btn-toggle-suspend-${c.id}`}
                                  onClick={() => handleToggleSuspendCustomer(c)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                                    isSuspended
                                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600 hover:text-white'
                                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500 hover:text-slate-950'
                                  }`}
                                  title={isSuspended ? 'Reactivar cuenta del cliente' : 'Suspender cliente'}
                                >
                                  {isSuspended ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Reactivar</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShieldAlert className="w-3.5 h-3.5" />
                                      <span>Suspender</span>
                                    </>
                                  )}
                                </button>

                                {/* Botón Eliminar Cliente */}
                                <button
                                  id={`btn-delete-customer-${c.id}`}
                                  onClick={() => handleDeleteCustomer(c)}
                                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white hover:border-red-600 transition flex items-center gap-1"
                                  title="Eliminar permanentemente este cliente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Eliminar</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

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
                    <th className="p-3">Precio del Viaje</th>
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

            {/* Section 4: Bank QR Codes for Direct Transfer Payments (Requested by user: "AGREGA UN CUADRO PARA SUBIR UNA IMAGEN DEL QR DEL BANCO, DAME DOS OPCIONES PICHINCHA Y GUAYAQUIL") */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-amber-400 font-black uppercase tracking-wider">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>4. Códigos QR para Pagos Bancarios (Pichincha DeUna y Banco Guayaquil)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sube la imagen del código QR oficial de cada banco. Estos QR se mostrarán automáticamente al cliente cuando elija pagar con <strong>Transferencia Bancaria</strong> (incluyendo el QR de <strong>DeUna</strong> de Banco Pichincha) para que pueda escanearlo y pagar de forma inmediata.
              </p>

              {/* Hidden file inputs for QRs */}
              <input
                ref={pichinchaQrInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUploadBankQr(e, 'pichincha')}
              />
              <input
                ref={guayaquilQrInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUploadBankQr(e, 'guayaquil')}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Option 1: Banco Pichincha (DeUna) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Banco Pichincha (DeUna QR)
                      </span>
                      {appSettingsForm.bankQrPichincha ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          QR Activo
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Sin QR subido</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Código QR oficial para pagos directos desde Banco Pichincha o app DeUna.
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-dashed border-slate-700 min-h-[140px]">
                    {appSettingsForm.bankQrPichincha ? (
                      <div className="space-y-2 text-center">
                        <img
                          src={appSettingsForm.bankQrPichincha}
                          alt="QR Pichincha DeUna"
                          className="w-28 h-28 object-contain rounded-lg bg-white p-1.5 shadow-md mx-auto"
                        />
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => pichinchaQrInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition"
                          >
                            Cambiar QR
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveBankQr('pichincha')}
                            className="px-2.5 py-1 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-300 text-[11px] font-bold border border-red-500/40 transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          No has subido el QR de Pichincha / DeUna
                        </p>
                        <button
                          type="button"
                          id="btn-upload-qr-pichincha"
                          onClick={() => pichinchaQrInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 mx-auto active:scale-95 transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir QR Pichincha</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Option 2: Banco Guayaquil */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-pink-400 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                        Banco Guayaquil QR
                      </span>
                      {appSettingsForm.bankQrGuayaquil ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          QR Activo
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Sin QR subido</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Código QR para transferencias directas desde la aplicación móvil de Banco Guayaquil.
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-dashed border-slate-700 min-h-[140px]">
                    {appSettingsForm.bankQrGuayaquil ? (
                      <div className="space-y-2 text-center">
                        <img
                          src={appSettingsForm.bankQrGuayaquil}
                          alt="QR Banco Guayaquil"
                          className="w-28 h-28 object-contain rounded-lg bg-white p-1.5 shadow-md mx-auto"
                        />
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => guayaquilQrInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-pink-500 hover:bg-pink-400 text-white font-bold text-[11px] transition"
                          >
                            Cambiar QR
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveBankQr('guayaquil')}
                            className="px-2.5 py-1 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-300 text-[11px] font-bold border border-red-500/40 transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mx-auto">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          No has subido el QR de Banco Guayaquil
                        </p>
                        <button
                          type="button"
                          id="btn-upload-qr-guayaquil"
                          onClick={() => guayaquilQrInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center gap-1.5 mx-auto active:scale-95 transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir QR Guayaquil</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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
                <label className="block font-bold text-slate-300 mb-1">Precio del Viaje (USD) *</label>
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
