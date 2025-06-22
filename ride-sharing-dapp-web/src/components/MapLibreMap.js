import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import axios from "axios";
import "maplibre-gl/dist/maplibre-gl.css";
import { toast } from "react-toastify";

export default function MapLibreMap({
  pickupCoords,
  dropoffCoords,
  setDistanceKm,
  onMapClick,
  onPickupMapClick,
  mapSelectMode,
  mapInstanceRef,
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);
  const controllerRef = useRef(new AbortController());
  const driverMarkerRef = useRef(null);
  const routeCoordsRef = useRef([]);
  const animationFrameRef = useRef(null);

  const isValidCoordinate = (coord) => {
    return (
      Array.isArray(coord) &&
      coord.length === 2 &&
      !isNaN(coord[0]) &&
      !isNaN(coord[1]) &&
      coord[0] >= -180 &&
      coord[0] <= 180 &&
      coord[1] >= -90 &&
      coord[1] <= 90
    );
  };

  const createCarIconElement = () => {
    const el = document.createElement("div");
    el.className = "car-marker";
    el.style.width = "32px";
    el.style.height = "32px";
    el.style.backgroundImage = "url('/car-icon.jpg')";
    el.style.backgroundSize = "contain";
    el.style.backgroundRepeat = "no-repeat";
    return el;
  };

  const calculateBearing = (lng1, lat1, lng2, lat2) => {
    const deltaLng = lng2 - lng1;
    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  };

  const animateDriver = (coords) => {
    if (!coords || coords.length === 0) return;
    let index = 0;
    const speed = 0.0005; // smaller = slower, tune as needed

    function animateStep() {
      if (index >= coords.length) return;

      const [lng, lat] = coords[index];
      driverMarkerRef.current.setLngLat([lng, lat]);
      if (index > 0) {
        const [prevLng, prevLat] = coords[index - 1];
        const angle = calculateBearing(prevLng, prevLat, lng, lat);
        driverMarkerRef.current.setRotation(angle);
      }
      index++;

      if (index < coords.length) {
        animationFrameRef.current = requestAnimationFrame(animateStep);
      }
    }
    animateStep();
  };

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: `https://tiles.stadiamaps.com/styles/alidade_smooth.json`,
        center: [90.4125, 23.8103],
        zoom: 14,
      });

      map.addControl(new maplibregl.NavigationControl(), "top-right");
      mapRef.current = map;
      if (mapInstanceRef) mapInstanceRef.current = map;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const userCoords = [pos.coords.longitude, pos.coords.latitude];
          new maplibregl.Marker({ color: "blue" })
            .setLngLat(userCoords)
            .setPopup(new maplibregl.Popup().setText("You are here"))
            .addTo(map)
            .togglePopup();

          if (isValidCoordinate(userCoords)) {
            map.flyTo({
              center: userCoords,
              zoom: 15,
              speed: 1.2,
              curve: 1.42,
            });
            if (pickupCoords && isValidCoordinate(pickupCoords)) {
              animateDriver([userCoords, pickupCoords]);
            }
          }
        });
      }

      driverMarkerRef.current = new maplibregl.Marker({
        element: createCarIconElement(),
        rotationAlignment: "map",
      })
        .setLngLat([90.4125, 23.8103])
        .addTo(map);

      map.on("click", (e) => {
        if (e.defaultPrevented || e.originalEvent.defaultPrevented) return;
        if (e.features && e.features.length > 0) return;

        const coords = [e.lngLat.lng, e.lngLat.lat];

        if (onPickupMapClick && mapSelectMode === "pickup") {
          onPickupMapClick(coords);
        } else if (onMapClick && mapSelectMode === "dropoff") {
          onMapClick(coords);
        }

        if (isValidCoordinate(coords)) {
          map.flyTo({ center: coords, zoom: 15, speed: 1.2, curve: 1.42 });
        }
      });

      return () => {
        map.remove();
        mapRef.current = null;
        controllerRef.current.abort();
      };
    } catch (error) {
      console.error("Map initialization failed:", error);
      toast.error("Failed to initialize map");
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;

    if (
      !map ||
      !isValidCoordinate(pickupCoords) ||
      !isValidCoordinate(dropoffCoords)
    ) {
      return;
    }

    try {
      if (map.getLayer("route-line")) map.removeLayer("route-line");
      if (map.getSource("route")) map.removeSource("route");
    } catch (err) {
      console.warn("Route cleanup failed:", err);
    }

    if (markersRef.current.length === 0) {
      const pickupMarker = new maplibregl.Marker({ color: "green" })
        .setLngLat(pickupCoords)
        .setPopup(new maplibregl.Popup().setText("Pickup"))
        .addTo(map);

      const dropoffMarker = new maplibregl.Marker({ color: "red" })
        .setLngLat(dropoffCoords)
        .setPopup(new maplibregl.Popup().setText("Dropoff"))
        .addTo(map);

      markersRef.current = [pickupMarker, dropoffMarker];
    } else {
      markersRef.current[0].setLngLat(pickupCoords);
      markersRef.current[1].setLngLat(dropoffCoords);
    }

    const fetchRoute = async () => {
      if (!ORS_API_KEY) {
        console.warn("\uD83D\uDEA8 ORS API key is missing.");
        toast.error("Missing OpenRouteService API key.");
        return;
      }

      controllerRef.current.abort();
      controllerRef.current = new AbortController();

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
            signal: controllerRef.current.signal,
          }
        );

        const route = res.data;
        const routeCoords = route.features?.[0]?.geometry?.coordinates || [];

        if (routeCoords.length > 1) {
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
              "line-color": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10,
                "#0f62fe",
                16,
                "#0062ff",
              ],
              "line-width": 5,
              "line-opacity": 0.9,
            },
          });

          routeCoordsRef.current = routeCoords;
          animateDriver(routeCoords);

          map.fitBounds([pickupCoords, dropoffCoords], {
            padding: 60,
            maxZoom: 15,
          });
        } else {
          toast.error("Invalid route data received.");
          map.flyTo({ center: pickupCoords, zoom: 15 });
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("\u274C Route fetch failed:", err);
          toast.error("Route fetch failed. Check API key or coordinates.");
          map.flyTo({ center: pickupCoords, zoom: 15 });
        }
      }
    };

    fetchRoute();

    return () => {
      controllerRef.current.abort();
    };
  }, [pickupCoords, dropoffCoords, setDistanceKm]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (driverMarkerRef.current) driverMarkerRef.current.remove();
    };
  }, []);

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
