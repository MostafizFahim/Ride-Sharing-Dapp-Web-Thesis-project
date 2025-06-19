import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box, Paper } from "@mui/material";
import { toast } from "react-toastify";
import { useUser } from "../components/UserContext"; // adjust path if needed

export default function SelectRolePage() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const handleRoleSelect = (role) => {
    const prevRoles = user?.roles || [];
    const updatedRoles = prevRoles.includes(role)
      ? prevRoles
      : [...prevRoles, role];
    const updatedUser = {
      ...user,
      currentRole: role,
      roles: updatedRoles,
      role, // for legacy compatibility
    };

    // Save to context/global state (instant update everywhere)
    setUser(updatedUser);

    // Also update in localStorage for login persistence
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("registeredUser", JSON.stringify(updatedUser));

    toast.success(`Logged in as ${role}`);
    if (role === "Passenger") navigate("/passenger");
    else if (role === "Driver") navigate("/driver");
    else if (role === "Admin") navigate("/admin");
    else navigate("/");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          Select Your Role
        </Typography>
        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleRoleSelect("Passenger")}
          >
            I’m a Passenger
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleRoleSelect("Driver")}
          >
            I’m a Driver
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => handleRoleSelect("Admin")}
          >
            I’m Admin
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
