import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Button,
  CircularProgress,
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

import { useUser } from "../components/UserContext";
import { getRideSharingContract } from "../utils/web3";
import { ethers } from "ethers";

const DEFAULT_DRIVER_ADDRESS = "0xc5116c11148c3d76f527d310f5142e3ff84745cf";

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
}));

const PassengerDashboard = () => {
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
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("rideHistory")) || []
  );
  const [bookingLoading, setBookingLoading] = useState(false);

  const { account } = useUser();
  const navigate = useNavigate();

  // Auto-set pickup to current location
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

  /* ----------------------------------------------
   ✅ FIXED FARE CALCULATION (now correct)
  ---------------------------------------------- */
  const calculateFare = (distance) => {
    const numericDistance = Number(distance);
    if (
      !Number.isFinite(numericDistance) ||
      numericDistance <= 0 ||
      !rideType ||
      !vehicleType
    ) {
      return null;
    }

    const perKmRate = fareRates[vehicleType]?.[rideType];
    if (!perKmRate) return null;

    const baseFee = 5; // flat
    const minFare = 30;

    let rawFare = numericDistance * perKmRate * surgeMultiplier + baseFee;

    if (rawFare < minFare) rawFare = minFare;

    return rawFare;
  };

  const vehicleSpeeds = { Car: 30, Bike: 40, CNG: 25 };

  const hasDistance =
    typeof distanceKm === "number" && !Number.isNaN(distanceKm);

  const eta =
    hasDistance && vehicleType
      ? `${Math.ceil(
          (distanceKm / (vehicleSpeeds[vehicleType] || 30)) * 60
        )} mins`
      : "--";

  /* ----------------------------------------------
   Fare Value + Display Fare
  ---------------------------------------------- */
  const fareValue =
    hasDistance && rideType && vehicleType ? calculateFare(distanceKm) : null;

  const fare = fareValue !== null ? fareValue.toFixed(2) : "--";

  const locationsSelected = pickupCoords && dropoffCoords;
  const selectionsValid = rideType && vehicleType;
  const canConfirmRide =
    locationsSelected && selectionsValid && hasDistance && !bookingLoading;

  /* ----------------------------------------------
   BLOCKCHAIN CONFIRM RIDE
  ---------------------------------------------- */
  const handleConfirmRide = async () => {
    if (!pickupCoords || !dropoffCoords) {
      toast.error("Please enter both pickup and dropoff locations.");
      return;
    }
    if (!rideType || !vehicleType) {
      toast.error("Please select both ride type and vehicle type.");
      return;
    }
    if (!hasDistance) {
      toast.error("Waiting for route distance. Please try again in a moment.");
      return;
    }
    if (!account) {
      toast.error("Please connect your wallet first.");
      return;
    }

    let driverAddress;
    try {
      driverAddress = ethers.getAddress(DEFAULT_DRIVER_ADDRESS);
    } catch {
      toast.error("Configured driver address is invalid.");
      return;
    }

    setBookingLoading(true);

    try {
      const fareBDT = calculateFare(distanceKm);

      if (!fareBDT || Number.isNaN(fareBDT)) {
        toast.error("Calculated fare is invalid.");
        return;
      }

      const displayFare = fareBDT.toFixed(2);

      const ETH_PER_BDT = 1e-4;
      const fareEth = fareBDT * ETH_PER_BDT;

      const fareWei = ethers.parseEther(fareEth.toFixed(6));

      const metadataURI = `ipfs://ride-${Date.now()}`;
      const contract = await getRideSharingContract(true);

      const tx = await contract.requestRide(
        driverAddress,
        fareWei,
        metadataURI
      );

      toast.info("Ride request sent to blockchain…");
      const receipt = await tx.wait();

      let rideIdOnChain = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === "RideRequested") {
            rideIdOnChain = parsed.args.rideId.toString();
            break;
          }
        } catch {}
      }

      const newRide = {
        pickup,
        dropoff,
        pickupLocation: { lat: pickupCoords[1], lng: pickupCoords[0] },
        dropoffLocation: { lat: dropoffCoords[1], lng: dropoffCoords[0] },
        rideType,
        vehicleType,
        distance: distanceKm,
        fare: displayFare,
        surge: surgeMultiplier,
        timestamp: new Date().toISOString(),
        rideId:
          rideIdOnChain ||
          `RIDE-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        estimatedDuration: eta,
        driver: {
          name: "John Doe",
          rating: 4.8,
          photo: "https://randomuser.me/api/portraits/men/42.jpg",
        },
        txHash: receipt.hash,
      };

      const updatedHistory = [newRide, ...history.slice(0, 4)];
      localStorage.setItem("rideHistory", JSON.stringify(updatedHistory));
      localStorage.setItem("currentRide", JSON.stringify(newRide));
      localStorage.setItem("rideStatus", "searching");

      if (rideIdOnChain) {
        localStorage.setItem("currentRideId", rideIdOnChain);
      }

      setHistory(updatedHistory);
      toast.success("Ride confirmed!");
      navigate("/ride-in-progress");
    } catch (err) {
      console.error("Confirm ride error:", err);

      if (err.code === "INSUFFICIENT_FUNDS") {
        toast.error("Insufficient balance");
      } else if (
        err.code === "USER_REJECTED" ||
        err.code === "ACTION_REJECTED"
      ) {
        toast.error("Transaction rejected");
      } else {
        toast.error(`Failed: ${err.message || err.toString()}`);
      }
    } finally {
      setBookingLoading(false);
    }
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
        pickupCoords={pickupCoords}
        dropoffCoords={dropoffCoords}
        setDistanceKm={setDistanceKm}
        mapInstanceRef={mapInstanceRef}
      />

      {/* LOCATION PANEL */}
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
                      }, 300);
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
                {eta && eta !== "--" && (
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

      {/* VEHICLE + RIDE TYPE PANEL */}
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
                    disabled={!canConfirmRide}
                    bookingLoading={bookingLoading}
                  />
                </Box>
              </ColorfulPaper>
            </motion.div>
          </Box>
        )}
      </AnimatePresence>

      {/* SUMMARY TOGGLE */}
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

      {/* SUMMARY DRAWER */}
      <AnimatePresence>
        {summaryOpen && (
          <Box
            key="ride-summary"
            sx={{
              position: "absolute",
              bottom: 60,
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
                  disabled={!canConfirmRide}
                  bookingLoading={bookingLoading}
                />
              </ColorfulPaper>
            </motion.div>
          </Box>
        )}
      </AnimatePresence>

      {/* GLOBAL LOADING */}
      {bookingLoading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default PassengerDashboard;
