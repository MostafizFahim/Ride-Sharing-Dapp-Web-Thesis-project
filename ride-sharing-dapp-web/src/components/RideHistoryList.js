import React from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";

const RideHistoryList = ({ history = [], onRebook }) => {
  if (!history.length) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="text.secondary">No rides yet.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {history.map((ride, i) => (
        <Grid item xs={12} sm={6} key={i}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography>
                <strong>From:</strong> {ride.pickup || "N/A"}
              </Typography>
              <Typography>
                <strong>To:</strong> {ride.dropoff || "N/A"}
              </Typography>
              <Typography>
                <strong>Type:</strong> {ride.rideType || "N/A"}
              </Typography>
              <Typography>
                <strong>Distance:</strong>{" "}
                {typeof ride.distance === "number"
                  ? `${ride.distance.toFixed(2)} km`
                  : "N/A"}
              </Typography>
              <Typography>
                <strong>Fare:</strong>{" "}
                {ride.fare !== undefined ? `৳${ride.fare}` : "N/A"}
              </Typography>
              <Box mt={2} textAlign="right">
                <Button
                  variant="outlined"
                  onClick={() => onRebook(ride)}
                  disabled={!onRebook}
                >
                  Rebook
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

RideHistoryList.propTypes = {
  history: PropTypes.array,
  onRebook: PropTypes.func,
};

export default RideHistoryList;
