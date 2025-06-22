import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  useTheme,
  Chip,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  DirectionsCar as DirectionsCarIcon,
  MonetizationOn as MonetizationOnIcon,
  LocalTaxi as LocalTaxiIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const theme = useTheme();
  const [rideHistory, setRideHistory] = useState([]);
  const [driverData, setDriverData] = useState([]);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    // Load all relevant data from localStorage
    const rides = JSON.parse(localStorage.getItem("rideHistory")) || [];
    const drivers = JSON.parse(localStorage.getItem("driverData")) || [];
    const users = JSON.parse(localStorage.getItem("userData")) || [];

    setRideHistory(rides);
    setDriverData(drivers);
    setUserData(users);
  }, []);

  // Calculate metrics
  const totalRevenue = rideHistory.reduce(
    (sum, ride) => sum + parseFloat(ride.fare || 0),
    0
  );
  const totalRides = rideHistory.length;
  const totalPassengers = userData.filter(
    (user) =>
      user.role === "Passenger" ||
      user.currentRole === "Passenger" ||
      user.roles?.includes("Passenger")
  ).length;
  const totalDrivers = userData.filter(
    (user) =>
      user.role === "Driver" ||
      user.currentRole === "Driver" ||
      user.roles?.includes("Driver")
  ).length;
  const avgDriverRating =
    driverData.reduce((sum, driver) => sum + (driver.rating || 0), 0) /
      totalDrivers || 0;

  // Prepare chart data
  const weeklyRevenueData = [
    { name: "Mon", revenue: 3200 },
    { name: "Tue", revenue: 4200 },
    { name: "Wed", revenue: 3800 },
    { name: "Thu", revenue: 5100 },
    { name: "Fri", revenue: 6800 },
    { name: "Sat", revenue: 7200 },
    { name: "Sun", revenue: 5900 },
  ];

  const rideTypeData = [
    {
      name: "Standard",
      value: rideHistory.filter((r) => r.rideType === "Standard").length,
    },
    {
      name: "Premium",
      value: rideHistory.filter((r) => r.rideType === "Premium").length,
    },
    {
      name: "XL",
      value: rideHistory.filter((r) => r.rideType === "XL").length,
    },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
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
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background:
                "linear-gradient(135deg, rgba(41,128,185,0.1) 0%, rgba(109,213,250,0.1) 100%)",
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "12px",
                    background: "rgba(41,128,185,0.1)",
                  }}
                >
                  <LocalTaxiIcon color="primary" fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Rides
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {totalRides}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    +12% from last week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background:
                "linear-gradient(135deg, rgba(155,89,182,0.1) 0%, rgba(236,112,99,0.1) 100%)",
              borderLeft: `4px solid ${theme.palette.secondary.main}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "12px",
                    background: "rgba(155,89,182,0.1)",
                  }}
                >
                  <PeopleIcon color="secondary" fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Passengers
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {totalPassengers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    +8 new this week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background:
                "linear-gradient(135deg, rgba(39,174,96,0.1) 0%, rgba(46,204,113,0.1) 100%)",
              borderLeft: `4px solid #2ecc71`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "12px",
                    background: "rgba(39,174,96,0.1)",
                  }}
                >
                  <DirectionsCarIcon
                    sx={{ color: "#2ecc71" }}
                    fontSize="large"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Drivers
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {totalDrivers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg. rating: {avgDriverRating.toFixed(1)}{" "}
                    <StarIcon
                      sx={{
                        fontSize: 12,
                        color: "gold",
                        verticalAlign: "middle",
                      }}
                    />
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background:
                "linear-gradient(135deg, rgba(243,156,18,0.1) 0%, rgba(241,196,15,0.1) 100%)",
              borderLeft: `4px solid #f39c12`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "12px",
                    background: "rgba(243,156,18,0.1)",
                  }}
                >
                  <MonetizationOnIcon
                    sx={{ color: "#f39c12" }}
                    fontSize="large"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${totalRevenue.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    +24% from last month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TimelineIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Weekly Revenue</Typography>
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
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LocalTaxiIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Ride Types</Typography>
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
                        fill={COLORS[index % COLORS.length]}
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
                  {rideHistory.slice(0, 6).map((ride, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        {new Date(
                          ride.timestamp || ride.date
                        ).toLocaleDateString()}
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
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Drivers
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {driverData
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 5)
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
                          <StarIcon
                            sx={{ fontSize: 16, color: "gold", mr: 0.5 }}
                          />
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
        </Grid>
      </Grid>
    </Container>
  );
}
