import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Stack,
} from "@mui/material";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import RoomIcon from "@mui/icons-material/Room";
import DirectionsIcon from "@mui/icons-material/Directions";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TimeIcon from "@mui/icons-material/Schedule";
import LocationIcon from "@mui/icons-material/LocationOn";
import CommuteIcon from "@mui/icons-material/Commute";

const RideSummaryDrawer = ({
  pickup,
  dropoff,
  rideType,
  vehicleType,
  distanceKm,
  eta,
  fare,
  onConfirmRide,
  disabled,
}) => {
  const pickupText =
    typeof pickup === "object" && pickup !== null
      ? pickup.label
      : pickup || "Not selected";
  const dropoffText =
    typeof dropoff === "object" && dropoff !== null
      ? dropoff.label
      : dropoff || "Not selected";

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        bgcolor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 1.5,
          background: "linear-gradient(90deg, #3a7bd5, #00d2ff)",
          color: "white",
        }}
      >
        <DriveEtaIcon />
        <Typography variant="subtitle1" fontWeight={600}>
          Ride Summary
        </Typography>
      </Box>

      <CardContent sx={{ px: 3, py: 2 }}>
        <Stack spacing={1.5}>
          {/* Pickup & Dropoff */}
          <Box display="flex" alignItems="center" gap={1}>
            <RoomIcon color="action" fontSize="small" />
            <Typography variant="body2">
              <strong>Pickup:</strong> {pickupText}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <RoomIcon color="action" fontSize="small" />
            <Typography variant="body2">
              <strong>Dropoff:</strong> {dropoffText}
            </Typography>
          </Box>

          <Divider />

          {/* Ride Details */}
          <Box display="flex" alignItems="center" gap={1}>
            <DirectionsIcon color="action" fontSize="small" />
            <Typography variant="body2">
              <strong>Ride Type:</strong> {rideType || "Not selected"}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <DirectionsIcon color="action" fontSize="small" />
            <Typography variant="body2">
              <strong>Vehicle:</strong> {vehicleType || "Not selected"}
            </Typography>
          </Box>

          <Divider />

          {/* Distance & ETA */}
          <Box display="flex" alignItems="center" gap={1}>
            <DirectionsIcon color="action" fontSize="small" />
            <Typography variant="body2">
              <strong>Distance:</strong>{" "}
              {distanceKm && !isNaN(distanceKm)
                ? `${Number(distanceKm).toFixed(2)} km`
                : "--"}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <DirectionsIcon color="action" fontSize="small" />
            <Typography variant="body2">
              <strong>ETA:</strong> {eta || "--"}
            </Typography>
          </Box>

          <Divider />

          {/* Fare */}
          <Box display="flex" alignItems="center" gap={1}>
            <MonetizationOnIcon color="action" fontSize="small" />
            <Typography variant="body2">
              <strong>Estimated Fare:</strong>{" "}
              <Box component="span" sx={{ color: "green", fontWeight: "bold" }}>
                {fare && fare !== "--" ? `৳${fare}` : "--"}
              </Box>
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RideSummaryDrawer;
