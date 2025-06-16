import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function RideRequestForm() {
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();

  const handleRequestRide = () => {
    console.log("Requesting ride to:", destination);
    navigate("/ride");
  };

  return (
    <div>
      <h3>Book a Ride</h3>
      <input
        type="text"
        placeholder="Enter destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <button onClick={handleRequestRide} style={{ marginLeft: "10px" }}>
        Request Ride
      </button>
    </div>
  );
}

export default RideRequestForm;
