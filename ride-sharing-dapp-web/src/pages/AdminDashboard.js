import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
// Other Material-UI imports you already have...
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
} from "@mui/material";
import {
  LocalTaxi as LocalTaxiIcon,
  People as PeopleIcon,
  DirectionsCar as DirectionsCarIcon,
  MonetizationOn as MonetizationOnIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Reusable Stats Card Component
const GradientStatsCard = ({
  icon,
  title,
  value,
  trend,
  gradient,
  borderColor,
  additionalContent,
}) => (
  <Card
    sx={{
      height: "100%",
      background: gradient,
      borderLeft: `4px solid ${borderColor}`,
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "12px",
            background: "rgba(255,255,255,0.2)",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {trend} {additionalContent}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Recent Rides Table Component
const RecentRidesTable = ({ rides }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Recent Rides
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Passenger</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="right">
              Distance
            </TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="right">
              Fare
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
                      mr: 1,
                      color: "text.secondary",
                      fontSize: "1rem",
                    }}
                  />
                  {ride.passengerName || "Unknown"}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={ride.rideType || "Standard"}
                  size="small"
                  color={
                    ride.rideType === "Premium"
                      ? "primary"
                      : ride.rideType === "XL"
                      ? "secondary"
                      : "default"
                  }
                />
              </TableCell>
              <TableCell align="right">
                {ride.distance?.toFixed(2)} km
              </TableCell>
              <TableCell align="right">${ride.fare}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// Top Drivers List Component
const TopDriversList = ({ drivers }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Top Drivers
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {drivers
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .map((driver, index) => (
          <Box key={index} mb={2}>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar
                src={driver.picture}
                sx={{ width: 40, height: 40, mr: 2 }}
              />
              <Box flexGrow={1}>
                <Typography fontWeight="bold">
                  {driver.fullName || driver.name}
                </Typography>
                <Box display="flex" alignItems="center">
                  <StarIcon sx={{ fontSize: 16, color: "gold", mr: 0.5 }} />
                  <Typography variant="body2">
                    {driver.rating?.toFixed(1) || "5.0"}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {driver.totalRides || 0} rides
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(driver.rating || 5) * 20}
              sx={{ height: 6, borderRadius: 3 }}
              color={
                (driver.rating || 5) >= 4.5
                  ? "success"
                  : (driver.rating || 5) >= 3.5
                  ? "primary"
                  : "warning"
              }
            />
          </Box>
        ))}
    </CardContent>
  </Card>
);

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
    user.role === role ||
    user.currentRole === role ||
    (Array.isArray(user.roles) && user.roles.includes(role));

  const totalRevenue = rideHistory.reduce(
    (sum, ride) => sum + parseFloat(ride.fare || 0),
    0
  );

  const totalRides = rideHistory.length;
  const totalPassengers = userData.filter((user) =>
    hasRole(user, "Passenger")
  ).length;
  const totalDrivers = userData.filter((user) =>
    hasRole(user, "Driver")
  ).length;
  const avgDriverRating =
    driverData.reduce(
      (sum, driver) => sum + (parseFloat(driver.rating) || 0),
      0
    ) / totalDrivers || 0;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  // Compute dynamic weekly revenue
  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyRevenueData = dayMap.map((day) => ({ name: day, revenue: 0 }));

  rideHistory.forEach((ride) => {
    if (!ride.timestamp) return;
    const date = new Date(ride.timestamp);
    const dayIndex = date.getDay();
    weeklyRevenueData[dayIndex].revenue += parseFloat(ride.fare || 0);
  });

  const rideTypeData = ["Standard", "Premium", "Shared"].map((type) => ({
    name: type,
    value: rideHistory.filter((r) => r.rideType === type).length,
  }));

  const topDrivers = [...driverData]
    .filter((d) => d.rating)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      </Box>

      {/* Stats Cards - Now using reusable component */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <GradientStatsCard
            icon={<LocalTaxiIcon fontSize="large" sx={{ color: "#43cea2" }} />}
            title="Total Rides"
            value={totalRides}
            trend="+12% from last week"
            gradient="linear-gradient(135deg, rgba(67,206,162,0.1) 0%, rgba(24,90,157,0.1) 100%)"
            borderColor="#43cea2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <GradientStatsCard
            icon={<PeopleIcon fontSize="large" sx={{ color: "#185a9d" }} />}
            title="Passengers"
            value={totalPassengers}
            trend="+8 new this week"
            gradient="linear-gradient(135deg, rgba(24,90,157,0.1) 0%, rgba(67,206,162,0.1) 100%)"
            borderColor="#185a9d"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <GradientStatsCard
            icon={
              <DirectionsCarIcon fontSize="large" sx={{ color: "#2ecc71" }} />
            }
            title="Drivers"
            value={totalDrivers}
            trend={`Avg. rating: ${avgDriverRating.toFixed(1)}`}
            gradient="linear-gradient(135deg, rgba(46,204,113,0.1) 0%, rgba(24,90,157,0.1) 100%)"
            borderColor="#2ecc71"
            additionalContent={
              <StarIcon
                sx={{ fontSize: 12, color: "gold", verticalAlign: "middle" }}
              />
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <GradientStatsCard
            icon={
              <MonetizationOnIcon fontSize="large" sx={{ color: "#f39c12" }} />
            }
            title="Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            trend="+24% from last month"
            gradient="linear-gradient(135deg, rgba(243,156,18,0.1) 0%, rgba(24,90,157,0.1) 100%)"
            borderColor="#f39c12"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TimelineIcon
                  sx={{
                    mr: 1,
                    background:
                      "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    background:
                      "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Weekly Revenue
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="url(#revenueGradient)"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="100%"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#43cea2" />
                      <stop offset="100%" stopColor="#185a9d" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LocalTaxiIcon
                  sx={{
                    mr: 1,
                    background:
                      "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    background:
                      "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Ride Types
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={rideTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {rideTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#43cea2" : "#185a9d"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <RecentRidesTable rides={rideHistory.slice(0, 6)} />
        </Grid>

        <Grid item xs={12} md={4}>
          <TopDriversList drivers={driverData.slice(0, 5)} />
        </Grid>
      </Grid>
    </Container>
  );
}
