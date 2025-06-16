import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Button,
  Switch,
} from "@mui/material";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const center = { lat: 23.8103, lng: 90.4125 };
const pickup = center;
const dropoff = { lat: 23.8303, lng: 90.4325 };

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [rideData, setRideData] = useState(null);
  const [rideStatus, setRideStatus] = useState("idle"); // idle, accepted, arrived, in_progress, completed

  useEffect(() => {
    if (isOnline) {
      const history = JSON.parse(localStorage.getItem("rideHistory")) || [];
      if (history.length > 0) {
        setTimeout(() => {
          setRideData(history[0]);
          localStorage.setItem("rideStatus", "accepted");
          setRideStatus("accepted");
        }, 2000);
      }
    } else {
      setRideData(null);
      setRideStatus("idle");
      localStorage.setItem("rideStatus", "idle");
    }
  }, [isOnline]);

  const updateStatus = (newStatus) => {
    setRideStatus(newStatus);
    localStorage.setItem("rideStatus", newStatus);
  };

  const renderActionButton = () => {
    switch (rideStatus) {
      case "accepted":
        return <Button onClick={() => updateStatus("arrived")}>Arrived</Button>;
      case "arrived":
        return (
          <Button onClick={() => updateStatus("in_progress")}>
            Start Ride
          </Button>
        );
      case "in_progress":
        return (
          <Button onClick={() => updateStatus("completed")}>End Ride</Button>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Driver Dashboard
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Typography variant="h6">
          Status: {isOnline ? "Online" : "Offline"}
        </Typography>
        <Switch checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
      </Box>

      {rideData && rideStatus !== "idle" && rideStatus !== "completed" && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">
              Ride Status: {rideStatus.replace("_", " ")}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>
              <strong>Pickup:</strong> {rideData.pickup}
            </Typography>
            <Typography>
              <strong>Dropoff:</strong> {rideData.dropoff}
            </Typography>
            <Typography>
              <strong>Fare:</strong> ${rideData.fare}
            </Typography>
            <Box mt={2}>{renderActionButton()}</Box>
          </CardContent>
        </Card>
      )}

      {rideStatus !== "idle" && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Ride Map
            </Typography>
            <Box sx={{ height: "400px" }}>
              <MapContainer
                center={pickup}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={pickup} icon={markerIcon}>
                  <Popup>Pickup Point</Popup>
                </Marker>
                <Marker position={dropoff} icon={markerIcon}>
                  <Popup>Dropoff Point</Popup>
                </Marker>
                <Polyline positions={[pickup, dropoff]} color="blue" />
              </MapContainer>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
