import React from 'react';

// ==========================================================
// 1. ILUSTRACIÓN: SELECCIÓN DE RUTA Y SMARTPHONE
// ==========================================================
export const RouteSelectionIllustration: React.FC<{ activeHotspot?: string; onSelectHotspot?: (id: string) => void }> = ({
  activeHotspot,
  onSelectHotspot
}) => (
  <svg viewBox="0 0 400 240" className="w-full h-auto max-h-56 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad1" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B192C" />
        <stop offset="1" stopColor="#06101E" />
      </linearGradient>
      <linearGradient id="goldGrad1" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#FDE047" />
      </linearGradient>
      <linearGradient id="phoneBody" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#1E293B" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
      <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Fondo base */}
    <rect width="400" height="240" rx="20" fill="url(#bgGrad1)" />

    {/* Mapa Estilizado de Manabí (Curvas de costa y ruta) */}
    <path
      d="M40 190 Q90 160 110 120 T190 70 T300 50"
      stroke="#1E293B"
      strokeWidth="24"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M40 190 Q90 160 110 120 T190 70 T300 50"
      stroke="#334155"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Línea dorada de la ruta Portoviejo <-> Pedernales */}
    <path
      d="M60 180 Q100 155 120 125 T190 75 T280 55"
      stroke="url(#goldGrad1)"
      strokeWidth="4"
      strokeDasharray="6 4"
      strokeLinecap="round"
      filter="url(#glowGold)"
    />

    {/* Puntos intermedios de Manabí */}
    <circle cx="120" cy="125" r="4" fill="#64748B" />
    <text x="130" y="129" fill="#94A3B8" fontSize="8" fontWeight="bold">Bahía / Tosagua</text>

    <circle cx="190" cy="75" r="4" fill="#64748B" />
    <text x="200" y="79" fill="#94A3B8" fontSize="8" fontWeight="bold">Jama</text>

    {/* Pin Origen: Portoviejo */}
    <g
      className="cursor-pointer transition-transform hover:scale-110"
      onClick={() => onSelectHotspot && onSelectHotspot('portoviejo')}
    >
      <circle cx="60" cy="180" r="14" fill="#F59E0B" fillOpacity="0.25" className="animate-ping" />
      <circle cx="60" cy="180" r="10" fill="#F59E0B" />
      <circle cx="60" cy="180" r="4" fill="#0B192C" />
      <rect x="25" y="196" width="70" height="18" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
      <text x="60" y="209" fill="#FDE047" fontSize="8" fontWeight="900" textAnchor="middle">PORTOVIEJO</text>
    </g>

    {/* Pin Destino: Pedernales */}
    <g
      className="cursor-pointer transition-transform hover:scale-110"
      onClick={() => onSelectHotspot && onSelectHotspot('pedernales')}
    >
      <circle cx="280" cy="55" r="14" fill="#10B981" fillOpacity="0.25" className="animate-ping" />
      <circle cx="280" cy="55" r="10" fill="#10B981" />
      <circle cx="280" cy="55" r="4" fill="#0B192C" />
      <rect x="245" y="26" width="72" height="18" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="1" />
      <text x="281" y="39" fill="#34D399" fontSize="8" fontWeight="900" textAnchor="middle">PEDERNALES</text>
    </g>

    {/* Teléfono Inteligente de Selección */}
    <g transform="translate(260, 80)">
      {/* Cuerpo del smartphone */}
      <rect x="0" y="0" width="115" height="145" rx="16" fill="url(#phoneBody)" stroke="#475569" strokeWidth="2.5" />
      {/* Pantalla */}
      <rect x="6" y="8" width="103" height="130" rx="11" fill="#091526" />
      {/* Barra superior teléfono */}
      <rect x="42" y="11" width="31" height="4" rx="2" fill="#334155" />

      {/* Mini App UI dentro del teléfono */}
      <rect x="12" y="22" width="91" height="16" rx="5" fill="#1E293B" stroke="#F59E0B" strokeWidth="0.8" />
      <text x="20" y="33" fill="#FBBF24" fontSize="7" fontWeight="bold">Origen: Portoviejo</text>

      <rect x="12" y="42" width="91" height="16" rx="5" fill="#1E293B" stroke="#38BDF8" strokeWidth="0.8" />
      <text x="20" y="53" fill="#38BDF8" fontSize="7" fontWeight="bold">Destino: Pedernales</text>

      {/* Selector de horario */}
      <rect x="12" y="63" width="43" height="14" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="0.6" />
      <text x="16" y="73" fill="#94A3B8" fontSize="6">Hoy: 08:30 AM</text>

      <rect x="59" y="63" width="44" height="14" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="0.6" />
      <text x="63" y="73" fill="#94A3B8" fontSize="6">Pasajeros: 2</text>

      {/* Botón Buscar Viaje */}
      <rect x="12" y="86" width="91" height="18" rx="6" fill="url(#goldGrad1)" />
      <text x="57" y="98" fill="#0B192C" fontSize="7.5" fontWeight="900" textAnchor="middle">PEDIR VIAJE PACHA</text>

      {/* Auto mini ilustrado */}
      <g transform="translate(38, 110)">
        <rect x="0" y="6" width="38" height="12" rx="4" fill="#F59E0B" />
        <rect x="7" y="1" width="24" height="8" rx="3" fill="#FEF08A" />
        <circle cx="9" cy="18" r="3.5" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="29" cy="18" r="3.5" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
      </g>
    </g>

    {/* Hotspot Interactivo: Frecuencias */}
    <g
      className="cursor-pointer"
      onClick={() => onSelectHotspot && onSelectHotspot('frecuencias')}
      transform="translate(18, 18)"
    >
      <rect
        x="0"
        y="0"
        width="112"
        height="32"
        rx="8"
        fill="#0F172A"
        fillOpacity="0.9"
        stroke={activeHotspot === 'frecuencias' ? '#F59E0B' : '#334155'}
        strokeWidth={activeHotspot === 'frecuencias' ? 1.5 : 1}
      />
      <circle cx="14" cy="16" r="5" fill="#F59E0B" />
      <text x="24" y="14" fill="#F8FAFC" fontSize="7.5" fontWeight="bold">Salidas cada 30 min</text>
      <text x="24" y="24" fill="#94A3B8" fontSize="6.5">05:00 AM a 20:00 PM</text>
    </g>
  </svg>
);

