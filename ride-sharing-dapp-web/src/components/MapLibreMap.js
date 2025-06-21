import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import axios from "axios";
import "maplibre-gl/dist/maplibre-gl.css";
import { toast } from "react-toastify";

export default function MapLibreMap({
  pickupCoords,
  dropoffCoords,
  setDistanceKm,
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://tiles.stadiamaps.com/styles/alidade_smooth.json`,
      center: [90.4125, 23.8103],
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    // Center on user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const userCoords = [pos.coords.longitude, pos.coords.latitude];
        new maplibregl.Marker({ color: "blue" })
          .setLngLat(userCoords)
          .setPopup(new maplibregl.Popup().setText("You are here"))
          .addTo(map)
          .togglePopup();
        map.flyTo({ center: userCoords, zoom: 15 });
      });
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;

    if (!map || !pickupCoords || !dropoffCoords) return;

    if (
      !Array.isArray(pickupCoords) ||
      !Array.isArray(dropoffCoords) ||
      pickupCoords.length !== 2 ||
      dropoffCoords.length !== 2 ||
      isNaN(pickupCoords[0]) ||
      isNaN(pickupCoords[1]) ||
      isNaN(dropoffCoords[0]) ||
      isNaN(dropoffCoords[1])
    ) {
      console.error("❌ Invalid coordinates:", pickupCoords, dropoffCoords);
      return;
    }

    // Clean up previous layers and markers
    try {
      if (map.getLayer("route-line")) map.removeLayer("route-line");
      if (map.getSource("route")) map.removeSource("route");
    } catch (err) {
      console.warn("Route cleanup failed:", err);
    }

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const pickupMarker = new maplibregl.Marker({ color: "green" })
      .setLngLat(pickupCoords)
      .setPopup(new maplibregl.Popup().setText("Pickup"))
      .addTo(map);

    const dropoffMarker = new maplibregl.Marker({ color: "red" })
      .setLngLat(dropoffCoords)
      .setPopup(new maplibregl.Popup().setText("Dropoff"))
      .addTo(map);

    markersRef.current.push(pickupMarker, dropoffMarker);

    if (
      pickupCoords[0] === dropoffCoords[0] &&
      pickupCoords[1] === dropoffCoords[1]
    ) {
      map.flyTo({ center: pickupCoords, zoom: 15 });
    } else {
      map.fitBounds([pickupCoords, dropoffCoords], { padding: 60 });
    }

    const fetchRoute = async () => {
      if (!ORS_API_KEY) {
        console.warn("🚨 ORS API key is missing.");
        toast.error("Missing OpenRouteService API key.");
        return;
      }

      try {
        const res = await axios.post(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          {
            coordinates: [pickupCoords, dropoffCoords],
          },
          {
            headers: {
              Authorization: ORS_API_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        const route = res.data;
        const distanceMeters = route.features[0].properties.summary.distance;
        const distanceKm = (distanceMeters / 1000).toFixed(2);
        setDistanceKm(parseFloat(distanceKm));

        map.addSource("route", {
          type: "geojson",
          data: route,
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#0f62fe",
            "line-width": 5,
            "line-opacity": 0.9,
          },
        });
      } catch (err) {
        console.error("❌ Route fetch failed:", err);
        toast.error("Route fetch failed. Check API key or coordinates.");
      }
    };

    fetchRoute();
  }, [pickupCoords, dropoffCoords, setDistanceKm]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        flexGrow: 1,
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
      }}
    />
  );
}
