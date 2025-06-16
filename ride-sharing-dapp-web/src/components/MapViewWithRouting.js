import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import Routing from "./Routing";

const MapViewWithRouting = ({
  pickupCoords,
  dropoffCoords,
  setDistanceKm,
  mapRef,
}) => {
  return (
    <MapContainer
      center={[23.8103, 90.4125]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100%" }}
      ref={mapRef}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pickupCoords && <Marker position={pickupCoords} />}
      {dropoffCoords && <Marker position={dropoffCoords} />}
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
