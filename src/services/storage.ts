import {
  User,
  City,
  Fare,
  RouteFare,
  Booking,
  Shipment,
  Vehicle,
  AppNotification,
  AppSettings,
  TripType,
  BookingStatus,
  ShipmentStatus
} from '../types';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, testFirestoreConnection } from './firebase';
import { compressDataUrl } from '../utils/imageOptimizer';

const STORAGE_KEYS = {
  USERS: 'pacha_users_v1',
  CITIES: 'pacha_cities_v1',
  FARES: 'pacha_fares_v1',
  BOOKINGS: 'pacha_bookings_v1',
  SHIPMENTS: 'pacha_shipments_v1',
  VEHICLES: 'pacha_vehicles_v1',
  NOTIFICATIONS: 'pacha_notifications_v1',
  SETTINGS: 'pacha_settings_v1',
  CURRENT_USER: 'pacha_current_user_v1'
};

// Initial Seed Cities
const INITIAL_CITIES: City[] = [
  { id: 'city-1', name: 'Portoviejo', isActive: true, isMainRoute: true, order: 1 },
  { id: 'city-2', name: 'Jama', isActive: true, isMainRoute: false, order: 2 },
  { id: 'city-3', name: 'San Vicente', isActive: true, isMainRoute: false, order: 3 },
  { id: 'city-4', name: 'Bahía', isActive: true, isMainRoute: false, order: 4 },
  { id: 'city-5', name: 'Sucre', isActive: true, isMainRoute: false, order: 5 },
  { id: 'city-6', name: 'Pedernales', isActive: true, isMainRoute: true, order: 6 }
];

// Initial Seed Fares
const INITIAL_FARES: Fare[] = [
  { id: 'fare-1', originCity: 'Portoviejo', destinationCity: 'Pedernales', price: 15.0, pricePerAdditionalPassenger: 10.0, isActive: true, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 'fare-2', originCity: 'Pedernales', destinationCity: 'Portoviejo', price: 15.0, pricePerAdditionalPassenger: 10.0, isActive: true, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 'fare-3', originCity: 'Portoviejo', destinationCity: 'Jama', price: 12.0, pricePerAdditionalPassenger: 8.0, isActive: true, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 'fare-4', originCity: 'Jama', destinationCity: 'Portoviejo', price: 12.0, pricePerAdditionalPassenger: 8.0, isActive: true, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 'fare-5', originCity: 'Portoviejo', destinationCity: 'San Vicente', price: 9.0, pricePerAdditionalPassenger: 6.0, isActive: true, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 'fare-6', originCity: 'San Vicente', destinationCity: 'Portoviejo', price: 9.0, pricePerAdditionalPassenger: 6.0, isActive: true, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 'fare-7', originCity: 'Portoviejo', destinationCity: 'Bahía', price: 9.0, pricePerAdditionalPassenger: 6.0, isActive: true, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 'fare-8', originCity: 'Bahía', destinationCity: 'Portoviejo', price: 9.0, pricePerAdditionalPassenger: 6.0, isActive: true, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 'fare-9', originCity: 'Portoviejo', destinationCity: 'Sucre', price: 10.0, pricePerAdditionalPassenger: 7.0, isActive: true, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 'fare-10', originCity: 'Sucre', destinationCity: 'Portoviejo', price: 10.0, pricePerAdditionalPassenger: 7.0, isActive: true, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 'fare-11', originCity: 'Pedernales', destinationCity: 'Jama', price: 6.0, pricePerAdditionalPassenger: 4.0, isActive: true, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 'fare-12', originCity: 'Jama', destinationCity: 'Pedernales', price: 6.0, pricePerAdditionalPassenger: 4.0, isActive: true, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' }
];

// Initial Seed Vehicles
const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    make: 'Toyota',
    model: 'Fortuner 4x4',
    year: 2024,
    color: 'Negro Ejecutivo',
    plate: 'MBP-4521',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    status: 'DISPONIBLE',
    assignedDriverId: 'usr-driver-1',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z'
  },
  {
    id: 'veh-2',
    make: 'Chevrolet',
    model: 'Trailblazer Premier',
    year: 2023,
    color: 'Plata Metálico',
    plate: 'MBB-9832',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    status: 'DISPONIBLE',
    assignedDriverId: 'usr-driver-2',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z'
  }
];

// Initial Seed Users
const INITIAL_USERS: User[] = [
  {
    id: 'usr-superadmin',
    username: '1310857063',
    fullName: 'Ing. Administrador Central (SUPER ADMIN)',
    cedula: '1310857063',
    phone: '0999999999',
    role: 'SUPER_ADMIN',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z'
  },
  {
    id: 'usr-admin-1',
    username: 'admin',
    fullName: 'Carlos Mendoza Vera (ADMINISTRADOR)',
    cedula: '1309876543',
    phone: '0998877665',
    role: 'ADMIN',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z'
  },
  {
    id: 'usr-driver-1',
    username: 'chofer1',
    fullName: 'Roberto Zambrano Bravo',
    cedula: '1304567890',
    phone: '0987654321',
    role: 'DRIVER',
    status: 'active',
    vehicleId: 'veh-1',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z'
  },
  {
    id: 'usr-driver-2',
    username: 'chofer2',
    fullName: 'Manuel Cedeño Alcívar',
    cedula: '1308899112',
    phone: '0984433221',
    role: 'DRIVER',
    status: 'active',
    vehicleId: 'veh-2',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z'
  },
  {
    id: 'usr-customer-1',
    username: '1305544332',
    fullName: 'Ana Lucía Vera Cevallos',
    cedula: '1305544332',
    phone: '0981122334',
    role: 'CUSTOMER',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z'
  }
];

