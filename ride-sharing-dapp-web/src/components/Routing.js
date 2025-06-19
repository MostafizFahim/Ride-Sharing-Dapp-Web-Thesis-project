import "leaflet-routing-machine";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const Routing = ({ pickupCoords, dropoffCoords, setDistanceKm }) => {
  const map = useMap();
  const routingLayerRef = useRef(null);

  useEffect(() => {
    if (!pickupCoords || !dropoffCoords || !map) return;

    // Remove existing route if present
    if (routingLayerRef.current) {
      map.removeLayer(routingLayerRef.current);
      routingLayerRef.current = null;
    }

    const router = L.Routing.osrmv1({
      serviceUrl: "https://router.project-osrm.org/route/v1",
    });

    const plan = L.Routing.plan(
      [L.latLng(pickupCoords), L.latLng(dropoffCoords)],
      {
        createMarker: () => null,
      }
    );

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
      const distance = e.routes[0].summary.totalDistance / 1000;
      setDistanceKm(distance);
    });

    return () => {
      if (routingLayerRef.current && map.hasLayer(routingLayerRef.current)) {
        try {
          map.removeLayer(routingLayerRef.current);
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
