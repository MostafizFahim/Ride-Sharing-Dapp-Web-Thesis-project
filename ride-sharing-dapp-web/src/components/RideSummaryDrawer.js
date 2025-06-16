import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Button,
} from "@mui/material";
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
}) => (
  <Card elevation={1} sx={{ borderRadius: 2 }}>
    <CardContent sx={{ px: 3, py: 2 }}>
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <DriveEtaIcon color="primary" />
        <Typography variant="h6">Ride Summary</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Typography>
        <strong>From:</strong> {pickup || "Not selected"}
      </Typography>
      <Typography>
        <strong>To:</strong> {dropoff || "Not selected"}
      </Typography>
      <Typography>
        <strong>Ride Type:</strong> {rideType || "Not selected"}
      </Typography>

      <Typography>
        <strong>Vehicle:</strong> {vehicleType || "Not selected"}
      </Typography>
      <Typography>
        <strong>Distance:</strong>{" "}
        {distanceKm ? `${distanceKm.toFixed(2)} km` : "--"}
      </Typography>
      <Typography>
        <strong>ETA:</strong> {eta}
      </Typography>
      <Typography>
        <strong>Estimated Fare:</strong> ${fare}
      </Typography>
      {/* <Box textAlign="right" mt={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={onConfirmRide}
          disabled={disabled}
        >
          Confirm Ride
        </Button>
      </Box> */}
    </CardContent>
  </Card>
);

export default RideSummaryDrawer;
