import "leaflet-routing-machine";
import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

const Routing = ({ pickupCoords, dropoffCoords, setDistanceKm }) => {
  const map = useMap();

  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) return;

    const control = L.Routing.control({
      waypoints: [L.latLng(pickupCoords), L.latLng(dropoffCoords)],
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
    })
      .on("routesfound", (e) => {
        const distance = e.routes[0].summary.totalDistance / 1000;
        setDistanceKm(distance);
      })
      .addTo(map);

    return () => map.removeControl(control);
  }, [pickupCoords, dropoffCoords, map, setDistanceKm]);

  return null;
};

export default Routing;
