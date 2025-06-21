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
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "./UserContext";

export default function NavBar() {
  const { user, setUser } = useContext(UserContext);
  const isLoggedIn = !!user;
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const currentRole = user?.currentRole || "Passenger";
  const roles = user?.roles || ["Passenger"];

  // LOGOUT clears both context and localStorage
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
    navigate("/login");
  };

  // Navigates user to dashboard by role
  const handleRoleNav = (role) => {
    if (!isLoggedIn) {
      toast.warning("Please login first");
      navigate("/login");
      return;
    }
    if (role === "Driver") navigate("/driver");
    else if (role === "Passenger") navigate("/passenger");
    else if (role === "Admin") navigate("/admin");
    else navigate("/");
  };

  // Handles switching role in user context
  const handleSwitchRole = () => {
    if (!isLoggedIn) return;
    // Allow dynamic switching if more than one role present
    const availableRoles = roles.filter((r) => r !== currentRole);
    if (availableRoles.length > 0) {
      const newRole = availableRoles[0]; // Switch to the next role available
      const updatedUser = { ...user, currentRole: newRole };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(`Switched to ${newRole} mode`);
      handleRoleNav(newRole);
    } else if (roles.includes("Passenger")) {
      toast.info("Register as a driver to enable driver mode.");
      navigate("/driver-registration");
    } else {
      toast.info("No other role to switch to.");
    }
    handleMenuClose();
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="static"
      elevation={4}
      sx={{
        background: "linear-gradient(90deg, #00274d 0%, #2575fc 100%)",
        borderBottom: "3px solid #b71c1c",
        minHeight: 68,
      }}
    >
      <Toolbar
        sx={{ display: "flex", justifyContent: "space-between", minHeight: 68 }}
      >
        {/* Logo & Current Role */}
        <Box display="flex" alignItems="center" gap={2}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              cursor: "pointer",
              color: "#fff",
              letterSpacing: 2,
              fontSize: { xs: "1.1rem", md: "1.3rem" },
              textShadow: "0 2px 8px rgba(30,40,100,0.2)",
            }}
            onClick={() => navigate("/")}
          >
            NexTrip
          </Typography>
          {isLoggedIn && (
            <Chip
              label={currentRole}
              color={currentRole === "Driver" ? "info" : "primary"}
              size="small"
              sx={{ ml: 1, color: "#fff", fontWeight: 700, bgcolor: "#3793e0" }}
            />
          )}
        </Box>
        {/* Avatar & Menu */}
        <Box display="flex" alignItems="center" gap={1.5}>
          {isLoggedIn && user?.picture && (
            <Tooltip title={user.email}>
              <Avatar
                src={user.picture}
                alt="User"
                sx={{
                  width: 36,
                  height: 36,
                  border: "2px solid #2575fc",
                  boxShadow: "0 2px 6px rgba(33,47,98,0.10)",
                  bgcolor: "#f5f7fa",
                }}
              />
            </Tooltip>
          )}
          <IconButton onClick={handleMenuOpen} sx={{ color: "#fff", ml: 0.5 }}>
            <MenuIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 3,
                minWidth: 200,
                mt: 1,
                boxShadow: 4,
                bgcolor: "#e3ecfa",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                navigate("/ride-history");
                handleMenuClose();
              }}
            >
              Ride History
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate("/ride-in-progress");
                handleMenuClose();
              }}
            >
              Ride In Progress
            </MenuItem>
            {/* Role Switch Option */}
            {isLoggedIn && roles.length > 1 && (
              <MenuItem onClick={handleSwitchRole}>
                Switch to {roles.filter((r) => r !== currentRole)[0]}
              </MenuItem>
            )}
            {isLoggedIn &&
              roles.length === 1 &&
              roles.includes("Passenger") && (
                <MenuItem onClick={handleSwitchRole}>Become a Driver</MenuItem>
              )}
            <MenuItem
              onClick={() => {
                navigate("/driver-registration");
                handleMenuClose();
              }}
            >
              Driver Registration
            </MenuItem>
            {roles.includes("Admin") && (
              <MenuItem
                onClick={() => {
                  navigate("/admin");
                  handleMenuClose();
                }}
              >
                Admin Panel
              </MenuItem>
            )}
            <Divider sx={{ my: 0.5 }} />
            {isLoggedIn && (
              <>
                <MenuItem
                  onClick={() => {
                    navigate("/profile");
                    handleMenuClose();
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleLogout();
                    handleMenuClose();
                  }}
                  sx={{
                    color: "#b71c1c",
                    fontWeight: 700,
                  }}
                >
                  Logout
                </MenuItem>
              </>
            )}
            {!isLoggedIn && (
              <>
                <MenuItem
                  onClick={() => {
                    navigate("/login");
                    handleMenuClose();
                  }}
                >
                  Login
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/register");
                    handleMenuClose();
                  }}
                >
                  Signup
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
