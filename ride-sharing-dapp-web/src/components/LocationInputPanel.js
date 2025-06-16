import React from "react";
import { Box, TextField, Stack } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FlagIcon from "@mui/icons-material/Flag";

const LocationInputPanel = ({
  pickup,
  dropoff,
  pickupSuggestions,
  dropoffSuggestions,
  onPickupChange,
  onDropoffChange,
  onPickupSelect,
  onDropoffSelect,
}) => {
  // ✅ Ensure safe defaults
  const safePickupSuggestions = Array.isArray(pickupSuggestions)
    ? pickupSuggestions
    : [];

  const safeDropoffSuggestions = Array.isArray(dropoffSuggestions)
    ? dropoffSuggestions
    : [];

  return (
    <Stack spacing={2}>
      {/* Pickup Field */}
      <Box display="flex" alignItems="center" gap={1}>
        <LocationOnIcon color="primary" />
        <Autocomplete
          freeSolo
          options={safePickupSuggestions}
          inputValue={pickup || ""}
          onInputChange={(e, val) => onPickupChange(val)}
          onChange={(e, val) => onPickupSelect(val)}
          sx={{ flexGrow: 1 }}
          renderInput={(params) => (
            <TextField {...params} label="Pickup Location" fullWidth />
          )}
        />
      </Box>

      {/* Dropoff Field */}
      <Box display="flex" alignItems="center" gap={1}>
        <FlagIcon color="secondary" />
        <Autocomplete
          freeSolo
          options={safeDropoffSuggestions}
          inputValue={dropoff || ""}
          onInputChange={(e, val) => onDropoffChange(val)}
          onChange={(e, val) => onDropoffSelect(val)}
          sx={{ flexGrow: 1 }}
          renderInput={(params) => (
            <TextField {...params} label="Dropoff Location" fullWidth />
          )}
        />
      </Box>
    </Stack>
  );
};

export default LocationInputPanel;