// Initial Seed Bookings
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-101',
    code: 'PAC-000125',
    customerId: 'usr-customer-1',
    customerName: 'Ana Lucía Vera Cevallos',
    customerPhone: '0981122334',
    customerCedula: '1305544332',
    tripType: 'IDA_Y_VUELTA',
    origin: 'Portoviejo',
    destination: 'Pedernales',
    originCityName: 'Portoviejo',
    destinationCityName: 'Pedernales',
    pickupAddress: 'Av. Reales Tamarindos y Callejon San Rafael',
    pickupReference: 'Frente a Farmacias Sana Sana',
    destAddress: 'Hotel Punta Prieta, Malecón',
    destinationAddress: 'Hotel Punta Prieta, Malecón',
    destReference: 'Lobby Principal',
    passengers: 2,
    passengerCount: 2,
    departureDate: '2026-09-04',
    travelDate: '2026-09-04',
    departureTime: '08:00',
    travelTime: '08:00',
    returnDate: '2026-09-06',
    returnTime: '16:00',
    totalPrice: 50.0,
    status: 'CONDUCTOR_ASIGNADO',
    driverId: 'usr-driver-1',
    assignedDriverId: 'usr-driver-1',
    driverName: 'Roberto Zambrano Bravo',
    driverPhone: '0987654321',
    driverPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    vehicleId: 'veh-1',
    vehicleMake: 'Toyota',
    vehicleModel: 'Fortuner 4x4',
    vehicleColor: 'Negro Ejecutivo',
    vehiclePlate: 'MBP-4521',
    paymentMethod: 'TRANSFERENCIA',
    paymentStatus: 'CONFIRMADO',
    statusHistory: [
      { status: 'PENDIENTE', timestamp: '2026-09-01T10:00:00Z', updatedBy: 'Ana Lucía Vera' },
      { status: 'CONFIRMADA', timestamp: '2026-09-01T10:15:00Z', updatedBy: 'Carlos Mendoza (ADMIN)' },
      { status: 'CONDUCTOR_ASIGNADO', timestamp: '2026-09-01T10:30:00Z', updatedBy: 'Carlos Mendoza (ADMIN)', notes: 'Conductor asignado: Roberto Zambrano' }
    ],
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:30:00Z'
  },
  {
    id: 'bk-102',
    code: 'PAC-000126',
    customerId: 'usr-customer-1',
    customerName: 'Ana Lucía Vera Cevallos',
    customerPhone: '0981122334',
    customerCedula: '1305544332',
    tripType: 'IDA',
    origin: 'Portoviejo',
    destination: 'San Vicente',
    originCityName: 'Portoviejo',
    destinationCityName: 'San Vicente',
    pickupAddress: 'Terminal Terrestre de Portoviejo',
    pickupReference: 'Puerta Principal Bloque A',
    destAddress: 'Malecón Leonidas Vega',
    destinationAddress: 'Malecón Leonidas Vega',
    destReference: 'Junto al Restaurante El Muelle',
    passengers: 1,
    passengerCount: 1,
    departureDate: '2026-09-05',
    travelDate: '2026-09-05',
    departureTime: '14:30',
    travelTime: '14:30',
    totalPrice: 9.0,
    status: 'SOLICITADA',
    paymentMethod: 'EFECTIVO',
    paymentStatus: 'PENDIENTE',
    statusHistory: [
      { status: 'SOLICITADA', timestamp: '2026-09-02T12:00:00Z', updatedBy: 'Ana Lucía Vera' }
    ],
    createdAt: '2026-09-02T12:00:00Z',
    updatedAt: '2026-09-02T12:00:00Z'
  }
];

// Initial Seed Shipments
const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'sh-201',
    code: 'PAC-EN-000125',
    deliveryCode: '4827',
    securityCode: '4827',
    customerId: 'usr-customer-1',
    senderName: 'Ana Lucía Vera',
    senderPhone: '0981122334',
    recipientName: 'Galo Mendoza Loor',
    receiverName: 'Galo Mendoza Loor',
    recipientPhone: '0997766554',
    receiverPhone: '0997766554',
    origin: 'Portoviejo',
    originCityName: 'Portoviejo',
    destination: 'Pedernales',
    destinationCityName: 'Pedernales',
    deliveryAddress: 'Av. Jaime Roldós y García Moreno',
    description: 'Documentos notariales y caja de repuestos electrónicos',
    packageDescription: 'Documentos notariales y caja de repuestos electrónicos',
    packageCount: 2,
    approxSize: 'MEDIANO',
    approxWeightKg: 4.5,
    declaredValue: 120.0,
    price: 8.0,
    status: 'EN_TRANSITO',
    driverId: 'usr-driver-1',
    assignedDriverId: 'usr-driver-1',
    driverName: 'Roberto Zambrano Bravo',
    driverPhone: '0987654321',
    vehiclePlate: 'MBP-4521',
    paymentMethod: 'EFECTIVO',
    paymentStatus: 'CONFIRMADO',
    statusHistory: [
      { status: 'SOLICITUD_RECIBIDA', timestamp: '2026-09-02T09:00:00Z', updatedBy: 'Ana Lucía Vera' },
      { status: 'ENCOMIENDA_RECIBIDA', timestamp: '2026-09-02T10:00:00Z', updatedBy: 'Roberto Zambrano (Conductor)' },
      { status: 'EN_TRANSITO', timestamp: '2026-09-02T11:00:00Z', updatedBy: 'Roberto Zambrano (Conductor)' }
    ],
    createdAt: '2026-09-02T09:00:00Z',
    updatedAt: '2026-09-02T11:00:00Z'
  }
];

// Initial Notifications
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    targetRole: 'CUSTOMER',
    userId: 'usr-customer-1',
    title: 'Conductor Asignado',
    message: 'Tu reserva PAC-000125 tiene asignado a Roberto Zambrano en un Toyota Fortuner (MBP-4521).',
    type: 'BOOKING',
    read: false,
    linkId: 'bk-101',
    createdAt: '2026-09-01T10:30:00Z'
  },
  {
    id: 'notif-2',
    targetRole: 'DRIVER',
    userId: 'usr-driver-1',
    title: 'Nuevo Servicio Asignado',
    message: 'Tienes un nuevo viaje asignado (PAC-000125) Portoviejo ↔ Pedernales.',
    type: 'BOOKING',
    read: false,
    linkId: 'bk-101',
    createdAt: '2026-09-01T10:30:00Z'
  },
  {
    id: 'notif-3',
    targetRole: 'ADMIN',
    title: 'Nueva Reserva Registrada',
    message: 'Se ha creado la reserva PAC-000126 para Portoviejo → San Vicente.',
    type: 'BOOKING',
    read: false,
    linkId: 'bk-102',
    createdAt: '2026-09-02T12:00:00Z'
  }
];

