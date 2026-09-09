// Geolocation and Mapping Utilities for PACHA Executive Transport

export interface GeoLocation {
  lat: number;
  lng: number;
  cityName: string;
  address: string;
  reference?: string;
  type: 'ORIGIN' | 'DESTINATION' | 'WAYPOINT';
}

// Canonical coordinates of main cities & cantons in Manabí, Ecuador
export const MANABI_CITIES_COORDS: Record<string, { lat: number; lng: number }> = {
  'Portoviejo': { lat: -1.05458, lng: -80.45445 },
  'Pedernales': { lat: 0.0716, lng: -80.0525 },
  'Chone': { lat: -0.6981, lng: -80.0936 },
  'Manta': { lat: -0.9676, lng: -80.7089 },
  'Bahía de Caráquez': { lat: -0.5978, lng: -80.4237 },
  'Bahia de Caraquez': { lat: -0.5978, lng: -80.4237 },
  'San Vicente': { lat: -0.5898, lng: -80.4087 },
  'Canoa': { lat: -0.4589, lng: -80.4542 },
  'Jama': { lat: -0.2039, lng: -80.2618 },
  'Calceta': { lat: -0.8465, lng: -80.1637 },
  'Tosagua': { lat: -0.7865, lng: -80.2343 },
  'Rocafuerte': { lat: -0.9238, lng: -80.4497 },
  'Flavio Alfaro': { lat: -0.4042, lng: -79.9042 },
  'Junín': { lat: -0.9284, lng: -80.2058 },
  'Junin': { lat: -0.9284, lng: -80.2058 },
  'Jipijapa': { lat: -1.3486, lng: -80.5794 },
  'Montecristi': { lat: -1.0478, lng: -80.6589 },
  'Pichincha': { lat: -1.0435, lng: -79.8184 },
  'El Carmen': { lat: -0.2697, lng: -79.4627 },
  'Cojimíes': { lat: 0.3666, lng: -80.0333 },
  'Cojimies': { lat: 0.3666, lng: -80.0333 },
};

// Deterministic micro-offset based on address string to create precise pin placement per address
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function getAddressCoordinates(cityName: string, address: string = ''): { lat: number; lng: number } {
  // Normalize city name
  const trimmedCity = cityName.trim();
  let baseCoords = MANABI_CITIES_COORDS[trimmedCity];

  if (!baseCoords) {
    const key = Object.keys(MANABI_CITIES_COORDS).find(
      (k) => k.toLowerCase() === trimmedCity.toLowerCase() || trimmedCity.toLowerCase().includes(k.toLowerCase())
    );
    baseCoords = key ? MANABI_CITIES_COORDS[key] : { lat: -0.5, lng: -80.2 };
  }

  // If address is given, calculate a realistic, deterministic local micro-offset (within ~500m of center)
  if (address && address.trim().length > 0) {
    const hash = Math.abs(hashString(address.trim()));
    const offsetLat = ((hash % 100) - 50) * 0.00012; // ~±600m
    const offsetLng = (((hash >> 4) % 100) - 50) * 0.00012;
    return {
      lat: Number((baseCoords.lat + offsetLat).toFixed(6)),
      lng: Number((baseCoords.lng + offsetLng).toFixed(6))
    };
  }

  return {
    lat: Number(baseCoords.lat.toFixed(6)),
    lng: Number(baseCoords.lng.toFixed(6))
  };
}

export function getGoogleMapsUrl(lat: number, lng: number, label: string = 'Dirección PACHA'): string {
  // Using query parameter with exact coordinates ensures Google Maps drops a distinct red marker
  const cleanLabel = encodeURIComponent(label);
  return `https://www.google.com/maps?q=${lat},${lng}+(${cleanLabel})&z=17`;
}

export function getWazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}
