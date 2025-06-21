import React from "react";
import {
  Box,
  TextField,
  Stack,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
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
  const safePickupSuggestions = Array.isArray(pickupSuggestions)
    ? pickupSuggestions
    : [];

  const safeDropoffSuggestions = Array.isArray(dropoffSuggestions)
    ? dropoffSuggestions
    : [];

  return (
    <Stack spacing={2}>
      {/* Pickup Field */}
      <Autocomplete
        freeSolo
        options={safePickupSuggestions.map((opt) =>
          typeof opt === "string" ? opt : opt.label
        )}
        inputValue={pickup || ""}
        onInputChange={(e, val) => onPickupChange(val)}
        onChange={(e, val) => {
          if (typeof val === "string") {
            onPickupSelect(val);
          } else {
            const selected = safePickupSuggestions.find((s) => s.label === val);
            onPickupSelect(selected || val);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Pickup Location"
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      {/* Dropoff Field */}
      <Autocomplete
        freeSolo
        options={safeDropoffSuggestions.map((opt) =>
          typeof opt === "string" ? opt : opt.label
        )}
        inputValue={dropoff || ""}
        onInputChange={(e, val) => onDropoffChange(val)}
        onChange={(e, val) => {
          if (typeof val === "string") {
            onDropoffSelect(val);
          } else {
            const selected = safeDropoffSuggestions.find(
              (s) => s.label === val
            );
            onDropoffSelect(selected || val);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Dropoff Location"
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <FlagIcon color="secondary" />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </Stack>
  );
};

export default LocationInputPanel;