// Initial Settings
const INITIAL_SETTINGS: AppSettings = {
  businessName: 'PACHA',
  fullBusinessName: 'PACHA “TRANSPORTE EJECUTIVO”',
  mainRoute: 'PORTOVIEJO ↔ PEDERNALES',
  supportPhone: '+593 98 765 4321',
  supportWhatsApp: '593987654321',
  cancellationPolicy: 'Cancelación gratuita hasta 4 horas antes del viaje. Después de ese periodo aplica recargo del 20%.',
  shipmentConditions: 'No se transportan sustancias ilícitas, inflamables ni animales vivos sin autorización previa. Es obligatorio presentar el código de 4 dígitos al recibir.',
  enableIntermediateRoutes: true,
  defaultPassengerCapacity: 4,
  bankName: 'Banco Pichincha',
  bankAccount: '2100889922',
  bankType: 'Cuenta Corriente',
  bankHolder: 'PACHA TRANSPORTE EJECUTIVO CIA. LTDA.',
  bankIdNumber: '1391827364001',
  bankEmail: 'pagos@pachatransporte.com',
  bankQrPichincha: '',
  bankQrGuayaquil: '',
  welcomeNotice: 'Servicio exclusivo de transporte puerta a puerta y encomiendas en la ruta Manabí.',
  // Default Visual Assets & Texts
  appIconUrl: '',
  appLogoUrl: '',
  splashBgUrl: '/splash-taxi.jpg',
  splashLogoUrl: '',
  splashOverlayOpacity: 65,
  splashLogoSize: 'md',
  splashLogoStyle: 'framed',
  splashShowRouteBadge: true,
  heroBgUrl: '',
  defaultVehiclePhotoUrl: '',
  bookingBannerUrl: '',
  shipmentBannerUrl: '',
  appAccentTheme: 'gold',
  brandTitle: 'PACHA',
  brandSubtitle: 'TRANSPORTE EJECUTIVO',
  brandRouteOrigin: 'Portoviejo',
  brandRouteDestination: 'Pedernales',
  brandBadgeText: 'Ida y Vuelta',
  heroSubtitle: 'Viaja con comodidad, máxima seguridad y puntualidad en Manabí.',
  splashLoadingText: 'Cargando aplicación...',
  splashSubtext: 'Portoviejo ↔ Pedernales • Confort y Puntualidad',
  loginTitle: 'Iniciar Sesión',
  loginSubtitle: 'Acceso a plataforma PACHA Transporte Ejecutivo',
  // Default Step Images & Texts for Client Guide
  guideTravelStep1Img: '',
  guideTravelStep1Title: 'SELECCIONAR TU RUTA Y DIRECCIONES',
  guideTravelStep1Subtitle: 'Elige tu ciudad de origen, destino y tu dirección exacta puerta a puerta',
  guideTravelStep1Desc: 'Selecciona tu ruta entre Portoviejo, Pedernales u otros cantones. Escribe tu dirección de recogida o fija tu ubicación exacta con el botón GPS para que el taxi llegue a tu puerta sin ir a terminales.',

  guideTravelStep2Img: '',
  guideTravelStep2Title: 'SELECCIONAR FECHA, HORA DEL VIAJE Y CANTIDAD DE PASAJEROS',
  guideTravelStep2Subtitle: 'Programa la fecha y hora de salida y elige entre 1 a 4 asientos confortables',
  guideTravelStep2Desc: 'Selecciona el día y la hora de tu viaje (salidas continuas cada 30 minutos). Elige la cantidad de pasajeros (de 1 a 4) y si prefieres viaje Estándar compartido ($12) o Ejecutivo VIP exclusivo para tu grupo.',

  guideTravelStep3Img: '',
  guideTravelStep3Title: 'SELECCIONAR EL TIPO DE PAGO (EFECTIVO O TRANSFERENCIA) Y CONFIRMAR EL VIAJE',
  guideTravelStep3Subtitle: 'Elige tu método de pago y recibe tu boleto digital con código QR al instante',
  guideTravelStep3Desc: 'Elige pagar en efectivo al chofer al subir a la unidad o por transferencia bancaria directa. Al confirmar tu viaje recibirás tu boleto digital con la placa del vehículo, chofer asignado y código QR de abordaje.',

  guideTravelStep4Img: '',
  guideTravelStep4Title: '',
  guideTravelStep4Subtitle: '',
  guideTravelStep4Desc: '',

  guideShipmentStep1Img: '',
  guideShipmentStep1Title: 'REGISTRA TU PAQUETE Y REMITENTE',
  guideShipmentStep1Subtitle: 'Sobres de documentos, paquetes medianos o bultos protegidos',
  guideShipmentStep1Desc: 'Ingresa a "Enviar Encomienda", elige la ciudad de destino y especifica el tipo de contenido y datos de quien recibe. Si contiene artículos delicados, márcalo como frágil para trato preferencial.',

  guideShipmentStep2Img: '',
  guideShipmentStep2Title: 'GENERACION DEL CODIGO SECRETO DE 4 DIGITOS',
  guideShipmentStep2Subtitle: '¡Blindaje total! Tu paquete no puede ser entregado a otra persona',
  guideShipmentStep2Desc: 'La app crea automáticamente un código de 4 números secretos (ejemplo: 4829). Este código solo lo conoces tú y debes compartirlo con la persona que recibirá el paquete en destino.',

  guideShipmentStep3Img: '',
  guideShipmentStep3Title: 'ENTREGA VERIFICADA EN MANO Y CIERRE SEGURO',
  guideShipmentStep3Subtitle: 'El destinatario dicta el código al chofer y se libera el paquete',
  guideShipmentStep3Desc: 'Al llegar a la dirección de entrega, el chofer solicita el código secreto de 4 dígitos. La app valida la clave en el teléfono del chofer y entrega el paquete con total tranquilidad.'
};

// Storage listeners for reactive real-time state updates across tabs and components
type Listener = () => void;
const listeners: Set<Listener> = new Set();

let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('pacha_realtime_sync_channel');
    syncChannel.onmessage = () => {
      listeners.forEach((l) => {
        try {
          l();
        } catch (e) {
          console.error(e);
        }
      });
    };
  } catch (e) {
    // BroadcastChannel fallback
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('pacha_')) {
      listeners.forEach((l) => {
        try {
          l();
        } catch (err) {
          console.error(err);
        }
      });
    }
  });
}

function emitChange() {
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.error(e);
    }
  });
  if (syncChannel) {
    try {
      syncChannel.postMessage({ timestamp: Date.now() });
    } catch (e) {
      // Ignore channel errors
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('pacha_realtime_data_update', { detail: { timestamp: Date.now() } })
    );
  }
}

// Firestore real-time synchronization helpers
function cleanFirestoreData(data: any): any {
  if (data === undefined) return null;
  if (data === null) return null;
  if (Array.isArray(data)) {
    return data.map(cleanFirestoreData).filter((item) => item !== undefined);
  }
  if (typeof data === 'object') {
    const res: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (val !== undefined) {
        res[key] = cleanFirestoreData(val);
      }
    }
    return res;
  }
  return data;
}

const syncFirestoreDoc = async (coll: string, id: string, data: any) => {
  try {
    if (!id || typeof window === 'undefined' || !db) return;
    const sanitized = cleanFirestoreData(data);
    await setDoc(doc(db, coll, id), sanitized, { merge: true });
    console.info(`[PACHA Firestore] Document ${coll}/${id} synced successfully.`);
  } catch (err) {
    console.error(`[PACHA Firestore] Error syncing doc ${coll}/${id}:`, err);
  }
};

const deleteFirestoreDoc = async (coll: string, id: string) => {
  try {
    if (!id || typeof window === 'undefined' || !db) return;
    await deleteDoc(doc(db, coll, id));
    console.info(`[PACHA Firestore] Document ${coll}/${id} deleted.`);
  } catch (err) {
    console.error(`[PACHA Firestore] Error deleting doc ${coll}/${id}:`, err);
  }
};

