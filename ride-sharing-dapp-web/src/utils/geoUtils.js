// src/utils/geoUtils.js
export async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  );
  const data = await res.json();
  return data.display_name || `${lat}, ${lng}`;
}
