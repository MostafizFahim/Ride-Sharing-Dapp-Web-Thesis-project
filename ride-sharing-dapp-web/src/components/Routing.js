// Routing.js
import "leaflet-routing-machine";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const Routing = ({ pickupCoords, dropoffCoords, setDistanceKm }) => {
  const map = useMap();
  const routingLayerRef = useRef(null);

  useEffect(() => {
    if (!pickupCoords || !dropoffCoords || !map) return;

    // Remove existing route/control if present
    if (routingLayerRef.current) {
      try {
        map.removeControl(routingLayerRef.current);
      } catch (e) {
        console.warn("Failed to remove existing routing control:", e);
      }
      routingLayerRef.current = null;
    }

    // NOTE: your coords are [lng, lat] → Leaflet needs (lat, lng)
    const from = L.latLng(pickupCoords[1], pickupCoords[0]);
    const to = L.latLng(dropoffCoords[1], dropoffCoords[0]);

    const router = L.Routing.osrmv1({
      serviceUrl: "https://router.project-osrm.org/route/v1",
    });

    const plan = L.Routing.plan([from, to], {
      createMarker: () => null,
    });

    const control = L.Routing.control({
      plan,
      router,
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [{ color: "blue", opacity: 0.7, weight: 5 }],
      },
    }).addTo(map);

    routingLayerRef.current = control;

    control.on("routesfound", (e) => {
      const distanceKm = e.routes[0].summary.totalDistance / 1000;
      if (setDistanceKm) {
        setDistanceKm(Number(distanceKm.toFixed(2)));
      }
    });

    return () => {
      if (routingLayerRef.current) {
        try {
          map.removeControl(routingLayerRef.current);
        } catch (e) {
          console.warn("Safe cleanup failed:", e);
        }
        routingLayerRef.current = null;
      }
    };
  }, [pickupCoords, dropoffCoords, map, setDistanceKm]);

  return null;
};

export default Routing;
