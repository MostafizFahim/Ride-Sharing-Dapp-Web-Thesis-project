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
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";

export default function AdminDashboard() {
  const [rideHistory, setRideHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("rideHistory")) || [];
    setRideHistory(data);
  }, []);

  const totalRevenue = rideHistory.reduce(
    (sum, ride) => sum + parseFloat(ride.fare || 0),
    0
  );

  const totalRides = rideHistory.length;
  const totalPassengers = 10; // mock data
  const totalDrivers = 5; // mock data

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <LocalTaxiIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h6">Total Rides</Typography>
                  <Typography variant="h5">{totalRides}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PeopleIcon color="secondary" fontSize="large" />
                <Box>
                  <Typography variant="h6">Passengers</Typography>
                  <Typography variant="h5">{totalPassengers}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <DirectionsCarIcon color="action" fontSize="large" />
                <Box>
                  <Typography variant="h6">Drivers</Typography>
                  <Typography variant="h5">{totalDrivers}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <MonetizationOnIcon sx={{ color: "green" }} fontSize="large" />
                <Box>
                  <Typography variant="h6">Revenue</Typography>
                  <Typography variant="h5">
                    ${totalRevenue.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={5}>
        <Typography variant="h6" gutterBottom>
          Latest Rides
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Pickup</TableCell>
              <TableCell>Dropoff</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Distance (km)</TableCell>
              <TableCell>Fare ($)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rideHistory.slice(0, 5).map((ride, index) => (
              <TableRow key={index}>
                <TableCell>{ride.pickup}</TableCell>
                <TableCell>{ride.dropoff}</TableCell>
                <TableCell>{ride.rideType}</TableCell>
                <TableCell>{ride.distance?.toFixed(2)}</TableCell>
                <TableCell>{ride.fare}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
}
