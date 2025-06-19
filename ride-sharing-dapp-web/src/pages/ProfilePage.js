import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Avatar,
  Box,
  Divider,
  Grid,
  Paper,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "Guest User",
    email: "guest@example.com",
    currentRole: "Passenger",
    roles: ["Passenger"],
    picture: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Switch between Passenger/Driver/Admin if user has more than one role
  const handleSwitchRole = () => {
    if (!user.roles || user.roles.length < 2) return;

    let nextRole;
    if (user.currentRole === "Passenger" && user.roles.includes("Driver"))
      nextRole = "Driver";
    else if (user.currentRole === "Driver" && user.roles.includes("Passenger"))
      nextRole = "Passenger";
    else if (user.currentRole === "Admin" && user.roles.includes("Passenger"))
      nextRole = "Passenger";
    else if (user.roles.length > 0)
      nextRole =
        user.roles.find((r) => r !== user.currentRole) || user.currentRole;

    const updatedUser = { ...user, currentRole: nextRole, role: nextRole };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success(`Switched to ${nextRole} role`);
    // Optional redirect:
    // if (nextRole === "Driver") window.location.href = "/driver";
    // else if (nextRole === "Passenger") window.location.href = "/passenger";
  };

  // Add driver role
  const handleBecomeDriver = () => {
    const updatedRoles = [...(user.roles || []), "Driver"];
    const updatedUser = {
      ...user,
      roles: updatedRoles,
      currentRole: "Driver",
      role: "Driver",
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success("You are now a driver! Complete your driver registration.");
    setTimeout(() => {
      window.location.href = "/driver-registration";
    }, 600);
  };

  // Add passenger role
  const handleBecomePassenger = () => {
    const updatedRoles = [...(user.roles || []), "Passenger"];
    const updatedUser = {
      ...user,
      roles: updatedRoles,
      currentRole: "Passenger",
      role: "Passenger",
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success("You are now a passenger!");
    setTimeout(() => {
      window.location.href = "/passenger";
    }, 600);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar
            alt={user.name}
            src={user.picture || ""}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <Typography variant="h5">{user.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user.email}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Role: <strong>{user.currentRole || user.role}</strong>
          </Typography>

          {/* Switch Role if user has multiple roles */}
          {user.roles && user.roles.length > 1 && (
            <Button
              variant="outlined"
              color="info"
              sx={{ mt: 2, fontWeight: 700, borderRadius: 2 }}
              onClick={handleSwitchRole}
            >
              Switch to{" "}
              {user.currentRole === "Driver"
                ? "Passenger"
                : user.currentRole === "Passenger" &&
                  user.roles.includes("Driver")
                ? "Driver"
                : user.roles.find((r) => r !== user.currentRole) || ""}
            </Button>
          )}

          {/* Become a Driver */}
          {user.roles &&
            user.roles.includes("Passenger") &&
            !user.roles.includes("Driver") && (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  mt: 2,
                  fontWeight: 700,
                  borderRadius: 2,
                  background:
                    "linear-gradient(90deg, #3793e0 0%, #53a0fd 100%)",
                }}
                startIcon={<DirectionsCarIcon />}
                onClick={handleBecomeDriver}
              >
                Become a Driver
              </Button>
            )}

          {/* Become a Passenger */}
          {user.roles &&
            user.roles.includes("Driver") &&
            !user.roles.includes("Passenger") && (
              <Button
                variant="contained"
                color="success"
                sx={{
                  mt: 2,
                  fontWeight: 700,
                  borderRadius: 2,
                  background:
                    "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                }}
                startIcon={<PersonIcon />}
                onClick={handleBecomePassenger}
              >
                Become a Passenger
              </Button>
            )}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">Total Rides</Typography>
              <Typography variant="h5">
                {user.currentRole === "Driver" ? 42 : 17}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">
                {user.currentRole === "Driver" ? "Earnings (৳)" : "Spent (৳)"}
              </Typography>
              <Typography variant="h5">
                {user.currentRole === "Driver" ? "3,250" : "1,480"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
