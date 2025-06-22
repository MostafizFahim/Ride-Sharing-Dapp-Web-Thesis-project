import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Button,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  List,
  ListItem,
  ListItemText,
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
  Grid,
  Stack,
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
  LocationOn,
  Money,
  Timer,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import FlagIcon from "@mui/icons-material/Flag";
import { useUser } from "../components/UserContext";
import { useNavigate } from "react-router-dom";

// Custom Icons
const driverIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const RIDE_OFFER_TIMEOUT = 15;

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const driver = user || {};

  // Profile Data
  const {
    fullName = "Driver",
    email = "-",
    phone = "-",
    picture = "https://cdn-icons-png.flaticon.com/512/4474/4474284.png",
    vehicleType = "Car",
    vehicleModel = "Not set",
    licensePlate = "Not set",
    vehicleColor = "Not set",
    dateOfBirth,
    rating = 4.8,
    totalRides = 0,
  } = driver;

  // State Management
  const [isOnline, setIsOnline] = useState(false);
  const [rideOffer, setRideOffer] = useState(null);
  const [offerTimer, setOfferTimer] = useState(RIDE_OFFER_TIMEOUT);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [rideStatus, setRideStatus] = useState("idle");
  const [rideData, setRideData] = useState(null);
  const [driverPosition, setDriverPosition] = useState(null);
  const [rideHistory, setRideHistory] = useState(
    JSON.parse(localStorage.getItem("driverRideHistory")) || []
  );
  const [driverEarnings, setDriverEarnings] = useState(
    parseFloat(localStorage.getItem("driverEarnings")) || 0
  );
  const [activeTab, setActiveTab] = useState("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rideStep, setRideStep] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [passengerRating, setPassengerRating] = useState(null);

  const watchIdRef = useRef(null);
  const offerTimerRef = useRef(null);

  // Format joined date
  const joinedDate = dateOfBirth
    ? new Date(dateOfBirth).toLocaleDateString()
    : new Date().toLocaleDateString();

  // Geolocation Tracking
  useEffect(() => {
    if (isOnline && "geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setDriverPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    } else {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    return () => navigator.geolocation.clearWatch(watchIdRef.current);
  }, [isOnline]);

  // Ride Request Simulation
  useEffect(() => {
    if (!isOnline || rideStatus !== "idle") return;

    const checkForRides = setInterval(() => {
      const passengerRide = JSON.parse(localStorage.getItem("currentRide"));
      const rideState = localStorage.getItem("rideStatus");

      if (
        passengerRide &&
        rideState === "searching" &&
        !passengerRide.driverAccepted
      ) {
        setRideOffer(passengerRide);
        setShowOfferModal(true);
        setOfferTimer(RIDE_OFFER_TIMEOUT);
      }
    }, 3000);

    return () => clearInterval(checkForRides);
  }, [isOnline, rideStatus]);

  // Ride Offer Timer
  useEffect(() => {
    if (showOfferModal) {
      offerTimerRef.current = setInterval(() => {
        setOfferTimer((prev) => {
          if (prev <= 1) {
            handleRejectRide();
            return RIDE_OFFER_TIMEOUT;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(offerTimerRef.current);
  }, [showOfferModal]);

  // Ride Handling Functions
  const handleAcceptRide = () => {
    const driverInfo = {
      name: fullName,
      rating,
      photo: picture,
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

    setShowOfferModal(false);
    setRideData(rideOffer);
    setRideStatus("accepted");
    setRideStep(0);
    setRideOffer(null);
  };

  const handleRejectRide = () => {
    setShowOfferModal(false);
    setRideOffer(null);
    setRideStatus("idle");
  };

  const nextRideStep = () => {
    if (rideStep < 3) {
      setRideStep(rideStep + 1);
      const statuses = ["accepted", "arrived", "in_progress", "completed"];
      setRideStatus(statuses[rideStep + 1]);

      if (rideStep === 2) {
        setShowRatingModal(true);
      }
    }
  };

  const finishRide = () => {
    const earnings = rideData?.fare || 0;
    const newEarnings = driverEarnings + earnings;

    const finishedRide = {
      ...rideData,
      date: new Date().toISOString(),
      fare: earnings,
      status: "Completed",
    };

    const newHistory = [finishedRide, ...rideHistory];

    setRideHistory(newHistory);
    setDriverEarnings(newEarnings);
    localStorage.setItem("driverRideHistory", JSON.stringify(newHistory));
    localStorage.setItem("driverEarnings", newEarnings.toString());

    setRideData(null);
    setRideStatus("idle");
    setRideStep(0);
    setShowRatingModal(false);
    setPassengerRating(null);
  };

  // Sidebar Component
  const Sidebar = (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 280,
          boxSizing: "border-box",
          position: "fixed", // ✅ fix position
          top: 68, // ✅ offset equal to AppBar height
          height: "calc(100% - 64px)", // ✅ remaining vertical space
          bgcolor: "background.paper",
          borderRight: "1px solid rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Avatar
          src={picture}
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 2,
            border: "2px solid",
            borderColor: "primary.main",
          }}
        />
        <Typography variant="h6" fontWeight={600}>
          {fullName}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {email}
        </Typography>
        <Chip
          icon={<VerifiedUser fontSize="small" />}
          label="Verified Driver"
          color="primary"
          size="small"
          sx={{ mt: 1.5 }}
        />
        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Tooltip title="Total Earnings">
            <Chip
              icon={<AttachMoney fontSize="small" />}
              label={`৳${driverEarnings.toFixed(2)}`}
              color="success"
              variant="outlined"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Total Rides">
            <Chip
              icon={<DirectionsCar fontSize="small" />}
              label={rideHistory.length}
              color="info"
              variant="outlined"
              size="small"
            />
          </Tooltip>
        </Stack>
      </Box>
      <List>
        <ListItem
          button
          selected={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
          sx={{
            "&.Mui-selected": {
              backgroundColor: "primary.light",
              "&:hover": { backgroundColor: "primary.light" },
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: activeTab === "dashboard" ? "primary.main" : "inherit",
            }}
          >
            <Home />
          </ListItemIcon>
          <ListItemText
            primary="Dashboard"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => navigate("/ride-history")}
          sx={{
            "&.Mui-selected": {
              backgroundColor: "primary.light",
              "&:hover": { backgroundColor: "primary.light" },
            },
          }}
        >
          <ListItemIcon>
            <Badge badgeContent={rideHistory.length} color="primary" max={99}>
              <History />
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary="Ride History"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
        <ListItem
          button
          selected={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
          sx={{
            "&.Mui-selected": {
              backgroundColor: "primary.light",
              "&:hover": { backgroundColor: "primary.light" },
            },
          }}
        >
          <ListItemIcon
            sx={{ color: activeTab === "profile" ? "primary.main" : "inherit" }}
          >
            <AccountCircle />
          </ListItemIcon>
          <ListItemText
            primary="Profile"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            setUser(null);
            localStorage.removeItem("user");
            navigate("/login");
          }}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
      </List>
    </Drawer>
  );

  // Dashboard Stats Cards
  const StatsCard = ({ icon, title, value, color }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark` }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  // Main Content Renderer
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Box>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={4}>
                <StatsCard
                  icon={<AttachMoney />}
                  title="Total Earnings"
                  value={`৳${driverEarnings.toFixed(2)}`}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatsCard
                  icon={<DirectionsCar />}
                  title="Total Rides"
                  value={rideHistory.length}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatsCard
                  icon={<Star />}
                  title="Your Rating"
                  value={rating}
                  color="warning"
                />
              </Grid>
            </Grid>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Your Location
                </Typography>
                <Box sx={{ height: 300, borderRadius: 2, overflow: "hidden" }}>
                  <MapContainer
                    center={driverPosition || { lat: 23.8103, lng: 90.4125 }}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {driverPosition && (
                      <Marker position={driverPosition} icon={driverIcon}>
                        <Popup>Your Current Position</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </Box>
                <Button
                  variant={isOnline ? "outlined" : "contained"}
                  color={isOnline ? "error" : "success"}
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => setIsOnline(!isOnline)}
                  startIcon={isOnline ? <CheckCircle /> : <Timer />}
                >
                  {isOnline ? "Go Offline" : "Go Online"}
                </Button>
              </CardContent>
            </Card>

            {rideData && rideStatus !== "idle" && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Current Ride with {rideData.passengerName}
                  </Typography>

                  <Stepper
                    activeStep={rideStep}
                    alternativeLabel
                    sx={{ mb: 3 }}
                  >
                    {["Accepted", "Arrived", "In Progress", "Completed"].map(
                      (label) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      )
                    )}
                  </Stepper>

                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1" fontWeight={500}>
                        <LocationOn
                          color="primary"
                          sx={{ verticalAlign: "middle", mr: 1 }}
                        />
                        {rideData.pickup}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        ml={3.5}
                      >
                        Pickup Location
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1" fontWeight={500}>
                        <FlagIcon
                          color="success"
                          sx={{ verticalAlign: "middle", mr: 1 }}
                        />
                        {rideData.dropoff}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        ml={3.5}
                      >
                        Dropoff Location
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body1" fontWeight={500}>
                        <Money
                          color="primary"
                          sx={{ verticalAlign: "middle", mr: 1 }}
                        />
                        ৳{rideData.fare}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        ml={3.5}
                      >
                        Fare
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body1" fontWeight={500}>
                        <DirectionsCar
                          color="info"
                          sx={{ verticalAlign: "middle", mr: 1 }}
                        />
                        {rideData.distance}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        ml={3.5}
                      >
                        Distance
                      </Typography>
                    </Grid>
                  </Grid>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={nextRideStep}
                    disabled={rideStep === 3}
                  >
                    {
                      [
                        "Arrived at Pickup",
                        "Start Ride",
                        "Finish Ride",
                        "Completed",
                      ][rideStep]
                    }
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case "history":
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <History
                  color="primary"
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                Ride History
              </Typography>

              {rideHistory.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="text.secondary" mb={2}>
                    You haven't completed any rides yet
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DirectionsCar />}
                    onClick={() => setIsOnline(true)}
                  >
                    Go Online to Get Rides
                  </Button>
                </Paper>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ bgcolor: "background.default" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Trip</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Date & Time
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">
                          Fare
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rideHistory.map((ride, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography fontWeight={500}>
                              {ride.pickup || "Unknown"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              to {ride.dropoff || "Unknown"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography>
                              {new Date(
                                ride.timestamp || ride.date
                              ).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(
                                ride.timestamp || ride.date
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600}>
                              ৳{(ride.fare || 0).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ride.status || "Completed"}
                              color={
                                (ride.status || "Completed") === "Completed"
                                  ? "success"
                                  : (ride.status || "Completed") === "Cancelled"
                                  ? "error"
                                  : "default"
                              }
                              size="small"
                            />
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

      case "earnings":
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <Payments
                  color="primary"
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                Earnings Summary
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{ bgcolor: "success.light", color: "success.dark" }}
                  >
                    <CardContent>
                      <Typography variant="body2">Total Earnings</Typography>
                      <Typography variant="h4" fontWeight={700}>
                        ৳{driverEarnings.toFixed(2)}
                      </Typography>
                      <Typography variant="caption">
                        All time earnings
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2">Recent Earnings</Typography>
                      <Typography variant="h5" fontWeight={600} mb={1}>
                        ৳{(rideHistory[0]?.fare || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="caption">
                        Last ride on{" "}
                        {rideHistory[0]
                          ? new Date(
                              rideHistory[0].timestamp
                            ).toLocaleDateString()
                          : "No rides yet"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="body1" fontWeight={600} mb={2}>
                        Earnings Breakdown
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Date
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Trip
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }} align="right">
                                Earnings
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rideHistory.slice(0, 5).map((ride, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {new Date(
                                    ride.timestamp || ride.date
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {ride.pickup} to {ride.dropoff}
                                </TableCell>
                                <TableCell align="right">
                                  ৳{(ride.fare || 0).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                            {rideHistory.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} align="center">
                                  No ride history available
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case "profile":
        return (
          <Card>
            <CardContent>
              <Box textAlign="center" mb={4}>
                <Avatar
                  src={picture}
                  sx={{
                    width: 100,
                    height: 100,
                    mx: "auto",
                    mb: 2,
                    border: "3px solid",
                    borderColor: "primary.main",
                  }}
                />
                <Typography variant="h5" fontWeight={700}>
                  {fullName}
                </Typography>
                <Chip
                  icon={<VerifiedUser fontSize="small" />}
                  label="Verified Driver"
                  color="primary"
                  sx={{ mt: 1, mb: 1 }}
                />
                <Typography color="text.secondary">
                  <Star sx={{ color: "gold", verticalAlign: "middle" }} />{" "}
                  {rating} ({totalRides} rides)
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} mb={2}>
                        Personal Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Phone color="primary" />
                          </ListItemIcon>
                          <ListItemText primary="Phone" secondary={phone} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Email color="primary" />
                          </ListItemIcon>
                          <ListItemText primary="Email" secondary={email} />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Driver Since"
                            secondary={joinedDate}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} mb={2}>
                        Vehicle Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <DirectionsCarFilled color="info" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Vehicle Type"
                            secondary={vehicleType}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Model"
                            secondary={vehicleModel}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="License Plate"
                            secondary={licensePlate}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Color"
                            secondary={vehicleColor}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box textAlign="center" mt={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate("/profile/edit")}
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // Modals
  const RideOfferModal = (
    <Modal open={showOfferModal} onClose={handleRejectRide}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          outline: "none",
        }}
      >
        <Box textAlign="center" mb={3}>
          <Avatar
            src={rideOffer?.passengerPhoto}
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              border: "2px solid",
              borderColor: "primary.main",
            }}
          />
          <Typography variant="h6" fontWeight={600}>
            New Ride Request!
          </Typography>
          <Typography color="text.secondary">
            {rideOffer?.passengerName || "Passenger"}
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography>
            <LocationOn
              color="primary"
              sx={{ verticalAlign: "middle", mr: 1 }}
            />
            <strong>Pickup:</strong> {rideOffer?.pickup}
          </Typography>
          <Typography>
            <FlagIcon color="success" sx={{ verticalAlign: "middle", mr: 1 }} />
            <strong>Dropoff:</strong> {rideOffer?.dropoff}
          </Typography>
          <Typography>
            <AttachMoney sx={{ verticalAlign: "middle", mr: 1 }} />
            <strong>Fare:</strong> ৳{rideOffer?.fare}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={(offerTimer / RIDE_OFFER_TIMEOUT) * 100}
          sx={{ height: 8, borderRadius: 4, mb: 2 }}
          color={offerTimer <= 5 ? "error" : "primary"}
        />
        <Typography
          align="center"
          color={offerTimer <= 5 ? "error" : "text.secondary"}
        >
          Respond in {offerTimer}s
        </Typography>

        <Box mt={3} display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectRide}
            sx={{ flex: 1 }}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleAcceptRide}
            sx={{ flex: 1 }}
          >
            Accept
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  const RatingModal = (
    <Modal open={showRatingModal} onClose={() => setShowRatingModal(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 350,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          outline: "none",
          textAlign: "center",
        }}
      >
        <Typography variant="h6" mb={2}>
          Rate Your Passenger
        </Typography>
        <Typography color="text.secondary" mb={3}>
          How was your ride with {rideData?.passengerName}?
        </Typography>

        <Rating
          value={passengerRating}
          onChange={(event, newValue) => setPassengerRating(newValue)}
          size="large"
          sx={{ fontSize: "2.5rem", mb: 3 }}
        />

        <Button
          variant="contained"
          fullWidth
          disabled={!passengerRating}
          onClick={finishRide}
        >
          Submit Rating
        </Button>
      </Box>
    </Modal>
  );

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
            <Typography variant="h5" fontWeight={700}>
              {activeTab === "dashboard" && "Driver Dashboard"}
              {activeTab === "history" && "Ride History"}
              {activeTab === "earnings" && "Earnings"}
              {activeTab === "profile" && "My Profile"}
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ display: { md: "none" } }}
            >
              <Menu />
            </IconButton>
          </Box>

          {renderContent()}
        </Container>
      </Box>

      {RideOfferModal}
      {RatingModal}
    </Box>
  );
}
