import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function NavBar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!user;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
    navigate("/login");
  };

  const handleRoleNav = (role) => {
    if (!isLoggedIn) {
      toast.warning("Please login first");
      navigate("/login");
      return;
    }
    navigate(role === "Passenger" ? "/passenger" : "/driver");
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        borderBottom: "2px solid #fff",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* App Logo + Buttons */}
        <Box display="flex" alignItems="center" gap={2}>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", cursor: "pointer", color: "#fff" }}
            onClick={() => navigate("/")}
          >
            Ride Sharing DApp
          </Typography>
          {/* <Button
            variant="text"
            sx={{ color: "#fff" }}
            onClick={() => handleRoleNav("Passenger")}
          >
            Ride
          </Button>
          <Button
            variant="text"
            sx={{ color: "#fff" }}
            onClick={() => handleRoleNav("Driver")}
          >
            Drive
          </Button> */}
        </Box>

        {/* Right Side Buttons or Avatar */}
        <Box display="flex" alignItems="center" gap={1}>
          {isLoggedIn && user?.picture && (
            <Tooltip title={user.email}>
              <Avatar
                src={user.picture}
                alt="User"
                sx={{ width: 32, height: 32 }}
              />
            </Tooltip>
          )}

          <IconButton onClick={handleMenuOpen} sx={{ color: "#fff" }}>
            <MenuIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
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
            <MenuItem
              onClick={() => {
                navigate("/select-role");
                handleMenuClose();
              }}
            >
              Select Role
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate("/admin");
                handleMenuClose();
              }}
            >
              Admin Panel
            </MenuItem>
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
