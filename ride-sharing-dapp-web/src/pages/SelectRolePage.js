import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box, Paper } from "@mui/material";
import { toast } from "react-toastify";
import { useUser } from "../components/UserContext"; // adjust path if needed

export default function SelectRolePage() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [processing, setProcessing] = useState(false);

  // Only allow becoming admin if already admin
  const isAdmin = user?.roles?.includes("Admin");

  const handleRoleSelect = async (role) => {
    if (processing) return;
    if (user?.currentRole === role) {
      toast.info(`Already in ${role} mode`);
      return;
    }
    setProcessing(true);

    try {
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

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("registeredUser", JSON.stringify(updatedUser));

      toast.success(`Logged in as ${role}`);
      if (role === "Passenger") navigate("/passenger");
      else if (role === "Driver") navigate("/driver");
      else if (role === "Admin") navigate("/admin");
      else navigate("/");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 8,
        mb: 4,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 3,
          boxShadow: 6,
          background: "#f4f6fb",
          borderTop: "4px solid #43cea2",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 800,
            color: "#185a9d",
            letterSpacing: 1,
          }}
        >
          Select Your Role
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 1, mb: 3 }}
        >
          Choose how you want to use NexTrip. You can switch roles later from
          the menu.
        </Typography>

        <Box
          display="flex"
          justifyContent="center"
          gap={2}
          mt={2}
          flexWrap="wrap"
        >
          <Button
            variant="contained"
            disabled={processing || user?.currentRole === "Passenger"}
            onClick={() => handleRoleSelect("Passenger")}
            sx={{
              bgcolor: "#43cea2",
              color: "#fff",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              "&:hover": {
                bgcolor: "#36b38f",
              },
            }}
          >
            I’m a Passenger
          </Button>

          <Button
            variant="contained"
            disabled={processing || user?.currentRole === "Driver"}
            onClick={() => handleRoleSelect("Driver")}
            sx={{
              bgcolor: "#185a9d",
              color: "#fff",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              "&:hover": {
                bgcolor: "#144b82",
              },
            }}
          >
            I’m a Driver
          </Button>

          <Button
            variant="contained"
            disabled={processing || (!isAdmin && user?.currentRole !== "Admin")}
            onClick={() => handleRoleSelect("Admin")}
            sx={{
              bgcolor: "#f39c12",
              color: "#fff",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              "&:hover": {
                bgcolor: "#e08e0b",
              },
            }}
          >
            I’m Admin
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