let firestoreSyncStarted = false;
export function initFirestoreRealtimeSync() {
  if (firestoreSyncStarted || typeof window === 'undefined') return;
  firestoreSyncStarted = true;

  if (!db) {
    console.info('[PACHA] Running in offline LocalStorage mode.');
    return;
  }

  testFirestoreConnection().catch(() => {});

  try {
    // 1. Cities listener
    onSnapshot(collection(db, 'cities'), (snap) => {
      if (!snap.empty) {
        const items: City[] = [];
        snap.forEach((d) => items.push(d.data() as City));
        items.sort((a, b) => (a.order || 0) - (b.order || 0));
        localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(items));
        emitChange();
      }
    }, () => {});

    // 2. Fares listener
    onSnapshot(collection(db, 'fares'), (snap) => {
      if (!snap.empty) {
        const items: Fare[] = [];
        snap.forEach((d) => items.push(d.data() as Fare));
        localStorage.setItem(STORAGE_KEYS.FARES, JSON.stringify(items));
        emitChange();
      }
    }, () => {});

    // 3. Vehicles listener
    onSnapshot(collection(db, 'vehicles'), (snap) => {
      if (!snap.empty) {
        const items: Vehicle[] = [];
        snap.forEach((d) => items.push(d.data() as Vehicle));
        localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(items));
        emitChange();
      }
    }, () => {});

    // 4. Bookings listener
    onSnapshot(collection(db, 'bookings'), (snap) => {
      if (!snap.empty) {
        const items: Booking[] = [];
        snap.forEach((d) => items.push(d.data() as Booking));
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(items));
        emitChange();
      }
    }, () => {});

    // 5. Shipments listener
    onSnapshot(collection(db, 'shipments'), (snap) => {
      if (!snap.empty) {
        const items: Shipment[] = [];
        snap.forEach((d) => items.push(d.data() as Shipment));
        localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(items));
        emitChange();
      }
    }, () => {});

    // 6. Users listener
    onSnapshot(collection(db, 'users'), (snap) => {
      if (!snap.empty) {
        const items: User[] = [];
        snap.forEach((d) => items.push(d.data() as User));
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(items));
        emitChange();
      }
    }, () => {});

    // 7. Settings listener (listens to all partitioned docs: core, visuals, guide_travel, guide_shipment, global)
    onSnapshot(collection(db, 'settings'), (snap) => {
      // If the snapshot has pending local writes, do not overwrite local storage with intermediate state
      if (snap.metadata.hasPendingWrites) {
        return;
      }

      if (!snap.empty) {
        try {
          const currentLocal = (() => {
            const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return raw ? JSON.parse(raw) : {};
          })();

          let remoteCombined: Record<string, any> = {};
          // Order so specific partition docs override generic/legacy global doc
          const docs = [...snap.docs].sort((a, b) => {
            if (a.id === 'global') return -1;
            if (b.id === 'global') return 1;
            return 0;
          });

          docs.forEach((d) => {
            const data = d.data();
            delete data.partitioned;
            delete data.id;

            // Never let empty values in legacy/manifest 'global' overwrite actual values from partition docs
            for (const key of Object.keys(data)) {
              if (d.id === 'global' && (data[key] === '' || data[key] === null || data[key] === undefined)) {
                continue;
              }
              remoteCombined[key] = data[key];
            }
          });

          // Merge: remote updates override local, but safeguard against wiping local non-empty images
          // if remote happens to be an empty string unless remote has an explicit newer timestamp
          const merged: Record<string, any> = { ...currentLocal };
          for (const key of Object.keys(remoteCombined)) {
            const remoteVal = remoteCombined[key];
            if (remoteVal !== undefined) {
              if (remoteVal !== '' || !currentLocal[key]) {
                merged[key] = remoteVal;
              } else if (remoteCombined.updatedAt && (!currentLocal.updatedAt || remoteCombined.updatedAt >= currentLocal.updatedAt)) {
                merged[key] = remoteVal;
              }
            }
          }

          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
          emitChange();
        } catch (e) {
          console.warn('[PACHA] Error merging realtime settings:', e);
        }
      }
    }, (err) => {
      console.warn('[PACHA] Settings realtime listener error:', err);
    });

    // Migrate oversized local settings if present from older sessions
    try {
      const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (rawSettings && rawSettings.length > 500000) {
        console.info('[PACHA] Auto-optimizing local settings to compact partitioned storage...');
        PachaStorage.saveSettings(JSON.parse(rawSettings)).catch((e) => {
          console.warn('[PACHA] Background settings migration note:', e);
        });
      }
    } catch {}
  } catch (err) {
    console.warn('[PACHA] Firestore listener setup error:', err);
  }
}

// Auto bootstrap Firestore sync
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initFirestoreRealtimeSync();
  }, 100);
}

