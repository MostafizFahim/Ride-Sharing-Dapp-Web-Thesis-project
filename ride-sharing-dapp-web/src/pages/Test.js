import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Divider,
  Chip,
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

import MapLibreMap from "../components/MapLibreMap";
import LocationInputPanel from "../components/LocationInputPanel";
import RideSummaryDrawer from "../components/RideSummaryDrawer";
import VehicleSelectionPanel from "../components/VehicleSelectionPanel";
import fareRates from "../config/fareConfig";

const ColorfulPaper = styled(Paper)(({ theme }) => ({
  background: "linear-gradient(145deg, #ffffff, #f5f9ff)",
  border: "1px solid rgba(145, 158, 171, 0.12)",
  backdropFilter: "blur(8px)",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  overflow: "hidden",
}));

const GradientButton = styled(IconButton)(({ theme }) => ({
  background: "linear-gradient(45deg, #3a7bd5, #00d2ff)",
  color: "white",
  "&:hover": {
    background: "linear-gradient(45deg, #00d2ff, #3a7bd5)",
  },
}));

const PassengerDashboard = () => {
  // ...same useState hooks as before...
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [rideType, setRideType] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [distanceKm, setDistanceKm] = useState(null);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("rideHistory")) || []
  );

  const navigate = useNavigate();

  useEffect(() => {
    // Center map on current location on mount
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

  // --- Place swap functionality here ---
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
    } catch (err) {
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

  const calculateFare = (distance) => {
    const numericDistance = parseFloat(distance);
    if (isNaN(numericDistance) || !rideType || !vehicleType) return 0;
    const baseRate = fareRates[vehicleType]?.[rideType] || 1.5;
    const flatFee = 5.0;
    const minFare = 30.0;
    const raw = numericDistance * baseRate * surgeMultiplier;
    return Math.max(raw + flatFee, minFare).toFixed(2);
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
      {/* MAP - Add colorful tiles option */}
      <MapLibreMap
        pickupCoords={pickupCoords}
        dropoffCoords={dropoffCoords}
        setDistanceKm={setDistanceKm}
        mapStyle="https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json"
      />

      {/* FLOATING PICKUP/DROPOFF PANEL - Enhanced with gradient */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          position: "absolute",
          top: 20,
          left: { xs: 10, md: 60 },
          width: { xs: "95vw", sm: 410, md: 450 },
          zIndex: 1100,
        }}
      >
        <ColorfulPaper elevation={0}>
          <Box
            sx={{
              p: 2.5,
              background: "linear-gradient(90deg, #3a7bd5, #00d2ff)",
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
              <GradientButton
                onClick={swapLocations}
                size="small"
                title="Swap Pickup & Dropoff"
              >
                <SwapVertIcon fontSize="small" />
              </GradientButton>
              <GradientButton
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setPickupCoords([
                        pos.coords.longitude,
                        pos.coords.latitude,
                      ]);
                    });
                  }
                }}
                size="small"
                title="Use My Location"
              >
                <MyLocationIcon fontSize="small" />
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
            />
          </Box>
        </ColorfulPaper>
      </Box>

      {/* VEHICLE SELECTION PANEL - Enhanced with card styling */}
      <AnimatePresence>
        {locationsSelected && (
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.35 }}
            style={{
              position: "absolute",
              right: 30,
              bottom: 100,
              zIndex: 1200,
              width: 340,
              maxWidth: "90vw",
            }}
          >
            <ColorfulPaper elevation={0}>
              <Box
                sx={{
                  p: 2,
                  background: "linear-gradient(90deg, #3a7bd5, #00d2ff)",
                  color: "white",
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              >
                <Typography fontWeight={600}>
                  <RideTypeIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                  Select Vehicle
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
                  disabled={!selectionsValid}
                />
              </Box>
            </ColorfulPaper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUMMARY DRAWER - Enhanced with gradient */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          right: 20,
          width: { xs: "95vw", sm: 380 },
          zIndex: 1100,
        }}
      >
        <ColorfulPaper>
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
      </Box>
    </Box>
  );
};

export default PassengerDashboard;
