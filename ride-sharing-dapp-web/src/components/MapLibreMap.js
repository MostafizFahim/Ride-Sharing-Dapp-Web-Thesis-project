import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import axios from "axios";
import "maplibre-gl/dist/maplibre-gl.css";
import { toast } from "react-toastify";

export default function MapLibreMap({
  pickupCoords,
  dropoffCoords,
  setDistanceKm,
  mapInstanceRef,
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);
  const controllerRef = useRef(new AbortController());
  const lastRouteKeyRef = useRef(null); // prevent spamming ORS

  const isValidCoordinate = (coord) => {
    return (
      Array.isArray(coord) &&
      coord.length === 2 &&
      !Number.isNaN(coord[0]) &&
      !Number.isNaN(coord[1]) &&
      coord[0] >= -180 &&
      coord[0] <= 180 &&
      coord[1] >= -90 &&
      coord[1] <= 90
    );
  };

  // Simple haversine distance (km) as fallback
  const haversineKm = ([lng1, lat1], [lng2, lat2]) => {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ----- INITIALIZE MAP -----
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    try {
      const maptilerKey = process.env.REACT_APP_MAPTILER_KEY;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`,
        center: [90.4125, 23.8103],
        zoom: 13,
      });

      map.addControl(new maplibregl.NavigationControl(), "top-right");
      mapRef.current = map;
      if (mapInstanceRef) mapInstanceRef.current = map;

      // Optional: center on user location once
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userCoords = [pos.coords.longitude, pos.coords.latitude];
            if (!isValidCoordinate(userCoords)) return;

            const currentMap = mapRef.current;
            if (!currentMap) return;

            new maplibregl.Marker({ color: "blue" })
              .setLngLat(userCoords)
              .setPopup(new maplibregl.Popup().setText("You are here"))
              .addTo(currentMap);

            currentMap.flyTo({
              center: userCoords,
              zoom: 15,
              speed: 1.2,
              curve: 1.42,
            });
          },
          () => {
            // ignore geolocation error
          }
        );
      }

      return () => {
        controllerRef.current.abort();
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null; // IMPORTANT: clear ref so inner functions can detect unmount
        }
      };
    } catch (error) {
      console.error("Map initialization failed:", error);
      toast.error("Failed to initialize map");
    }
  }, [mapInstanceRef]);

  // ----- DRAW / UPDATE ROUTE WHEN pickup/dropoff CHANGE -----
  useEffect(() => {
    const updateRoute = () => {
      const map = mapRef.current;
      const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;

      // map may already be removed when switching role
      if (!map) return;

      // If coords are invalid/cleared, remove route + markers + distance
      if (
        !isValidCoordinate(pickupCoords) ||
        !isValidCoordinate(dropoffCoords)
      ) {
        try {
          if (map.getLayer("route-line")) map.removeLayer("route-line");
          if (map.getSource("route")) map.removeSource("route");
        } catch {
          // ignore
        }
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        if (typeof setDistanceKm === "function") setDistanceKm(null);
        lastRouteKeyRef.current = null;
        return;
      }

      // Avoid hammering ORS for the same route
      const routeKey = `${pickupCoords.join(",")}_${dropoffCoords.join(",")}`;
      if (lastRouteKeyRef.current === routeKey) {
        // same route; don't refetch
      } else {
        lastRouteKeyRef.current = routeKey;
      }

      // Cleanup previous route (safe)
      if (map.isStyleLoaded()) {
        try {
          if (map.getLayer("route-line")) map.removeLayer("route-line");
          if (map.getSource("route")) map.removeSource("route");
        } catch {
          // ignore
        }
      }

      // Pickup & dropoff markers
      if (markersRef.current.length === 0) {
        const safeMap = mapRef.current;
        if (!safeMap) return;

        const pickupMarker = new maplibregl.Marker({ color: "green" })
          .setLngLat(pickupCoords)
          .setPopup(new maplibregl.Popup().setText("Pickup"))
          .addTo(safeMap);

        const dropoffMarker = new maplibregl.Marker({ color: "red" })
          .setLngLat(dropoffCoords)
          .setPopup(new maplibregl.Popup().setText("Dropoff"))
          .addTo(safeMap);

        markersRef.current = [pickupMarker, dropoffMarker];
      } else {
        markersRef.current[0].setLngLat(pickupCoords);
        markersRef.current[1].setLngLat(dropoffCoords);
      }

      // Helper to fit map bounds
      const fitOnBothPoints = () => {
        const safeMap = mapRef.current;
        if (!safeMap) return;

        try {
          const bounds = new maplibregl.LngLatBounds(
            pickupCoords,
            pickupCoords
          );
          bounds.extend(dropoffCoords);
          safeMap.fitBounds(bounds, {
            padding: 60,
            maxZoom: 15,
          });
        } catch {
          safeMap.flyTo({ center: pickupCoords, zoom: 14 });
        }
      };

      // Fallback: simple straight line
      const drawSimpleRoute = () => {
        const safeMap = mapRef.current;
        if (!safeMap) return; // 🔐 guard: map might be removed while switching

        const routeGeojson = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [pickupCoords, dropoffCoords],
          },
        };

        const existingSource = safeMap.getSource("route");
        if (existingSource) {
          existingSource.setData(routeGeojson);
        } else {
          safeMap.addSource("route", {
            type: "geojson",
            data: routeGeojson,
          });
        }

        if (!safeMap.getLayer("route-line")) {
          safeMap.addLayer({
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
        }

        if (typeof setDistanceKm === "function") {
          const distance = haversineKm(pickupCoords, dropoffCoords);
          setDistanceKm(parseFloat(distance.toFixed(2)));
        }

        fitOnBothPoints();
      };

      const fetchRoute = async () => {
        // if map was removed (role switch) while waiting, bail
        if (!mapRef.current) {
          return;
        }

        if (!ORS_API_KEY) {
          console.warn("OpenRouteService API key missing. Using fallback.");
          drawSimpleRoute();
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

          // map may have been removed after the request finished
          const safeMap = mapRef.current;
          if (!safeMap) {
            return;
          }

          const route = res.data;
          const feature = route.features?.[0];
          const routeCoords = feature?.geometry?.coordinates || [];

          if (routeCoords.length > 1 && feature.properties?.summary) {
            const distanceMeters = feature.properties.summary.distance;
            const distanceKm = distanceMeters / 1000;
            if (typeof setDistanceKm === "function") {
              setDistanceKm(parseFloat(distanceKm.toFixed(2)));
            }

            const existingSource = safeMap.getSource("route");
            if (existingSource) {
              existingSource.setData(route);
            } else {
              safeMap.addSource("route", {
                type: "geojson",
                data: route,
              });
            }

            if (!safeMap.getLayer("route-line")) {
              safeMap.addLayer({
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
            }

            fitOnBothPoints();
          } else {
            console.warn("Invalid ORS route data. Using fallback.");
            drawSimpleRoute();
          }
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error("Route fetch failed, using fallback:", err);
            // toast.error("Route fetch failed. Using approximate route.");
            drawSimpleRoute();
          }
        }
      };

      // ensure style is loaded
      if (!map.isStyleLoaded()) {
        // if the map is destroyed before 'load', this handler will still run,
        // so we check mapRef.current again inside fetchRoute/drawSimpleRoute.
        map.once("load", () => {
          fetchRoute();
        });
      } else {
        fetchRoute();
      }
    };

    updateRoute();

    return () => {
      controllerRef.current.abort();
    };
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
