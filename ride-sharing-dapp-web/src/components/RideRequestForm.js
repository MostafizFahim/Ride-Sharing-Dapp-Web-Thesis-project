import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import { useUser } from "./UserContext";
import { getRideSharingContract } from "../utils/web3";
import { ethers } from "ethers"; // for getAddress only

export default function RideRequestForm() {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { account } = useUser();

  // Simple placeholder fare system (same as before)
  const calculateFareWei = () => {
    const baseFare = 1000000000000000n; // 0.001 (project ETH) in wei
    return baseFare;
  };

  // Convert ride details to IPFS-style metadata (simulated)
  const generateIpfsMetadataURI = () => {
    const metadata = {
      pickup,
      destination,
      timestamp: new Date().toISOString(),
      rider: account,
    };

    const encoded = btoa(JSON.stringify(metadata));
    return `ipfs://${encoded}`;
  };

  const handleRequestRide = async () => {
    if (!pickup.trim() || !destination.trim()) {
      setError("Please enter both pickup and destination.");
      return;
    }
    setError("");

    if (!account) {
      toast.error("Please connect your wallet first.");
      return;
    }

    // Normalize hardcoded driver address to avoid checksum errors
    let driverAddress;
    try {
      const rawDriverAddress = "0xc5116c11148c3d76f527d310f5142e3ff84745cf"; // your test driver
      driverAddress = ethers.getAddress(rawDriverAddress);
    } catch {
      toast.error("Configured driver address is invalid. Check checksum.");
      return;
    }

    try {
      setLoading(true);

      const contract = await getRideSharingContract(true);

      const fareWei = calculateFareWei();
      const metadataURI = generateIpfsMetadataURI();

      console.log("RequestRide Params:", {
        driverAddress,
        fareWei: fareWei.toString(),
        metadataURI,
      });

      const tx = await contract.requestRide(
        driverAddress,
        fareWei,
        metadataURI
      );

      toast.info("Transaction sent. Waiting for confirmation...");
      await tx.wait();

      toast.success("Ride request confirmed on blockchain!");

      // Save to your local UI flow
      const rideRequest = {
        pickup,
        dropoff: destination,
        fareWei: fareWei.toString(),
        driver: driverAddress,
        metadataURI,
        rideId: "...will fetch soon...",
        status: "requested",
      };

      localStorage.setItem("currentRide", JSON.stringify(rideRequest));
      localStorage.setItem("rideStatus", "searching");

      navigate("/ride-in-progress");
    } catch (err) {
      console.error("Ride request failed:", err);
      const msg =
        err.reason ||
        err.data?.message ||
        err.info?.error?.message ||
        err.message ||
        "Unknown error";
      toast.error("Failed: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 380,
        mx: "auto",
        mt: 3,
        p: 3,
        borderRadius: 3,
        boxShadow: 3,
        background: "#fff",
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={2} align="center">
        Book a Ride
      </Typography>

      <TextField
        fullWidth
        label="Pickup Location"
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        margin="normal"
      />

      {error && (
        <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        fullWidth
        size="large"
        sx={{
          mt: 2,
          background: "linear-gradient(90deg, #3793e0 0%, #53a0fd 100%)",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: 3,
          letterSpacing: 1,
          "&:hover": {
            background: "linear-gradient(90deg, #53a0fd 0%, #3793e0 100%)",
          },
        }}
        onClick={handleRequestRide}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={26} sx={{ color: "#fff" }} />
        ) : (
          "Request Ride"
        )}
      </Button>
    </Box>
  );
}
