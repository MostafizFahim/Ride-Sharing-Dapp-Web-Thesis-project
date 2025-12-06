// MapViewWithRouting.js
import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import Routing from "./Routing";

const MapViewWithRouting = ({
  pickupCoords,
  dropoffCoords,
  setDistanceKm,
  mapRef,
}) => {
  const dhakaCenter = [23.8103, 90.4125];

  // your coords are [lng, lat] → Leaflet wants [lat, lng]
  const pickupLatLng = pickupCoords && [pickupCoords[1], pickupCoords[0]];
  const dropoffLatLng = dropoffCoords && [dropoffCoords[1], dropoffCoords[0]];

  return (
    <MapContainer
      center={dhakaCenter}
      zoom={13}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100%" }}
      whenCreated={(map) => {
        if (mapRef) {
          mapRef.current = map;
        }
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {pickupLatLng && <Marker position={pickupLatLng} />}
      {dropoffLatLng && <Marker position={dropoffLatLng} />}

      {pickupCoords && dropoffCoords && (
        <Routing
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          setDistanceKm={setDistanceKm}
        />
      )}
    </MapContainer>
  );
};

export default MapViewWithRouting;
