import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";

const RideHistoryList = ({ history, onRebook }) => (
  <Grid container spacing={2}>
    {history.map((ride, i) => (
      <Grid item xs={12} sm={6} key={i}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography>
              <strong>From:</strong> {ride.pickup}
            </Typography>
            <Typography>
              <strong>To:</strong> {ride.dropoff}
            </Typography>
            <Typography>
              <strong>Type:</strong> {ride.rideType}
            </Typography>
            <Typography>
              <strong>Distance:</strong> {ride.distance?.toFixed(2)} km
            </Typography>
            <Typography>
              <strong>Fare:</strong> ${ride.fare}
            </Typography>
            <Box mt={2} textAlign="right">
              <Button variant="outlined" onClick={() => onRebook(ride)}>
                Rebook
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default RideHistoryList;
