import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Avatar,
  Box,
  Divider,
  Grid,
  Paper,
} from "@mui/material";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "Guest User",
    email: "guest@example.com",
    role: "Passenger", // or "Driver"
    picture: "", // if Google login is used
  });

  useEffect(() => {
    // Simulate getting user info from localStorage or Google OAuth
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar
            alt={user.name}
            src={user.picture || ""}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <Typography variant="h5">{user.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user.email}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Role: <strong>{user.role}</strong>
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">Total Rides</Typography>
              <Typography variant="h5">
                {user.role === "Driver" ? 42 : 17}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">
                {user.role === "Driver" ? "Earnings (৳)" : "Spent (৳)"}
              </Typography>
              <Typography variant="h5">
                {user.role === "Driver" ? "3,250" : "1,480"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
