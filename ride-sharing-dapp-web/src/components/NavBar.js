import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Divider,
  Chip,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "./UserContext";

export default function NavBar() {
  const { user, setUser } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = !!user;
  const currentRole = user?.currentRole || "Passenger";
  const roles = user?.roles || ["Passenger"];

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
    navigate("/");
    handleMenuClose();
  };

  const handleSwitchRole = () => {
    if (!isLoggedIn) return;
    const otherRoles = roles.filter((r) => r !== currentRole);
    if (otherRoles.length > 0) {
      const newRole = otherRoles[0];
      const updatedUser = { ...user, currentRole: newRole };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(`Switched to ${newRole} mode`);
      handleMenuClose();
      navigate(`/${newRole.toLowerCase()}`);
    } else {
      toast.info("No other role to switch to.");
    }
  };

  const handleRegisterPassenger = () => {
    toast.info("Please select Passenger role during registration");
    handleMenuClose();
  };

  const handleRegisterDriver = () => {
    toast.info("Please select Driver role during registration");
    handleMenuClose();
  };

  return (
    <AppBar
      position="static"
      elevation={5}
      sx={{
        background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
        borderBottom: "4px solid #43cea2",
        minHeight: 72,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 2 }}>
        {/* Logo & App Name */}
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <img
              src="/logo123.png"
              alt="NexTrip Logo"
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "10px",
                padding: "4px",
              }}
            />
          </Box>
          <Typography
            variant="h6"
            fontWeight={900}
            sx={{
              color: "#fff",
              letterSpacing: 2,
              fontSize: { xs: "1rem", md: "1.3rem" },
              textShadow: "0 2px 8px rgba(0,0,0,0.15)",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            NexTrip
          </Typography>

          {isLoggedIn && (
            <Chip
              label={currentRole}
              size="small"
              sx={{ bgcolor: "#00c896", color: "#fff", fontWeight: 700, ml: 1 }}
            />
          )}
        </Box>

        {/* User Menu */}
        <Box display="flex" alignItems="center" gap={1.5}>
          {isLoggedIn && user?.picture && (
            <Tooltip title={user.email}>
              <Avatar
                src={user.picture}
                alt="User"
                sx={{
                  width: 38,
                  height: 38,
                  border: "2px solid #fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              />
            </Tooltip>
          )}
          <IconButton onClick={handleMenuOpen} sx={{ color: "#fff" }}>
            <MenuIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                borderRadius: 2,
                boxShadow: 6,
                background: "#f4f6fb",
                minWidth: 200,
              },
            }}
          >
            {/* Home button for all roles */}
            <MenuItem onClick={() => navigate("/")}>
              <HomeIcon sx={{ mr: 1 }} />
              Homepage
            </MenuItem>
            <Divider />

            {isLoggedIn ? (
              <>
                {/* Dashboard Links */}
                {currentRole === "Passenger" && (
                  <MenuItem onClick={() => navigate("/passenger")}>
                    Passenger Dashboard
                  </MenuItem>
                )}
                {currentRole === "Driver" && (
                  <MenuItem onClick={() => navigate("/driver")}>
                    Driver Dashboard
                  </MenuItem>
                )}
                {currentRole === "Admin" && (
                  <MenuItem onClick={() => navigate("/admin")}>
                    Admin Dashboard
                  </MenuItem>
                )}

                {/* Common Features */}
                <MenuItem onClick={() => navigate("/ride-history")}>
                  Ride History
                </MenuItem>

                {currentRole === "Passenger" && (
                  <MenuItem onClick={() => navigate("/ride-in-progress")}>
                    Ride In Progress
                  </MenuItem>
                )}

                {/* Role Management */}
                {roles.length > 1 && (
                  <MenuItem onClick={handleSwitchRole}>
                    Switch to {roles.find((r) => r !== currentRole)}
                  </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={() => navigate("/profile")}>
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{ color: "#b71c1c", fontWeight: 700 }}
                >
                  Logout
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem onClick={() => navigate("/login")}>Login</MenuItem>
                <MenuItem onClick={handleRegisterPassenger}>
                  Register as Passenger
                </MenuItem>
                <MenuItem onClick={handleRegisterDriver}>
                  Register as Driver
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
