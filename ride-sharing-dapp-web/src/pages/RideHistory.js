import React, { useState } from "react";
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

  const currentRole = user?.currentRole || "Passenger";
  const [activeTab, setActiveTab] = useState(currentRole);

  // Decide where the "Back" button returns
  const backPath = currentRole === "Driver" ? "/driver" : "/passenger";

  // Get and validate history data from localStorage
  const getValidHistory = (key) => {
    try {
      const raw = localStorage.getItem(key);
      const history = raw ? JSON.parse(raw) : [];

      if (!Array.isArray(history)) return [];

      return history.map((ride) => {
        const safeFare =
          ride && ride.fare !== undefined && ride.fare !== null
            ? Number(ride.fare)
            : 0;

        const ts = ride?.timestamp || ride?.date || new Date().toISOString();

        return {
          ...ride,
          pickup: ride?.pickup || "Unknown pickup",
          dropoff: ride?.dropoff || "Unknown dropoff",
          fare: isNaN(safeFare) ? 0 : safeFare,
          timestamp: ts,
          status: ride?.status || "Completed",
        };
      });
    } catch (error) {
      console.error(`Error parsing ${key}:`, error);
      return [];
    }
  };

  // Passenger rides come from PassengerDashboard (on-chain requestRide)
  const passengerHistory = getValidHistory("rideHistory");

  // Driver rides come from DriverDashboard (using match/start/complete)
  const driverHistory = getValidHistory("driverRideHistory");

  const history = activeTab === "Driver" ? driverHistory : passengerHistory;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(backPath)}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          <HistoryIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Ride History
        </Typography>
      </Box>

      {/* Role Tabs (only show if user has both roles) */}
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
                  navigate(activeTab === "Driver" ? "/driver" : "/passenger")
                }
              >
                {activeTab === "Driver"
                  ? "Start Driving"
                  : "Book Your First Ride"}
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: "background.default" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Trip</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Date &amp; Time
                    </TableCell>
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
