import React, { useState } from "react";
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
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useUser } from "./UserContext"; // or "../context/UserContext"
import { EXPECTED_CHAIN_ID } from "../utils/web3";

export default function NavBar() {
  const { user, setUser, account, chainId, connectWallet, logout } = useUser();

  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = !!user;
  const currentRole = user?.currentRole || "Passenger";
  const roles = user?.roles || ["Passenger"];

  // Short wallet address
  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const navigateTo = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = () => {
    // If your context has a disconnect/reset wallet, call it here as well
    // e.g., disconnectWallet();
    logout();
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
      navigateTo(`/${newRole.toLowerCase()}`);
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

  const handleConnectWalletClick = () => {
    if (!isLoggedIn) {
      // This shouldn’t be reachable now since button is hidden when logged out,
      // but keep it safe:
      toast.info("Please login first to connect your wallet");
      navigate("/login");
      return;
    }

    connectWallet();
  };

  const walletTooltip =
    account && chainId
      ? chainId === EXPECTED_CHAIN_ID
        ? `Connected: ${account}`
        : `Connected to chain ${chainId}, expected ${EXPECTED_CHAIN_ID}`
      : "Connect your wallet to NexTrip";

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
              sx={{
                bgcolor: "#00c896",
                color: "#fff",
                fontWeight: 700,
                ml: 1,
              }}
            />
          )}
        </Box>

        {/* Right side: Wallet + User Menu */}
        <Box display="flex" alignItems="center" gap={1.5}>
          {/* 🔹 Wallet Section (VISIBLE ONLY IF LOGGED IN) */}
          {isLoggedIn && (
            <>
              {account ? (
                <Tooltip title={walletTooltip}>
                  <Chip
                    icon={<AccountBalanceWalletIcon sx={{ fontSize: 18 }} />}
                    label={shortAddress}
                    sx={{
                      bgcolor: "rgba(0,0,0,0.2)",
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title={walletTooltip}>
                  <span>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      startIcon={<AccountBalanceWalletIcon />}
                      onClick={handleConnectWalletClick}
                      sx={{
                        borderColor: "rgba(255,255,255,0.8)",
                        color: "#fff",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          borderColor: "#fff",
                          backgroundColor: "rgba(0,0,0,0.12)",
                        },
                      }}
                    >
                      Connect Wallet
                    </Button>
                  </span>
                </Tooltip>
              )}
            </>
          )}

          {/* Avatar (if logged in) */}
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

          {/* Menu Icon (always visible) */}
          <IconButton onClick={handleMenuOpen} sx={{ color: "#fff" }}>
            <MenuIcon sx={{ fontSize: 30 }} />
          </IconButton>

          {/* Menu */}
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
            <MenuItem onClick={() => navigateTo("/")}>
              <HomeIcon sx={{ mr: 1 }} />
              Homepage
            </MenuItem>
            <Divider />

            {isLoggedIn ? (
              <>
                {/* Dashboard Links */}
                {currentRole === "Passenger" && (
                  <MenuItem onClick={() => navigateTo("/passenger")}>
                    Passenger Dashboard
                  </MenuItem>
                )}
                {currentRole === "Driver" && (
                  <MenuItem onClick={() => navigateTo("/driver")}>
                    Driver Dashboard
                  </MenuItem>
                )}
                {currentRole === "Admin" && (
                  <MenuItem onClick={() => navigateTo("/admin")}>
                    Admin Dashboard
                  </MenuItem>
                )}

                {/* Common Features */}
                <MenuItem onClick={() => navigateTo("/ride-history")}>
                  Ride History
                </MenuItem>

                {currentRole === "Passenger" && (
                  <MenuItem onClick={() => navigateTo("/ride-in-progress")}>
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

                <MenuItem onClick={() => navigateTo("/profile")}>
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
                <MenuItem onClick={() => navigateTo("/login")}>Login</MenuItem>
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