// ==========================================================
// 2. ILUSTRACIÓN: ASIENTOS, CONFORT Y TAXI EJECUTIVO
// ==========================================================
export const CarComfortIllustration: React.FC<{ activeHotspot?: string; onSelectHotspot?: (id: string) => void }> = ({
  activeHotspot,
  onSelectHotspot
}) => (
  <svg viewBox="0 0 400 240" className="w-full h-auto max-h-56 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad2" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B192C" />
        <stop offset="1" stopColor="#061222" />
      </linearGradient>
      <linearGradient id="carBody" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#1E293B" />
        <stop offset="0.5" stopColor="#334155" />
        <stop offset="1" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="goldCar" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#FDE047" />
      </linearGradient>
    </defs>

    {/* Fondo base */}
    <rect width="400" height="240" rx="20" fill="url(#bgGrad2)" />

    {/* Silueta / Corte Técnico de Taxi Ejecutivo PACHA */}
    <g transform="translate(45, 30)">
      {/* Contorno exterior del auto */}
      <path
        d="M20 135 C35 135 45 125 60 120 L100 80 C120 62 145 60 210 60 L245 80 L280 120 C295 125 305 135 310 145 L310 160 C310 165 300 170 290 170 L260 170 C255 152 238 140 220 140 C202 140 185 152 180 170 L110 170 C105 152 88 140 70 140 C52 140 35 152 30 170 L10 170 C5 170 0 165 0 160 L0 145 C0 138 10 135 20 135 Z"
        fill="url(#carBody)"
        stroke="#F59E0B"
        strokeWidth="1.5"
      />

      {/* Ventanas con tinte ejecutivo */}
      <path
        d="M98 84 L145 84 L145 118 L68 118 Z"
        fill="#0284C7"
        fillOpacity="0.3"
        stroke="#38BDF8"
        strokeWidth="1"
      />
      <path
        d="M152 84 L205 84 L205 118 L152 118 Z"
        fill="#0284C7"
        fillOpacity="0.3"
        stroke="#38BDF8"
        strokeWidth="1"
      />
      <path
        d="M212 84 L240 84 L265 118 L212 118 Z"
        fill="#0284C7"
        fillOpacity="0.3"
        stroke="#38BDF8"
        strokeWidth="1"
      />

      {/* Ruedas con rines de lujo */}
      <g transform="translate(70, 168)">
        <circle cx="0" cy="0" r="22" fill="#090E17" stroke="#475569" strokeWidth="3" />
        <circle cx="0" cy="0" r="14" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="0" cy="0" r="5" fill="#F59E0B" />
      </g>
      <g transform="translate(220, 168)">
        <circle cx="0" cy="0" r="22" fill="#090E17" stroke="#475569" strokeWidth="3" />
        <circle cx="0" cy="0" r="14" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="0" cy="0" r="5" fill="#F59E0B" />
      </g>

      {/* Asiento 1: Chofer */}
      <g transform="translate(105, 90)">
        <rect x="0" y="0" width="16" height="24" rx="4" fill="#334155" stroke="#64748B" strokeWidth="1" />
        <circle cx="8" cy="-5" r="4" fill="#64748B" />
        <text x="8" y="16" fill="#94A3B8" fontSize="6" fontWeight="bold" textAnchor="middle">Chofer</text>
      </g>

      {/* Asiento 2: Copiloto (Asiento 1 cliente) */}
      <g
        className="cursor-pointer transition-transform hover:scale-110"
        transform="translate(130, 90)"
        onClick={() => onSelectHotspot && onSelectHotspot('asiento1')}
      >
        <rect
          x="0"
          y="0"
          width="18"
          height="25"
          rx="4"
          fill="#0F172A"
          stroke={activeHotspot === 'asiento1' ? '#FDE047' : '#F59E0B'}
          strokeWidth="1.5"
        />
        <circle cx="9" cy="-5" r="4.5" fill="#F59E0B" />
        <text x="9" y="16" fill="#FDE047" fontSize="7" fontWeight="900" textAnchor="middle">1</text>
      </g>

      {/* Asientos Traseros (Asiento 2, 3, 4) */}
      <g
        className="cursor-pointer transition-transform hover:scale-110"
        transform="translate(165, 90)"
        onClick={() => onSelectHotspot && onSelectHotspot('asientostraseros')}
      >
        <rect
          x="0"
          y="0"
          width="42"
          height="25"
          rx="4"
          fill="#0F172A"
          stroke={activeHotspot === 'asientostraseros' ? '#FDE047' : '#F59E0B'}
          strokeWidth="1.5"
        />
        <circle cx="8" cy="-5" r="4" fill="#F59E0B" />
        <circle cx="21" cy="-5" r="4" fill="#F59E0B" />
        <circle cx="34" cy="-5" r="4" fill="#F59E0B" />
        <text x="8" y="16" fill="#FDE047" fontSize="6.5" fontWeight="900" textAnchor="middle">2</text>
        <text x="21" y="16" fill="#FDE047" fontSize="6.5" fontWeight="900" textAnchor="middle">3</text>
        <text x="34" y="16" fill="#FDE047" fontSize="6.5" fontWeight="900" textAnchor="middle">4</text>
      </g>

      {/* Maletero con equipaje */}
      <g
        className="cursor-pointer transition-transform hover:scale-105"
        transform="translate(230, 95)"
        onClick={() => onSelectHotspot && onSelectHotspot('maletero')}
      >
        <rect
          x="0"
          y="0"
          width="32"
          height="22"
          rx="4"
          fill="#1E293B"
          stroke={activeHotspot === 'maletero' ? '#38BDF8' : '#64748B'}
          strokeWidth="1.2"
        />
        {/* Maleta dibujada */}
        <rect x="4" y="5" width="14" height="12" rx="2" fill="#F59E0B" />
        <rect x="8" y="3" width="6" height="3" rx="1" fill="#FEF08A" />
        <rect x="20" y="7" width="9" height="10" rx="2" fill="#38BDF8" />
      </g>

      {/* Letrero PACHA en el techo */}
      <g transform="translate(150, 48)">
        <rect x="0" y="0" width="35" height="11" rx="3" fill="#F59E0B" />
        <text x="17.5" y="8" fill="#0B192C" fontSize="7" fontWeight="900" textAnchor="middle">PACHA</text>
      </g>
    </g>

    {/* Tarjeta flotante interactiva: Aire Acondicionado */}
    <g
      className="cursor-pointer"
      transform="translate(16, 15)"
      onClick={() => onSelectHotspot && onSelectHotspot('aire')}
    >
      <rect
        x="0"
        y="0"
        width="110"
        height="32"
        rx="8"
        fill="#0F172A"
        stroke={activeHotspot === 'aire' ? '#38BDF8' : '#334155'}
        strokeWidth={activeHotspot === 'aire' ? 1.5 : 1}
      />
      <circle cx="14" cy="16" r="6" fill="#0284C7" />
      <text x="26" y="15" fill="#38BDF8" fontSize="7.5" fontWeight="bold">Aire Acondicionado</text>
      <text x="26" y="24" fill="#94A3B8" fontSize="6.5">Climatización total</text>
    </g>

    {/* Tarjeta flotante interactiva: Equipaje gratis */}
    <g
      className="cursor-pointer"
      transform="translate(265, 15)"
      onClick={() => onSelectHotspot && onSelectHotspot('maletero')}
    >
      <rect
        x="0"
        y="0"
        width="118"
        height="32"
        rx="8"
        fill="#0F172A"
        stroke={activeHotspot === 'maletero' ? '#F59E0B' : '#334155'}
        strokeWidth={activeHotspot === 'maletero' ? 1.5 : 1}
      />
      <circle cx="14" cy="16" r="6" fill="#F59E0B" />
      <text x="26" y="15" fill="#FDE047" fontSize="7.5" fontWeight="bold">Equipaje Incluido</text>
      <text x="26" y="24" fill="#94A3B8" fontSize="6.5">Mano + Mediana s/costo</text>
    </g>
  </svg>
);

