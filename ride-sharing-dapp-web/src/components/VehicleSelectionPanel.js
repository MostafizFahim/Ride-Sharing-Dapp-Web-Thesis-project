import React from "react";
import {
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Button,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import CNGIcon from "../components/CNGIcon";

// Still ok to import like this in a .js file
import { ConfirmRideButton } from "../pages/PassengerDashboard";

const VehicleSelectionPanel = ({
  rideType,
  onRideTypeChange,
  vehicleType,
  onVehicleTypeChange,
  onConfirmRide,
  onCancelRide,
  fare,
  eta,
  disabled,
}) => {
  const hasValidFare =
    fare !== null && fare !== undefined && fare !== "--" && !Number.isNaN(fare);

  const isConfirmDisabled =
    disabled || !vehicleType || !rideType || !hasValidFare;

  return (
    <Card
      sx={{
        width: "100%",
        boxShadow: 4,
        borderRadius: 3,
        bgcolor: "#ffffff",
        borderTop: "4px solid #43cea2",
      }}
    >
      <CardContent>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: 700, color: "#185a9d" }}
        >
          Choose Your Ride
        </Typography>

        {/* Vehicle Type */}
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ mt: 1, color: "text.secondary" }}
        >
          Vehicle Type
        </Typography>

        <ToggleButtonGroup
          exclusive
          value={vehicleType}
          onChange={(e, val) => {
            if (val !== null) onVehicleTypeChange(val);
          }}
          fullWidth
          sx={{
            mb: 2,
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
            },
            "& .MuiToggleButton-root.Mui-selected": {
              bgcolor: "rgba(67, 206, 162, 0.15)",
              borderColor: "#43cea2",
              color: "#185a9d",
            },
          }}
        >
          <ToggleButton value="Car">
            <DirectionsCarIcon sx={{ mr: 1 }} /> Car
          </ToggleButton>

          <ToggleButton value="Bike">
            <TwoWheelerIcon sx={{ mr: 1 }} /> Bike
          </ToggleButton>

          <ToggleButton value="CNG">
            <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
              <CNGIcon />
            </Box>
            CNG
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Ride Type */}
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ color: "text.secondary" }}
        >
          Ride Type
        </Typography>

        <ToggleButtonGroup
          exclusive
          value={rideType}
          onChange={(e, val) => {
            if (val !== null) onRideTypeChange(val);
          }}
          fullWidth
          sx={{
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
            },
            "& .MuiToggleButton-root.Mui-selected": {
              bgcolor: "rgba(24, 90, 157, 0.12)",
              borderColor: "#185a9d",
              color: "#185a9d",
            },
          }}
        >
          <ToggleButton value="Standard">Standard</ToggleButton>
          <ToggleButton value="Premium">Premium</ToggleButton>
          <ToggleButton value="Shared">Shared</ToggleButton>
        </ToggleButtonGroup>

        {/* Fare + ETA */}
        <Box mt={2}>
          <Typography variant="body2">
            <strong>Estimated Fare:</strong>{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: hasValidFare ? "green" : "inherit",
              }}
            >
              {hasValidFare ? `৳${fare}` : "--"}
            </Box>
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            <strong>Estimated Time:</strong> {eta || "--"}
          </Typography>
        </Box>

        {/* Actions */}
        <Box mt={2}>
          <ConfirmRideButton
            fullWidth
            onClick={onConfirmRide}
            disabled={isConfirmDisabled}
          >
            Confirm Ride
          </ConfirmRideButton>

          <Button
            fullWidth
            variant="outlined"
            color="error"
            sx={{ mt: 1, textTransform: "none", fontWeight: 600 }}
            onClick={onCancelRide}
          >
            Cancel Ride
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VehicleSelectionPanel;
