interface Location {
  id: string;
  lat: number;
  lng: number;
  name: string;
  address: string;
}

interface LatLng {
  lat: number;
  lng: number;
}

// Haversine distance in km (fallback when Google API unavailable)
function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// Nearest-neighbor heuristic
export function optimizeRoute(
  locations: Location[],
  homeBase: LatLng
): Location[] {
  if (locations.length <= 1) return locations;

  const remaining = [...locations];
  const ordered: Location[] = [];
  let current: LatLng = homeBase;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineDistance(current, {
        lat: remaining[i].lat,
        lng: remaining[i].lng,
      });
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const nearest = remaining.splice(nearestIdx, 1)[0];
    ordered.push(nearest);
    current = { lat: nearest.lat, lng: nearest.lng };
  }

  return ordered;
}
