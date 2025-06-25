// 🚘 RideInProgress.js — Two-Column Enhanced UI
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Avatar,
  Chip,
  Modal,
  Rating,
  Stack,
  Paper,
  Divider,
  IconButton,
  CircularProgress,
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
  Star,
  Payment,
  Schedule,
  DirectionsCar,
  Phone,
  MyLocation,
  Flag,
  Cancel,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Leaflet icon fix
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

const StatusChip = styled(Chip)(({ status }) => ({
  fontWeight: 600,
  textTransform: "capitalize",
  color: "white",
  backgroundColor:
    status === "searching"
      ? "#ff9800"
      : status === "in_progress"
      ? "#4caf50"
      : status === "completed"
      ? "#3f51b5"
      : "#9e9e9e",
}));

const RideInProgress = () => {
  const [rideStatus, setRideStatus] = useState("searching");
  const [rideData, setRideData] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState("--");
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const savedRide = JSON.parse(localStorage.getItem("currentRide")) || {};
    setRideData(savedRide);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedRide = JSON.parse(localStorage.getItem("currentRide"));
      const updatedStatus = localStorage.getItem("rideStatus");
      if (!updatedRide || ["available", "idle"].includes(updatedStatus)) {
        navigate("/passenger");
        clearInterval(interval);
        return;
      }
      setRideData(updatedRide);
      setRideStatus(updatedStatus || "searching");
      if (updatedRide.driverLocation)
        setDriverLocation(updatedRide.driverLocation);
    }, 2000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedRide = JSON.parse(localStorage.getItem("currentRide"));
      if (updatedRide?.eta) {
        setEta(updatedRide.eta);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const animateDriverToDropoff = () => {
    if (!driverLocation || !rideData?.dropoffLocation) return;
    const steps = 100,
      intervalTime = 100;
    const latDiff = (rideData.dropoffLocation.lat - driverLocation.lat) / steps;
    const lngDiff = (rideData.dropoffLocation.lng - driverLocation.lng) / steps;
    let i = 0;
    const interval = setInterval(() => {
      if (i >= steps) return clearInterval(interval);
      setDriverLocation({
        lat: driverLocation.lat + latDiff * i,
        lng: driverLocation.lng + lngDiff * i,
      });
      i++;
    }, intervalTime);
  };

  useEffect(() => {
    if (rideStatus === "in_progress") animateDriverToDropoff();
  }, [rideStatus]);

  const handleCancel = () => {
    setRideData(null);
    localStorage.removeItem("currentRide");
    localStorage.setItem("rideStatus", "idle");
    navigate("/passenger");
  };

  const handlePayment = () => setShowRating(true);
  const handleSubmitRating = () => {
    setShowRating(false);
    setTimeout(() => navigate("/passenger"), 800);
  };

  if (!rideData?.pickupLocation || !rideData?.dropoffLocation) {
    return (
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography mt={3} variant="h6">
          Loading your ride details...
        </Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: "100vh",
        width: "100vw",
        background:
          "radial-gradient(circle at center, #f5f9ff 0%, #e3eafd 100%)",
      }}
    >
      {/* Left - Map */}
      <Box sx={{ flex: 1, minHeight: 300 }}>
        <MapContainer
          center={rideData.pickupLocation}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={rideData.pickupLocation}>
            <Popup>Pickup Location</Popup>
          </Marker>
          <Marker position={rideData.dropoffLocation}>
            <Popup>Dropoff Location</Popup>
          </Marker>
          {driverLocation && (
            <>
              <Marker position={driverLocation} icon={driverIcon}>
                <Popup>Your Driver</Popup>
              </Marker>
              <Polyline
                positions={[
                  [driverLocation.lat, driverLocation.lng],
                  [rideData.dropoffLocation.lat, rideData.dropoffLocation.lng],
                ]}
                color="#3a7bd5"
                weight={4}
              />
            </>
          )}
        </MapContainer>
      </Box>

      {/* Right - Ride Details */}
      {/* Right - Ride Details */}
      <Box
        sx={{
          width: { xs: "100%", md: 400 },
          p: 3,
          overflowY: "auto",
          borderLeft: { md: "1px solid #ccc" },
          backgroundColor: "white",
        }}
      >
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Ride Summary
        </Typography>

        <StatusChip
          status={rideStatus}
          label={rideStatus.replace("_", " ")}
          size="medium"
          sx={{
            mb: 2,
            background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
          }}
        />

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            mb: 3,
            border: "1px solid rgba(0,0,0,0.06)",
            background: "linear-gradient(145deg, #ffffff, #f5f9ff)",
            boxShadow: "0 8px 32px rgba(31, 38, 135, 0.05)",
          }}
        >
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <MyLocation color="primary" />
              <Typography>
                <b>Pickup:</b> {rideData.pickup}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Flag color="primary" />
              <Typography>
                <b>Dropoff:</b> {rideData.dropoff}
              </Typography>
            </Box>
            <Divider />
            <Box display="flex" alignItems="center" gap={2}>
              <DirectionsCar color="primary" />
              <Typography>
                <b>Vehicle:</b> {rideData.vehicleType}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Schedule color="primary" />
              <Typography>
                <b>ETA:</b> {eta}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Payment color="primary" />
              <Typography>
                <b>Fare:</b> ৳{rideData.fare}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {rideData.driver && rideStatus !== "searching" && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              mb: 3,
              border: "1px solid rgba(0,0,0,0.06)",
              background: "linear-gradient(145deg, #ffffff, #f5f9ff)",
              boxShadow: "0 8px 32px rgba(31, 38, 135, 0.05)",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={rideData.driver.photo}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography fontWeight={600}>{rideData.driver.name}</Typography>
                <Rating
                  value={rideData.driver.rating}
                  precision={0.5}
                  readOnly
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {rideData.driver.vehicle.make} {rideData.driver.vehicle.model}{" "}
                  • {rideData.driver.vehicle.color}
                </Typography>
              </Box>
              <IconButton
                sx={{
                  ml: "auto",
                  bgcolor: "#185a9d",
                  color: "white",
                  "&:hover": {
                    bgcolor: "#43cea2",
                  },
                }}
              >
                <Phone />
              </IconButton>
            </Box>
          </Paper>
        )}

        <Stack direction="row" spacing={2}>
          {rideStatus !== "completed" && (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={handleCancel}
              startIcon={<Cancel />}
              sx={{
                borderRadius: 3,
                fontWeight: "bold",
                border: "2px solid #185a9d",
                color: "#185a9d",
                "&:hover": {
                  background: "#185a9d",
                  color: "white",
                },
              }}
            >
              Cancel Ride
            </Button>
          )}
          {rideStatus === "completed" && (
            <Button
              fullWidth
              variant="contained"
              onClick={handlePayment}
              startIcon={<Payment />}
              sx={{
                borderRadius: 3,
                fontWeight: "bold",
                color: "white",
                background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)",
                },
              }}
            >
              Pay & Rate
            </Button>
          )}
        </Stack>
      </Box>

      <Modal open={showRating} onClose={() => setShowRating(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            bgcolor: "#ffffff",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            border: "1px solid rgba(145, 158, 171, 0.2)",
            backgroundImage: "linear-gradient(145deg, #ffffff, #f5f9ff)",
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            gutterBottom
            textAlign="center"
            sx={{
              background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Rate Your Experience
          </Typography>

          <Box textAlign="center" my={3}>
            <Rating
              value={rating}
              onChange={(e, val) => setRating(val)}
              size="large"
              precision={0.5}
              icon={<Star fontSize="inherit" color="primary" />}
              emptyIcon={<Star fontSize="inherit" />}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmitRating}
            disabled={!rating}
            sx={{
              mt: 2,
              borderRadius: 3,
              color: "white",
              fontWeight: "bold",
              background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
              "&:hover": {
                background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)",
              },
            }}
          >
            Submit Rating
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default RideInProgress;
