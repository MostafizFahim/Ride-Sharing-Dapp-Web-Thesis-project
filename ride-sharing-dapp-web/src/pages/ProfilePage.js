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
  Chip,
  IconButton,
  LinearProgress,
  CircularProgress,
  Switch,
  useTheme,
} from "@mui/material";
import { toast } from "react-toastify";
import {
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon,
  MonetizationOn as MoneyIcon,
  LocalTaxi as RideIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Support as SupportIcon,
  History as HistoryIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { useUser } from "../components/UserContext";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// Styled Components
const GradientPaper = styled(Paper)(({ theme }) => ({
  background: "linear-gradient(145deg, #ffffff, #f5f9ff)",
  border: "1px solid rgba(145, 158, 171, 0.12)",
  backdropFilter: "blur(8px)",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  overflow: "hidden",
  padding: theme.spacing(4),
  position: "relative",
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  borderRadius: theme.shape.borderRadius * 2,
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(8px)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #3a7bd5, #00d2ff)",
  color: "white",
  fontWeight: "bold",
  borderRadius: "12px",
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  textTransform: "none",
  boxShadow: "0px 4px 15px rgba(58, 123, 213, 0.4)",
  "&:hover": {
    background: "linear-gradient(45deg, #00d2ff, #3a7bd5)",
  },
}));

export default function ProfilePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, setUser } = useUser();
  const [stats, setStats] = useState({ rides: 0, total: 0 });
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) || false
  );
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [safetyScore, setSafetyScore] = useState(0);

  // Validate user data structure
  const validateUserData = (userData) => {
    if (!userData || typeof userData !== "object") return false;
    return ["name", "email", "currentRole", "roles"].every(
      (field) => field in userData
    );
  };

  // Calculate safety score for drivers
  const calculateSafetyScore = (driverHistory) => {
    const totalRides = driverHistory.length;
    if (totalRides === 0) return 0;

    const safeRides = driverHistory.filter(
      (ride) => ride.safetyRating && ride.safetyRating >= 4
    ).length;
    return Math.round((safeRides / totalRides) * 100);
  };

  // Get ride history with error handling
  const getRideHistory = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      console.error(`Failed to parse ${key}`, e);
      return [];
    }
  };

  // Calculate total fares safely
  const calculateTotal = (rides) => {
    return rides.reduce((sum, ride) => {
      try {
        const fare = parseFloat(ride.fare) || 0;
        return sum + fare;
      } catch (e) {
        console.error("Invalid fare format:", ride.fare);
        return sum;
      }
    }, 0);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (!validateUserData(user)) {
      console.error("Invalid user data structure");
      navigate("/login");
      return;
    }

    setLoading(true);

    const passengerHistory = getRideHistory("rideHistory");
    const driverHistory = getRideHistory("driverHistory");

    setRecentRides(passengerHistory.slice(0, 3));
    setSafetyScore(calculateSafetyScore(driverHistory));

    if (user.currentRole === "Passenger") {
      setStats({
        rides: passengerHistory.length,
        total: calculateTotal(passengerHistory),
      });
      if (passengerHistory.length >= 10) triggerConfetti();
    } else {
      setStats({
        rides: driverHistory.length,
        total: calculateTotal(driverHistory),
      });
      if (driverHistory.length >= 10) triggerConfetti();
    }

    setLoading(false);
  }, [user, navigate]);

  const triggerConfetti = () => {
    toast.success("🎉 Congratulations on reaching 10+ rides!");
  };

  const handleSwitchRole = () => {
    if (!user?.roles || user.roles.length < 2) {
      toast.warning("You only have one role assigned");
      return;
    }

    const nextRole = user.currentRole === "Passenger" ? "Driver" : "Passenger";
    if (!user.roles.includes(nextRole)) {
      toast.error(`You don't have ${nextRole} role access`);
      return;
    }

    const updatedUser = { ...user, currentRole: nextRole };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    toast.success(`Switched to ${nextRole} mode`);
    navigate(`/${nextRole.toLowerCase()}`);
  };

  const handleBecomeDriver = () => {
    if (user.roles.includes("Driver")) {
      toast.info("You already have Driver access");
      return;
    }

    // In a real app, this would involve backend verification
    const updatedUser = {
      ...user,
      roles: [...user.roles, "Driver"],
      currentRole: "Driver",
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    toast.success("Driver mode activated! Verification pending.");
    navigate("/driver");
  };

  const handleBecomePassenger = () => {
    if (user.roles.includes("Passenger")) {
      toast.info("You already have Passenger access");
      return;
    }

    const updatedUser = {
      ...user,
      roles: [...user.roles, "Passenger"],
      currentRole: "Passenger",
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    toast.success("Passenger mode activated!");
    navigate("/passenger");
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));
    // Implement theme switching logic in your theme provider
    toast.info(`Dark mode ${newMode ? "enabled" : "disabled"}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12
      ? "🌞 Good Morning"
      : hour < 18
      ? "🌤️ Good Afternoon"
      : "🌙 Good Evening";
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <GradientPaper>
          <Typography variant="h5" align="center">
            You are not logged in
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mt: 2 }}
          >
            Please{" "}
            <a href="/login" style={{ color: theme.palette.primary.main }}>
              log in
            </a>{" "}
            to view your profile
          </Typography>
        </GradientPaper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container
        maxWidth="sm"
        sx={{ mt: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 12 }}>
      <GradientPaper>
        {/* Dark Mode Toggle */}
        <IconButton
          onClick={toggleDarkMode}
          sx={{ position: "absolute", top: 16, right: 16 }}
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        {/* Profile Header */}
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar
            alt={user.name}
            src={user.picture || ""}
            sx={{
              width: 120,
              height: 120,
              mb: 3,
              border: "4px solid rgba(58, 123, 213, 0.2)",
              boxShadow: "0 4px 20px rgba(58, 123, 213, 0.3)",
            }}
          />

          <Typography variant="h5" sx={{ mb: 1 }}>
            {getGreeting()}, {user.name.split(" ")[0]}!
          </Typography>

          <Chip
            label={user.currentRole}
            color={user.currentRole === "Driver" ? "primary" : "secondary"}
            sx={{
              fontWeight: 700,
              px: 2,
              py: 1,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          />

          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            {user.email}
          </Typography>

          {/* Role Switch Toggle */}
          {user.roles?.length > 1 && (
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Passenger</Typography>
              <Switch
                checked={user.currentRole === "Driver"}
                onChange={handleSwitchRole}
                color="primary"
              />
              <Typography>Driver</Typography>
            </Box>
          )}

          {/* Become Driver/Passenger Buttons */}
          {user.roles?.length === 1 && (
            <GradientButton
              fullWidth
              startIcon={
                user.currentRole === "Passenger" ? (
                  <DirectionsCarIcon />
                ) : (
                  <PersonIcon />
                )
              }
              onClick={
                user.currentRole === "Passenger"
                  ? handleBecomeDriver
                  : handleBecomePassenger
              }
              sx={{
                background:
                  user.currentRole === "Passenger"
                    ? "linear-gradient(45deg, #43cea2, #185a9d)"
                    : "linear-gradient(45deg, #f7971e, #ffd200)",
                "&:hover": {
                  background:
                    user.currentRole === "Passenger"
                      ? "linear-gradient(45deg, #185a9d, #43cea2)"
                      : "linear-gradient(45deg, #ffd200, #f7971e)",
                },
              }}
            >
              Become {user.currentRole === "Passenger" ? "Driver" : "Passenger"}
            </GradientButton>
          )}
        </Box>

        <Divider sx={{ my: 4, borderColor: "rgba(0,0,0,0.08)" }} />

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <StatCard>
              <RideIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                Total Rides
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {stats.rides}
              </Typography>
              {stats.rides > 0 && (
                <LinearProgress
                  variant="determinate"
                  value={Math.min((stats.rides / 10) * 100, 100)}
                  sx={{ height: 8, borderRadius: 4, mt: 2 }}
                />
              )}
            </StatCard>
          </Grid>
          <Grid item xs={6}>
            <StatCard>
              <MoneyIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                {user.currentRole === "Driver" ? "Earnings" : "Spent"}
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                ৳{stats.total.toFixed(2)}
              </Typography>
            </StatCard>
          </Grid>
        </Grid>

        {/* Safety Score (for Drivers) */}
        {user.currentRole === "Driver" && (
          <StatCard sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Safety Score
            </Typography>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={safetyScore}
                size={80}
                thickness={6}
                sx={{
                  color:
                    safetyScore > 75
                      ? "#4caf50"
                      : safetyScore > 50
                      ? "#ff9800"
                      : "#f44336",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6">{safetyScore}%</Typography>
              </Box>
            </Box>
          </StatCard>
        )}

        {/* Achievements */}
        <Paper sx={{ p: 2, mt: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            🏆 Achievements
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {stats.rides >= 5 && (
              <Chip icon={<StarIcon />} label="5+ Rides" color="primary" />
            )}
            {stats.rides >= 10 && (
              <Chip icon={<StarIcon />} label="10+ Rides" color="secondary" />
            )}
            {user.currentRole === "Driver" && (
              <Chip icon={<DirectionsCarIcon />} label="Verified Driver" />
            )}
          </Box>
        </Paper>

        {/* Referral Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<ShareIcon />}
          sx={{ mt: 3, borderRadius: 3 }}
        >
          Invite Friends (Get ৳100 Credit)
        </Button>
      </GradientPaper>

      {/* Quick Actions Bar */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          zIndex: 1000,
          borderRadius: "12px 12px 0 0",
        }}
      >
        <Button startIcon={<SupportIcon />} size="small">
          Support
        </Button>
        <Button
          startIcon={<HistoryIcon />}
          size="small"
          onClick={() => navigate("/ride-history")}
        >
          History
        </Button>
      </Paper>
    </Container>
  );
}
