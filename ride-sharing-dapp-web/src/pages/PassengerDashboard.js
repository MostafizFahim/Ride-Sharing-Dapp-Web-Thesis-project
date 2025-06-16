import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Autocomplete as MUIAutocomplete,
  Stack,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FlagIcon from "@mui/icons-material/Flag";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const Routing = ({ pickupCoords, dropoffCoords, setDistanceKm }) => {
  const map = useMap();
  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) return;
    const control = L.Routing.control({
      waypoints: [L.latLng(pickupCoords), L.latLng(dropoffCoords)],
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
    })
      .on("routesfound", (e) => {
        const distance = e.routes[0].summary.totalDistance / 1000;
        setDistanceKm(distance);
      })
      .addTo(map);
    return () => map.removeControl(control);
  }, [pickupCoords, dropoffCoords, map, setDistanceKm]);
  return null;
};

const PassengerDashboard = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [rideType, setRideType] = useState("Standard");
  const [distanceKm, setDistanceKm] = useState(null);
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("rideHistory")) || []
  );

  const navigate = useNavigate();
  const mapRef = useRef();

  const fetchSuggestions = async (input, setOptions) => {
    if (!input) return;
    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: { q: input, format: "json", addressdetails: 1, limit: 5 },
        }
      );
      setOptions(res.data.map((item) => item.display_name));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCoordinates = async (query, setAddress, setCoords) => {
    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: { q: query, format: "json", limit: 1 },
        }
      );
      if (res.data.length > 0) {
        const place = res.data[0];
        setAddress(place.display_name);
        setCoords([parseFloat(place.lat), parseFloat(place.lon)]);
      }
    } catch (err) {
      toast.error("Location lookup failed");
    }
  };

  const handleConfirmRide = () => {
    if (!pickupCoords || !dropoffCoords) {
      toast.error("Please enter both pickup and dropoff locations.");
      return;
    }
    const fare = calculateFare(distanceKm);
    const newRide = {
      pickup,
      dropoff,
      rideType,
      distance: distanceKm,
      fare,
    };
    const updatedHistory = [newRide, ...history.slice(0, 4)];
    localStorage.setItem("rideHistory", JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
    toast.success("Ride confirmed!");
    navigate("/ride-in-progress");
  };

  const calculateFare = (distance) => {
    const rates = { Standard: 1.5, Premium: 2.5, Shared: 1.0 };
    return (distance * rates[rideType]).toFixed(2);
  };

  const eta = distanceKm ? `${Math.ceil(distanceKm * 2)} mins` : "--";

  const handleRebook = (ride) => {
    setPickup(ride.pickup);
    setDropoff(ride.dropoff);
    setRideType(ride.rideType);
    fetchCoordinates(ride.pickup, setPickup, setPickupCoords);
    fetchCoordinates(ride.dropoff, setDropoff, setDropoffCoords);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 3, px: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Book a Ride
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
        <Box display="flex" alignItems="center" gap={1} flex={1}>
          <LocationOnIcon color="primary" sx={{ mt: 1.5 }} />
          <MUIAutocomplete
            freeSolo
            options={pickupSuggestions}
            inputValue={pickup}
            onInputChange={(e, val) => {
              setPickup(val);
              fetchSuggestions(val, setPickupSuggestions);
            }}
            onChange={(e, val) => {
              setPickup(val);
              fetchCoordinates(val, setPickup, setPickupCoords);
            }}
            sx={{ width: "100%" }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Pickup Location"
                fullWidth
                autoComplete="off"
              />
            )}
          />
        </Box>
        <Box display="flex" alignItems="center" gap={1} flex={1}>
          <FlagIcon color="secondary" sx={{ mt: 1.5 }} />
          <MUIAutocomplete
            freeSolo
            options={dropoffSuggestions}
            inputValue={dropoff}
            onInputChange={(e, val) => {
              setDropoff(val);
              fetchSuggestions(val, setDropoffSuggestions);
            }}
            onChange={(e, val) => {
              setDropoff(val);
              fetchCoordinates(val, setDropoff, setDropoffCoords);
            }}
            sx={{ width: "100%" }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Dropoff Location"
                fullWidth
                autoComplete="off"
              />
            )}
          />
        </Box>
      </Stack>

      <Box textAlign="center" my={2}>
        <Typography variant="subtitle1" gutterBottom>
          Select Ride Type
        </Typography>
        <ToggleButtonGroup
          value={rideType}
          exclusive
          onChange={(e, val) => val && setRideType(val)}
          size="small"
          sx={{ mt: 1 }}
        >
          <ToggleButton value="Standard" sx={{ px: 3 }}>
            STANDARD
          </ToggleButton>
          <ToggleButton value="Premium" sx={{ px: 3 }}>
            PREMIUM
          </ToggleButton>
          <ToggleButton value="Shared" sx={{ px: 3 }}>
            SHARED
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Map Preview
        </Typography>
        <Box sx={{ width: "100%", height: 400, mb: 4 }}>
          <MapContainer
            center={[23.8103, 90.4125]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ width: "100%", height: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {pickupCoords && <Marker position={pickupCoords} />}
            {dropoffCoords && <Marker position={dropoffCoords} />}
            {pickupCoords && dropoffCoords && (
              <Routing
                pickupCoords={pickupCoords}
                dropoffCoords={dropoffCoords}
                setDistanceKm={setDistanceKm}
              />
            )}
          </MapContainer>
        </Box>
      </Box>

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
            <strong>Type:</strong> {rideType}
          </Typography>
          <Typography>
            <strong>Distance:</strong>{" "}
            {distanceKm ? `${distanceKm.toFixed(2)} km` : "--"}
          </Typography>
          <Typography>
            <strong>ETA:</strong> {eta}
          </Typography>
          <Typography>
            <strong>Estimated Fare:</strong> $
            {distanceKm ? calculateFare(distanceKm) : "--"}
          </Typography>
          <Box textAlign="right" mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmRide}
              disabled={!pickupCoords || !dropoffCoords}
            >
              Confirm Ride
            </Button>
          </Box>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Box mt={5}>
          <Typography variant="h6" gutterBottom>
            Recent Rides
          </Typography>
          <Grid container spacing={2}>
            {history.map((ride, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography>
                      <strong>From:</strong> {ride.pickup}
                    </Typography>
                    <Typography>
                      <strong>To:</strong> {ride.dropoff}
                    </Typography>
                    <Typography>
                      <strong>Type:</strong> {ride.rideType}
                    </Typography>
                    <Typography>
                      <strong>Distance:</strong> {ride.distance?.toFixed(2)} km
                    </Typography>
                    <Typography>
                      <strong>Fare:</strong> ${ride.fare}
                    </Typography>
                    <Box mt={2} textAlign="right">
                      <Button
                        variant="outlined"
                        onClick={() => handleRebook(ride)}
                      >
                        Rebook
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default PassengerDashboard;
