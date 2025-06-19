import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import MapLibreMap from "../components/MapLibreMap";
import LocationInputPanel from "../components/LocationInputPanel";
import RideSummaryDrawer from "../components/RideSummaryDrawer";
import VehicleSelectionPanel from "../components/VehicleSelectionPanel";
import fareRates from "../config/fareConfig";

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
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("rideHistory")) || []
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const coords = [lng, lat];
        setPickupCoords(coords);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const label = data.display_name || "Current Location";
          setPickup(label);
        } catch (err) {
          setPickup("Current Location");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      setSurgeMultiplier(1.0 + Math.random() * 0.5);
    }
  }, [pickupCoords, dropoffCoords]);

  const fetchSuggestions = async (input, setOptions) => {
    if (!input) return setOptions([]);
    try {
      const res = await axios.get("https://photon.komoot.io/api", {
        params: { q: input, limit: 5 },
      });
      const options =
        res.data.features?.map((feature) => ({
          label:
            feature.properties.name +
            ", " +
            (feature.properties.city || feature.properties.country || ""),
          coords: feature.geometry.coordinates,
        })) || [];
      setOptions(options);
    } catch (err) {
      console.error("Autocomplete failed:", err);
      setOptions([]);
    }
  };

  const fetchCoordinates = async (query, setAddress, setCoords) => {
    try {
      const res = await axios.get("https://photon.komoot.io/api", {
        params: { q: query, limit: 1 },
      });
      if (res.data.features?.length > 0) {
        const place = res.data.features[0];
        const label =
          place.properties.name +
          ", " +
          (place.properties.city || place.properties.country || "");
        const [lng, lat] = place.geometry.coordinates;
        setAddress(label);
        setCoords([lng, lat]);
      } else {
        toast.error("No results found");
      }
    } catch (err) {
      toast.error("Location lookup failed");
    }
  };

  const calculateFare = (distance) => {
    const numericDistance = parseFloat(distance);
    if (isNaN(numericDistance) || !rideType || !vehicleType) return 0;
    const baseRate = fareRates[vehicleType]?.[rideType] || 1.5;
    const flatFee = 5.0;
    const minFare = 30.0;
    const raw = numericDistance * baseRate * surgeMultiplier;
    return Math.max(raw + flatFee, minFare).toFixed(2);
  };

  const handleConfirmRide = () => {
    if (!pickupCoords || !dropoffCoords) {
      toast.error("Please enter both pickup and dropoff locations.");
      return;
    }
    if (!rideType || !vehicleType) {
      toast.error("Please select both ride type and vehicle type.");
      return;
    }

    const fareAmount = calculateFare(distanceKm);
    const newRide = {
      pickup,
      dropoff,
      pickupLocation: { lat: pickupCoords[1], lng: pickupCoords[0] },
      dropoffLocation: { lat: dropoffCoords[1], lng: dropoffCoords[0] },
      rideType,
      vehicleType,
      distance: distanceKm,
      fare: fareAmount,
      surge: surgeMultiplier,
      // Additional fields for the ride-in-progress page
      timestamp: new Date().toISOString(),
      rideId: `RIDE-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      estimatedDuration: `${Math.ceil(
        (distanceKm / (vehicleSpeeds[vehicleType] || 30)) * 60
      )} mins`,
      // These would normally come from your backend/driver service
      driver: {
        name: "John Doe",
        rating: 4.8,
        photo: "https://randomuser.me/api/portraits/men/42.jpg",
        vehicle: {
          make:
            vehicleType === "Car"
              ? "Toyota"
              : vehicleType === "Bike"
              ? "Honda"
              : "Bajaj",
          model:
            vehicleType === "Car"
              ? "Camry"
              : vehicleType === "Bike"
              ? "CBR"
              : "RE",
          license: `${
            vehicleType === "Car" ? "C" : vehicleType === "Bike" ? "B" : "3"
          }${Math.random().toString().substr(2, 6)}`,
          color: ["Blue", "Red", "White", "Black"][
            Math.floor(Math.random() * 4)
          ],
        },
      },
    };

    // Save to both history and current ride
    const updatedHistory = [newRide, ...history.slice(0, 4)];
    localStorage.setItem("rideHistory", JSON.stringify(updatedHistory));
    localStorage.setItem("currentRide", JSON.stringify(newRide));
    setHistory(updatedHistory);

    // Set initial ride status
    localStorage.setItem("rideStatus", "searching");

    toast.success("Ride confirmed! Finding your driver...");
    navigate("/ride-in-progress");
  };

  const vehicleSpeeds = { Car: 30, Bike: 40, CNG: 25 };
  const eta =
    distanceKm && vehicleType
      ? `${Math.ceil(
          (distanceKm / (vehicleSpeeds[vehicleType] || 30)) * 60
        )} mins`
      : "--";

  const fare =
    distanceKm && rideType && vehicleType ? calculateFare(distanceKm) : "--";

  const locationsSelected = pickupCoords && dropoffCoords;
  const selectionsValid = rideType && vehicleType;

  return (
    <Box sx={{ width: "100%", height: "100vh", position: "relative" }}>
      <Box sx={{ width: "100%", height: "100%" }}>
        <MapLibreMap
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          setDistanceKm={setDistanceKm}
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
            if (!val) return;
            if (val.label && val.coords) {
              setPickup(val.label);
              setPickupCoords(val.coords);
            } else if (typeof val === "string") {
              setPickup(val);
              fetchCoordinates(val, setPickup, setPickupCoords);
            }
          }}
          onDropoffSelect={(val) => {
            if (!val) return;
            if (val.label && val.coords) {
              setDropoff(val.label);
              setDropoffCoords(val.coords);
            } else if (typeof val === "string") {
              setDropoff(val);
              fetchCoordinates(val, setDropoff, setDropoffCoords);
            }
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
          surgeMultiplier={surgeMultiplier}
          onConfirmRide={handleConfirmRide}
          disabled={!selectionsValid}
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
          disabled={!selectionsValid}
        />
      </Box>
    </Box>
  );
};

export default PassengerDashboard;
