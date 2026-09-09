export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'DRIVER' | 'CUSTOMER';

export interface User {
  id: string;
  username: string; // Cedula for customer, custom for driver/admin/superadmin
  fullName: string;
  cedula: string;
  phone: string; // WhatsApp
  email?: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'inactive';
  avatarUrl?: string;
  vehicleId?: string; // For drivers
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isMainRoute?: boolean; // Portoviejo and Pedernales
  order: number;
}

export interface Fare {
  id: string;
  originCity: string;
  destinationCity: string;
  price: number; // Base price per trip
  pricePerAdditionalPassenger: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// RouteFare alias for tabular editing
export interface RouteFare {
  id?: string;
  originCityId?: string;
  destinationCityId?: string;
  originCityName: string;
  destinationCityName: string;
  passengerPrice: number;
  shipmentBasePrice: number;
  estimatedMinutes: number;
}

export type TripType = 'IDA' | 'VUELTA' | 'IDA_Y_VUELTA';

export type BookingStatus =
  | 'PENDIENTE'
  | 'SOLICITADA'
  | 'CONFIRMADA'
  | 'ASIGNADA'
  | 'CONDUCTOR_ASIGNADO'
  | 'EN_CAMINO'
  | 'CONDUCTOR_EN_CAMINO'
  | 'LLEGO_AL_PUNTO'
  | 'EN_PUNTO_RECOGIDA'
  | 'ESPERANDO_CLIENTE'
  | 'PASAJERO_ABORDO'
  | 'PASAJERO_A_BORDO'
  | 'VIAJE_INICIADO'
  | 'EN_RUTA'
  | 'LLEGO_AL_DESTINO'
  | 'FINALIZADA'
  | 'FINALIZADO'
  | 'CANCELADA';

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA';
export type PaymentStatus = 'PENDIENTE' | 'RECIBIDO' | 'CONFIRMADO' | 'RECHAZADO' | 'PAID';

export interface Booking {
  id: string;
  code: string; // e.g. PAC-000125
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCedula: string;
  tripType: TripType;
  origin: string;
  destination: string;
  originCityName?: string;
  destinationCityName?: string;
  pickupAddress: string;
  pickupReference: string;
  destAddress: string;
  destinationAddress?: string;
  destReference: string;
  passengers: number;
  passengerCount?: number;
  departureDate: string;
  travelDate?: string;
  departureTime: string;
  travelTime?: string;
  returnDate?: string;
  returnTime?: string;
  totalPrice: number;
  status: BookingStatus;
  driverId?: string;
  assignedDriverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  vehicleId?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehiclePlate?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  statusHistory: StatusHistoryEntry[];
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  updatedAt: string;
}

export type ShipmentStatus =
  | 'SOLICITUD_RECIBIDA'
  | 'REGISTRADO'
  | 'ENCOMIENDA_RECIBIDA'
  | 'EN_TRANSITO'
  | 'LLEGO_A_DESTINO'
  | 'ENTREGADA'
  | 'ENTREGADO'
  | 'CANCELADA';

export interface Shipment {
  id: string;
  code: string; // PAC-EN-000125
  deliveryCode: string; // 4-digit code e.g. 4827
  securityCode?: string;
  customerId: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  receiverName?: string;
  recipientPhone: string;
  receiverPhone?: string;
  origin: string;
  originCityName?: string;
  destination: string;
  destinationCityName?: string;
  deliveryAddress?: string;
  description: string;
  packageDescription?: string;
  packageCount: number;
  approxSize: 'PEQUEÑO' | 'MEDIANO' | 'GRANDE' | 'ESPECIAL';
  approxWeightKg: number;
  declaredValue: number;
  photoUrl?: string;
  price: number;
  status: ShipmentStatus;
  driverId?: string;
  assignedDriverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  statusHistory: StatusHistoryEntry[];
  deliveredAt?: string;
  deliveredByDriverId?: string;
  verifiedCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  capacity: number;
  photoUrl: string;
  status: 'DISPONIBLE' | 'EN_SERVICIO' | 'MANTENIMIENTO' | 'INACTIVO';
  assignedDriverId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  targetRole?: UserRole | 'ALL';
  title: string;
  message: string;
  type: 'BOOKING' | 'SHIPMENT' | 'PAYMENT' | 'SYSTEM';
  read: boolean;
  linkId?: string;
  createdAt: string;
}

export interface AppSettings {
  businessName: string;
  fullBusinessName: string;
  mainRoute: string;
  supportPhone: string;
  supportWhatsApp: string;
  cancellationPolicy: string;
  shipmentConditions: string;
  enableIntermediateRoutes: boolean;
  defaultPassengerCapacity: number;
  bankAccount?: string;
  bankName?: string;
  bankHolder?: string;
  bankType?: string;
  bankIdNumber?: string;
  bankEmail?: string;
  welcomeNotice?: string;
  // --- Visual Customization (Fotos, Íconos y Textos del Super Admin) ---
  appIconUrl?: string; // Custom App Icon (Isotipo)
  appLogoUrl?: string; // Custom App Wordmark / Logo "PACHA"
  splashBgUrl?: string; // Background photo for Loading / Splash Screen
  splashLogoUrl?: string; // Custom Logo / Emblem shown on top of the Splash Screen background image
  splashOverlayOpacity?: number; // 20 to 90 (% opacity of dark overlay over splash photo)
  splashLogoSize?: 'sm' | 'md' | 'lg' | 'xl'; // Size of the logo on the splash background
  splashLogoStyle?: 'framed' | 'floating'; // Framed in glass card or floating transparently
  splashShowRouteBadge?: boolean; // Whether to show Portoviejo ↔ Pedernales badge on splash
  heroBgUrl?: string; // Background banner for Landing Page
  defaultVehiclePhotoUrl?: string; // Custom fleet / vehicle photo
  bookingBannerUrl?: string; // Custom banner for reservations
  shipmentBannerUrl?: string; // Custom banner for parcels/shipments
  appAccentTheme?: 'gold' | 'sapphire' | 'emerald' | 'ruby' | 'purple'; // Visual color accent
  brandTitle?: string; // e.g. "PACHA"
  brandSubtitle?: string; // e.g. "TRANSPORTE EJECUTIVO"
  brandRouteOrigin?: string; // e.g. "Portoviejo"
  brandRouteDestination?: string; // e.g. "Pedernales"
  brandBadgeText?: string; // e.g. "Ida y Vuelta"
  heroSubtitle?: string; // Slogan on public home
  splashLoadingText?: string; // e.g. "Cargando aplicación..."
  splashSubtext?: string; // e.g. "Portoviejo ↔ Pedernales • Confort y Puntualidad"
  loginTitle?: string; // e.g. "Iniciar Sesión"
  loginSubtitle?: string; // e.g. "Acceso a plataforma PACHA Transporte Ejecutivo"
  // --- Gestor de Imágenes y Textos para la Guía de Clientes (Super Admin) ---
  guideTravelStep1Img?: string;
  guideTravelStep1Title?: string;
  guideTravelStep1Subtitle?: string;
  guideTravelStep1Desc?: string;

  guideTravelStep2Img?: string;
  guideTravelStep2Title?: string;
  guideTravelStep2Subtitle?: string;
  guideTravelStep2Desc?: string;

  guideTravelStep3Img?: string;
  guideTravelStep3Title?: string;
  guideTravelStep3Subtitle?: string;
  guideTravelStep3Desc?: string;

  guideTravelStep4Img?: string;
  guideTravelStep4Title?: string;
  guideTravelStep4Subtitle?: string;
  guideTravelStep4Desc?: string;

  guideShipmentStep1Img?: string;
  guideShipmentStep1Title?: string;
  guideShipmentStep1Subtitle?: string;
  guideShipmentStep1Desc?: string;

  guideShipmentStep2Img?: string;
  guideShipmentStep2Title?: string;
  guideShipmentStep2Subtitle?: string;
  guideShipmentStep2Desc?: string;

  guideShipmentStep3Img?: string;
  guideShipmentStep3Title?: string;
  guideShipmentStep3Subtitle?: string;
  guideShipmentStep3Desc?: string;
}