// ==========================================================
// 3. ILUSTRACIÓN: GEORREFERENCIACIÓN Y RECOGIDA PUERTA A PUERTA
// ==========================================================
export const DoorToDoorIllustration: React.FC<{ activeHotspot?: string; onSelectHotspot?: (id: string) => void }> = ({
  activeHotspot,
  onSelectHotspot
}) => (
  <svg viewBox="0 0 400 240" className="w-full h-auto max-h-56 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad3" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B192C" />
        <stop offset="1" stopColor="#081424" />
      </linearGradient>
      <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#1E293B" />
        <stop offset="1" stopColor="#334155" />
      </linearGradient>
    </defs>

    {/* Fondo base */}
    <rect width="400" height="240" rx="20" fill="url(#bgGrad3)" />

    {/* Calle / Pavimento */}
    <path d="M0 160 L400 160 L400 240 L0 240 Z" fill="url(#roadGrad)" />
    <path d="M20 200 L70 200 M110 200 L160 200 M200 200 L250 200 M290 200 L340 200 M370 200 L400 200" stroke="#FDE047" strokeWidth="4" strokeDasharray="12 12" />

    {/* Casa / Destino Puerta a Puerta */}
    <g transform="translate(45, 60)">
      {/* Fachada */}
      <rect x="0" y="30" width="105" height="70" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
      {/* Techo */}
      <path d="M-10 30 L52 -5 L115 30 Z" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
      {/* Puerta con pin de llegada */}
      <rect x="42" y="55" width="22" height="45" rx="3" fill="#334155" stroke="#F59E0B" strokeWidth="1" />
      <circle cx="60" cy="78" r="2" fill="#FDE047" />

      {/* Ventanas */}
      <rect x="12" y="45" width="20" height="22" rx="3" fill="#FEF08A" fillOpacity="0.7" stroke="#334155" strokeWidth="1" />
      <rect x="73" y="45" width="20" height="22" rx="3" fill="#FEF08A" fillOpacity="0.7" stroke="#334155" strokeWidth="1" />

      {/* Placa dirección */}
      <rect x="36" y="36" width="34" height="12" rx="2" fill="#0B192C" stroke="#38BDF8" strokeWidth="0.8" />
      <text x="53" y="44.5" fill="#38BDF8" fontSize="6.5" fontWeight="bold" textAnchor="middle">Tu Domicilio</text>
    </g>

    {/* Taxi Llegando a la Puerta */}
    <g transform="translate(170, 115)">
      {/* Sombra de auto */}
      <ellipse cx="75" cy="58" rx="65" ry="10" fill="#000000" fillOpacity="0.5" />

      {/* Chasis */}
      <path
        d="M10 32 L35 15 C45 8 60 8 100 8 L125 15 L145 32 L150 48 L0 48 L5 36 Z"
        fill="#F59E0B"
        stroke="#FEF08A"
        strokeWidth="1.2"
      />
      {/* Ventanas */}
      <path d="M38 17 L72 17 L72 32 L22 32 Z" fill="#0F172A" />
      <path d="M78 17 L116 17 L132 32 L78 32 Z" fill="#0F172A" />

      {/* Faro delantero con haz de luz */}
      <polygon points="148,36 210,18 220,55 148,46" fill="#FEF08A" fillOpacity="0.2" />

      {/* Ruedas */}
      <circle cx="35" cy="50" r="14" fill="#090E17" stroke="#94A3B8" strokeWidth="2.5" />
      <circle cx="118" cy="50" r="14" fill="#090E17" stroke="#94A3B8" strokeWidth="2.5" />
      <circle cx="35" cy="50" r="6" fill="#F59E0B" />
      <circle cx="118" cy="50" r="6" fill="#F59E0B" />

      {/* Letrero PACHA */}
      <rect x="65" y="0" width="30" height="9" rx="2" fill="#091526" stroke="#FEF08A" strokeWidth="0.8" />
      <text x="80" y="7" fill="#FEF08A" fontSize="6" fontWeight="900" textAnchor="middle">PACHA</text>
    </g>

    {/* Pin Flotante de GPS con Ondas */}
    <g
      className="cursor-pointer transition-transform hover:scale-110"
      transform="translate(98, 25)"
      onClick={() => onSelectHotspot && onSelectHotspot('gps')}
    >
      <circle cx="0" cy="0" r="16" fill="#F59E0B" fillOpacity="0.25" className="animate-ping" />
      <circle cx="0" cy="0" r="10" fill="#F59E0B" />
      <circle cx="0" cy="0" r="4" fill="#091526" />
      <rect x="-35" y="-30" width="70" height="18" rx="5" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
      <text x="0" y="-18" fill="#FDE047" fontSize="7.5" fontWeight="bold" textAnchor="middle">Ubicación Exacta</text>
    </g>

    {/* Tarjeta de soporte de referencia */}
    <g
      className="cursor-pointer"
      transform="translate(230, 20)"
      onClick={() => onSelectHotspot && onSelectHotspot('referencia')}
    >
      <rect
        x="0"
        y="0"
        width="150"
        height="40"
        rx="10"
        fill="#0F172A"
        stroke={activeHotspot === 'referencia' ? '#10B981' : '#334155'}
        strokeWidth={activeHotspot === 'referencia' ? 1.5 : 1}
      />
      <circle cx="18" cy="20" r="8" fill="#10B981" />
      <text x="32" y="18" fill="#34D399" fontSize="8" fontWeight="bold">Recogida Puerta a Puerta</text>
      <text x="32" y="29" fill="#94A3B8" fontSize="6.5">Sin caminar a terminales</text>
    </g>
  </svg>
);

