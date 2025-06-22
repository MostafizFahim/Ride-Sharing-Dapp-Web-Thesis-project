// 🚘 RideInProgress.js — Enhanced UI Version
import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Avatar,
  Chip,
  Modal,
  Rating,
  Stack,
  Paper,
  Divider,
  IconButton,
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
  Person,
  Phone,
  Cancel,
  CheckCircle,
  MyLocation,
  Flag,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { styled } from "@mui/material/styles";

// Leaflet default icon fix
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

// Styled Components
const GradientCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(145deg, #ffffff, #f5f9ff)",
  border: "1px solid rgba(145, 158, 171, 0.12)",
  backdropFilter: "blur(8px)",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  overflow: "hidden",
}));

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
  const [showNoDriver, setShowNoDriver] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [progress, setProgress] = useState(0);

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
        setShowNoDriver(true);
        setRideStatus("idle");
        setRideData(null);
        setTimeout(() => navigate("/passenger"), 3000);
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

  if (showNoDriver) {
    return (
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Cancel color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Ride Not Accepted
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            No drivers were available for your ride request
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/passenger")}
            sx={{ borderRadius: 3, px: 4 }}
          >
            Try Again
          </Button>
        </motion.div>
      </Container>
    );
  }

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
        position: "relative",
        height: "100vh",
        background:
          "radial-gradient(circle at center, #f5f9ff 0%, #e3eafd 100%)",
        overflow: "hidden",
        p: { xs: 2, md: 4 },
      }}
    >
      <GradientCard sx={{ height: "100%", overflow: "auto" }}>
        <Box sx={{ p: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h4" fontWeight={800}>
              {rideStatus === "completed" ? "Ride Completed" : "Your Ride"}
            </Typography>
            <StatusChip
              status={rideStatus}
              label={rideStatus.replace("_", " ")}
              size="medium"
            />
          </Box>

          <Box
            sx={{
              height: 300,
              borderRadius: 3,
              overflow: "hidden",
              mt: 3,
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <MapContainer
              center={rideData.pickupLocation}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={rideData.pickupLocation}>
                <Popup>Pickup Location</Popup>
              </Marker>
              <Marker position={rideData.dropoffLocation}>
                <Popup>Dropoff Location</Popup>
              </Marker>
              {driverLocation && (
                <Marker position={driverLocation} icon={driverIcon}>
                  <Popup>Your Driver</Popup>
                </Marker>
              )}
              {driverLocation && (
                <Polyline
                  positions={[
                    [driverLocation.lat, driverLocation.lng],
                    [
                      rideData.dropoffLocation.lat,
                      rideData.dropoffLocation.lng,
                    ],
                  ]}
                  color="#3a7bd5"
                  weight={4}
                />
              )}
            </MapContainer>
          </Box>

          {rideStatus !== "searching" && rideData.driver && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mt: 3,
                  borderRadius: 3,
                  background: "rgba(58, 123, 213, 0.05)",
                  border: "1px solid rgba(58, 123, 213, 0.1)",
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={rideData.driver.photo}
                    sx={{ width: 56, height: 56 }}
                  />
                  <Box>
                    <Typography fontWeight={600}>
                      {rideData.driver.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Rating
                        value={rideData.driver.rating}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {rideData.driver.rating}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {rideData.driver.vehicle.make}{" "}
                      {rideData.driver.vehicle.model} •{" "}
                      {rideData.driver.vehicle.color}
                    </Typography>
                  </Box>
                  <IconButton
                    sx={{ ml: "auto", bgcolor: "#3a7bd5", color: "white" }}
                  >
                    <Phone />
                  </IconButton>
                </Box>
              </Paper>
            </motion.div>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 3,
              mt: 3,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(8px)",
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
                <Flag color="primary" /> {/* Changed from FlagIcon to Flag */}
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

            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              {rideStatus !== "completed" && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleCancel}
                  startIcon={<Cancel />}
                  sx={{ borderRadius: 3, py: 1.5 }}
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
                    py: 1.5,
                    background: "linear-gradient(45deg, #3a7bd5, #00d2ff)",
                  }}
                >
                  Pay & Rate
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </GradientCard>

      <Modal open={showRating} onClose={() => setShowRating(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            outline: "none",
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            gutterBottom
            textAlign="center"
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
              py: 1.5,
              background: "linear-gradient(45deg, #3a7bd5, #00d2ff)",
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
