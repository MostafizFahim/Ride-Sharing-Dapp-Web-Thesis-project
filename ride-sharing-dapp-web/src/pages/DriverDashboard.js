import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Button,
  Switch,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Chip,
  Drawer,
  IconButton,
  Badge,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  LinearProgress,
  Rating,
  Tooltip,
} from "@mui/material";
import {
  DirectionsCar,
  Person,
  Star,
  Place,
  CheckCircle,
  Schedule,
  Menu,
  History,
  AccountCircle,
  Payments,
  Home,
  Logout,
  VerifiedUser,
  DirectionsCarFilled,
  Phone,
  Email,
  AttachMoney,
} from "@mui/icons-material";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import FlagIcon from "@mui/icons-material/Flag";

// Icons
const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4474/4474284.png",
  iconSize: [40, 40],
});
const passengerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
  iconSize: [30, 30],
});
const RIDE_OFFER_TIMEOUT = 15;

export default function DriverDashboard() {
  // === Real Driver Info (from Registration) ===
  const driver =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(localStorage.getItem("registeredUser")) ||
    {};

  const profileName = driver.fullName || driver.name || "Driver";
  const profileEmail = driver.email || "-";
  const profilePhone = driver.phone || "-";
  const profileAvatar =
    driver.picture || "https://cdn-icons-png.flaticon.com/512/4474/4474284.png";
  const vehicleType = driver.vehicleType || "Car";
  const vehicleModel = driver.vehicleModel || "Not set";
  const licensePlate = driver.licensePlate || "Not set";
  const vehicleColor = driver.vehicleColor || "Not set";
  const joined = driver.dateOfBirth
    ? new Date(driver.dateOfBirth).toLocaleDateString()
    : "2024";

  // === Driver Activity/Status ===
  const [isOnline, setIsOnline] = useState(false);
  const [rideOffer, setRideOffer] = useState(null);
  const [offerTimer, setOfferTimer] = useState(RIDE_OFFER_TIMEOUT);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [rideStatus, setRideStatus] = useState("idle"); // idle | accepted | arrived | in_progress | completed
  const [rideData, setRideData] = useState(null);
  const [driverPosition, setDriverPosition] = useState(null);
  const [rideProgress, setRideProgress] = useState(0);
  const [rideHistory, setRideHistory] = useState(
    JSON.parse(localStorage.getItem("driverRideHistory")) || []
  );
  const [driverEarnings, setDriverEarnings] = useState(
    parseFloat(localStorage.getItem("driverEarnings")) || 0
  );
  const [activeTab, setActiveTab] = useState("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rideStep, setRideStep] = useState(0); // Stepper: accepted(0), arrived(1), in_progress(2), completed(3)
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [passengerRating, setPassengerRating] = useState(null);

  const watchIdRef = useRef(null);
  const offerTimerRef = useRef(null);

  // === Geolocation (Real Driver Position) ===
  useEffect(() => {
    if (isOnline && "geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setDriverPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {},
        { enableHighAccuracy: true }
      );
    } else {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    return () => navigator.geolocation.clearWatch(watchIdRef.current);
  }, [isOnline]);

  // === Simulate/Listen for Incoming Ride Requests ===
  useEffect(() => {
    if (!isOnline) return;
    // If not in a ride, check if a passenger ride is waiting in localStorage
    if (rideStatus === "idle") {
      const passengerRide = JSON.parse(localStorage.getItem("currentRide"));
      const rideState = localStorage.getItem("rideStatus");
      // If a new ride request is waiting for a driver
      if (
        passengerRide &&
        rideState === "searching" &&
        !passengerRide.driverAccepted
      ) {
        // Show this real ride to the driver as an offer
        setRideOffer(passengerRide);
        setShowOfferModal(true);
        setOfferTimer(RIDE_OFFER_TIMEOUT);
      }
    }
  }, [isOnline, rideStatus]);

  // === Offer Modal Timer (Countdown for Accept/Reject) ===
  useEffect(() => {
    if (showOfferModal) {
      setOfferTimer(RIDE_OFFER_TIMEOUT);
      offerTimerRef.current = setInterval(() => {
        setOfferTimer((prev) => {
          if (prev <= 1) {
            clearInterval(offerTimerRef.current);
            handleRejectRide();
            return RIDE_OFFER_TIMEOUT;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(offerTimerRef.current);
    // eslint-disable-next-line
  }, [showOfferModal]);

  // === Accept Ride Request ===
  function handleAcceptRide() {
    setShowOfferModal(false);
    setRideData(rideOffer);
    setRideStatus("accepted");
    setRideStep(0);

    // Mark driver as accepted, add driver info to currentRide
    const driverInfo = {
      name: profileName,
      rating: 4.8,
      photo: profileAvatar,
      vehicle: {
        make: vehicleType,
        model: vehicleModel,
        license: licensePlate,
        color: vehicleColor,
      },
    };

    const updatedRide = {
      ...rideOffer,
      driverAccepted: true,
      driver: driverInfo,
    };

    localStorage.setItem("currentRide", JSON.stringify(updatedRide));
    localStorage.setItem("rideStatus", "accepted");
    setRideOffer(null);
  }

  // === Reject Ride Request ===
  function handleRejectRide() {
    setShowOfferModal(false);
    setRideOffer(null);
    setRideStatus("idle");
    localStorage.setItem("rideStatus", "idle");
  }

  // === Ride Stepper (Accepted -> Arrived -> In Progress -> Completed) ===
  const rideSteps = [
    "Ride Accepted",
    "Arrived at Pickup",
    "Ride In Progress",
    "Ride Completed",
  ];
  function nextRideStep() {
    if (rideStep < 3) {
      setRideStep(rideStep + 1);
      // Step transitions
      if (rideStep === 0) setRideStatus("arrived");
      if (rideStep === 1) setRideStatus("in_progress");
      if (rideStep === 2) {
        setRideStatus("completed");
        setShowRatingModal(true);
      }
    }
  }

  function finishRide() {
    // Save to history, update earnings
    const finishedRide = {
      ...rideData,
      date: new Date().toISOString(),
      fare: rideData?.fare || 0,
    };
    const newHistory = [finishedRide, ...rideHistory];
    setRideHistory(newHistory);
    localStorage.setItem("driverRideHistory", JSON.stringify(newHistory));
    const newEarnings =
      (parseFloat(driverEarnings) || 0) + (rideData?.fare || 0);
    setDriverEarnings(newEarnings);
    localStorage.setItem("driverEarnings", newEarnings);
    // Reset states
    setRideData(null);
    setRideStatus("idle");
    setRideStep(0);
    setShowRatingModal(false);
    setPassengerRating(null);
  }

  // === Sidebar: Always Shows Real Driver Info ===
  const Sidebar = (
    <Drawer
      variant="permanent"
      sx={{
        width: 250,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 250,
          boxSizing: "border-box",
          pt: 8,
          bgcolor: "#f8fbff",
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Avatar
          src={profileAvatar}
          sx={{
            width: 84,
            height: 84,
            mx: "auto",
            mb: 2,
            border: "2px solid #53a0fd",
            boxShadow: 2,
          }}
        />
        <Typography variant="h6" fontWeight={700}>
          {profileName}
        </Typography>
        <Typography color="text.secondary" fontSize="0.98rem">
          <VerifiedUser fontSize="small" sx={{ color: "#53a0fd", mr: 0.5 }} />
          Verified Driver
        </Typography>
        <Typography color="text.secondary" fontSize="0.92rem" mt={0.3}>
          {profileEmail}
        </Typography>
        <Chip
          label={`$${driverEarnings.toFixed(2)} earned`}
          color="success"
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>
      <List>
        <ListItem
          button
          selected={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
        >
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem
          button
          selected={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        >
          <ListItemIcon>
            <Badge badgeContent={rideHistory.length} color="primary">
              <History />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Ride History" />
        </ListItem>
        <ListItem
          button
          selected={activeTab === "earnings"}
          onClick={() => setActiveTab("earnings")}
        >
          <ListItemIcon>
            <Payments />
          </ListItemIcon>
          <ListItemText primary="Earnings" />
        </ListItem>
        <ListItem
          button
          selected={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
        >
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );

  // === Profile Card (All Real Data) ===
  const ProfileCard = (
    <Card sx={{ maxWidth: 480, mx: "auto", p: 2 }}>
      <CardContent>
        <Box textAlign="center" mb={4}>
          <Avatar
            src={profileAvatar}
            sx={{
              width: 100,
              height: 100,
              mx: "auto",
              mb: 2,
              border: "2px solid #53a0fd",
              boxShadow: 2,
            }}
          />
          <Typography variant="h5" fontWeight={800}>
            {profileName}
          </Typography>
          <Chip
            icon={<VerifiedUser />}
            label="Verified Driver"
            color="primary"
            sx={{ mt: 1, mb: 1 }}
          />
          <Typography color="text.secondary" mt={1}>
            <Star sx={{ color: "gold", verticalAlign: "middle" }} /> 4.8 (256
            ratings)
          </Typography>
        </Box>
        <List>
          <ListItem>
            <ListItemIcon>
              <Phone color="primary" />
            </ListItemIcon>
            <ListItemText primary="Contact" secondary={profilePhone} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Email color="primary" />
            </ListItemIcon>
            <ListItemText primary="Email" secondary={profileEmail} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Driver Since" secondary={joined} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <DirectionsCarFilled color="info" />
            </ListItemIcon>
            <ListItemText
              primary={`Vehicle: ${vehicleType}`}
              secondary={
                <>
                  Model: {vehicleModel} <br />
                  Plate: {licensePlate} <br />
                  Color: {vehicleColor}
                </>
              }
            />
          </ListItem>
        </List>
        <Box textAlign="center" mt={3}>
          <Chip
            label="Edit Profile (Coming Soon)"
            variant="outlined"
            color="primary"
          />
        </Box>
      </CardContent>
    </Card>
  );

  // === Renders all main dashboard content by activeTab ===
  function renderContent() {
    // === Dashboard/Online/Incoming Ride Request UI ===
    if (activeTab === "dashboard") {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Welcome, {profileName}!{" "}
            {isOnline ? "You are online 🚗" : "You are offline."}
          </Typography>
          <Box sx={{ height: 320, width: "100%", mb: 3 }}>
            <MapContainer
              center={driverPosition || { lat: 23.8103, lng: 90.4125 }}
              zoom={13}
              style={{ height: "100%", width: "100%", borderRadius: 16 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {driverPosition && (
                <Marker position={driverPosition} icon={driverIcon}>
                  <Popup>My Position</Popup>
                </Marker>
              )}
              {/* You can add more markers, e.g. pickup/dropoff, as needed */}
            </MapContainer>
          </Box>
          <Button
            variant={isOnline ? "outlined" : "contained"}
            color="primary"
            sx={{ mb: 2, mr: 2 }}
            onClick={() => setIsOnline(!isOnline)}
          >
            {isOnline ? "Go Offline" : "Go Online"}
          </Button>
          <Chip
            label={`Earnings: $${driverEarnings.toFixed(2)}`}
            color="success"
            sx={{ ml: 1 }}
          />
          <Divider sx={{ my: 3 }} />
          {/* === Show ride progress if in a ride === */}
          {rideData && rideStatus !== "idle" && (
            <Card sx={{ maxWidth: 600, mx: "auto", mt: 2 }}>
              <CardContent>
                <Typography variant="h6">
                  Current Ride — <b>{rideData.passengerName}</b>
                </Typography>
                <Stepper
                  activeStep={rideStep}
                  alternativeLabel
                  sx={{ mt: 2, mb: 2 }}
                >
                  {rideSteps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <Box mb={2}>
                  <Typography>
                    <Place
                      sx={{ color: "info.main", verticalAlign: "middle" }}
                    />{" "}
                    <b>Pickup:</b> {rideData.pickup}
                  </Typography>
                  <Typography>
                    <FlagIcon
                      sx={{ color: "success.main", verticalAlign: "middle" }}
                    />{" "}
                    <b>Dropoff:</b> {rideData.dropoff}
                  </Typography>
                  <Typography>
                    <AttachMoney sx={{ verticalAlign: "middle" }} />{" "}
                    <b>Fare:</b> {rideData.fare} BDT
                  </Typography>
                  <Typography>
                    <DirectionsCar
                      sx={{ color: "primary.main", verticalAlign: "middle" }}
                    />{" "}
                    <b>Distance:</b> {rideData.distance}
                  </Typography>
                  <Typography>
                    <Schedule
                      sx={{ color: "primary.main", verticalAlign: "middle" }}
                    />{" "}
                    <b>ETA:</b> {rideData.eta}
                  </Typography>
                </Box>
                {rideStep < 3 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={nextRideStep}
                  >
                    {
                      ["Arrived at Pickup", "Start Ride", "Finish Ride"][
                        rideStep
                      ]
                    }
                  </Button>
                )}
                {rideStep === 3 && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={finishRide}
                  >
                    Complete Ride
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          {/* === Modal: Incoming Ride Offer === */}
          <Modal open={showOfferModal} onClose={handleRejectRide}>
            <Box
              sx={{
                p: 4,
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: 6,
                maxWidth: 400,
                mx: "auto",
                mt: "15vh",
                outline: "none",
                textAlign: "center",
              }}
            >
              <Avatar
                src={rideOffer?.passengerPhoto}
                sx={{
                  width: 68,
                  height: 68,
                  mx: "auto",
                  mb: 1,
                  border: "2px solid #53a0fd",
                }}
              />
              <Typography variant="h6" fontWeight={800} mb={1}>
                New Ride Request!
              </Typography>
              <Typography>
                <b>From:</b> {rideOffer?.pickup} <br />
                <b>To:</b> {rideOffer?.dropoff}
              </Typography>
              <Typography>
                <b>Fare:</b> {rideOffer?.fare} BDT
              </Typography>
              <Typography>
                <b>Distance:</b> {rideOffer?.distance}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(offerTimer / RIDE_OFFER_TIMEOUT) * 100}
                sx={{ mt: 2, mb: 2, height: 8, borderRadius: 5 }}
                color={offerTimer <= 4 ? "error" : "primary"}
              />
              <Typography color={offerTimer <= 4 ? "error" : "primary"}>
                Respond in {offerTimer}s
              </Typography>
              <Box mt={2} display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleAcceptRide}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRejectRide}
                >
                  Reject
                </Button>
              </Box>
            </Box>
          </Modal>
          {/* === Modal: Rate Passenger After Ride === */}
          <Modal
            open={showRatingModal}
            onClose={() => setShowRatingModal(false)}
          >
            <Box
              sx={{
                p: 4,
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: 6,
                maxWidth: 360,
                mx: "auto",
                mt: "18vh",
                outline: "none",
                textAlign: "center",
              }}
            >
              <Typography variant="h6" mb={2}>
                Rate Passenger
              </Typography>
              <Rating
                value={passengerRating}
                onChange={(e, v) => setPassengerRating(v)}
                size="large"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                disabled={!passengerRating}
                onClick={finishRide}
              >
                Submit
              </Button>
            </Box>
          </Modal>
        </Box>
      );
    }
    // === Ride History Tab ===
    if (activeTab === "history") {
      return (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Ride History
            </Typography>
            {rideHistory.length === 0 ? (
              <Typography color="text.secondary">No rides yet.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Pickup</TableCell>
                      <TableCell>Dropoff</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Fare</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rideHistory.map((ride, i) => (
                      <TableRow key={i}>
                        <TableCell>{ride.pickup || "N/A"}</TableCell>
                        <TableCell>{ride.dropoff || "N/A"}</TableCell>
                        <TableCell>
                          {ride.date
                            ? new Date(ride.date).toLocaleString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {ride.fare ? `${ride.fare} BDT` : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      );
    }
    // === Earnings Tab ===
    if (activeTab === "earnings") {
      return (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Earnings Summary
            </Typography>
            <Typography fontSize="1.4rem" fontWeight={800}>
              {driverEarnings.toFixed(2)} BDT
            </Typography>
            <Typography color="text.secondary" mb={2}>
              Total earned this month.
            </Typography>
          </CardContent>
        </Card>
      );
    }
    // === Profile Tab ===
    if (activeTab === "profile") {
      return ProfileCard;
    }
    return null;
  }

  // === MAIN RENDER ===
  return (
    <Box sx={{ display: "flex" }}>
      {Sidebar}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h4" fontWeight={800}>
              {activeTab === "dashboard" && "Driver Dashboard"}
              {activeTab === "history" && "Ride History"}
              {activeTab === "earnings" && "Earnings"}
              {activeTab === "profile" && "My Profile"}
            </Typography>
            {activeTab === "dashboard" && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => setDrawerOpen(!drawerOpen)}
                sx={{ mr: 2, display: { sm: "none" } }}
              >
                <Menu />
              </IconButton>
            )}
          </Box>
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
}