// ==========================================================
// 4. ILUSTRACIÓN: BOLETO DIGITAL, QR Y ASIGNACIÓN DE CHOFER
// ==========================================================
export const TicketAndQRIllustration: React.FC<{ activeHotspot?: string; onSelectHotspot?: (id: string) => void }> = ({
  activeHotspot,
  onSelectHotspot
}) => (
  <svg viewBox="0 0 400 240" className="w-full h-auto max-h-56 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad4" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B192C" />
        <stop offset="1" stopColor="#071322" />
      </linearGradient>
      <linearGradient id="ticketGold" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#1E293B" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
    </defs>

    {/* Fondo base */}
    <rect width="400" height="240" rx="20" fill="url(#bgGrad4)" />

    {/* Tarjeta Boleto Digital Central */}
    <g transform="translate(60, 20)">
      {/* Cuerpo principal del boleto */}
      <rect
        x="0"
        y="0"
        width="280"
        height="195"
        rx="16"
        fill="url(#ticketGold)"
        stroke="#F59E0B"
        strokeWidth="1.8"
      />

      {/* Cabecera del boleto */}
      <rect x="0" y="0" width="280" height="42" rx="16" fill="#091526" />
      <rect x="0" y="32" width="280" height="10" fill="#091526" />
      <line x1="0" y1="42" x2="280" y2="42" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 4" />

      {/* Marca PACHA en el boleto */}
      <text x="18" y="26" fill="#F59E0B" fontSize="14" fontWeight="900" letterSpacing="2">PACHA</text>
      <rect x="95" y="14" width="70" height="16" rx="4" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="0.8" />
      <text x="130" y="25" fill="#34D399" fontSize="7.5" fontWeight="bold" textAnchor="middle">BOLETO CONFIRMADO</text>

      {/* Código de Viaje */}
      <text x="260" y="25" fill="#94A3B8" fontSize="8" fontFamily="monospace" textAnchor="end">#PCH-2026</text>

      {/* Detalles del Viaje */}
      <g transform="translate(18, 55)">
        <text x="0" y="12" fill="#64748B" fontSize="7" fontWeight="bold">RUTA OFICIAL</text>
        <text x="0" y="26" fill="#F8FAFC" fontSize="10" fontWeight="900">PORTOVIEJO ➔ PEDERNALES</text>

        <text x="0" y="44" fill="#64748B" fontSize="7" fontWeight="bold">CHOFER ASIGNADO</text>
        <text x="0" y="58" fill="#FDE047" fontSize="9" fontWeight="bold">Ing. Carlos Mendoza (Calificado ★ 4.9)</text>

        <text x="0" y="74" fill="#64748B" fontSize="7" fontWeight="bold">VEHÍCULO Y PLACA</text>
        <text x="0" y="88" fill="#38BDF8" fontSize="9" fontWeight="bold">Toyota Corolla Ejecutivo • M-045</text>

        <text x="0" y="104" fill="#64748B" fontSize="7" fontWeight="bold">FORMA DE PAGO</text>
        <text x="0" y="118" fill="#34D399" fontSize="8.5" fontWeight="bold">Efectivo al abordar ($12.00)</text>
      </g>

      {/* Código QR Interactivo a la derecha */}
      <g
        className="cursor-pointer transition-transform hover:scale-105"
        transform="translate(185, 55)"
        onClick={() => onSelectHotspot && onSelectHotspot('qr')}
      >
        <rect
          x="0"
          y="0"
          width="80"
          height="80"
          rx="10"
          fill="#091526"
          stroke={activeHotspot === 'qr' ? '#FDE047' : '#475569'}
          strokeWidth="1.5"
        />
        {/* Patrón simulado de QR */}
        <rect x="8" y="8" width="20" height="20" fill="#F59E0B" rx="3" />
        <rect x="13" y="13" width="10" height="10" fill="#091526" />
        <rect x="52" y="8" width="20" height="20" fill="#F59E0B" rx="3" />
        <rect x="57" y="13" width="10" height="10" fill="#091526" />
        <rect x="8" y="52" width="20" height="20" fill="#F59E0B" rx="3" />
        <rect x="13" y="57" width="10" height="10" fill="#091526" />
        {/* Puntos centrales */}
        <rect x="34" y="12" width="12" height="6" fill="#FEF08A" />
        <rect x="34" y="24" width="8" height="14" fill="#FEF08A" />
        <rect x="46" y="34" width="14" height="8" fill="#FEF08A" />
        <rect x="34" y="52" width="16" height="16" fill="#FEF08A" />
        <rect x="56" y="46" width="16" height="6" fill="#FEF08A" />
        <text x="40" y="93" fill="#94A3B8" fontSize="6.5" textAnchor="middle">Escanear para Subir</text>
      </g>

      {/* Botón WhatsApp de contacto directo */}
      <g
        className="cursor-pointer"
        transform="translate(18, 155)"
        onClick={() => onSelectHotspot && onSelectHotspot('chofer')}
      >
        <rect x="0" y="0" width="145" height="24" rx="6" fill="#10B981" />
        <circle cx="14" cy="12" r="6" fill="#064E3B" />
        <text x="25" y="16" fill="#FFFFFF" fontSize="8" fontWeight="bold">Llamar / WhatsApp al Chofer</text>
      </g>
    </g>
  </svg>
);

