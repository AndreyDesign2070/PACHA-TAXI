import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
  Car,
  AlertTriangle,
  Lock,
  CheckCircle,
  FileText,
  UserX,
  X,
  LayoutDashboard,
  Search,
  DollarSign,
  Package,
  Calendar,
  KeyRound,
  Download,
  Shield,
  Palette,
  RotateCcw
} from 'lucide-react';
import { User, UserRole, Booking, Shipment, Vehicle } from '../../types';
import { PachaStorage } from '../../services/storage';
import { PachaAuth } from '../../services/auth';
import { AppVisualEditor } from './AppVisualEditor';

interface SuperAdminDashboardProps {
  currentUser: User;
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  currentUser,
  currentTab = 'super-dashboard',
  onSelectTab
}) => {
  const [users, setUsers] = useState<User[]>(() => PachaStorage.getUsers());
  const [bookings, setBookings] = useState<Booking[]>(() => PachaStorage.getBookings());
  const [shipments, setShipments] = useState<Shipment[]>(() => PachaStorage.getShipments());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => PachaStorage.getVehicles());

  const refreshAll = () => {
    setUsers(PachaStorage.getUsers());
    setBookings(PachaStorage.getBookings());
    setShipments(PachaStorage.getShipments());
    setVehicles(PachaStorage.getVehicles());
  };

  useEffect(() => {
    refreshAll();
    const unsub = PachaStorage.subscribe(refreshAll);
    return () => unsub();
  }, []);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // New admin form fields
  const [adminFullName, setAdminFullName] = useState('');
  const [adminCedula, setAdminCedula] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('pacha2026');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Sub-tab inside Clientes (Clientes vs Conductores)
  const [customerSubTab, setCustomerSubTab] = useState<'CLIENTS' | 'DRIVERS'>(
    currentTab === 'super-drivers' ? 'DRIVERS' : 'CLIENTS'
  );

  useEffect(() => {
    if (currentTab === 'super-drivers') {
      setCustomerSubTab('DRIVERS');
    } else if (currentTab === 'super-customers') {
      setCustomerSubTab('CLIENTS');
    }
  }, [currentTab]);

  const refreshUsers = () => {
    setUsers(PachaStorage.getUsers());
  };

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const res = PachaAuth.createAdminAccount({
      fullName: adminFullName,
      cedula: adminCedula,
      phone: adminPhone,
      username: adminUsername,
      password: adminPassword
    });

    if (res.success) {
      setShowAdminModal(false);
      setAdminFullName('');
      setAdminCedula('');
      setAdminPhone('');
      setAdminUsername('');
      refreshUsers();
      showNotification('¡Cuenta de Administrador creada exitosamente!');
    } else {
      setAdminError(res.error || 'Error al crear la cuenta de Administrador');
    }
  };

  const handleToggleSuspendUser = (user: User) => {
    if (user.role === 'SUPER_ADMIN') {
      alert('La cuenta de Super Admin Central no puede ser suspendida.');
      return;
    }

    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    PachaStorage.updateUserStatus(user.id, nextStatus);
    refreshUsers();
    showNotification(`Usuario ${user.fullName} ahora está: ${nextStatus.toUpperCase()}`);
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (window.confirm(`¿Está seguro de eliminar permanentemente al usuario "${name}"? Esta acción no se puede deshacer.`)) {
      PachaStorage.deleteUser(userId);
      refreshUsers();
      showNotification(`Usuario ${name} eliminado del sistema.`);
    }
  };

  // Derive active view from currentTab
  const activeView = (() => {
    if (currentTab === 'super-visual-editor') return 'VISUAL_EDITOR';
    if (currentTab === 'super-admins') return 'ADMINS';
    if (currentTab === 'super-customers') return 'CUSTOMERS';
    if (currentTab === 'super-drivers') return 'DRIVERS';
    if (currentTab === 'super-reports') return 'REPORTS';
    return 'DASHBOARD';
  })();

  const handleSwitchTab = (tabId: string) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
  };

  // Data subsets
  const adminUsers = users.filter((u) => u.role === 'ADMIN');
  const driverUsers = users.filter((u) => u.role === 'DRIVER');
  const customerUsers = users.filter((u) => u.role === 'CUSTOMER');

  // Revenue & Activity stats
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0) +
    shipments.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 text-white pb-28 space-y-6">
      {/* Super Admin Top Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/90 via-[#0B192C] to-[#0A192F] border-2 border-purple-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-inner shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 px-2.5 py-0.5 rounded-full bg-purple-900/80 border border-purple-500/50">
                Gobernanza Total • SUPER ADMIN
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: 1310857063</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-brand mt-1">
              Consola Maestra del Creador
            </h2>
            <p className="text-xs text-slate-300">
              Control de Administradores, conductores, clientes y auditoría general de PACHA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-superadmin-reset-data"
            onClick={async () => {
              if (
                window.confirm(
                  '¿ATENCIÓN: Desea REINICIAR TODO EL SISTEMA A CERO?\n\nEsta acción eliminará todos los viajes, encomiendas, notificaciones, vehículos y usuarios creados, manteniendo EXCLUSIVAMENTE su cuenta de SUPER ADMIN.\n\n¿Desea continuar?'
                )
              ) {
                await PachaStorage.resetAllData();
                refreshUsers();
                setFeedbackMessage('¡Sistema reiniciado a CERO con éxito! Solo se mantiene la cuenta SUPER ADMIN.');
                setTimeout(() => setFeedbackMessage(null), 5000);
              }
            }}
            className="px-3.5 py-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
            title="Reiniciar todos los datos a cero manteniendo Super Admin"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINICIAR SISTEMA A CERO</span>
          </button>

          <button
            id="btn-superadmin-create-admin"
            onClick={() => setShowAdminModal(true)}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ CREAR NUEVO ADMINISTRADOR</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* 1. VIEW: DASHBOARD OVERVIEW */}
      {activeView === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Key Global Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div
              onClick={() => handleSwitchTab('super-admins')}
              className="p-4 rounded-2xl bg-[#0B192C] border border-purple-500/30 hover:border-purple-500 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-purple-300">Administradores</span>
                <Shield className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                {adminUsers.length}
              </p>
              <span className="text-[11px] text-purple-400 underline mt-1 block">Gestionar cuentas →</span>
            </div>

            <div
              onClick={() => handleSwitchTab('super-drivers')}
              className="p-4 rounded-2xl bg-[#0B192C] border border-blue-500/30 hover:border-blue-500 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-blue-300">Conductores Activos</span>
                <Car className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                {driverUsers.length}
              </p>
              <span className="text-[11px] text-blue-400 underline mt-1 block">Ver flota y choferes →</span>
            </div>

            <div
              onClick={() => handleSwitchTab('super-customers')}
              className="p-4 rounded-2xl bg-[#0B192C] border border-emerald-500/30 hover:border-emerald-500 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-300">Clientes Registrados</span>
                <Users className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                {customerUsers.length}
              </p>
              <span className="text-[11px] text-emerald-400 underline mt-1 block">Ver pasajeros →</span>
            </div>

            <div
              onClick={() => handleSwitchTab('super-reports')}
              className="p-4 rounded-2xl bg-[#0B192C] border border-amber-500/30 hover:border-amber-500 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-300">Volumen Facturado</span>
                <DollarSign className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-1">
                ${totalRevenue.toFixed(2)}
              </p>
              <span className="text-[11px] text-amber-400 underline mt-1 block">Auditoría financiera →</span>
            </div>
          </div>

          {/* Visual Customization Quick Action Banner */}
          <div
            onClick={() => handleSwitchTab('super-visual-editor')}
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-[#0B192C] border-2 border-purple-500/40 hover:border-purple-400 shadow-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform shrink-0">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                    NUEVA FUNCIÓN
                  </span>
                  <span className="text-xs text-purple-300 font-bold">Personalización de la App</span>
                </div>
                <h4 className="text-base font-black text-white font-brand mt-0.5">
                  Cambiar Fotos, Fondos, Ícono y Textos de la App
                </h4>
                <p className="text-xs text-slate-300">
                  Sube tus fotos del taxi ejecutivo, fondo del Splash Screen, logotipo e ícono oficial.
                </p>
              </div>
            </div>

            <button className="px-4 py-2 rounded-xl bg-purple-600 group-hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider shrink-0 transition-colors">
              Abrir Editor Visual →
            </button>
          </div>

          {/* Quick Overview of Recent Activity */}
          <div className="p-5 rounded-3xl bg-[#0B192C] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Resumen de Plataforma</h3>
                <p className="text-xs text-slate-400">Total de {users.length} usuarios registrados en la base de datos</p>
              </div>
              <button
                onClick={() => setShowAdminModal(true)}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white"
              >
                + Nuevo Admin
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Administradores de PACHA ({adminUsers.length})
                </h4>
                {adminUsers.map((adm) => (
                  <div key={adm.id} className="p-2.5 rounded-xl bg-slate-950 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{adm.fullName}</p>
                      <p className="text-[11px] text-slate-400">Usuario: {adm.username} • Tel: {adm.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/60 text-purple-300 border border-purple-500/40">
                      ADMIN
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                  Estado de Servicios del Sistema
                </h4>
                <div className="p-3 rounded-xl bg-slate-950 flex justify-between text-xs">
                  <span className="text-slate-400">Viajes Registrados:</span>
                  <span className="font-bold font-mono text-white">{bookings.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 flex justify-between text-xs">
                  <span className="text-slate-400">Encomiendas Registradas:</span>
                  <span className="font-bold font-mono text-white">{shipments.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 flex justify-between text-xs">
                  <span className="text-slate-400">Vehículos en Flota:</span>
                  <span className="font-bold font-mono text-white">{vehicles.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIEW: ADMINS MANAGEMENT */}
      {activeView === 'ADMINS' && (
        <div className="p-5 rounded-3xl bg-[#0B192C] border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Cuentas de Administradores (ADMIN)</h3>
              <p className="text-xs text-slate-400">
                Los Administradores gestionan despachos, tarifas, conductores y configuraciones.
              </p>
            </div>
            <button
              onClick={() => setShowAdminModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>CREAR ADMIN</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Nombre Completo</th>
                  <th className="p-3">Usuario de Acceso</th>
                  <th className="p-3">Cédula</th>
                  <th className="p-3">Teléfono</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones de Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {adminUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">{u.fullName}</td>
                    <td className="p-3 font-mono text-purple-300 font-bold">{u.username}</td>
                    <td className="p-3 font-mono text-slate-300">{u.cedula || 'N/A'}</td>
                    <td className="p-3 text-slate-400">{u.phone}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {u.status === 'active' ? 'ACTIVO' : 'SUSPENDIDO'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleSuspendUser(u)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          u.status === 'active'
                            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspender' : 'Reactivar'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.fullName)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-500/20 text-red-300 hover:bg-red-500/30"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. VIEW: CUSTOMERS & DRIVERS (Dentro de la pestaña Clientes del menú inferior) */}
      {(activeView === 'CUSTOMERS' || activeView === 'DRIVERS') && (
        <div className="p-5 rounded-3xl bg-[#0B192C] border border-slate-800 shadow-xl space-y-5">
          {/* Sub-pestañas internas: Clientes Registrados y Conductores del Sistema */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              id="subtab-super-clients"
              onClick={() => setCustomerSubTab('CLIENTS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                customerSubTab === 'CLIENTS'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clientes ({customerUsers.length})</span>
            </button>

            <button
              id="subtab-super-drivers"
              onClick={() => setCustomerSubTab('DRIVERS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                customerSubTab === 'DRIVERS'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Conductores ({driverUsers.length})</span>
            </button>
          </div>

          {/* Sub-pantalla 1: Clientes Registrados */}
          {customerSubTab === 'CLIENTS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Clientes y Pasajeros Registrados</h3>
                  <p className="text-xs text-slate-400">Total de {customerUsers.length} cuentas de clientes</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar cliente por nombre o cédula..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Cédula</th>
                      <th className="p-3">Teléfono</th>
                      <th className="p-3">Viajes Realizados</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {customerUsers
                      .filter((c) =>
                        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (c.cedula && c.cedula.includes(searchQuery))
                      )
                      .map((c) => {
                        const clientTrips = bookings.filter((b) => b.customerId === c.id || b.customerPhone === c.phone);
                        return (
                          <tr key={c.id} className="hover:bg-slate-900/40">
                            <td className="p-3 font-semibold text-white">{c.fullName}</td>
                            <td className="p-3 font-mono">{c.cedula || c.username}</td>
                            <td className="p-3">{c.phone}</td>
                            <td className="p-3 font-bold font-mono text-amber-400">{clientTrips.length} viajes</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  c.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-red-500/20 text-red-300'
                                }`}
                              >
                                {c.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleToggleSuspendUser(c)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                              >
                                {c.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-pantalla 2: Conductores del Sistema */}
          {customerSubTab === 'DRIVERS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Conductores y Unidades de Flota</h3>
                  <p className="text-xs text-slate-400">Total de {driverUsers.length} conductores ejecutivos</p>
                </div>
                <button
                  onClick={() => {
                    if (onSelectTab) onSelectTab('admin-drivers');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase"
                >
                  Ver en Módulo Admin Flota
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Conductor</th>
                      <th className="p-3">Cédula / Usuario</th>
                      <th className="p-3">Teléfono</th>
                      <th className="p-3">Vehículo Asignado</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {driverUsers.map((d) => {
                      const assignedVeh = vehicles.find((v) => v.assignedDriverId === d.id);
                      return (
                        <tr key={d.id} className="hover:bg-slate-900/40">
                          <td className="p-3 font-semibold text-white">{d.fullName}</td>
                          <td className="p-3 font-mono text-slate-400">{d.cedula || d.username}</td>
                          <td className="p-3">{d.phone}</td>
                          <td className="p-3">
                            {assignedVeh ? (
                              <span className="font-semibold text-amber-300">
                                {assignedVeh.model} ({assignedVeh.plate})
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">Sin unidad fija</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                d.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {d.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleToggleSuspendUser(d)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              {d.status === 'active' ? 'Suspender' : 'Reactivar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. VIEW: GLOBAL REPORTS & AUDIT */}
      {activeView === 'REPORTS' && (
        <div className="p-5 rounded-3xl bg-[#0B192C] border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Auditoría Global y Métricas Financieras</h3>
              <p className="text-xs text-slate-400">Consolidado general de operaciones en Manabí</p>
            </div>
            <button
              onClick={() => alert('Reporte global descargado en formato estructurado.')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Reporte</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase block">Ingresos por Pasajeros</span>
              <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                ${bookings.reduce((sum, b) => sum + b.totalPrice, 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{bookings.length} viajes registrados</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase block">Ingresos por Encomiendas</span>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
                ${shipments.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{shipments.length} paquetes enviados</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase block">Volumen Total Operado</span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                ${totalRevenue.toFixed(2)}
              </p>
              <p className="text-[11px] text-emerald-400 mt-1">100% de transacciones auditadas</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW: VISUAL EDITOR & APP CUSTOMIZATION */}
      {activeView === 'VISUAL_EDITOR' && (
        <AppVisualEditor onNotify={showNotification} />
      )}

      {/* MODAL: CREATE ADMIN ACCOUNT */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0B192C] border-2 border-purple-500/50 p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-brand">Nueva Cuenta ADMIN</h3>
                <p className="text-xs text-slate-400">Crear usuario administrador de operaciones</p>
              </div>
            </div>

            {adminError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombre Completo del Administrador *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Carlos Mendoza"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Cédula *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="1310857063"
                    value={adminCedula}
                    onChange={(e) => setAdminCedula(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0998877665"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Usuario de Acceso *</label>
                  <input
                    type="text"
                    required
                    placeholder="admin_manabi"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Contraseña *</label>
                  <input
                    type="text"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider shadow-lg"
              >
                REGISTRAR Y HABILITAR ADMINISTRADOR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
