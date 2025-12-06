import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
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
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  DirectionsCar,
  Star,
  VerifiedUser,
  DirectionsCarFilled,
  Phone,
  Email,
  AttachMoney,
  LocationOn,
  Timer,
  History,
  CheckCircle,
  Dashboard,
  Person,
  TrendingUp,
  Schedule,
  LocalAtm,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import FlagIcon from "@mui/icons-material/Flag";
import { useUser } from "../components/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getRideSharingContract } from "../utils/web3";

// ---- DRIVER-SPECIFIC LOCALSTORAGE KEYS ----
const DRIVER_RIDE_STATUS_KEY = "driverRideStatus";
const DRIVER_CURRENT_RIDE_KEY = "driverCurrentRide";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom driver icon
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

const RIDE_OFFER_TIMEOUT = 25;

// status mapping shared with passenger side:
// idle | searching | driver_assigned | in_progress | completed | cancelled | arrived
const statusToStep = (status) => {
  switch (status) {
    case "driver_assigned":
      return 0;
    case "arrived":
      return 1;
    case "in_progress":
      return 2;
    case "completed":
      return 3;
    default:
      return 0;
  }
};

// Simple Map Component with error handling
const SimpleMap = ({ center, driverPosition }) => {
  const [map, setMap] = useState(null);

  // Default center (Dhaka coordinates)
  const defaultCenter = [23.8103, 90.4125];

  return (
    <MapContainer
      center={center || defaultCenter}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      whenCreated={setMap}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {driverPosition && (
        <Marker
          position={[driverPosition.lat, driverPosition.lng]}
          icon={driverIcon}
        >
          <Popup>
            <Typography variant="body2">
              <strong>Your Current Position</strong>
            </Typography>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default function DriverDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useUser();
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

  // ---- STATE ----
  const [isOnline, setIsOnline] = useState(
    localStorage.getItem("driverOnline") === "true"
  );
  const [rideOffer, setRideOffer] = useState(null);
  const [offerTimer, setOfferTimer] = useState(RIDE_OFFER_TIMEOUT);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const [rideStatus, setRideStatus] = useState("idle");
  const [rideData, setRideData] = useState(null);
  const [rideStep, setRideStep] = useState(0);

  const [driverPosition, setDriverPosition] = useState(null);
  const [rideHistory, setRideHistory] = useState(
    JSON.parse(localStorage.getItem("driverRideHistory") || "[]")
  );
  const [driverEarnings, setDriverEarnings] = useState(
    parseFloat(localStorage.getItem("driverEarnings")) || 0
  );
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [passengerRating, setPassengerRating] = useState(null);
  const [mapKey, setMapKey] = useState(Date.now()); // Key to force map re-render

  const watchIdRef = useRef(null);
  const offerTimerRef = useRef(null);

  const joinedDate = dateOfBirth
    ? new Date(dateOfBirth).toLocaleDateString()
    : new Date().toLocaleDateString();

  // ---- REHYDRATE DRIVER RIDE STATE ON MOUNT ----
  useEffect(() => {
    try {
      const storedStatus =
        localStorage.getItem(DRIVER_RIDE_STATUS_KEY) || "idle";
      const storedRide =
        JSON.parse(localStorage.getItem(DRIVER_CURRENT_RIDE_KEY) || "null") ||
        null;

      const sharedStatus = localStorage.getItem("rideStatus") || "idle";
      const sharedRide =
        JSON.parse(localStorage.getItem("currentRide") || "null") || null;

      const DRIVER_RELEVANT_STATUSES = new Set([
        "driver_assigned",
        "arrived",
        "in_progress",
        "completed",
        "cancelled",
      ]);

      let finalStatus = storedStatus;
      let finalRide = storedRide;

      if (
        !storedRide &&
        sharedRide &&
        DRIVER_RELEVANT_STATUSES.has(sharedStatus)
      ) {
        finalStatus = sharedStatus;
        finalRide = sharedRide;
      }

      setRideStatus(finalStatus);
      setRideData(finalRide);
    } catch (e) {
      console.error("Failed to rehydrate driver ride state:", e);
    }
  }, []);

  // Calculate real-time stats from localStorage data
  const calculateTodayStats = () => {
    const today = new Date().toDateString();
    let todayEarnings = 0;
    let todayRides = 0;

    rideHistory.forEach((ride) => {
      const rideDate = new Date(ride.timestamp || ride.date).toDateString();
      if (rideDate === today) {
        todayRides++;
        const fare = parseFloat(ride.fare) || 0;
        todayEarnings += fare;
      }
    });

    return { todayEarnings, todayRides };
  };

  const { todayEarnings, todayRides } = calculateTodayStats();

  // ---- KEEP rideStep IN SYNC WHEN STATUS CHANGES ----
  useEffect(() => {
    setRideStep(statusToStep(rideStatus));
  }, [rideStatus]);

  // ---- GEOLOCATION TRACKING ----
  useEffect(() => {
    if (isOnline && "geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setDriverPosition(pos);
          setMapKey(Date.now());

          const sharedRide = JSON.parse(
            localStorage.getItem("currentRide") || "null"
          );
          if (sharedRide) {
            const updatedShared = { ...sharedRide, driverLocation: pos };
            localStorage.setItem("currentRide", JSON.stringify(updatedShared));
          }

          const driverRide = JSON.parse(
            localStorage.getItem(DRIVER_CURRENT_RIDE_KEY) || "null"
          );
          if (driverRide) {
            const updatedDriverRide = { ...driverRide, driverLocation: pos };
            localStorage.setItem(
              DRIVER_CURRENT_RIDE_KEY,
              JSON.stringify(updatedDriverRide)
            );
            setRideData(updatedDriverRide);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          toast.error("Failed to get location: " + err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else if ("geolocation" in navigator && watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    return () => {
      if ("geolocation" in navigator && watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isOnline]);

  // ---- RIDE REQUEST POLLING (pull from passenger localStorage) ----
  useEffect(() => {
    if (!isOnline) return;

    const checkForRides = () => {
      try {
        const passengerRide = JSON.parse(
          localStorage.getItem("currentRide") || "null"
        );
        const rideState = localStorage.getItem("rideStatus");
        const driverState =
          localStorage.getItem(DRIVER_RIDE_STATUS_KEY) || "idle";

        // driver is busy -> ignore
        if (driverState !== "idle" || rideData) return;

        if (
          passengerRide &&
          rideState === "searching" &&
          !passengerRide.driverAccepted
        ) {
          // only open modal once
          if (!showOfferModal) {
            setRideOffer(passengerRide);
            setOfferTimer(RIDE_OFFER_TIMEOUT);
            setShowOfferModal(true);
          }
        }
      } catch (error) {
        console.error("Error checking for rides:", error);
      }
    };

    const interval = setInterval(checkForRides, 3000);
    // run immediately once so you don't wait for first 3s tick
    checkForRides();

    return () => clearInterval(interval);
  }, [isOnline, showOfferModal, rideData]);

  // ---- RIDE OFFER TIMER ----
  useEffect(() => {
    if (!showOfferModal) {
      if (offerTimerRef.current) {
        clearInterval(offerTimerRef.current);
        offerTimerRef.current = null;
      }
      return;
    }

    offerTimerRef.current = setInterval(() => {
      setOfferTimer((prev) => {
        if (prev <= 1) {
          handleRejectRide();
          return RIDE_OFFER_TIMEOUT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (offerTimerRef.current) {
        clearInterval(offerTimerRef.current);
        offerTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOfferModal]);

  // ---- HANDLERS ----

  const handleToggleOnline = () => {
    const next = !isOnline;
    setIsOnline(next);
    localStorage.setItem("driverOnline", String(next));

    // when going online, ensure driver status is idle if no active ride
    if (next) {
      const hasCurrentDriverRide = localStorage.getItem(
        DRIVER_CURRENT_RIDE_KEY
      );
      if (!hasCurrentDriverRide) {
        setRideStatus("idle");
        localStorage.setItem(DRIVER_RIDE_STATUS_KEY, "idle");
      }
      toast.success("You're now online and ready to accept rides!");
    } else {
      toast.info("You're now offline");
    }
  };

  const handleAcceptRide = async () => {
    if (!rideOffer) return;

    const currentRideId = localStorage.getItem("currentRideId");
    if (!currentRideId) {
      toast.error("No on-chain rideId found for this request.");
      return;
    }

    try {
      const contract = await getRideSharingContract(true);
      toast.info("Accepting ride on-chain…");
      const tx = await contract.matchRide(currentRideId);
      await tx.wait();
      toast.success("Ride accepted on-chain.");
    } catch (err) {
      console.error("matchRide failed:", err);
      toast.error(`Failed to accept ride: ${err.message || err.toString()}`);
      return;
    }

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
      status: "driver_assigned",
      driverLocation: driverPosition || rideOffer.pickupLocation || null,
    };

    // DRIVER-SPECIFIC STATE
    localStorage.setItem(DRIVER_CURRENT_RIDE_KEY, JSON.stringify(updatedRide));
    localStorage.setItem(DRIVER_RIDE_STATUS_KEY, "driver_assigned");

    // SHARED STATE FOR PASSENGER SIDE
    localStorage.setItem("currentRide", JSON.stringify(updatedRide));
    localStorage.setItem("rideStatus", "driver_assigned");

    setShowOfferModal(false);
    setRideData(updatedRide);
    setRideStatus("driver_assigned");
    setRideStep(0);
    setRideOffer(null);

    toast.success(`Ride accepted! Heading to ${rideOffer.pickup}`);
  };

  const handleRejectRide = () => {
    setShowOfferModal(false);
    setRideOffer(null);
    setOfferTimer(RIDE_OFFER_TIMEOUT); // reset timer
    setRideStatus("idle");

    localStorage.setItem(DRIVER_RIDE_STATUS_KEY, "idle");
    // shared status back to idle so passenger knows it was rejected
    localStorage.setItem("rideStatus", "idle");

    toast.info("Ride request declined");
  };

  const nextRideStep = async () => {
    if (rideStep >= 3 || !rideData) return;

    const currentRideId = localStorage.getItem("currentRideId");
    const statuses = ["driver_assigned", "arrived", "in_progress", "completed"];

    if (!currentRideId) {
      toast.warn("No on-chain rideId found. Updating local status only.");
    }

    try {
      if (currentRideId) {
        const contract = await getRideSharingContract(true);

        // 0->1: Arrived (UI only)
        // 1->2: startRide()
        // 2->3: completeRide()
        if (rideStep === 1) {
          toast.info("Starting ride on-chain…");
          const tx = await contract.startRide(currentRideId);
          await tx.wait();
          toast.success("Ride started on-chain.");
        } else if (rideStep === 2) {
          toast.info("Completing ride on-chain…");
          const tx = await contract.completeRide(currentRideId);
          await tx.wait();
          toast.success("Ride completed on-chain.");
        }
      }

      const nextStep = Math.min(rideStep + 1, 3);
      const nextStatus = statuses[nextStep];

      setRideStep(nextStep);
      setRideStatus(nextStatus);

      localStorage.setItem(DRIVER_RIDE_STATUS_KEY, nextStatus);
      localStorage.setItem("rideStatus", nextStatus); // shared

      const updatedRide = {
        ...rideData,
        status: nextStatus,
        driverLocation: driverPosition || rideData.driverLocation || null,
      };
      setRideData(updatedRide);
      localStorage.setItem(
        DRIVER_CURRENT_RIDE_KEY,
        JSON.stringify(updatedRide)
      );
      localStorage.setItem("currentRide", JSON.stringify(updatedRide));

      if (nextStatus === "completed") {
        setShowRatingModal(true);
      }
    } catch (err) {
      console.error("Ride step tx failed:", err);
      toast.error(
        `Failed to update on-chain status: ${err.message || err.toString()}`
      );
    }
  };

  const finishRide = () => {
    if (!rideData) {
      setShowRatingModal(false);
      return;
    }

    const earnings = parseFloat(rideData?.fare) || 0;
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

    // ✅ clear driver-specific ride only
    localStorage.removeItem(DRIVER_CURRENT_RIDE_KEY);
    localStorage.setItem(DRIVER_RIDE_STATUS_KEY, "idle");

    // ❌ DO NOT clear shared ride here;
    // passenger still needs to see completed ride + pay button

    setRideData(null);
    setRideStatus("idle");
    setRideStep(0);
    setShowRatingModal(false);
    setPassengerRating(null);

    toast.success(`Ride completed! Earned ৳${earnings.toFixed(2)}`);
  };

  // ---- MODERN STATS CARD ----
  const StatsCard = ({ icon, title, value, subtitle, color = "primary" }) => (
    <Card
      sx={{
        height: "100%",
        background: "white",
        borderRadius: 3,
        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
        border: "1px solid rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 30px 0 rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              width: 60,
              height: 60,
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  // ---- TAB NAVIGATION ----
  const TabNavigation = (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          "& .MuiTab-root": {
            fontWeight: 600,
            fontSize: "1rem",
            minWidth: 120,
            py: 2,
            mx: 1,
          },
        }}
      >
        <Tab
          value="dashboard"
          label="Dashboard"
          icon={<Dashboard />}
          iconPosition="start"
        />
        <Tab
          value="history"
          label="Ride History"
          icon={<History />}
          iconPosition="start"
        />
        <Tab
          value="profile"
          label="Profile"
          icon={<Person />}
          iconPosition="start"
        />
      </Tabs>
    </Box>
  );

  // ---- MAIN TAB RENDER ----
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Box>
            {/* Stats Overview */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={3}>
                <StatsCard
                  icon={<LocalAtm />}
                  title="Total Earnings"
                  value={`৳${parseFloat(driverEarnings).toFixed(2)}`}
                  subtitle="All time earnings"
                  color="success"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatsCard
                  icon={<DirectionsCar />}
                  title="Total Rides"
                  value={rideHistory.length}
                  subtitle="Completed rides"
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatsCard
                  icon={<TrendingUp />}
                  title="Today's Earnings"
                  value={`৳${parseFloat(todayEarnings).toFixed(2)}`}
                  subtitle="From today's rides"
                  color="info"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatsCard
                  icon={<Schedule />}
                  title="Today's Rides"
                  value={todayRides}
                  subtitle="Rides completed today"
                  color="warning"
                />
              </Grid>
            </Grid>

            {/* Map and Status Section */}
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
                    mb: 3,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      mb={2}
                      color="text.primary"
                    >
                      Live Location Tracking
                    </Typography>
                    <Box
                      sx={{ height: 400, borderRadius: 2, overflow: "hidden" }}
                    >
                      <SimpleMap
                        key={mapKey}
                        center={
                          driverPosition
                            ? [driverPosition.lat, driverPosition.lng]
                            : null
                        }
                        driverPosition={driverPosition}
                      />
                    </Box>
                    <Box
                      sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {driverPosition
                          ? `Current location: ${driverPosition.lat.toFixed(
                              6
                            )}, ${driverPosition.lng.toFixed(6)}`
                          : "Location not available. Please enable location services."}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                {/* Online Status Card */}
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
                    mb: 3,
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: isOnline
                          ? "linear-gradient(135deg, #4CAF50, #8BC34A)"
                          : "linear-gradient(135deg, #f44336, #FF9800)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      {isOnline ? (
                        <CheckCircle sx={{ fontSize: 40, color: "white" }} />
                      ) : (
                        <Timer sx={{ fontSize: 40, color: "white" }} />
                      )}
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="text.primary"
                      gutterBottom
                    >
                      {isOnline ? "You're Online" : "You're Offline"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      {isOnline
                        ? "Ready to accept ride requests"
                        : "Go online to start receiving rides"}
                    </Typography>
                    <Button
                      variant={isOnline ? "outlined" : "contained"}
                      color={isOnline ? "error" : "success"}
                      fullWidth
                      onClick={handleToggleOnline}
                      startIcon={isOnline ? <CheckCircle /> : <Timer />}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        py: 1.5,
                      }}
                    >
                      {isOnline ? "Go Offline" : "Go Online"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      mb={2}
                      color="text.primary"
                    >
                      Performance Summary
                    </Typography>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Average Rating
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Star sx={{ color: "gold", mr: 0.5 }} />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                          >
                            {rating}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Completion Rate
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="text.primary"
                        >
                          {rideHistory.length > 0 ? "100%" : "0%"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Response Time
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="text.primary"
                        >
                          {isOnline ? "< 2min" : "N/A"}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Current Ride Section */}
            {rideData &&
              rideStatus !== "idle" &&
              rideStatus !== "completed" && (
                <Card
                  sx={{
                    mt: 3,
                    borderRadius: 3,
                    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      mb={2}
                      color="text.primary"
                    >
                      Active Ride with {rideData.passengerName || "Passenger"}
                    </Typography>

                    <Stepper
                      activeStep={rideStep}
                      alternativeLabel
                      sx={{ mb: 4 }}
                    >
                      {[
                        "Driver Assigned",
                        "Arrived",
                        "In Progress",
                        "Completed",
                      ].map((label) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>

                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={12} md={6}>
                        <Card
                          variant="outlined"
                          sx={{ background: "rgba(0,0,0,0.02)" }}
                        >
                          <CardContent>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Pickup Location
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={500}
                              color="text.primary"
                            >
                              <LocationOn
                                sx={{
                                  verticalAlign: "middle",
                                  mr: 1,
                                  color: "primary.main",
                                }}
                              />
                              {rideData.pickup}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card
                          variant="outlined"
                          sx={{ background: "rgba(0,0,0,0.02)" }}
                        >
                          <CardContent>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Dropoff Location
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={500}
                              color="text.primary"
                            >
                              <FlagIcon
                                sx={{
                                  verticalAlign: "middle",
                                  mr: 1,
                                  color: "success.main",
                                }}
                              />
                              {rideData.dropoff}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card
                          variant="outlined"
                          sx={{ background: "rgba(0,0,0,0.02)" }}
                        >
                          <CardContent>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Fare
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={500}
                              color="text.primary"
                            >
                              <AttachMoney
                                sx={{
                                  verticalAlign: "middle",
                                  mr: 1,
                                  color: "warning.main",
                                }}
                              />
                              ৳{parseFloat(rideData.fare || 0).toFixed(2)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card
                          variant="outlined"
                          sx={{ background: "rgba(0,0,0,0.02)" }}
                        >
                          <CardContent>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Distance
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={500}
                              color="text.primary"
                            >
                              <DirectionsCar
                                sx={{
                                  verticalAlign: "middle",
                                  mr: 1,
                                  color: "info.main",
                                }}
                              />
                              {rideData.distance}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={nextRideStep}
                      disabled={rideStep === 3}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                      }}
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
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                fontWeight={600}
                mb={3}
                color="text.primary"
              >
                Ride History
              </Typography>

              {rideHistory.length === 0 ? (
                <Paper
                  sx={{
                    p: 6,
                    textAlign: "center",
                    background: "rgba(0,0,0,0.02)",
                  }}
                >
                  <DirectionsCar
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" mb={2}>
                    No rides completed yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Start driving to see your ride history here
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      setActiveTab("dashboard");
                      setIsOnline(true);
                      localStorage.setItem("driverOnline", "true");
                      localStorage.setItem(DRIVER_RIDE_STATUS_KEY, "idle");
                    }}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    Go Online
                  </Button>
                </Paper>
              ) : (
                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: 2,
                    boxShadow: "none",
                  }}
                >
                  <Table>
                    <TableHead sx={{ background: "rgba(0,0,0,0.02)" }}>
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
                            <Typography fontWeight={500} color="text.primary">
                              {ride.pickup || "Unknown"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              to {ride.dropoff || "Unknown"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography color="text.primary">
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
                            <Typography fontWeight={600} color="success.main">
                              ৳{parseFloat(ride.fare || 0).toFixed(2)}
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
                              sx={{ fontWeight: 500 }}
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

      case "profile":
        return (
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box textAlign="center" mb={4}>
                <Avatar
                  src={picture}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 3,
                    border: "4px solid",
                    borderColor: "primary.main",
                  }}
                />
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {fullName}
                </Typography>
                <Chip
                  icon={<VerifiedUser fontSize="small" />}
                  label="Verified Driver"
                  color="primary"
                  sx={{ mt: 2, mb: 2, fontWeight: 600 }}
                />
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={1}
                >
                  <Star sx={{ color: "gold" }} />
                  <Typography variant="h6" color="text.primary">
                    {rating}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    ({rideHistory.length || totalRides} rides)
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        mb={2}
                        color="text.primary"
                      >
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
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        mb={2}
                        color="text.primary"
                      >
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

              <Box textAlign="center" mt={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/profile/edit")}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                  }}
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

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", background: "#f8f9fa" }}>
      <Box component="main" sx={{ p: 3 }}>
        <Container maxWidth="xl">
          <Box mb={4}>
            <Typography
              variant="h4"
              fontWeight={700}
              color="text.primary"
              gutterBottom
            >
              {activeTab === "dashboard" && "Driver Dashboard"}
              {activeTab === "history" && "Ride History"}
              {activeTab === "profile" && "My Profile"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {activeTab === "dashboard" &&
                "Manage your rides and track your performance"}
              {activeTab === "history" &&
                "View your complete ride history and earnings"}
              {activeTab === "profile" &&
                "Manage your driver profile and vehicle information"}
            </Typography>
          </Box>

          {TabNavigation}
          {renderContent()}
        </Container>
      </Box>

      {/* Ride Offer Modal */}
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
            borderRadius: 3,
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
                border: "3px solid",
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
              <FlagIcon
                color="success"
                sx={{ verticalAlign: "middle", mr: 1 }}
              />
              <strong>Dropoff:</strong> {rideOffer?.dropoff}
            </Typography>
            <Typography>
              <AttachMoney sx={{ verticalAlign: "middle", mr: 1 }} />
              <strong>Fare:</strong> ৳
              {parseFloat(rideOffer?.fare || 0).toFixed(2)}
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
              variant="outlined"
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

      {/* Passenger Rating Modal */}
      <Modal open={showRatingModal} onClose={finishRide}>
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
            borderRadius: 3,
            outline: "none",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={2}>
            Rate Your Passenger
          </Typography>
          <Typography color="text.secondary" mb={3}>
            How was your ride with {rideData?.passengerName || "the passenger"}?
          </Typography>

          <Rating
            value={passengerRating}
            onChange={(event, newValue) => setPassengerRating(newValue)}
            size="large"
            sx={{ fontSize: "3rem", mb: 3 }}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={!passengerRating}
            onClick={finishRide}
            sx={{
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Submit Rating
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