// ==========================================================
// 5. ILUSTRACIÓN: ENCOMIENDAS - CÓDIGO DE 4 DÍGITOS ANTI-FRAUDE
// ==========================================================
export const SecurityCodeIllustration: React.FC<{ activeHotspot?: string; onSelectHotspot?: (id: string) => void }> = ({
  activeHotspot,
  onSelectHotspot
}) => (
  <svg viewBox="0 0 400 240" className="w-full h-auto max-h-56 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad5" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B192C" />
        <stop offset="1" stopColor="#061224" />
      </linearGradient>
      <linearGradient id="boxGrad" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#D97706" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#10B981" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
    </defs>

    {/* Fondo base */}
    <rect width="400" height="240" rx="20" fill="url(#bgGrad5)" />

    {/* Caja de Encomienda Ilustrada con Cinta de Seguridad */}
    <g transform="translate(45, 65)">
      {/* Cara frontal */}
      <polygon points="35,45 130,45 110,135 15,135" fill="url(#boxGrad)" stroke="#F59E0B" strokeWidth="1.5" />
      {/* Cara lateral */}
      <polygon points="130,45 175,20 155,100 110,135" fill="#92400E" stroke="#F59E0B" strokeWidth="1.5" />
      {/* Tapa superior */}
      <polygon points="35,45 80,20 175,20 130,45" fill="#F59E0B" stroke="#FDE047" strokeWidth="1.5" />

      {/* Cinta de Seguridad PACHA */}
      <path d="M72 32 L55 135" stroke="#091526" strokeWidth="12" />
      <path d="M72 32 L55 135" stroke="#FDE047" strokeWidth="3" strokeDasharray="6 4" />

      {/* Sello Frágil / Prioridad */}
      <rect x="80" y="65" width="28" height="28" rx="4" fill="#DC2626" />
      <text x="94" y="77" fill="#FFFFFF" fontSize="6" fontWeight="900" textAnchor="middle">FRÁGIL</text>
      <text x="94" y="86" fill="#FEF08A" fontSize="5.5" fontWeight="bold" textAnchor="middle">PACHA</text>
    </g>

    {/* Candado / Caja Fuerte con Display Digital de 4 Dígitos */}
    <g
      className="cursor-pointer transition-transform hover:scale-105"
      transform="translate(205, 35)"
      onClick={() => onSelectHotspot && onSelectHotspot('codigo4')}
    >
      {/* Escudo de fondo */}
      <path
        d="M80 0 L150 25 L150 105 C150 145 80 180 80 180 C80 180 10 145 10 105 L10 25 Z"
        fill="#091526"
        stroke="#10B981"
        strokeWidth="2"
      />

      {/* Candado Dorado */}
      <path
        d="M60 55 L60 40 C60 28 100 28 100 40 L100 55"
        stroke="#F59E0B"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="45" y="55" width="70" height="48" rx="8" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />

      {/* Display LED de los 4 Dígitos Secretos */}
      <rect x="52" y="65" width="56" height="26" rx="4" fill="#000000" stroke="#34D399" strokeWidth="1" />
      <text
        x="80"
        y="83"
        fill="#34D399"
        fontSize="14"
        fontFamily="monospace"
        fontWeight="900"
        letterSpacing="4"
        textAnchor="middle"
      >
        4 8 2 9
      </text>

      {/* Texto de advertencia de seguridad */}
      <text x="80" y="125" fill="#F8FAFC" fontSize="7.5" fontWeight="bold" textAnchor="middle">
        CÓDIGO DE 4 DÍGITOS
      </text>
      <text x="80" y="137" fill="#94A3B8" fontSize="6" textAnchor="middle">
        Sin este código NO se entrega
      </text>
      <text x="80" y="148" fill="#FDE047" fontSize="6.5" fontWeight="bold" textAnchor="middle">
        ¡100% Blindado contra robos!
      </text>
    </g>

    {/* Tarjeta flotante interactiva: Notificación WhatsApp */}
    <g
      className="cursor-pointer"
      transform="translate(18, 15)"
      onClick={() => onSelectHotspot && onSelectHotspot('notificacion')}
    >
      <rect
        x="0"
        y="0"
        width="155"
        height="32"
        rx="8"
        fill="#0F172A"
        stroke={activeHotspot === 'notificacion' ? '#10B981' : '#334155'}
        strokeWidth={activeHotspot === 'notificacion' ? 1.5 : 1}
      />
      <circle cx="15" cy="16" r="6" fill="#10B981" />
      <text x="28" y="15" fill="#34D399" fontSize="7.5" fontWeight="bold">Aviso WhatsApp Inmediato</text>
      <text x="28" y="24" fill="#94A3B8" fontSize="6.5">Al remitente y al destinatario</text>
    </g>
  </svg>
);

