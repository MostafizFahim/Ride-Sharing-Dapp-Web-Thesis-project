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
} from "@mui/material";

// Mock ride history data
const rideHistory = [
  {
    id: 1,
    pickup: "Banani",
    dropoff: "Dhanmondi",
    fare: 120,
    date: "2025-06-09",
    status: "Completed",
  },
  {
    id: 2,
    pickup: "Gulshan",
    dropoff: "Mirpur",
    fare: 150,
    date: "2025-06-08",
    status: "Cancelled",
  },
  {
    id: 3,
    pickup: "Uttara",
    dropoff: "Shyamoli",
    fare: 200,
    date: "2025-06-07",
    status: "Completed",
  },
];

export default function RideHistory() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ride History
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell>
                <strong>Pickup</strong>
              </TableCell>
              <TableCell>
                <strong>Dropoff</strong>
              </TableCell>
              <TableCell>
                <strong>Fare (৳)</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rideHistory.map((ride) => (
              <TableRow key={ride.id}>
                <TableCell>{ride.date}</TableCell>
                <TableCell>{ride.pickup}</TableCell>
                <TableCell>{ride.dropoff}</TableCell>
                <TableCell>{ride.fare}</TableCell>
                <TableCell>
                  <Chip
                    label={ride.status}
                    color={ride.status === "Completed" ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
