import React, { useState, useEffect } from 'react';
import { User, UserRole, Booking, Shipment, AppNotification } from './types';
import { PachaStorage } from './services/storage';
import { PachaAuth } from './services/auth';

// Common Components
import { SplashScreen } from './components/common/SplashScreen';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { DesktopNav } from './components/common/DesktopNav';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { UserGuideModal } from './components/common/UserGuideModal';

// Public & Auth Components
import { LandingPage } from './components/public/LandingPage';
import { LoginModal } from './components/public/LoginModal';
import { RegisterModal } from './components/public/RegisterModal';
import { RecoverPasswordModal } from './components/public/RecoverPasswordModal';

// Client Components
import { BookingFlow } from './components/client/BookingFlow';
import { ShipmentFlow } from './components/client/ShipmentFlow';
import { ClientTripsView } from './components/client/ClientTripsView';
import { UserProfileView } from './components/common/UserProfileView';

// Driver & Admin Components
import { DriverDashboard } from './components/driver/DriverDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(() => PachaAuth.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    PachaStorage.getNotifications()
  );

  useEffect(() => {
    // Real-time synchronization subscription
    const unsubscribe = PachaStorage.subscribe(() => {
      setNotifications(PachaStorage.getNotifications());
    });

    const interval = setInterval(() => {
      setNotifications(PachaStorage.getNotifications());
    }, 2500);

    // Allow Super Admin to test Splash Screen & Client Guide in real-time
    const handleTriggerSplash = () => {
      setShowSplash(true);
    };
    const handleTriggerGuide = () => {
      setIsGuideOpen(true);
    };
    window.addEventListener('pacha_trigger_splash', handleTriggerSplash);
    window.addEventListener('pacha_trigger_guide', handleTriggerGuide);

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('pacha_trigger_splash', handleTriggerSplash);
      window.removeEventListener('pacha_trigger_guide', handleTriggerGuide);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle Login Success
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Switch default tab based on user role
    if (user.role === 'SUPER_ADMIN') {
      setCurrentTab('super-dashboard');
    } else if (user.role === 'ADMIN') {
      setCurrentTab('admin-dashboard');
    } else if (user.role === 'DRIVER') {
      setCurrentTab('driver-services');
    } else {
      setCurrentTab('home');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    PachaAuth.logout();
    setCurrentUser(null);
    setCurrentTab('home');
    setIsLoginOpen(true);
  };

  // Handle Switch Role for Evaluator Demo
  const handleSelectRoleDemo = (role: string) => {
    const users = PachaStorage.getUsers();
    let target = users.find((u) => u.role === role);

    if (!target && role === 'SUPER_ADMIN') {
      target = {
        id: 'usr-superadmin',
        username: '1310857063',
        fullName: 'Ing. Administrador Central (SUPER ADMIN)',
        cedula: '1310857063',
        phone: '0999999999',
        role: 'SUPER_ADMIN',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    if (target) {
      PachaAuth.switchUser(target);
      handleLoginSuccess(target);
    }
  };

  // Determine user role for navigation
  const effectiveRole: UserRole | 'PUBLIC' = currentUser ? currentUser.role : 'PUBLIC';

  return (
    <div className="min-h-screen bg-[#071322] text-white flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950 font-sans overflow-x-hidden w-full max-w-full">
      {/* 3-second animated Splash Screen */}
      {showSplash && (
        <SplashScreen
          onComplete={() => {
            setShowSplash(false);
            setIsLoginOpen(true);
          }}
        />
      )}

      {/* Top Sticky Header */}
      <Navbar
        currentUser={currentUser}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onSelectRoleDemo={handleSelectRoleDemo}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Layout Body: Desktop Sidebar + Content Stage */}
      <div className="flex-1 flex flex-row w-full max-w-7xl mx-auto">
        {/* Desktop Side Navigation */}
        <DesktopNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          role={effectiveRole}
          onOpenGuide={() => setIsGuideOpen(true)}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 w-full min-w-0 flex flex-col pb-28 sm:pb-32">
          {/* 1. PUBLIC & CLIENT VIEWS */}
          {currentTab === 'home' && (
            <LandingPage
              onStartBooking={() => setCurrentTab('book')}
              onStartShipment={() => setCurrentTab('shipment')}
              onOpenLogin={() => setIsLoginOpen(true)}
              onOpenGuide={() => setIsGuideOpen(true)}
            />
          )}

          {currentTab === 'book' && (
            <BookingFlow
              currentUser={currentUser}
              onOpenLogin={() => setIsLoginOpen(true)}
              onBookingComplete={(b) => {
                setNotifications(PachaStorage.getNotifications());
              }}
            />
          )}

          {currentTab === 'shipment' && (
            <ShipmentFlow
              currentUser={currentUser}
              onOpenLogin={() => setIsLoginOpen(true)}
              onShipmentComplete={(s) => {
                setNotifications(PachaStorage.getNotifications());
              }}
            />
          )}

          {currentTab === 'my-trips' && (
            <ClientTripsView
              currentUser={currentUser}
              onOpenLogin={() => setIsLoginOpen(true)}
              onBookNew={() => setCurrentTab('book')}
              onShipNew={() => setCurrentTab('shipment')}
            />
          )}

          {currentTab === 'profile' && (
            <UserProfileView
              currentUser={currentUser}
              onOpenLogin={() => setIsLoginOpen(true)}
              onLogout={handleLogout}
            />
          )}

          {/* 2. DRIVER VIEWS */}
          {currentTab.startsWith('driver') && currentUser?.role === 'DRIVER' && (
            <DriverDashboard
              currentUser={currentUser}
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
            />
          )}

          {/* 3. ADMIN VIEWS */}
          {currentTab.startsWith('admin') && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
            <AdminDashboard
              currentUser={currentUser}
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
            />
          )}

          {/* 4. SUPER ADMIN VIEWS */}
          {currentTab.startsWith('super') && currentUser?.role === 'SUPER_ADMIN' && (
            <SuperAdminDashboard
              currentUser={currentUser}
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
            />
          )}
        </main>
      </div>

      {/* Mobile-first Bottom Navigation Dock */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        role={effectiveRole}
      />

      {/* Modals & Drawers */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenRecover={() => setIsRecoverOpen(true)}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleLoginSuccess}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <RecoverPasswordModal
        isOpen={isRecoverOpen}
        onClose={() => setIsRecoverOpen(false)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
      />

      {/* Guía de Uso para Clientes */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onStartBooking={() => {
          setIsGuideOpen(false);
          setCurrentTab('book');
        }}
        onStartShipment={() => {
          setIsGuideOpen(false);
          setCurrentTab('shipment');
        }}
      />
    </div>
  );
}
