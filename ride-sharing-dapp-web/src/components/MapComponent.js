// MapComponent.js
import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";

const MapComponent = ({ pickupCoords, dropoffCoords, setDistanceKm }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current) return;

    const maptilerKey = process.env.REACT_APP_MAPTILER_KEY;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`,
      center: [90.4125, 23.8103],
      zoom: 13,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          if (!mapRef.current) return;
          mapRef.current.setCenter(coords);
          new maplibregl.Marker({ color: "blue" })
            .setLngLat(coords)
            .setPopup(new maplibregl.Popup().setText("You are here"))
            .addTo(mapRef.current);
        },
        (err) => {
          console.warn("Geolocation error:", err);
        }
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Draw route and markers when pickup/dropoff change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pickupCoords || !dropoffCoords) return;

    const drawRoute = () => {
      // Clear previous route
      if (map.getLayer("route-line")) map.removeLayer("route-line");
      if (map.getSource("route")) map.removeSource("route");

      // Clear previous markers
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.remove();
        pickupMarkerRef.current = null;
      }
      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.remove();
        dropoffMarkerRef.current = null;
      }

      // Add new markers (MapLibre uses [lng, lat] directly)
      pickupMarkerRef.current = new maplibregl.Marker({ color: "#2E86DE" })
        .setLngLat(pickupCoords)
        .setPopup(new maplibregl.Popup().setText("Pickup"))
        .addTo(map);

      dropoffMarkerRef.current = new maplibregl.Marker({ color: "#28B463" })
        .setLngLat(dropoffCoords)
        .setPopup(new maplibregl.Popup().setText("Dropoff"))
        .addTo(map);

      // Fetch and draw route via OpenRouteService
      const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;

      axios
        .post(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          { coordinates: [pickupCoords, dropoffCoords] },
          {
            headers: {
              Authorization: ORS_API_KEY,
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          const feature = res.data.features?.[0];
          if (!feature) return;

          const geom = feature.geometry;
          const distMeters = feature.properties?.summary?.distance;

          if (
            typeof distMeters === "number" &&
            Number.isFinite(distMeters) &&
            setDistanceKm
          ) {
            const distKm = distMeters / 1000;
            setDistanceKm(Number(distKm.toFixed(2)));
          }

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

          // Fit bounds to route
          const allCoords = geom.coordinates;
          if (Array.isArray(allCoords) && allCoords.length > 1) {
            const bounds = allCoords.reduce(
              (b, coord) => b.extend(coord),
              new maplibregl.LngLatBounds(allCoords[0], allCoords[0])
            );
            map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
          }
        })
        .catch((err) => console.error("Route error", err));
    };

    if (map.isStyleLoaded()) {
      drawRoute();
    } else {
      map.once("load", drawRoute);
    }
  }, [pickupCoords, dropoffCoords, setDistanceKm]);

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
