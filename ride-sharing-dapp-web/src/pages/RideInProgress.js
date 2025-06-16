import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const center = { lat: 23.8103, lng: 90.4125 };
const dropoff = { lat: 23.8303, lng: 90.4325 };

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function RideInProgress() {
  const [rideStatus, setRideStatus] = useState("searching");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const status = localStorage.getItem("rideStatus");
      if (status) setRideStatus(status);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = () => {
    localStorage.setItem("rideStatus", "idle");
    navigate("/passenger");
  };

  const getStatusMessage = () => {
    switch (rideStatus) {
      case "searching":
        return "Searching for drivers...";
      case "accepted":
        return "✅ Driver found! On the way.";
      case "arrived":
        return "🚗 Driver has arrived at your location.";
      case "in_progress":
        return "🛣️ Your ride is in progress.";
      case "completed":
        return "🎉 You've arrived at your destination!";
      default:
        return "Waiting for a ride to start...";
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardHeader
          title="Ride In Progress"
          titleTypographyProps={{ variant: "h5", fontWeight: "bold" }}
          sx={{ textAlign: "center", pb: 0 }}
        />
        <CardContent>
          <Box
            sx={{ height: "400px", borderRadius: 2, overflow: "hidden", mb: 3 }}
          >
            <MapContainer
              center={center}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={center} icon={markerIcon}>
                <Popup>Your Location</Popup>
              </Marker>
              <Marker position={dropoff} icon={markerIcon}>
                <Popup>Dropoff</Popup>
              </Marker>
            </MapContainer>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            {rideStatus === "searching" ? (
              <>
                <CircularProgress size={40} />
                <Typography variant="h6" mt={2}>
                  Finding a driver near you...
                </Typography>
              </>
            ) : (
              <Typography variant="h6" mt={1}>
                {getStatusMessage()}
              </Typography>
            )}

            {rideStatus !== "completed" && (
              <Button
                onClick={handleCancel}
                variant="outlined"
                color="error"
                sx={{ mt: 3 }}
              >
                Cancel Ride
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
