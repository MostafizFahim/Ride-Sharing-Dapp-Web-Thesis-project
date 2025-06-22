import React from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import {
  History as HistoryIcon,
  DirectionsCar as DriverIcon,
  Person as PassengerIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/UserContext";

export default function RideHistory() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = React.useState(
    user?.currentRole || "Passenger"
  );

  // Get and validate history data from localStorage
  const getValidHistory = (key) => {
    try {
      const history = JSON.parse(localStorage.getItem(key)) || [];
      return history.map((ride) => ({
        ...ride,
        pickup: ride.pickup || "Unknown pickup",
        dropoff: ride.dropoff || "Unknown dropoff",
        fare: ride.fare ? Number(ride.fare) : 0,
        timestamp: ride.timestamp || ride.date || new Date().toISOString(),
        status: ride.status || "Completed",
      }));
    } catch (error) {
      console.error(`Error parsing ${key}:`, error);
      return [];
    }
  };

  const passengerHistory = getValidHistory("rideHistory");
  const driverHistory = getValidHistory("driverRideHistory");
  const history = activeTab === "Passenger" ? passengerHistory : driverHistory;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate("/profile")}
          sx={{ mr: 2 }}
        >
          Back to Profile
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          <HistoryIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Ride History
        </Typography>
      </Box>

      {/* Role Tabs */}
      {user?.roles?.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant={activeTab === "Passenger" ? "contained" : "outlined"}
            startIcon={<PassengerIcon />}
            onClick={() => setActiveTab("Passenger")}
            sx={{ mr: 2 }}
          >
            Passenger Rides
          </Button>
          <Button
            variant={activeTab === "Driver" ? "contained" : "outlined"}
            startIcon={<DriverIcon />}
            onClick={() => setActiveTab("Driver")}
          >
            Driver Rides
          </Button>
        </Box>
      )}

      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        <CardContent>
          {history.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                You haven't taken any {activeTab.toLowerCase()} rides yet
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() =>
                  navigate(activeTab === "Passenger" ? "/book-ride" : "/driver")
                }
              >
                {activeTab === "Passenger"
                  ? "Book Your First Ride"
                  : "Start Driving"}
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: "background.default" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Trip</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Fare
                    </TableCell>
                    {activeTab === "Driver" && (
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Earnings
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((ride, i) => (
                    <TableRow
                      key={i}
                      hover
                      sx={{ "&:last-child td": { borderBottom: 0 } }}
                    >
                      <TableCell>
                        <Typography fontWeight={500}>{ride.pickup}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          to {ride.dropoff}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {new Date(ride.timestamp).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(ride.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>
                          ৳{ride.fare.toFixed(2)}
                        </Typography>
                      </TableCell>
                      {activeTab === "Driver" && (
                        <TableCell align="right">
                          <Typography fontWeight={600} color="success.main">
                            +৳{(ride.fare * 0.8).toFixed(2)}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={ride.status}
                          color={
                            ride.status === "Completed"
                              ? "success"
                              : ride.status === "Cancelled"
                              ? "error"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
