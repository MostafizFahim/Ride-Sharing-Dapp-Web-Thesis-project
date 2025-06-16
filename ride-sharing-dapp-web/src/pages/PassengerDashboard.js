import React, { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Components
import MapViewWithRouting from "../components/MapViewWithRouting";
import LocationInputPanel from "../components/LocationInputPanel";
import RideSummaryDrawer from "../components/RideSummaryDrawer";
import RideHistoryList from "../components/RideHistoryList";
import VehicleSelectionPanel from "../components/VehicleSelectionPanel";
import fareRates from "../config/fareConfig";

// Fix leaflet marker icon loading
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const PassengerDashboard = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [rideType, setRideType] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [distanceKm, setDistanceKm] = useState(null);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0); // ✅ NEW
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("rideHistory")) || []
  );

  const navigate = useNavigate();
  const mapRef = useRef();

  // ✅ Calculate Fare with config, surge, flat fee, and min fare
  const calculateFare = (distance) => {
    if (!distance || !rideType || !vehicleType) return 0;

    const baseRate = fareRates[vehicleType]?.[rideType] || 1.5;
    const flatFee = 5.0;
    const minFare = 30.0;

    const raw = distance * baseRate * surgeMultiplier;
    const total = raw + flatFee;

    return Math.max(total, minFare).toFixed(2);
  };

  // ✅ Trigger surge pricing after both locations are set
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      setSurgeMultiplier(1.0 + Math.random() * 0.5); // Simulate 1.0–1.5 surge
    }
  }, [pickupCoords, dropoffCoords]);

  // const fetchSuggestions = async (input, setOptions) => {
  //   if (!input) return;
  //   try {
  //     const res = await axios.get(
  //       "https://nominatim.openstreetmap.org/search",
  //       {
  //         params: { q: input, format: "json", addressdetails: 1, limit: 5 },
  //       }
  //     );
  //     setOptions(res.data.map((item) => item.display_name));
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  const fetchSuggestions = async (input, setOptions) => {
    if (!input) return setOptions([]);

    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: { q: input, format: "json", addressdetails: 1, limit: 5 },
        }
      );
      const options = res.data.map((item) => item.display_name);
      setOptions(options || []);
    } catch (err) {
      console.error(err);
      setOptions([]); // fallback if fetch fails
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

    const fareAmount = calculateFare(distanceKm);
    const newRide = {
      pickup,
      dropoff,
      rideType,
      vehicleType,
      distance: distanceKm,
      fare: fareAmount,
      surge: surgeMultiplier,
    };
    const updatedHistory = [newRide, ...history.slice(0, 4)];
    localStorage.setItem("rideHistory", JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
    toast.success("Ride confirmed!");
    navigate("/ride-in-progress");
  };

  const handleRebook = (ride) => {
    setPickup(ride.pickup);
    setDropoff(ride.dropoff);
    setRideType(ride.rideType);
    setVehicleType(ride.vehicleType || "Car");
    fetchCoordinates(ride.pickup, setPickup, setPickupCoords);
    fetchCoordinates(ride.dropoff, setDropoff, setDropoffCoords);
  };

  const vehicleSpeeds = {
    Car: 30, // km/h
    Bike: 40,
    CNG: 25,
  };

  const eta = distanceKm
    ? `${Math.ceil(
        (distanceKm / (vehicleSpeeds[vehicleType] || 30)) * 60
      )} mins`
    : "--";

  const fare = distanceKm ? calculateFare(distanceKm) : "--";
  const locationsSelected = pickupCoords && dropoffCoords;

  return (
    <Box sx={{ width: "100%", height: "100vh", position: "relative" }}>
      <Box sx={{ width: "100%", height: "100%" }}>
        <MapViewWithRouting
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          setDistanceKm={setDistanceKm}
          mapRef={mapRef}
        />
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 60,
          width: { xs: "90%", sm: 450 },
          bgcolor: "white",
          boxShadow: 3,
          borderRadius: 2,
          p: 2,
          zIndex: 1000,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Book a Ride
        </Typography>
        <LocationInputPanel
          pickup={pickup}
          dropoff={dropoff}
          pickupSuggestions={pickupSuggestions}
          dropoffSuggestions={dropoffSuggestions}
          onPickupChange={(val) => {
            setPickup(val);
            fetchSuggestions(val, setPickupSuggestions);
          }}
          onDropoffChange={(val) => {
            setDropoff(val);
            fetchSuggestions(val, setDropoffSuggestions);
          }}
          onPickupSelect={(val) => {
            setPickup(val);
            fetchCoordinates(val, setPickup, setPickupCoords);
          }}
          onDropoffSelect={(val) => {
            setDropoff(val);
            fetchCoordinates(val, setDropoff, setDropoffCoords);
          }}
        />
      </Box>

      {locationsSelected && (
        <VehicleSelectionPanel
          rideType={rideType}
          onRideTypeChange={setRideType}
          vehicleType={vehicleType}
          onVehicleTypeChange={setVehicleType}
          fare={fare}
          eta={eta}
          surgeMultiplier={surgeMultiplier} // ✅ now passed to UI
          onConfirmRide={handleConfirmRide}
        />
      )}

      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          right: 20,
          width: { xs: "90%", sm: 400 },
          zIndex: 1000,
        }}
      >
        <RideSummaryDrawer
          pickup={pickup}
          dropoff={dropoff}
          rideType={rideType}
          vehicleType={vehicleType}
          distanceKm={distanceKm}
          eta={eta}
          fare={fare}
          onConfirmRide={handleConfirmRide}
          disabled={!locationsSelected}
        />
      </Box>
    </Box>
  );
};

export default PassengerDashboard;
