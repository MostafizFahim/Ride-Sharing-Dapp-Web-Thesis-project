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
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import CNGIcon from "../components/CNGIcon";

// Import the styled ConfirmRideButton from PassengerDashboard
import { ConfirmRideButton } from "../pages/PassengerDashboard";

const VehicleSelectionPanel = ({
  rideType,
  onRideTypeChange,
  vehicleType,
  onVehicleTypeChange,
  onConfirmRide,
  onCancelRide, // <-- Add this prop
  fare,
  eta,
  disabled,
}) => {
  return (
    <Card
      sx={{
        width: "100%",
        boxShadow: 4,
        borderRadius: 2,
        bgcolor: "white",
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" gutterBottom>
          Vehicle Type
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={vehicleType}
          onChange={(e, val) => val && onVehicleTypeChange(val)}
          fullWidth
          sx={{ mb: 2 }}
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

        <Typography variant="subtitle2" gutterBottom>
          Ride Type
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={rideType}
          onChange={(e, val) => val && onRideTypeChange(val)}
          fullWidth
        >
          <ToggleButton value="Standard">Standard</ToggleButton>
          <ToggleButton value="Premium">Premium</ToggleButton>
          <ToggleButton value="Shared">Shared</ToggleButton>
        </ToggleButtonGroup>

        <Box mt={2}>
          <Typography>
            <strong>Fare:</strong> ৳{fare}
          </Typography>
        </Box>

        <Box mt={1}>
          <ConfirmRideButton
            fullWidth
            onClick={onConfirmRide}
            disabled={disabled}
          >
            Confirm Ride
          </ConfirmRideButton>

          <Button
            fullWidth
            variant="outlined"
            color="error"
            sx={{ mt: 1 }}
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
