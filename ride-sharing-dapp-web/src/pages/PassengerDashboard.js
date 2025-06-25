import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Divider,
  Chip,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  SwapVert as SwapVertIcon,
  MyLocation as MyLocationIcon,
  DirectionsCar as DirectionsCarIcon,
  Bolt as SurgeIcon,
  Schedule as ScheduleIcon,
  LocalTaxi as RideTypeIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { styled } from "@mui/material/styles";
import FlagIcon from "@mui/icons-material/Flag";

import LocationInputPanel from "../components/LocationInputPanel";
import RideSummaryDrawer from "../components/RideSummaryDrawer";
import VehicleSelectionPanel from "../components/VehicleSelectionPanel";
import fareRates from "../config/fareConfig";
import MapLibreMap from "../components/MapLibreMap";
import { reverseGeocode } from "../utils/geoUtils";

// ---- Styled UI Components ----
const ColorfulPaper = styled(Paper)(({ theme }) => ({
  background: "linear-gradient(145deg, #ffffff, #f5f9ff)",
  border: "1px solid rgba(145, 158, 171, 0.12)",
  backdropFilter: "blur(8px)",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  overflow: "hidden",
}));

const GradientButton = styled(IconButton)(({ theme }) => ({
  background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
  color: "white",
  "&:hover": {
    background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)",
  },
}));

export const ConfirmRideButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
  "&:hover": {
    background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)",
  },

  color: "white",
  fontWeight: "bold",
  fontSize: "1rem",
  borderRadius: "8px",
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  textTransform: "none",
  boxShadow: "0px 4px 15px rgba(58, 123, 213, 0.4)",
  "&:hover": {
    background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
    // borderBottom: "4px solid #43cea2",
  },
}));

