// 🚘 RideInProgress.js — Two-Column UI with On-Chain Sync + MapLibreMap + demo driver animation
import React, { useEffect, useState, useRef } from "react";
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
import { toast } from "react-toastify";
import { ethers } from "ethers";
import maplibregl from "maplibre-gl"; // 🔹 for driver markers

import { getRideSharingContract, getProvider } from "../utils/web3";
import MapLibreMap from "../components/MapLibreMap"; // reuse your map

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
      : status === "driver_assigned"
      ? "#2196f3"
      : status === "cancelled"
      ? "#f44336"
      : "#9e9e9e",
}));

const RideInProgress = () => {
  const [rideStatus, setRideStatus] = useState("searching");
  const [rideData, setRideData] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState("--");
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  // on-chain
  const [onChainRideId, setOnChainRideId] = useState(null);
  const [onChainStatus, setOnChainStatus] = useState(null);
  const [onChainFareWei, setOnChainFareWei] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const navigate = useNavigate();
  const mapInstanceRef = useRef(null); // MapLibreMap fills this ref

  // 🔹 demo driver marker + searching markers
  const driverMarkerRef = useRef(null);
  const searchingMarkersRef = useRef([]);
  const driverAnimIntervalRef = useRef(null);

  // 1️⃣ Load local ride + on-chain rideId
  useEffect(() => {
    const savedRide = JSON.parse(localStorage.getItem("currentRide")) || null;
    setRideData(savedRide);

    const storedId = localStorage.getItem("currentRideId");
    if (storedId) {
      setOnChainRideId(String(storedId));
    } else if (savedRide?.rideId && /^\d+$/.test(savedRide.rideId)) {
      setOnChainRideId(String(savedRide.rideId));
    }
  }, []);

  // 2️⃣ Keep syncing local ride from localStorage (driver updates)
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

      if (updatedRide.driverLocation) {
        setDriverLocation(updatedRide.driverLocation);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate]);

  // 3️⃣ Optional ETA sync (if DriverDashboard writes it)
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedRide = JSON.parse(localStorage.getItem("currentRide"));
      if (updatedRide?.eta) {
        setEta(updatedRide.eta);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 4️⃣ On-chain polling: getRideDetails(rideId)
  useEffect(() => {
    if (!onChainRideId) return;

    let cancelled = false;

    const statusMap = (solStatus) => {
      switch (solStatus) {
        case "Requested":
          return "searching";
        case "Matched":
          return "driver_assigned";
        case "InProgress":
          return "in_progress";
        case "Completed":
          return "completed";
        case "Cancelled":
          return "cancelled";
        default:
          return "searching";
      }
    };

    const fetchFromChain = async () => {
      try {
        setSyncing(true);
        const contract = await getRideSharingContract(false);
        const ride = await contract.getRideDetails(onChainRideId);

        if (cancelled) return;

        setOnChainStatus(ride.status);
        setOnChainFareWei(ride.fareWei);

        const mapped = statusMap(ride.status);
        setRideStatus(mapped);
        localStorage.setItem("rideStatus", mapped);

        if (rideData && !rideData.fare && ride.fareWei) {
          try {
            const fareEth = ethers.formatEther(ride.fareWei);
            const updated = { ...rideData, fare: fareEth };
            setRideData(updated);
            localStorage.setItem("currentRide", JSON.stringify(updated));
          } catch {
            // ignore formatting issues
          }
        }
      } catch (err) {
        console.error("Failed to sync ride from chain:", err);
      } finally {
        if (!cancelled) setSyncing(false);
      }
    };

    fetchFromChain();
    const interval = setInterval(fetchFromChain, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChainRideId]);

  // 5️⃣ Demo: initialize driverLocation slightly away from pickup if we don't have one
  useEffect(() => {
    if (!rideData?.pickupLocation) return;
    if (driverLocation) return;
    // small offset near pickup
    setDriverLocation({
      lat: rideData.pickupLocation.lat + 0.002,
      lng: rideData.pickupLocation.lng + 0.002,
    });
  }, [rideData, driverLocation]);

  // 6️⃣ Demo: create/update driver marker on MapLibre when driverLocation changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !driverLocation) return;

    const lngLat = [driverLocation.lng, driverLocation.lat];

    if (!driverMarkerRef.current) {
      const el = document.createElement("div");
      el.style.width = "28px";
      el.style.height = "28px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#185a9d";
      el.style.border = "2px solid #ffffff";
      el.style.boxShadow = "0 0 8px rgba(0,0,0,0.35)";
      el.style.backgroundImage = "url('/car-icon.jpg')";
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";

      driverMarkerRef.current = new maplibregl.Marker({
        element: el,
        rotationAlignment: "map",
      })
        .setLngLat(lngLat)
        .addTo(map);
    } else {
      driverMarkerRef.current.setLngLat(lngLat);
    }

    return () => {
      // marker cleanup handled in global cleanup below
    };
  }, [driverLocation]);

  // 7️⃣ Demo: show some random nearby drivers when status === "searching"
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !rideData?.pickupLocation) return;

    // clear existing searching markers
    searchingMarkersRef.current.forEach((m) => m.remove());
    searchingMarkersRef.current = [];

    if (rideStatus !== "searching") return;

    const baseLng = rideData.pickupLocation.lng;
    const baseLat = rideData.pickupLocation.lat;

    for (let i = 0; i < 3; i++) {
      const offsetLng = baseLng + (Math.random() - 0.5) * 0.01;
      const offsetLat = baseLat + (Math.random() - 0.5) * 0.01;

      const el = document.createElement("div");
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "rgba(0,0,0,0.7)";
      el.style.border = "2px solid #ffffff";

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([offsetLng, offsetLat])
        .addTo(map);

      searchingMarkersRef.current.push(marker);
    }

    return () => {
      searchingMarkersRef.current.forEach((m) => m.remove());
      searchingMarkersRef.current = [];
    };
  }, [rideStatus, rideData]);

  // 8️⃣ Demo: animate driver from current position to dropoff when status === "in_progress"
  const animateDriverToDropoff = () => {
    if (!driverLocation || !rideData?.dropoffLocation) return;

    if (driverAnimIntervalRef.current) {
      clearInterval(driverAnimIntervalRef.current);
    }

    const steps = 120;
    const intervalTime = 120;

    const startLat = driverLocation.lat;
    const startLng = driverLocation.lng;
    const endLat = rideData.dropoffLocation.lat;
    const endLng = rideData.dropoffLocation.lng;

    const latDiff = (endLat - startLat) / steps;
    const lngDiff = (endLng - startLng) / steps;

    let i = 0;
    driverAnimIntervalRef.current = setInterval(() => {
      i++;
      setDriverLocation((prev) => {
        if (!prev) return prev;
        return {
          lat: prev.lat + latDiff,
          lng: prev.lng + lngDiff,
        };
      });
      if (i >= steps) {
        clearInterval(driverAnimIntervalRef.current);
        driverAnimIntervalRef.current = null;
      }
    }, intervalTime);
  };

  useEffect(() => {
    if (rideStatus === "in_progress") {
      animateDriverToDropoff();
    }
  }, [rideStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Global cleanup for demo markers/animation
  useEffect(() => {
    return () => {
      if (driverAnimIntervalRef.current) {
        clearInterval(driverAnimIntervalRef.current);
      }
      if (driverMarkerRef.current) {
        driverMarkerRef.current.remove();
        driverMarkerRef.current = null;
      }
      searchingMarkersRef.current.forEach((m) => m.remove());
      searchingMarkersRef.current = [];
    };
  }, []);

  // 9️⃣ Cancel ride (local only for passenger)
  const handleCancel = () => {
    setRideData(null);
    localStorage.removeItem("currentRide");
    localStorage.setItem("rideStatus", "idle");
    navigate("/passenger");
  };

  // 🔟 Pay on-chain + then show rating modal
  const handlePayment = async () => {
    if (!onChainRideId) {
      setShowRating(true);
      return;
    }

    try {
      const contract = await getRideSharingContract(true);
      const ride = await contract.getRideDetails(onChainRideId);

      console.log("On-chain ride details before payment:", ride);

      const expectedFareWei = ride.fareWei;
      const riderOnChain = ride.rider;

      if (expectedFareWei === 0n) {
        toast.error("On-chain fare is zero. Cannot pay for this ride.");
        return;
      }

      const provider = await getProvider();
      const accounts = await provider.send("eth_accounts", []);
      const current = accounts?.[0]?.toLowerCase();
      if (!current) {
        toast.error("No connected wallet. Please connect MetaMask first.");
        return;
      }

      if (riderOnChain.toLowerCase() !== current) {
        toast.error(
          `Only the rider can pay for this ride. Rider on-chain is ${riderOnChain}.`
        );
        return;
      }

      toast.info("Submitting on-chain payment…");

      const tx = await contract.payForRide(onChainRideId, {
        value: expectedFareWei,
        gasLimit: 300000n,
      });

      console.log("payForRide tx sent:", tx.hash);
      await tx.wait();
      console.log("payForRide tx mined");

      toast.success("Payment sent successfully on-chain ✅");
      setShowRating(true);
    } catch (err) {
      console.error("payForRide failed:", err);
      toast.error(
        "Payment failed: " + (err?.reason || err?.message || "Unknown error")
      );
    }
  };

  const handleSubmitRating = () => {
    // ✅ After payment + rating, passenger cleans up shared ride
    localStorage.removeItem("currentRide");
    localStorage.setItem("rideStatus", "idle");

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

  // convert saved {lat,lng} into [lng,lat] for MapLibreMap
  const pickupCoords = [
    rideData.pickupLocation.lng,
    rideData.pickupLocation.lat,
  ];
  const dropoffCoords = [
    rideData.dropoffLocation.lng,
    rideData.dropoffLocation.lat,
  ];

  const driverVehicleText =
    rideData.driver?.vehicle && rideData.driver.vehicle.make
      ? `${rideData.driver.vehicle.make || ""} ${
          rideData.driver.vehicle.model || ""
        } • ${rideData.driver.vehicle.color || ""}`
      : "Assigned Vehicle";

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
      {/* Left - MapLibre map */}
      <Box sx={{ flex: 1, minHeight: 300, position: "relative" }}>
        <MapLibreMap
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          setDistanceKm={undefined} // distance already known from previous page
          mapInstanceRef={mapInstanceRef}
        />
      </Box>

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

        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <StatusChip
            status={rideStatus}
            label={rideStatus.replace("_", " ")}
            size="medium"
            sx={{
              background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
            }}
          />
        </Stack>
        {syncing && <CircularProgress size={16} thickness={5} sx={{ mb: 1 }} />}

        {onChainRideId && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            On-chain Ride ID: #{onChainRideId}
            {onChainStatus && ` • Status on chain: ${onChainStatus}`}
          </Typography>
        )}

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
            {/* Optional ETA */}
            {/* <Box display="flex" alignItems="center" gap={2}>
              <Schedule color="primary" />
              <Typography>
                <b>ETA:</b> {eta}
              </Typography>
            </Box> */}
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
                  {driverVehicleText}
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

      {/* Rating modal */}
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
