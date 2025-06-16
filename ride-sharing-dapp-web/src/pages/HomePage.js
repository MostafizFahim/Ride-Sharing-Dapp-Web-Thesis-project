import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SecurityIcon from "@mui/icons-material/Security";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        sx={{
          height: "70vh",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Get There. Fast & Secure.
        </Typography>
        <Typography variant="h6" mb={4}>
          Book a ride instantly with trusted drivers.
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/select-role")}
          >
            Book a Ride
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate("/select-role")}
          >
            Become a Driver
          </Button>
        </Box>
      </Box>

      {/* Features Section - Optimized spacing */}
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: "#fff" }}>
        <Container maxWidth="md">
          <Typography
            component={motion.div}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            variant="h4"
            textAlign="center"
            mb={4}
          >
            Why Choose Us?
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {[
              {
                icon: <DirectionsCarIcon fontSize="large" />,
                title: "Easy Booking",
              },
              {
                icon: <SecurityIcon fontSize="large" />,
                title: "Secure Payments",
              },
              {
                icon: <TravelExploreIcon fontSize="large" />,
                title: "Live Tracking",
              },
            ].map((item, index) => (
              <Grid
                item
                xs={12}
                sm={4}
                key={index}
                component={motion.div}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={index + 1}
                variants={fadeIn}
              >
                <Card sx={{ textAlign: "center", py: 3 }}>
                  <CardContent>
                    {item.icon}
                    <Typography variant="h6" mt={1.5}>
                      {item.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box bgcolor="#f9f9f9" py={6}>
        <Container maxWidth="lg">
          <Typography
            component={motion.div}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            variant="h4"
            textAlign="center"
            mb={6}
          >
            How It Works
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "stretch", // ✅ make all children same height
              flexWrap: "nowrap",
              gap: 3,
              overflowX: "auto",
            }}
          >
            {[
              "Choose your role: Passenger or Driver",
              "Enter pickup and drop-off location",
              "Confirm ride and get matched",
              "Enjoy your journey!",
            ].map((step, i) => (
              <Box
                key={i}
                component={motion.div}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i + 1}
                variants={fadeIn}
                sx={{
                  minWidth: { xs: "250px", sm: "200px", md: "230px" },
                  flex: "1 1 0", // ✅ allows uniform scaling
                  display: "flex", // ✅ child Box behaves like flex container
                  flexDirection: "column",
                }}
              >
                <Card
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "center",
                    p: 3,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight="bold">
                      Step {i + 1}
                    </Typography>
                    <Typography mt={2}>{step}</Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box
        component={motion.div}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        sx={{
          py: 6,
          textAlign: "center",
          backgroundColor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Ready to ride or drive?
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/select-role")}
          sx={{ mt: 2 }}
        >
          Get Started
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
