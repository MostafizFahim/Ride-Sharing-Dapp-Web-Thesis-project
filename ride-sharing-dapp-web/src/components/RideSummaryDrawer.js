import React from "react";
import { Card, CardContent, Box, Typography, Divider } from "@mui/material";
import DriveEtaIcon from "@mui/icons-material/DriveEta";

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
    <Card elevation={1} sx={{ borderRadius: 2 }}>
      <CardContent sx={{ px: 3, py: 2 }}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <DriveEtaIcon color="primary" />
          <Typography variant="h6">Ride Summary</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Typography>
          <strong>From:</strong> {pickupText}
        </Typography>
        <Typography>
          <strong>To:</strong> {dropoffText}
        </Typography>
        <Typography>
          <strong>Ride Type:</strong> {rideType || "Not selected"}
        </Typography>
        <Typography>
          <strong>Vehicle:</strong> {vehicleType || "Not selected"}
        </Typography>
        <Typography>
          <strong>Distance:</strong>{" "}
          {distanceKm && !isNaN(distanceKm)
            ? `${Number(distanceKm).toFixed(2)} km`
            : "--"}
        </Typography>
        <Typography>
          <strong>ETA:</strong> {eta || "--"}
        </Typography>
        <Typography>
          <strong>Estimated Fare:</strong>{" "}
          {fare && !isNaN(fare) ? `$${fare}` : "--"}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RideSummaryDrawer;
