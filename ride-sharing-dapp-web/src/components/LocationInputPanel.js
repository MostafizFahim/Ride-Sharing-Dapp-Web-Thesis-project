import React from "react";
import { Box, TextField, Stack, Button, Tooltip } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FlagIcon from "@mui/icons-material/Flag";
import MyLocationIcon from "@mui/icons-material/MyLocation";

const LocationInputPanel = ({
  pickup,
  dropoff,
  pickupSuggestions,
  dropoffSuggestions,
  onPickupChange,
  onDropoffChange,
  onPickupSelect,
  onDropoffSelect,
  onUseMyLocation,
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
      <Box display="flex" alignItems="center" gap={1}>
        <LocationOnIcon color="primary" />
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
              const selected = safePickupSuggestions.find(
                (s) => s.label === val
              );
              if (selected) onPickupSelect(selected);
              else onPickupSelect(val);
            }
          }}
          sx={{ flexGrow: 1 }}
          renderInput={(params) => (
            <TextField {...params} label="Pickup Location" fullWidth />
          )}
        />
        <Tooltip title="Use My Location">
          <Button onClick={onUseMyLocation}>
            <MyLocationIcon />
          </Button>
        </Tooltip>
      </Box>

      {/* Dropoff Field */}
      <Box display="flex" alignItems="center" gap={1}>
        <FlagIcon color="secondary" />
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
              if (selected) onDropoffSelect(selected);
              else onDropoffSelect(val);
            }
          }}
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