export const PachaStorage = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // --- CITIES ---
  getCities(): City[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(INITIAL_CITIES));
      return INITIAL_CITIES;
    }
    return JSON.parse(raw);
  },

  getActiveCities(): City[] {
    return this.getCities().filter((c) => c.isActive);
  },

  saveCities(cities: City[]) {
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities));
    cities.forEach((c) => syncFirestoreDoc('cities', c.id, c));
    emitChange();
  },

  addCity(name: string, description?: string): City {
    const cities = this.getCities();
    const newCity: City = {
      id: 'city-' + Date.now(),
      name: name.trim(),
      description: description || '',
      isActive: true,
      order: cities.length + 1
    };
    cities.push(newCity);
    this.saveCities(cities);
    return newCity;
  },

  toggleCityActive(id: string) {
    const cities = this.getCities().map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    this.saveCities(cities);
  },

  updateCity(id: string, updates: Partial<City>) {
    const cities = this.getCities().map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.saveCities(cities);
  },

  deleteCity(id: string) {
    const cities = this.getCities().filter((c) => c.id !== id);
    deleteFirestoreDoc('cities', id);
    this.saveCities(cities);
  },

  // --- FARES & ROUTES ---
  getFares(): (Fare & RouteFare)[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FARES);
    const fares: Fare[] = raw ? JSON.parse(raw) : INITIAL_FARES;
    return fares.map((f) => ({
      ...f,
      originCityName: f.originCity,
      destinationCityName: f.destinationCity,
      passengerPrice: f.price,
      shipmentBasePrice: Math.round(f.price * 0.6 * 100) / 100,
      estimatedMinutes: f.originCity.includes('Pedernales') || f.destinationCity.includes('Pedernales') ? 150 : 70
    }));
  },

  getFare(origin: string, destination: string): (Fare & RouteFare) | undefined {
    const fares = this.getFares();
    return fares.find(
      (f) =>
        (f.originCity.toLowerCase() === origin.toLowerCase() &&
          f.destinationCity.toLowerCase() === destination.toLowerCase()) ||
        (f.originCity.toLowerCase() === destination.toLowerCase() &&
          f.destinationCity.toLowerCase() === origin.toLowerCase())
    );
  },

  saveFares(fares: Fare[]) {
    localStorage.setItem(STORAGE_KEYS.FARES, JSON.stringify(fares));
    fares.forEach((f) => syncFirestoreDoc('fares', f.id, f));
    emitChange();
  },

  addFare(fareData: Omit<Fare, 'id' | 'createdAt' | 'updatedAt'>): Fare {
    const fares = this.getFares();
    const newFare: Fare = {
      ...fareData,
      id: 'fare-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    fares.push(newFare as any);
    this.saveFares(fares);
    return newFare;
  },

  updateFare(originOrId: string, destinationOrUpdates?: string | Partial<Fare>, updates?: Partial<Fare>) {
    const fares = this.getFares();
    let updatedList = fares;

    if (typeof destinationOrUpdates === 'string' && updates) {
      // update by origin and destination
      updatedList = fares.map((f) => {
        if (
          (f.originCity.toLowerCase() === originOrId.toLowerCase() &&
            f.destinationCity.toLowerCase() === destinationOrUpdates.toLowerCase()) ||
          (f.originCity.toLowerCase() === destinationOrUpdates.toLowerCase() &&
            f.destinationCity.toLowerCase() === originOrId.toLowerCase())
        ) {
          const newPrice = (updates as any).passengerPrice ?? updates.price ?? f.price;
          return {
            ...f,
            price: newPrice,
            updatedAt: new Date().toISOString()
          };
        }
        return f;
      });
    } else {
      // update by ID
      const u = destinationOrUpdates as Partial<Fare>;
      updatedList = fares.map((f) =>
        f.id === originOrId ? { ...f, ...u, updatedAt: new Date().toISOString() } : f
      );
    }

    this.saveFares(updatedList);
  },

  deleteFare(id: string) {
    const fares = this.getFares().filter((f) => f.id !== id);
    deleteFirestoreDoc('fares', id);
    this.saveFares(fares);
  },

  calculatePrice(origin: string, destination: string, tripType: TripType, passengers: number): { price: number; fareFound: boolean } {
    const fares = this.getFares().filter((f) => f.isActive);
    
    let matchedFare = fares.find(
      (f) => f.originCity.toLowerCase() === origin.toLowerCase() && f.destinationCity.toLowerCase() === destination.toLowerCase()
    );

    if (!matchedFare) {
      matchedFare = fares.find(
        (f) => f.originCity.toLowerCase() === destination.toLowerCase() && f.destinationCity.toLowerCase() === origin.toLowerCase()
      );
    }

    if (!matchedFare) {
      const base = 12.0;
      const additional = Math.max(0, passengers - 1) * 8.0;
      const multiplier = tripType === 'IDA_Y_VUELTA' ? 1.9 : 1.0;
      return { price: Number(((base + additional) * multiplier).toFixed(2)), fareFound: false };
    }

    const basePrice = matchedFare.price;
    const additionalPrice = Math.max(0, passengers - 1) * (matchedFare.pricePerAdditionalPassenger || (matchedFare.price * 0.7));
    const singleTripPrice = basePrice + additionalPrice;
    
    const multiplier = tripType === 'IDA_Y_VUELTA' ? 1.95 : 1.0;
    const finalPrice = Number((singleTripPrice * multiplier).toFixed(2));

    return { price: finalPrice, fareFound: true };
  },

  // --- BOOKINGS ---
  getBookings(): Booking[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    const list: Booking[] = raw ? JSON.parse(raw) : INITIAL_BOOKINGS;
    return list.map((b) => ({
      ...b,
      originCityName: b.originCityName || b.origin,
      destinationCityName: b.destinationCityName || b.destination,
      travelDate: b.travelDate || b.departureDate,
      travelTime: b.travelTime || b.departureTime,
      passengerCount: b.passengerCount || b.passengers,
      destinationAddress: b.destinationAddress || b.destAddress,
      assignedDriverId: b.assignedDriverId || b.driverId,
      driverId: b.driverId || b.assignedDriverId,
      assignedDriverName: b.assignedDriverName || b.driverName,
      driverName: b.driverName || b.assignedDriverName,
      assignedVehiclePlate: b.assignedVehiclePlate || b.vehiclePlate,
      vehiclePlate: b.vehiclePlate || b.assignedVehiclePlate
    }));
  },

  saveBookings(bookings: Booking[]) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    bookings.forEach((b) => syncFirestoreDoc('bookings', b.id, b));
    emitChange();
  },

  createBooking(data: Omit<Booking, 'id' | 'code' | 'status' | 'statusHistory' | 'createdAt' | 'updatedAt'>): Booking {
    const bookings = this.getBookings();
    const nextNum = 125 + bookings.length + 1;
    const code = `PAC-${String(nextNum).padStart(6, '0')}`;
    const now = new Date().toISOString();

    const newBooking: Booking = {
      ...data,
      id: 'bk-' + Date.now(),
      code,
      originCityName: data.originCityName || data.origin,
      destinationCityName: data.destinationCityName || data.destination,
      travelDate: data.travelDate || data.departureDate,
      travelTime: data.travelTime || data.departureTime,
      passengerCount: data.passengerCount || data.passengers,
      destinationAddress: data.destinationAddress || data.destAddress,
      status: 'SOLICITADA',
      statusHistory: [
        {
          status: 'SOLICITADA',
          timestamp: now,
          updatedBy: data.customerName,
          notes: 'Reserva creada por el cliente'
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    bookings.unshift(newBooking);
    this.saveBookings(bookings);

    this.addNotification({
      targetRole: 'ADMIN',
      title: 'Nueva Reserva Recibida',
      message: `${data.customerName} reservó viaje ${data.origin} → ${data.destination} (${data.tripType}) para ${data.passengers} pasajero(s).`,
      type: 'BOOKING',
      linkId: newBooking.id
    });

    return newBooking;
  },

  updateBookingStatus(id: string, newStatus: BookingStatus, updatedBy: string = 'SISTEMA PACHA', notes?: string) {
    const bookings = this.getBookings().map((b) => {
      if (b.id === id) {
        const history = [...b.statusHistory, { status: newStatus, timestamp: new Date().toISOString(), updatedBy, notes }];
        return {
          ...b,
          status: newStatus,
          statusHistory: history,
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    });
    this.saveBookings(bookings);

    const b = bookings.find((item) => item.id === id);
    if (b) {
      this.addNotification({
        userId: b.customerId,
        targetRole: 'CUSTOMER',
        title: `Estado de viaje: ${newStatus}`,
        message: `Tu viaje ${b.code} cambió a: ${newStatus.replace(/_/g, ' ')}.`,
        type: 'BOOKING',
        linkId: b.id
      });
    }
  },

  approveBookingPayment(id: string) {
    const bookings = this.getBookings().map((b) =>
      b.id === id
        ? {
            ...b,
            paymentStatus: 'PAID' as any,
            status: (b.status === 'SOLICITADA' ? 'CONFIRMADA' : b.status) as BookingStatus,
            updatedAt: new Date().toISOString()
          }
        : b
    );
    this.saveBookings(bookings);
  },

  assignDriverToBooking(
    bookingId: string,
    driverOrId: User | string,
    vehicleOrDriverName?: Vehicle | string,
    driverPhone?: string,
    vehiclePlate?: string,
    vehicleModel?: string
  ) {
    const now = new Date().toISOString();
    const bookings = this.getBookings().map((b) => {
      if (b.id === bookingId) {
        let dId = '';
        let dName = '';
        let dPhone = '';
        let vPlate = '';
        let vModel = '';

        if (typeof driverOrId === 'object') {
          dId = driverOrId.id;
          dName = driverOrId.fullName;
          dPhone = driverOrId.phone;
          const veh = vehicleOrDriverName as Vehicle;
          vPlate = veh?.plate || '';
          vModel = veh ? `${veh.make} ${veh.model}` : '';
        } else {
          dId = driverOrId;
          dName = (vehicleOrDriverName as string) || 'Conductor PACHA';
          dPhone = driverPhone || '0999999999';
          vPlate = vehiclePlate || 'MBA-1234';
          vModel = vehicleModel || 'Vehículo Ejecutivo';
        }

        const history = [
          ...b.statusHistory,
          {
            status: 'ASIGNADA',
            timestamp: now,
            updatedBy: 'ADMINISTRACIÓN',
            notes: `Asignado conductor: ${dName} (${vModel} - ${vPlate})`
          }
        ];

        return {
          ...b,
          driverId: dId,
          assignedDriverId: dId,
          driverName: dName,
          assignedDriverName: dName,
          driverPhone: dPhone,
          vehiclePlate: vPlate,
          assignedVehiclePlate: vPlate,
          vehicleModel: vModel,
          status: 'ASIGNADA' as BookingStatus,
          statusHistory: history,
          updatedAt: now
        };
      }
      return b;
    });

    this.saveBookings(bookings);

    const targetBooking = bookings.find((b) => b.id === bookingId);
    let dIdForNotif = typeof driverOrId === 'object' ? driverOrId.id : driverOrId;
    this.addNotification({
      targetRole: 'DRIVER',
      userId: dIdForNotif,
      title: 'Nuevo Viaje Asignado',
      message: `Te han asignado el viaje ${targetBooking?.code || bookingId} (${targetBooking?.originCityName || 'Origen'} → ${targetBooking?.destinationCityName || 'Destino'}).`,
      type: 'BOOKING',
      linkId: bookingId
    });
  },

  addRatingToBooking(bookingId: string, rating: number, comment?: string) {
    const bookings = this.getBookings().map((b) => {
      if (b.id === bookingId) {
        return { ...b, rating, ratingComment: comment || '', updatedAt: new Date().toISOString() };
      }
      return b;
    });
    this.saveBookings(bookings);
  },

  // --- SHIPMENTS (ENCOMIENDAS) ---
  getShipments(): Shipment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    const list: Shipment[] = raw ? JSON.parse(raw) : INITIAL_SHIPMENTS;
    return list.map((s) => ({
      ...s,
      originCityName: s.originCityName || s.origin,
      destinationCityName: s.destinationCityName || s.destination,
      deliveryAddress: s.deliveryAddress || s.destination,
      securityCode: s.securityCode || s.deliveryCode,
      receiverName: s.receiverName || s.recipientName,
      receiverPhone: s.receiverPhone || s.recipientPhone,
      packageDescription: s.packageDescription || s.description,
      assignedDriverId: s.assignedDriverId || s.driverId,
      driverId: s.driverId || s.assignedDriverId,
      assignedDriverName: s.assignedDriverName || s.driverName,
      driverName: s.driverName || s.assignedDriverName,
      assignedVehiclePlate: s.assignedVehiclePlate || s.vehiclePlate,
      vehiclePlate: s.vehiclePlate || s.assignedVehiclePlate
    }));
  },

  saveShipments(shipments: Shipment[]) {
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));
    shipments.forEach((s) => syncFirestoreDoc('shipments', s.id, s));
    emitChange();
  },

  createShipment(data: Omit<Shipment, 'id' | 'code' | 'deliveryCode' | 'status' | 'statusHistory' | 'createdAt' | 'updatedAt'>): Shipment {
    const shipments = this.getShipments();
    const nextNum = 125 + shipments.length + 1;
    const code = `PAC-EN-${String(nextNum).padStart(6, '0')}`;
    
    // Generate secure 4-digit PIN for delivery validation (1000 - 9999)
    const deliveryCode = String(Math.floor(1000 + Math.random() * 9000));
    const now = new Date().toISOString();

    const newShipment: Shipment = {
      ...data,
      id: 'sh-' + Date.now(),
      code,
      deliveryCode,
      securityCode: deliveryCode,
      originCityName: data.originCityName || data.origin,
      destinationCityName: data.destinationCityName || data.destination,
      deliveryAddress: data.deliveryAddress || data.destination,
      receiverName: data.receiverName || data.recipientName,
      receiverPhone: data.receiverPhone || data.recipientPhone,
      packageDescription: data.packageDescription || data.description,
      status: 'SOLICITUD_RECIBIDA',
      statusHistory: [
        {
          status: 'SOLICITUD_RECIBIDA',
          timestamp: now,
          updatedBy: data.senderName,
          notes: 'Solicitud de encomienda ingresada'
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    shipments.unshift(newShipment);
    this.saveShipments(shipments);

    this.addNotification({
      targetRole: 'ADMIN',
      title: 'Nueva Encomienda Solicitada',
      message: `De ${data.senderName} para ${data.recipientName} (${data.origin} → ${data.destination}). Código: ${code}.`,
      type: 'SHIPMENT',
      linkId: newShipment.id
    });

    return newShipment;
  },

  updateShipmentStatus(id: string, newStatus: ShipmentStatus, updatedBy: string = 'SISTEMA', notes?: string) {
    const shipments = this.getShipments().map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status: newStatus,
          statusHistory: [...s.statusHistory, { status: newStatus, timestamp: new Date().toISOString(), updatedBy, notes }],
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
    this.saveShipments(shipments);
  },

  assignDriverToShipment(
    shipmentId: string,
    driverId: string,
    driverName: string,
    driverPhone?: string,
    vehiclePlate?: string
  ) {
    const now = new Date().toISOString();
    const shipments = this.getShipments().map((s) => {
      if (s.id === shipmentId) {
        const history = [
          ...s.statusHistory,
          {
            status: 'EN_TRANSITO' as ShipmentStatus,
            timestamp: now,
            updatedBy: 'ADMINISTRACIÓN',
            notes: `Conductor asignado: ${driverName} (${vehiclePlate || 'Vehículo PACHA'})`
          }
        ];
        return {
          ...s,
          driverId,
          assignedDriverId: driverId,
          driverName,
          assignedDriverName: driverName,
          driverPhone: driverPhone || '0999999999',
          vehiclePlate: vehiclePlate || 'PACHA',
          assignedVehiclePlate: vehiclePlate || 'PACHA',
          status: 'EN_TRANSITO' as ShipmentStatus,
          statusHistory: history,
          updatedAt: now
        };
      }
      return s;
    });

    this.saveShipments(shipments);

    this.addNotification({
      targetRole: 'DRIVER',
      userId: driverId,
      title: 'Nueva Encomienda Asignada',
      message: `Te han asignado la encomienda ${shipmentId} para entrega a ${shipments.find(s => s.id === shipmentId)?.receiverName || 'destinatario'}.`,
      type: 'SHIPMENT',
      linkId: shipmentId
    });
  },

  verifyDeliveryCodeAndComplete(shipmentId: string, enteredCode: string, driverId: string, driverName: string): { success: boolean; message: string } {
    const shipments = this.getShipments();
    const item = shipments.find((s) => s.id === shipmentId);

    if (!item) {
      return { success: false, message: 'Encomienda no encontrada.' };
    }

    // Security check: Only assigned driver can deliver (Requirement 6)
    const assignedId = item.assignedDriverId || item.driverId;
    if (assignedId && driverId && assignedId !== driverId && !driverId.includes('admin')) {
      return {
        success: false,
        message: `Acceso restringido: Solo el conductor asignado (${item.driverName || item.assignedDriverName || 'autorizado'}) puede ingresar el código de entrega para este paquete.`
      };
    }

    const codeToMatch = (item.securityCode || item.deliveryCode).trim();
    if (codeToMatch !== enteredCode.trim()) {
      return { success: false, message: 'Código de entrega incorrecto. Solicite el código de 4 dígitos al destinatario.' };
    }

    const now = new Date().toISOString();
    const updatedShipments = shipments.map((s) => {
      if (s.id === shipmentId) {
        return {
          ...s,
          status: 'ENTREGADO' as ShipmentStatus,
          deliveredAt: now,
          deliveredByDriverId: driverId,
          verifiedCode: enteredCode,
          statusHistory: [
            ...s.statusHistory,
            {
              status: 'ENTREGADO' as ShipmentStatus,
              timestamp: now,
              updatedBy: `${driverName} (Conductor)`,
              notes: `Entrega verificada exitosamente con código ${enteredCode}`
            }
          ],
          updatedAt: now
        };
      }
      return s;
    });

    this.saveShipments(updatedShipments);

    this.addNotification({
      userId: item.customerId,
      targetRole: 'CUSTOMER',
      title: 'Encomienda Entregada',
      message: `Tu encomienda ${item.code} fue entregada con éxito a ${item.recipientName}.`,
      type: 'SHIPMENT',
      linkId: item.id
    });

    return { success: true, message: 'Código verificado con éxito. Encomienda marcada como ENTREGADA.' };
  },

  verifyAndDeliverShipment(shipmentId: string, code: string, driverId?: string, driverName?: string): { success: boolean; message: string } {
    return this.verifyDeliveryCodeAndComplete(shipmentId, code, driverId || 'usr-driver-1', driverName || 'Roberto Zambrano');
  },

  // --- VEHICLES ---
  getVehicles(): Vehicle[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_VEHICLES));
      return INITIAL_VEHICLES;
    }
    return JSON.parse(raw);
  },

  saveVehicles(vehicles: Vehicle[]) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    vehicles.forEach((v) => syncFirestoreDoc('vehicles', v.id, v));
    emitChange();
  },

  addVehicle(data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Vehicle {
    const vehicles = this.getVehicles();
    const newVehicle: Vehicle = {
      ...data,
      id: 'veh-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    vehicles.push(newVehicle);
    this.saveVehicles(vehicles);
    return newVehicle;
  },

  updateVehicle(id: string, updates: Partial<Vehicle>) {
    const vehicles = this.getVehicles().map((v) =>
      v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
    );
    this.saveVehicles(vehicles);
  },

  deleteVehicle(id: string) {
    const vehicles = this.getVehicles().filter((v) => v.id !== id);
    deleteFirestoreDoc('vehicles', id);
    this.saveVehicles(vehicles);
  },

  // --- USERS ---
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  },

  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    users.forEach((u) => syncFirestoreDoc('users', u.id, u));
    emitChange();
  },

  addUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...data,
      id: 'usr-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>) {
    const users = this.getUsers().map((u) =>
      u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u
    );
    this.saveUsers(users);
  },

  updateUserStatus(id: string, status: 'active' | 'suspended') {
    const users = this.getUsers().map((u) => (u.id === id ? { ...u, status } : u));
    this.saveUsers(users);
  },

  deleteUser(id: string) {
    const users = this.getUsers().filter((u) => u.id !== id);
    deleteFirestoreDoc('users', id);
    this.saveUsers(users);
  },

  // --- NOTIFICATIONS ---
  getNotifications(): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    const notifs = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now(),
      read: false,
      createdAt: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    emitChange();
  },

  markNotificationRead(id: string) {
    const notifs = this.getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    emitChange();
  },

  markAllNotificationsRead() {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    emitChange();
  },

  clearAllNotifications() {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    emitChange();
  },

  deleteNotification(id: string) {
    const notifs = this.getNotifications().filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    emitChange();
  },

  // --- SETTINGS ---
  getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    const merged: AppSettings = { ...INITIAL_SETTINGS, ...parsed };

    // Migrate previous default titles if they hadn't been manually altered
    if (merged.guideTravelStep1Title === 'Selecciona tu Ruta y Horario' || !merged.guideTravelStep1Title) {
      merged.guideTravelStep1Title = 'SELECCIONAR TU RUTA Y DIRECCIONES';
      merged.guideTravelStep1Subtitle = 'Elige tu ciudad de origen, destino y tu dirección exacta puerta a puerta';
    }
    if (merged.guideTravelStep2Title === 'Elige tus Asientos y Nivel de Confort' || !merged.guideTravelStep2Title) {
      merged.guideTravelStep2Title = 'SELECCIONAR FECHA, HORA DEL VIAJE Y CANTIDAD DE PASAJEROS';
      merged.guideTravelStep2Subtitle = 'Programa la fecha y hora de salida y elige entre 1 a 4 asientos confortables';
    }
    if (merged.guideTravelStep3Title === 'Dirección Exacta y Recogida Puerta a Puerta' || !merged.guideTravelStep3Title) {
      merged.guideTravelStep3Title = 'SELECCIONAR EL TIPO DE PAGO (EFECTIVO O TRANSFERENCIA) Y CONFIRMAR EL VIAJE';
      merged.guideTravelStep3Subtitle = 'Elige tu método de pago y recibe tu boleto digital con código QR al instante';
    }
    if (merged.guideShipmentStep1Title === 'Registra tu Paquete y Remitente' || !merged.guideShipmentStep1Title) {
      merged.guideShipmentStep1Title = 'REGISTRA TU PAQUETE Y REMITENTE';
    }
    if (merged.guideShipmentStep2Title === 'Generación del Código Secreto de 4 Dígitos' || !merged.guideShipmentStep2Title) {
      merged.guideShipmentStep2Title = 'GENERACION DEL CODIGO SECRETO DE 4 DIGITOS';
    }
    if (merged.guideShipmentStep3Title === 'Entrega Verificada en Mano y Cierre Seguro' || !merged.guideShipmentStep3Title) {
      merged.guideShipmentStep3Title = 'ENTREGA VERIFICADA EN MANO Y CIERRE SEGURO';
    }

    return merged;
  },

  deleteBooking(id: string) {
    const bookings = this.getBookings().filter((b) => b.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.warn('[PACHA] localStorage error deleting booking:', e);
    }
    deleteFirestoreDoc('bookings', id);
    emitChange();
  },

  deleteShipment(id: string) {
    const shipments = this.getShipments().filter((s) => s.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));
    } catch (e) {
      console.warn('[PACHA] localStorage error deleting shipment:', e);
    }
    deleteFirestoreDoc('shipments', id);
    emitChange();
  },

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    // 1. Recompress any oversized base64 image strings if present
    const processedSettings = { ...settings };
    const imageKeys: (keyof AppSettings)[] = [
      'appIconUrl', 'appLogoUrl', 'splashBgUrl', 'splashLogoUrl',
      'heroBgUrl', 'defaultVehiclePhotoUrl', 'bookingBannerUrl', 'shipmentBannerUrl',
      'bankQrPichincha', 'bankQrGuayaquil',
      'guideTravelStep1Img', 'guideTravelStep2Img', 'guideTravelStep3Img', 'guideTravelStep4Img',
      'guideShipmentStep1Img', 'guideShipmentStep2Img', 'guideShipmentStep3Img'
    ];

    for (const k of imageKeys) {
      const val = processedSettings[k];
      if (typeof val === 'string' && val.startsWith('data:image/') && val.length > 38000) {
        try {
          (processedSettings as any)[k] = await compressDataUrl(val, 36000);
        } catch (e) {
          console.warn(`[PACHA] Error compressing image field ${String(k)}:`, e);
        }
      }
    }

    const sanitized = cleanFirestoreData(processedSettings);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(sanitized));
    } catch (e) {
      console.warn('[PACHA] localStorage error saving settings:', e);
    }

    // 2. Partition Firestore documents so no single document ever exceeds 1MB limit
    const coreDoc = {
      businessName: sanitized.businessName || 'PACHA',
      fullBusinessName: sanitized.fullBusinessName || 'PACHA Transporte Ejecutivo',
      mainRoute: sanitized.mainRoute || 'Portoviejo - Pedernales',
      supportPhone: sanitized.supportPhone || '',
      supportWhatsApp: sanitized.supportWhatsApp || '',
      cancellationPolicy: sanitized.cancellationPolicy || '',
      shipmentConditions: sanitized.shipmentConditions || '',
      enableIntermediateRoutes: !!sanitized.enableIntermediateRoutes,
      defaultPassengerCapacity: sanitized.defaultPassengerCapacity || 4,
      bankAccount: sanitized.bankAccount || '',
      bankName: sanitized.bankName || '',
      bankHolder: sanitized.bankHolder || '',
      bankType: sanitized.bankType || '',
      bankIdNumber: sanitized.bankIdNumber || '',
      bankEmail: sanitized.bankEmail || '',
      bankQrPichincha: sanitized.bankQrPichincha || '',
      bankQrGuayaquil: sanitized.bankQrGuayaquil || '',
      welcomeNotice: sanitized.welcomeNotice || '',
      updatedAt: new Date().toISOString()
    };

    const visualsDoc = {
      appIconUrl: sanitized.appIconUrl || '',
      appLogoUrl: sanitized.appLogoUrl || '',
      splashBgUrl: sanitized.splashBgUrl || '',
      splashLogoUrl: sanitized.splashLogoUrl || '',
      splashOverlayOpacity: sanitized.splashOverlayOpacity ?? 65,
      splashLogoSize: sanitized.splashLogoSize || 'md',
      splashLogoStyle: sanitized.splashLogoStyle || 'framed',
      splashShowRouteBadge: sanitized.splashShowRouteBadge ?? true,
      heroBgUrl: sanitized.heroBgUrl || '',
      defaultVehiclePhotoUrl: sanitized.defaultVehiclePhotoUrl || '',
      bookingBannerUrl: sanitized.bookingBannerUrl || '',
      shipmentBannerUrl: sanitized.shipmentBannerUrl || '',
      appAccentTheme: sanitized.appAccentTheme || 'gold',
      brandTitle: sanitized.brandTitle || 'PACHA',
      brandSubtitle: sanitized.brandSubtitle || 'TRANSPORTE EJECUTIVO',
      brandRouteOrigin: sanitized.brandRouteOrigin || 'Portoviejo',
      brandRouteDestination: sanitized.brandRouteDestination || 'Pedernales',
      brandBadgeText: sanitized.brandBadgeText || 'Ida y Vuelta',
      heroSubtitle: sanitized.heroSubtitle || '',
      splashLoadingText: sanitized.splashLoadingText || '',
      splashSubtext: sanitized.splashSubtext || '',
      loginTitle: sanitized.loginTitle || '',
      loginSubtitle: sanitized.loginSubtitle || '',
      updatedAt: new Date().toISOString()
    };

    const guideTravelDoc = {
      guideTravelStep1Img: sanitized.guideTravelStep1Img || '',
      guideTravelStep1Title: sanitized.guideTravelStep1Title || '',
      guideTravelStep1Subtitle: sanitized.guideTravelStep1Subtitle || '',
      guideTravelStep1Desc: sanitized.guideTravelStep1Desc || '',
      guideTravelStep2Img: sanitized.guideTravelStep2Img || '',
      guideTravelStep2Title: sanitized.guideTravelStep2Title || '',
      guideTravelStep2Subtitle: sanitized.guideTravelStep2Subtitle || '',
      guideTravelStep2Desc: sanitized.guideTravelStep2Desc || '',
      guideTravelStep3Img: sanitized.guideTravelStep3Img || '',
      guideTravelStep3Title: sanitized.guideTravelStep3Title || '',
      guideTravelStep3Subtitle: sanitized.guideTravelStep3Subtitle || '',
      guideTravelStep3Desc: sanitized.guideTravelStep3Desc || '',
      guideTravelStep4Img: sanitized.guideTravelStep4Img || '',
      guideTravelStep4Title: sanitized.guideTravelStep4Title || '',
      guideTravelStep4Subtitle: sanitized.guideTravelStep4Subtitle || '',
      guideTravelStep4Desc: sanitized.guideTravelStep4Desc || '',
      updatedAt: new Date().toISOString()
    };

    const guideShipmentDoc = {
      guideShipmentStep1Img: sanitized.guideShipmentStep1Img || '',
      guideShipmentStep1Title: sanitized.guideShipmentStep1Title || '',
      guideShipmentStep1Subtitle: sanitized.guideShipmentStep1Subtitle || '',
      guideShipmentStep1Desc: sanitized.guideShipmentStep1Desc || '',
      guideShipmentStep2Img: sanitized.guideShipmentStep2Img || '',
      guideShipmentStep2Title: sanitized.guideShipmentStep2Title || '',
      guideShipmentStep2Subtitle: sanitized.guideShipmentStep2Subtitle || '',
      guideShipmentStep2Desc: sanitized.guideShipmentStep2Desc || '',
      guideShipmentStep3Img: sanitized.guideShipmentStep3Img || '',
      guideShipmentStep3Title: sanitized.guideShipmentStep3Title || '',
      guideShipmentStep3Subtitle: sanitized.guideShipmentStep3Subtitle || '',
      guideShipmentStep3Desc: sanitized.guideShipmentStep3Desc || '',
      updatedAt: new Date().toISOString()
    };

    const globalDoc = {
      id: 'global',
      partitioned: true,
      updatedAt: new Date().toISOString(),
      businessName: sanitized.businessName || 'PACHA',
      fullBusinessName: sanitized.fullBusinessName || 'PACHA Transporte Ejecutivo',
      mainRoute: sanitized.mainRoute || 'Portoviejo - Pedernales',
      supportPhone: sanitized.supportPhone || '',
      supportWhatsApp: sanitized.supportWhatsApp || ''
    };

    // Sync all partitioned documents in parallel (each is ~10KB-80KB, well under 1MB)
    await Promise.all([
      syncFirestoreDoc('settings', 'global', globalDoc),
      syncFirestoreDoc('settings', 'core', coreDoc),
      syncFirestoreDoc('settings', 'visuals', visualsDoc),
      syncFirestoreDoc('settings', 'guide_travel', guideTravelDoc),
      syncFirestoreDoc('settings', 'guide_shipment', guideShipmentDoc)
    ]);

    emitChange();
    return sanitized;
  },

  // --- RESET SYSTEM ---
  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(INITIAL_CITIES));
    localStorage.setItem(STORAGE_KEYS.FARES, JSON.stringify(INITIAL_FARES));
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_VEHICLES));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(INITIAL_SHIPMENTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    emitChange();
  }
};
