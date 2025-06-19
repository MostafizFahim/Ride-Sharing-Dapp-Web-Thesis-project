import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";

export default function RideRequestForm() {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRequestRide = () => {
    if (!pickup.trim() || !destination.trim()) {
      setError("Please enter both pickup and destination.");
      return;
    }
    setError("");

    // You can expand this with more fields (e.g., vehicle type, ride options)
    const rideRequest = {
      pickup,
      dropoff: destination,
      createdAt: new Date().toISOString(),
    };

    // Save ride request for RideInProgress or DriverDashboard, etc.
    localStorage.setItem("currentRide", JSON.stringify(rideRequest));
    localStorage.setItem("rideStatus", "searching");
    navigate("/ride-in-progress");
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
      >
        Request Ride
      </Button>
    </Box>
  );
}