// ==========================================================
// 6. ILUSTRACIÓN: ENTREGA EN MANO Y RECEPCIÓN
// ==========================================================
export const PackageDeliveryIllustration: React.FC<{ activeHotspot?: string; onSelectHotspot?: (id: string) => void }> = ({
  activeHotspot,
  onSelectHotspot
}) => (
  <svg viewBox="0 0 400 240" className="w-full h-auto max-h-56 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad6" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B192C" />
        <stop offset="1" stopColor="#071320" />
      </linearGradient>
    </defs>

    {/* Fondo base */}
    <rect width="400" height="240" rx="20" fill="url(#bgGrad6)" />

    {/* Pavimento y vereda */}
    <rect x="0" y="170" width="400" height="70" fill="#1E293B" />
    <line x1="0" y1="170" x2="400" y2="170" stroke="#475569" strokeWidth="2" />

    {/* Chofer PACHA (Uniforme / Chaleco azul con dorado) */}
    <g transform="translate(90, 80)">
      {/* Cabeza */}
      <circle cx="30" cy="15" r="12" fill="#F59E0B" />
      {/* Gorra PACHA */}
      <path d="M16 12 Q30 5 44 12 L50 15 L18 15 Z" fill="#091526" />
      <text x="30" y="13" fill="#FDE047" fontSize="4" fontWeight="bold" textAnchor="middle">PACHA</text>
      {/* Cuerpo */}
      <rect x="15" y="27" width="30" height="48" rx="6" fill="#0C203E" stroke="#F59E0B" strokeWidth="1" />
      {/* Brazos entregando paquete */}
      <path d="M45 40 L80 50" stroke="#0C203E" strokeWidth="10" strokeLinecap="round" />
      {/* Piernas */}
      <rect x="18" y="75" width="10" height="30" fill="#091526" />
      <rect x="32" y="75" width="10" height="30" fill="#091526" />
    </g>

    {/* Paquete entregado entre ambos */}
    <g transform="translate(165, 115)">
      <rect x="0" y="0" width="42" height="32" rx="4" fill="#D97706" stroke="#FDE047" strokeWidth="1.2" />
      <path d="M21 0 L21 32" stroke="#091526" strokeWidth="3" />
      <circle cx="21" cy="16" r="6" fill="#10B981" />
      <path d="M19 16 L21 18 L24 14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    {/* Cliente Destinatario recibiendo */}
    <g transform="translate(240, 80)">
      {/* Cabeza */}
      <circle cx="30" cy="15" r="12" fill="#E2E8F0" />
      {/* Cuerpo */}
      <rect x="15" y="27" width="30" height="48" rx="6" fill="#1E293B" stroke="#38BDF8" strokeWidth="1" />
      {/* Brazos recibiendo paquete */}
      <path d="M15 40 L-10 50" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
      {/* Piernas */}
      <rect x="18" y="75" width="10" height="30" fill="#091526" />
      <rect x="32" y="75" width="10" height="30" fill="#091526" />
      {/* Celular en la mano con el código ingresado */}
      <rect x="-16" y="22" width="16" height="24" rx="3" fill="#020617" stroke="#10B981" strokeWidth="1" />
      <text x="-8" y="34" fill="#34D399" fontSize="4.5" fontFamily="monospace" textAnchor="middle">✓ 4829</text>
    </g>

    {/* Tarjeta Superior: Confirmación de Entrega */}
    <g
      className="cursor-pointer"
      transform="translate(100, 20)"
      onClick={() => onSelectHotspot && onSelectHotspot('entregaok')}
    >
      <rect
        x="0"
        y="0"
        width="200"
        height="38"
        rx="10"
        fill="#0F172A"
        stroke="#10B981"
        strokeWidth="1.5"
      />
      <circle cx="20" cy="19" r="8" fill="#10B981" />
      <path d="M16 19 L19 22 L24 16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <text x="36" y="17" fill="#34D399" fontSize="8" fontWeight="900">ENTREGA VALIDADA CON ÉXITO</text>
      <text x="36" y="27" fill="#94A3B8" fontSize="6.5">Código verificado en el celular del chofer</text>
    </g>
  </svg>
);
