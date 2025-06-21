import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";

const MapComponent = ({ pickupCoords, dropoffCoords, setDistanceKm }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.REACT_APP_MAPTILER_KEY}`,
      center: [90.4125, 23.8103],
      zoom: 13,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        mapRef.current.setCenter(coords);
        new maplibregl.Marker({ color: "blue" })
          .setLngLat(coords)
          .setPopup(new maplibregl.Popup().setText("You are here"))
          .addTo(mapRef.current);
      });
    }

    return () => mapRef.current.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !(pickupCoords && dropoffCoords)) return;

    // clear route source/layer
    if (map.getLayer("route-line")) map.removeLayer("route-line");
    if (map.getSource("route")) map.removeSource("route");

    // add markers
    new maplibregl.Marker({ color: "#2E86DE" })
      .setLngLat(pickupCoords)
      .setPopup(new maplibregl.Popup().setText("Pickup"))
      .addTo(map);
    new maplibregl.Marker({ color: "#28B463" })
      .setLngLat(dropoffCoords)
      .setPopup(new maplibregl.Popup().setText("Dropoff"))
      .addTo(map);

    // fetch and draw route
    axios
      .post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        { coordinates: [pickupCoords, dropoffCoords] },
        {
          headers: {
            Authorization: process.env.REACT_APP_ORS_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        const geom = res.data.features[0].geometry;
        const dist = res.data.features[0].properties.summary.distance / 1000;
        setDistanceKm(dist.toFixed(2));

        map.addSource("route", {
          type: "geojson",
          data: { type: "Feature", geometry: geom },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#3a7bd5", "line-width": 5 },
        });
      })
      .catch((err) => console.error("Route error", err));
  }, [pickupCoords, dropoffCoords]);

  return (
    <div
      ref={mapContainer}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
      }}
    />
  );
};

export default MapComponent;
