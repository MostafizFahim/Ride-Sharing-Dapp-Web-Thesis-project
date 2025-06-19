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
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Modal,
  Rating,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  DirectionsCar,
  Person,
  Star,
  Payment,
  Place,
  Schedule,
} from "@mui/icons-material";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4474/4474284.png",
  iconSize: [40, 40],
});

export default function RideInProgress() {
  const [rideStatus, setRideStatus] = useState("searching");
  const [rideData, setRideData] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState("--");
  const [showNoDriver, setShowNoDriver] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  const navigate = useNavigate();

  // Load initial ride data
  useEffect(() => {
    const savedRide = JSON.parse(localStorage.getItem("currentRide")) || {};
    setRideData(savedRide);
  }, []);

  // Simulate ride progress and listen for status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedRide = JSON.parse(localStorage.getItem("currentRide"));
      const updatedStatus = localStorage.getItem("rideStatus");

      // Detect if driver rejected, canceled, or ride is gone
      if (
        !updatedRide ||
        updatedStatus === "available" ||
        updatedStatus === "idle"
      ) {
        setShowNoDriver(true);
        setRideStatus("idle");
        setRideData(null);
        setTimeout(() => {
          navigate("/passenger");
        }, 3000);
        clearInterval(interval);
        return;
      }

      setRideData(updatedRide);
      setRideStatus(updatedStatus || "searching");

      if (updatedRide.driverLocation) {
        setDriverLocation(updatedRide.driverLocation);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Calculate ETA
  const calculateETA = () => {
    if (!driverLocation || !rideData || !rideData.dropoffLocation) return "--";
    const distance = Math.sqrt(
      Math.pow(rideData.dropoffLocation.lat - driverLocation.lat, 2) +
        Math.pow(rideData.dropoffLocation.lng - driverLocation.lng, 2)
    );
    return `${Math.max(1, Math.round(distance * 1000))} mins`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEta(calculateETA());
    }, 5000);
    return () => clearInterval(interval);
  }, [driverLocation, rideStatus]);

  const handleCancel = () => {
    setRideData(null);
    setRideStatus("idle");
    localStorage.removeItem("currentRide");
    localStorage.setItem("rideStatus", "idle");
    navigate("/passenger");
  };

  const handlePayment = () => {
    setShowRating(true);
  };

  // Handle submitting rating
  const handleSubmitRating = () => {
    setShowRating(false);
    // Optionally save to backend or localStorage, then go back home
    setTimeout(() => {
      navigate("/passenger");
    }, 1000);
  };

  // Show searching or no driver UI if needed
  if (showNoDriver) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, textAlign: "center" }}>
        <Chip
          label="No driver accepted the ride"
          color="error"
          sx={{ mb: 2 }}
        />
        <Typography variant="h5" gutterBottom>
          Sorry, your ride was not accepted.
        </Typography>
        <Typography>
          Searching for another driver or please try again later...
        </Typography>
        <CircularProgress sx={{ mt: 3 }} />
      </Container>
    );
  }

  if (!rideData || !rideData.pickupLocation || !rideData.dropoffLocation) {
    return (
      <Container maxWidth="md" sx={{ mt: 5, textAlign: "center" }}>
        <CircularProgress />
        <Typography>Loading ride details...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 5 }}>
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                {rideStatus === "completed"
                  ? "Ride Completed"
                  : "Ride In Progress"}
              </Typography>
              <Chip
                label={rideStatus.replace("_", " ")}
                color={
                  rideStatus === "completed"
                    ? "success"
                    : rideStatus === "searching"
                    ? "default"
                    : "primary"
                }
              />
            </Box>
          }
          sx={{ pb: 0 }}
        />

        <CardContent>
          {/* Map Section */}
          <Box
            sx={{ height: "300px", borderRadius: 2, overflow: "hidden", mb: 3 }}
          >
            <MapContainer
              center={rideData.pickupLocation}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Pickup Marker */}
              <Marker position={rideData.pickupLocation}>
                <Popup>Pickup Location</Popup>
              </Marker>

              {/* Dropoff Marker */}
              <Marker position={rideData.dropoffLocation}>
                <Popup>Dropoff Location</Popup>
              </Marker>

              {/* Driver Marker */}
              {driverLocation && (
                <Marker position={driverLocation} icon={driverIcon}>
                  <Popup>Your Driver</Popup>
                </Marker>
              )}

              {/* Route Line */}
              {driverLocation && rideStatus === "in_progress" && (
                <Polyline
                  positions={[
                    [driverLocation.lat, driverLocation.lng],
                    [
                      rideData.dropoffLocation.lat,
                      rideData.dropoffLocation.lng,
                    ],
                  ]}
                  color="blue"
                />
              )}
            </MapContainer>
          </Box>

          {/* Ride Details Section */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Place color="primary" />
                </ListItemIcon>
                <ListItemText primary="Pickup" secondary={rideData.pickup} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Place color="secondary" />
                </ListItemIcon>
                <ListItemText primary="Dropoff" secondary={rideData.dropoff} />
              </ListItem>
              <Divider />

              {rideStatus !== "searching" && (
                <>
                  <ListItem>
                    <ListItemIcon>
                      <Person color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Driver"
                      secondary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            src={
                              rideData?.driver?.photo ||
                              "https://cdn-icons-png.flaticon.com/512/4474/4474284.png"
                            }
                            sx={{ width: 24, height: 24 }}
                          />
                          <span>
                            {rideData?.driver?.name || "Your Driver"} (
                            {rideData?.driver?.rating || "–"}{" "}
                            <Star fontSize="small" sx={{ color: "gold" }} />)
                          </span>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DirectionsCar color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Vehicle"
                      secondary={
                        rideData?.driver?.vehicle
                          ? `${rideData.driver.vehicle.make || ""} ${
                              rideData.driver.vehicle.model || ""
                            } (${rideData.driver.vehicle.license || ""})${
                              rideData.driver.vehicle.color
                                ? ", " + rideData.driver.vehicle.color
                                : ""
                            }`
                          : rideData.vehicleType || ""
                      }
                    />
                  </ListItem>
                </>
              )}

              <ListItem>
                <ListItemIcon>
                  <Schedule color="action" />
                </ListItemIcon>
                <ListItemText primary="ETA" secondary={eta} />
              </ListItem>
            </List>
          </Paper>

          {/* Status and Actions */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {rideStatus === "searching" &&
                "Searching for available drivers..."}
              {rideStatus === "accepted" &&
                "Driver is on the way to your location"}
              {rideStatus === "arrived" && "Your driver has arrived"}
              {rideStatus === "in_progress" && "En route to your destination"}
              {rideStatus === "completed" &&
                "You've arrived at your destination"}
            </Typography>

            {rideStatus === "completed" ? (
              <Box>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Total Fare: ${rideData.fare}
                </Typography>
                <Button
                  onClick={handlePayment}
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<Payment />}
                >
                  Complete Payment
                </Button>
                {/* Ride Rating Modal */}
                <Modal open={showRating} onClose={handleSubmitRating}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      bgcolor: "background.paper",
                      boxShadow: 24,
                      borderRadius: 2,
                      p: 4,
                      width: 320,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" mb={2}>
                      Rate Your Ride
                    </Typography>
                    <Rating
                      name="ride-rating"
                      value={rating}
                      onChange={(_, value) => setRating(value)}
                      size="large"
                    />
                    <Button
                      sx={{ mt: 2 }}
                      variant="contained"
                      onClick={handleSubmitRating}
                    >
                      Submit
                    </Button>
                  </Box>
                </Modal>
              </Box>
            ) : (
              <Button
                onClick={handleCancel}
                variant="outlined"
                color="error"
                sx={{ mt: 1 }}
                disabled={rideStatus === "in_progress"}
              >
                {rideStatus === "in_progress"
                  ? "Cancel (with fee)"
                  : "Cancel Ride"}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
