import React from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

const center = {
  lat: 23.8103, // Dhaka as example
  lng: 90.4125,
};

function MapComponent() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your key!
  });

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      zoom={14}
      center={center}
      mapContainerStyle={{
        width: "100%",
        height: "400px",
        marginBottom: "20px",
      }}
    >
      <Marker position={center} />
    </GoogleMap>
  );
}

export default MapComponent;
