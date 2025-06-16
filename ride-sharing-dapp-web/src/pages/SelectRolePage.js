import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box, Paper } from "@mui/material";
import { toast } from "react-toastify";

export default function SelectRolePage() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...storedUser, role };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    toast.success(`Logged in as ${role}`);
    navigate(role === "Passenger" ? "/passenger" : "/driver");
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
        </Box>
      </Paper>
    </Container>
  );
}