// ---- Main Component ----
const PassengerDashboard = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [rideType, setRideType] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [distanceKm, setDistanceKm] = useState(null);
  const [mapSelectMode, setMapSelectMode] = useState("dropoff"); // or "pickup"
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("rideHistory")) || []
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const coords = [lng, lat];
        setPickupCoords(coords);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const label = data.display_name || "Current Location";
          setPickup(label);
        } catch {
          setPickup("Current Location");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      setSurgeMultiplier(1.0 + Math.random() * 0.5);
    }
  }, [pickupCoords, dropoffCoords]);

  useEffect(() => {
    window.setDropoffFromMap = async (coords) => {
      setDropoffCoords(coords);
      const [lng, lat] = coords;
      const label = await reverseGeocode(lat, lng);
      setDropoff(label);
    };

    return () => {
      window.setDropoffFromMap = null; // Cleanup on unmount
    };
  }, []);

  const swapLocations = () => {
    if (!pickup || !dropoff) return;
    const tempLabel = pickup;
    const tempCoords = pickupCoords;
    setPickup(dropoff);
    setPickupCoords(dropoffCoords);
    setDropoff(tempLabel);
    setDropoffCoords(tempCoords);
  };

  const fetchSuggestions = async (input, setOptions) => {
    if (!input) return setOptions([]);
    try {
      const res = await axios.get("https://photon.komoot.io/api", {
        params: { q: input, limit: 5 },
      });
      const options =
        res.data.features?.map((feature) => ({
          label:
            feature.properties.name +
            ", " +
            (feature.properties.city || feature.properties.country || ""),
          coords: feature.geometry.coordinates,
        })) || [];
      setOptions(options);
    } catch {
      setOptions([]);
    }
  };

  const fetchCoordinates = async (query, setAddress, setCoords) => {
    try {
      const res = await axios.get("https://photon.komoot.io/api", {
        params: { q: query, limit: 1 },
      });
      if (res.data.features?.length > 0) {
        const place = res.data.features[0];
        const label =
          place.properties.name +
          ", " +
          (place.properties.city || place.properties.country || "");
        const [lng, lat] = place.geometry.coordinates;
        setAddress(label);
        setCoords([lng, lat]);
      } else {
        toast.error("No results found");
      }
    } catch {
      toast.error("Location lookup failed");
    }
  };
  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      return data.display_name || "Selected Location";
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      return "Selected Location";
    }
  };

  const calculateFare = (distance) => {
    const numericDistance = parseFloat(distance);
    if (isNaN(numericDistance) || !rideType || !vehicleType) return 0;
    const baseRate = fareRates[vehicleType]?.[rideType] || 1.5;
    const flatFee = 5.0;
    const minFare = 30.0;
    const raw = numericDistance * baseRate * surgeMultiplier;
    return Math.max(raw + flatFee, minFare).toFixed(2);
  };
  const handleMapClick = (coords) => {
    setDropoffCoords(coords);
    reverseGeocode(coords[1], coords[0]).then(setDropoff);
  };

  const handlePickupClick = (coords) => {
    setPickupCoords(coords);
    reverseGeocode(coords[1], coords[0]).then(setPickup); // label
  };

  const handleConfirmRide = () => {
    if (!pickupCoords || !dropoffCoords) {
      toast.error("Please enter both pickup and dropoff locations.");
      return;
    }
    if (!rideType || !vehicleType) {
      toast.error("Please select both ride type and vehicle type.");
      return;
    }
    const fareAmount = calculateFare(distanceKm);
    const newRide = {
      pickup,
      dropoff,
      pickupLocation: { lat: pickupCoords[1], lng: pickupCoords[0] },
      dropoffLocation: { lat: dropoffCoords[1], lng: dropoffCoords[0] },
      rideType,
      vehicleType,
      distance: distanceKm,
      fare: fareAmount,
      surge: surgeMultiplier,
      timestamp: new Date().toISOString(),
      rideId: `RIDE-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      estimatedDuration: `${Math.ceil(
        (distanceKm / (vehicleSpeeds[vehicleType] || 30)) * 60
      )} mins`,
      driver: {
        name: "John Doe",
        rating: 4.8,
        photo: "https://randomuser.me/api/portraits/men/42.jpg",
        vehicle: {
          make:
            vehicleType === "Car"
              ? "Toyota"
              : vehicleType === "Bike"
              ? "Honda"
              : "Bajaj",
          model:
            vehicleType === "Car"
              ? "Camry"
              : vehicleType === "Bike"
              ? "CBR"
              : "RE",
          license: `${
            vehicleType === "Car" ? "C" : vehicleType === "Bike" ? "B" : "3"
          }${Math.random().toString().substr(2, 6)}`,
          color: ["Blue", "Red", "White", "Black"][
            Math.floor(Math.random() * 4)
          ],
        },
      },
    };
    const updatedHistory = [newRide, ...history.slice(0, 4)];
    localStorage.setItem("rideHistory", JSON.stringify(updatedHistory));
    localStorage.setItem("currentRide", JSON.stringify(newRide));
    setHistory(updatedHistory);
    localStorage.setItem("rideStatus", "searching");
    toast.success("Ride confirmed! Finding your driver...");
    navigate("/ride-in-progress");
  };
  const handleCancelRide = () => {
    setPickup("");
    setDropoff("");
    setPickupCoords(null);
    setDropoffCoords(null);
    setRideType("");
    setVehicleType("");
    setDistanceKm(null);
    setSummaryOpen(false);
    toast.info("Ride selection cancelled.");
  };

  const vehicleSpeeds = { Car: 30, Bike: 40, CNG: 25 };
  const eta =
    distanceKm && vehicleType
      ? `${Math.ceil(
          (distanceKm / (vehicleSpeeds[vehicleType] || 30)) * 60
        )} mins`
      : "--";
  const fare =
    distanceKm && rideType && vehicleType ? calculateFare(distanceKm) : "--";

  const locationsSelected = pickupCoords && dropoffCoords;
  const selectionsValid = rideType && vehicleType;

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background:
          "radial-gradient(circle at center, #f5f9ff 0%, #e3eafd 100%)",
      }}
    >
      <MapLibreMap
        mapRef={mapRef}
        pickupCoords={pickupCoords}
        dropoffCoords={dropoffCoords}
        setDistanceKm={setDistanceKm}
        onMapClick={handleMapClick}
        onPickupMapClick={handlePickupClick}
        mapSelectMode={mapSelectMode} // ✅ pass it
        mapInstanceRef={mapInstanceRef}
      />
      <Box
        sx={{
          position: "absolute",
          top: 80,
          right: 30,
          zIndex: 1200,
        }}
      >
        <Button
          variant="contained"
          onClick={() =>
            setMapSelectMode((prev) =>
              prev === "pickup" ? "dropoff" : "pickup"
            )
          }
          sx={{
            borderRadius: "8px",
            background:
              mapSelectMode === "pickup"
                ? "linear-gradient(45deg, #43cea2, #185a9d)"
                : "linear-gradient(45deg, #f7971e, #ffd200)",
            color: "white",
            fontWeight: "bold",
            textTransform: "none",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            "&:hover": {
              background:
                mapSelectMode === "pickup"
                  ? "linear-gradient(45deg, #185a9d, #43cea2)"
                  : "linear-gradient(45deg, #ffd200, #f7971e)",
            },
          }}
        >
          🎯 Now Selecting:{" "}
          {mapSelectMode === "pickup" ? "Pickup Location" : "Dropoff Location"}
        </Button>
      </Box>

      {/* Location Panel */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          position: "absolute",
          top: 20,
          left: { xs: 10, md: 20 },
          width: { xs: "95vw", sm: 410, md: 450 },
          zIndex: 1100,
        }}
      >
        <ColorfulPaper elevation={0}>
          <Box
            sx={{
              p: 2.5,
              background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
              borderBottom: "4px solid #43cea2",

              color: "white",
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <DirectionsCarIcon sx={{ color: "white" }} />
              <Typography fontWeight={800} fontSize="1.3rem">
                Book a Ride
              </Typography>
              {surgeMultiplier > 1.2 && (
                <Chip
                  icon={<SurgeIcon />}
                  label={`${surgeMultiplier.toFixed(1)}x SURGE`}
                  size="small"
                  sx={{
                    ml: "auto",
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: "bold",
                  }}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <GradientButton onClick={swapLocations} size="small">
                <SwapVertIcon fontSize="small" />
              </GradientButton>
              <GradientButton
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      const coords = [
                        pos.coords.longitude,
                        pos.coords.latitude,
                      ];
                      setPickupCoords(coords);
                      reverseGeocode(coords[1], coords[0]).then(setPickup);

                      setTimeout(() => {
                        if (mapInstanceRef.current && coords[0] && coords[1]) {
                          mapInstanceRef.current.flyTo({
                            center: coords,
                            zoom: 15,
                            speed: 1.2,
                            curve: 1.42,
                          });
                        }
                      }, 300); // Optional delay to ensure map is ready
                    });
                  }
                }}
                size="small"
              >
                <MyLocationIcon fontSize="small" />
              </GradientButton>

              <GradientButton size="small">
                <FlagIcon fontSize="small" color="secondary" />
              </GradientButton>

              <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
                {eta && (
                  <>
                    <ScheduleIcon color="primary" fontSize="small" />
                    <Typography variant="body2" color="text.secondary" ml={0.5}>
                      ~{eta}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>

            <LocationInputPanel
              pickup={pickup}
              dropoff={dropoff}
              pickupSuggestions={pickupSuggestions}
              dropoffSuggestions={dropoffSuggestions}
              onPickupChange={(val) => {
                setPickup(val);
                fetchSuggestions(val, setPickupSuggestions);
              }}
              onDropoffChange={(val) => {
                setDropoff(val);
                fetchSuggestions(val, setDropoffSuggestions);
              }}
              onPickupSelect={(val) => {
                if (!val) return;
                if (val.label && val.coords) {
                  setPickup(val.label);
                  setPickupCoords(val.coords);
                } else if (typeof val === "string") {
                  setPickup(val);
                  fetchCoordinates(val, setPickup, setPickupCoords);
                }
              }}
              onDropoffSelect={(val) => {
                if (!val) return;
                if (val.label && val.coords) {
                  setDropoff(val.label);
                  setDropoffCoords(val.coords);
                } else if (typeof val === "string") {
                  setDropoff(val);
                  fetchCoordinates(val, setDropoff, setDropoffCoords);
                }
              }}
              aria-label-pickup="Pickup Location"
              aria-label-dropoff="Dropoff Location"
            />
          </Box>
        </ColorfulPaper>
      </Box>

      <AnimatePresence>
        {locationsSelected && (
          <Box
            sx={{
              position: "absolute",
              bottom: 40,
              right: 30,
              width: 360,
              maxWidth: "90vw",
              zIndex: 1200,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              borderRadius: 4,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ColorfulPaper elevation={4}>
                <Box
                  sx={{
                    p: 2,
                    background:
                      "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                    borderBottom: "4px solid #43cea2",
                    color: "white",
                    borderTopLeftRadius: "18px",
                    borderTopRightRadius: "18px",
                  }}
                >
                  <Typography fontWeight={600}>
                    <RideTypeIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                    Select Vehicle & Ride Type
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <VehicleSelectionPanel
                    rideType={rideType}
                    onRideTypeChange={setRideType}
                    vehicleType={vehicleType}
                    onVehicleTypeChange={setVehicleType}
                    fare={fare}
                    eta={eta}
                    surgeMultiplier={surgeMultiplier}
                    onConfirmRide={handleConfirmRide}
                    onCancelRide={handleCancelRide}
                    disabled={!selectionsValid}
                    aria-label="Vehicle and Ride Type Selection Panel"
                  />
                </Box>
              </ColorfulPaper>
            </motion.div>
          </Box>
        )}
      </AnimatePresence>

      {/* RIDE SUMMARY - Bottom Left */}
      {/* Toggle Button */}

      <Box
        sx={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1300,
        }}
      >
        <Button
          size="small"
          variant="contained"
          onClick={() => setSummaryOpen((prev) => !prev)}
          sx={{
            background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
            color: "white",
            borderRadius: "20px",
            fontWeight: "bold",
            textTransform: "none",
            px: 2.5,
            py: 0.8,
          }}
        >
          {summaryOpen ? "Hide Summary" : "Show Summary"}
        </Button>
      </Box>

      <AnimatePresence>
        {summaryOpen && (
          <Box
            key="ride-summary"
            sx={{
              position: "absolute",
              bottom: 60, // above the toggle
              left: "50%",
              transform: "translateX(-50%)",
              width: { xs: "95vw", sm: 450 },
              zIndex: 1200,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: 4,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ColorfulPaper elevation={3}>
                <RideSummaryDrawer
                  pickup={pickup}
                  dropoff={dropoff}
                  rideType={rideType}
                  vehicleType={vehicleType}
                  distanceKm={distanceKm}
                  eta={eta}
                  fare={fare}
                  onConfirmRide={handleConfirmRide}
                  disabled={!selectionsValid}
                />
              </ColorfulPaper>
            </motion.div>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default PassengerDashboard;
