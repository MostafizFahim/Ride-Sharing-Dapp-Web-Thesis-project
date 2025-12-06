import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  LocalTaxi as LocalTaxiIcon,
  People as PeopleIcon,
  DirectionsCar as DirectionsCarIcon,
  MonetizationOn as MonetizationOnIcon,
  Person as PersonIcon,
  Star as StarIcon,
  TravelExplore as TravelExploreIcon,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";

// ---------- Small Components (compact) ---------- //

const SimpleStatCard = ({ icon, label, value, subtitle }) => (
  <Card
    sx={{
      height: "100%",
      borderRadius: 2,
      boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
      bgcolor: "background.paper",
    }}
  >
    <CardContent sx={{ p: 1.75 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            bgcolor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: 0.4 }}
          >
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1.1 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const RecentRidesTable = ({ rides }) => {
  const hasRides = rides && rides.length > 0;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Recent Rides
          </Typography>
          <Chip
            size="small"
            label={`${rides.length || 0}`}
            sx={{ fontSize: 11, height: 22 }}
          />
        </Stack>
        <Divider sx={{ mb: 1.5 }} />

        {hasRides ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Passenger</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Dist.
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Fare (৳)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rides.map((ride, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    {new Date(ride.timestamp || ride.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PersonIcon
                        sx={{
                          mr: 0.5,
                          color: "text.secondary",
                          fontSize: "0.95rem",
                        }}
                      />
                      <Typography variant="body2">
                        {ride.passengerName || "Unknown"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ride.rideType || "Standard"}
                      size="small"
                      variant={ride.rideType ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={ride.status || "Completed"}
                      color={
                        (ride.status || "").toLowerCase().includes("cancelled")
                          ? "error"
                          : (ride.status || "")
                              .toLowerCase()
                              .includes("progress")
                          ? "warning"
                          : "success"
                      }
                      sx={{ fontSize: 11, height: 22 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {ride.distance != null
                      ? `${Number(ride.distance).toFixed(1)}`
                      : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {ride.fare != null
                      ? `${Number(ride.fare).toFixed(0)}`
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Box
            sx={{
              py: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "text.secondary",
            }}
          >
            <TravelExploreIcon sx={{ fontSize: 32, mb: 0.5, opacity: 0.6 }} />
            <Typography variant="body2">
              No rides yet. Data will appear here after bookings.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const TopDriversList = ({ drivers }) => {
  const hasDrivers = drivers && drivers.length > 0;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Top Drivers
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        {hasDrivers ? (
          drivers.map((driver, index) => (
            <Box key={index} mb={1.5}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
                <Avatar
                  src={driver.picture}
                  sx={{ width: 34, height: 34, fontSize: 16 }}
                >
                  {driver.fullName?.[0] ||
                    driver.name?.[0] ||
                    driver.username?.[0] ||
                    "D"}
                </Avatar>
                <Box flexGrow={1}>
                  <Typography
                    fontWeight={600}
                    noWrap
                    variant="body2"
                    sx={{ lineHeight: 1.2 }}
                  >
                    {driver.fullName || driver.name || "Unnamed Driver"}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <StarIcon sx={{ fontSize: 14, color: "#FACC15" }} />
                    <Typography variant="caption">
                      {(driver.rating ?? 5).toFixed(1)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      · {driver.totalRides || 0} rides
                    </Typography>
                  </Box>
                </Box>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(driver.rating ?? 5) * 20}
                sx={{ height: 5, borderRadius: 999 }}
                color={
                  (driver.rating ?? 5) >= 4.5
                    ? "success"
                    : (driver.rating ?? 5) >= 3.8
                    ? "primary"
                    : "warning"
                }
              />
            </Box>
          ))
        ) : (
          <Box
            sx={{
              py: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "text.secondary",
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: 32, mb: 0.5, opacity: 0.6 }} />
            <Typography variant="body2">
              No driver data yet. It will appear here later.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ---------- Main Admin Dashboard (compact layout) ---------- //

export default function AdminDashboard() {
  const theme = useTheme();
  const [rideHistory, setRideHistory] = useState([]);
  const [driverData, setDriverData] = useState([]);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    try {
      const rides = JSON.parse(localStorage.getItem("rideHistory")) || [];
      const drivers = JSON.parse(localStorage.getItem("driverData")) || [];
      const users = JSON.parse(localStorage.getItem("userData")) || [];
      setRideHistory(rides);
      setDriverData(drivers);
      setUserData(users);
    } catch (err) {
      console.error("Error loading data from localStorage", err);
    }
  }, []);

  const hasRole = (user, role) =>
    user?.role === role ||
    user?.currentRole === role ||
    (Array.isArray(user?.roles) && user.roles.includes(role));

  const totalRevenue = useMemo(
    () =>
      rideHistory.reduce((sum, ride) => sum + (parseFloat(ride.fare) || 0), 0),
    [rideHistory]
  );

  const totalRides = rideHistory.length;
  const totalPassengers = userData.filter((user) =>
    hasRole(user, "Passenger")
  ).length;
  const totalDrivers = userData.filter((user) =>
    hasRole(user, "Driver")
  ).length;

  const avgDriverRating = useMemo(() => {
    if (!driverData.length) return 0;
    const rated = driverData.filter((d) => d.rating != null);
    if (!rated.length) return 0;
    const sum = rated.reduce((acc, d) => acc + (parseFloat(d.rating) || 0), 0);
    return sum / rated.length;
  }, [driverData]);

  const hasRides = totalRides > 0;

  // simple weekday revenue chart
  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyRevenueData = dayMap.map((day) => ({ name: day, revenue: 0 }));

  if (hasRides) {
    rideHistory.forEach((ride) => {
      if (!ride.timestamp && !ride.date) return;
      const date = new Date(ride.timestamp || ride.date);
      const dayIndex = date.getDay();
      weeklyRevenueData[dayIndex].revenue += parseFloat(ride.fare) || 0;
    });
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 2,
        background:
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at top left, #020617 0, #020617 60%)"
            : "radial-gradient(circle at top left, #e0f2fe 0, #f9fafb 55%)",
      }}
    >
      <Container maxWidth="lg">
        {/* Header (minimal) */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          flexDirection={{ xs: "column", sm: "row" }}
          mb={2}
          gap={0.5}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                background:
                  "linear-gradient(120deg, #22c55e 0%, #0ea5e9 50%, #6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 0.25,
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overview of rides, drivers, passengers and revenue.
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip size="small" label="Geth" variant="outlined" />
            <Chip size="small" label="IPFS + NFT" variant="outlined" />
          </Stack>
        </Box>

        {/* KPI Row – max 3 cards, tight spacing */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={4}>
            <SimpleStatCard
              icon={
                <LocalTaxiIcon fontSize="small" sx={{ color: "#22c55e" }} />
              }
              label="Total Rides"
              value={totalRides}
              subtitle={hasRides ? "" : "No rides yet"}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <SimpleStatCard
              icon={
                <MonetizationOnIcon
                  fontSize="small"
                  sx={{ color: "#f59e0b" }}
                />
              }
              label="Total Revenue"
              value={`৳${totalRevenue.toFixed(0)}`}
              subtitle=""
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <SimpleStatCard
              icon={
                <DirectionsCarIcon fontSize="small" sx={{ color: "#6366f1" }} />
              }
              label="Drivers / Passengers"
              value={`${totalDrivers} / ${totalPassengers}`}
              subtitle={
                avgDriverRating > 0
                  ? `Avg rating: ${avgDriverRating.toFixed(1)}`
                  : ""
              }
            />
          </Grid>
        </Grid>

        {/* Small Revenue Chart – only if rides exist */}
        {hasRides && (
          <Card
            sx={{
              mb: 2,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "#020617"
                  : "rgba(255,255,255,0.95)",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
                Weekly Revenue
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 2.5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Recent Rides & Top Drivers – tight row */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <RecentRidesTable rides={rideHistory.slice(0, 8)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TopDriversList
              drivers={[...driverData]
                .filter((d) => d.rating != null)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5)}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
