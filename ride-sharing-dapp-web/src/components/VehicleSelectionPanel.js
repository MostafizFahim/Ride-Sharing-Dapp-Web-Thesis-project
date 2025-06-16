import React from "react";
import {
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Box,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";

const VehicleSelectionPanel = ({
  rideType,
  onRideTypeChange,
  vehicleType,
  onVehicleTypeChange,
  onConfirmRide,
  fare,
  eta,
}) => {
  return (
    <Card
      sx={{
        width: { xs: "100%", sm: 400 },
        position: "absolute",
        bottom: 80,
        left: 60,
        zIndex: 1000,
        boxShadow: 4,
        borderRadius: 2,
        bgcolor: "white",
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Select Vehicle & Ride Type
        </Typography>

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
            <EmojiPeopleIcon sx={{ mr: 1 }} /> CNG
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
            <strong>Fare:</strong> ${fare}
          </Typography>
          <Typography>
            <strong>ETA:</strong> {eta}
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={onConfirmRide}
        >
          Confirm Ride
        </Button>
      </CardContent>
    </Card>
  );
};

export default VehicleSelectionPanel;
