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
  Avatar,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SecurityIcon from "@mui/icons-material/Security";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import { motion } from "framer-motion";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { useUser } from "../components/UserContext"; // adjust path if needed

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

const developers = [
  {
    name: "Rayhan Ferdous Srejon",
    role: "Full Stack Developer",
    avatar: "/srejon.jpg",
    socials: {
      facebook: "https://facebook.com/",
      instagram: "https://instagram.com/",
      linkedin: "https://linkedin.com/",
      github: "https://github.com/",
    },
  },
  {
    name: "Mostafiz",
    role: "Frontend Developer",
    avatar: "/Mostafiz.jpg",
    socials: {
      facebook: "https://facebook.com/",
      instagram: "https://instagram.com/",
      linkedin: "https://linkedin.com/",
      github: "https://github.com/",
    },
  },
  {
    name: "Sk. Md. Shadman Ifaz",
    role: "Backend & Blockchain",
    avatar: "/alindo.jpg",
    socials: {
      facebook: "https://facebook.com/",
      instagram: "https://instagram.com/",
      linkedin: "https://linkedin.com/",
      github: "https://github.com/",
    },
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const currentRole = user?.currentRole || user?.role || "Passenger";
  const roles = user?.roles || [user?.role || "Passenger"];

  // Use the right trip history based on active role
  let lastRide = null;
  if (currentRole === "Driver") {
    const driverHistory =
      JSON.parse(localStorage.getItem("driverRideHistory")) || [];
    lastRide = driverHistory[0];
  } else if (currentRole === "Passenger") {
    const rideHistory = JSON.parse(localStorage.getItem("rideHistory")) || [];
    lastRide = rideHistory[0];
  }

  // Greeting logic (updated to show the actual current role and dual-role chip)
  const renderGreeting = () => {
    if (!user) {
      return (
        <>
          <Typography
            component={motion.div}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            variant="h3"
            fontWeight="bold"
            gutterBottom
          >
            Get There. Fast & Secure.
          </Typography>
          <Typography
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            variant="h6"
            mb={6}
          >
            Book a ride instantly with trusted drivers.
          </Typography>
        </>
      );
    }
    return (
      <>
        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
          <Typography
            component={motion.div}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            variant="h4"
            fontWeight="bold"
            gutterBottom
          >
            Welcome back{user.name ? `, ${user.name}` : ""}!
          </Typography>
          {/* <Chip
            label={currentRole}
            color={currentRole === "Driver" ? "info" : "primary"}
            size="medium"
            sx={{
              color: "#fff",
              fontWeight: 700,
              bgcolor: "#3793e0",
              fontSize: "1rem",
            }}
          /> */}
        </Box>
        <Typography
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          variant="h6"
          mb={3}
        >
          {currentRole === "Passenger"
            ? "Need a ride? Book instantly or continue where you left off."
            : currentRole === "Driver"
            ? "Go online and start earning!"
            : currentRole === "Admin"
            ? "Monitor the platform or manage users below."
            : ""}
        </Typography>
      </>
    );
  };

  // Main CTA logic
  const renderCTA = () => {
    if (!user) {
      return (
        <Box
          display="flex"
          gap={2}
          justifyContent="center"
          alignItems="center"
          mt={2}
        >
          <Button
            variant="contained"
            sx={mainButtonStyle}
            onClick={() => navigate("/select-role")}
          >
            Book a Ride
          </Button>
          <Button
            variant="contained"
            sx={mainButtonStyle}
            onClick={() => navigate("/select-role")}
          >
            Become a Driver
          </Button>
        </Box>
      );
    }
    if (currentRole === "Passenger") {
      return (
        <Box display="flex" gap={2} ml={{ xs: 4, md: 8 }}>
          <Button
            variant="contained"
            sx={mainButtonStyle}
            onClick={() => navigate("/passenger")}
          >
            Book a Ride
          </Button>
          {lastRide && (
            <Button
              variant="outlined"
              color="secondary"
              sx={{
                ...mainButtonStyle,
                background: "none",
                color: "#185a9d",
                border: "2px solid #43cea2",
              }}
              onClick={() => navigate("/ride-in-progress")}
            >
              Continue Last Ride
            </Button>
          )}
        </Box>
      );
    }

    if (currentRole === "Driver") {
      return (
        <Button
          variant="contained"
          sx={mainButtonStyle}
          onClick={() => navigate("/driver")}
        >
          Go to Driver Dashboard
        </Button>
      );
    }
    if (currentRole === "Admin") {
      return (
        <Button
          variant="contained"
          sx={mainButtonStyle}
          onClick={() => navigate("/admin")}
        >
          Go to Admin Panel
        </Button>
      );
    }
    return null;
  };

  // --- NEW: Card showing last trip/ride summary only for relevant role ---
  const renderLastTripCard = () => {
    if (!user || !lastRide) return null;

    // Only show for Passenger or Driver, not Admin
    let cardTitle, destinationLabel, btnLabel, btnAction;
    if (currentRole === "Passenger") {
      cardTitle = "Last Ride Summary";
      destinationLabel = "To";
      btnLabel = "Go to Ride";
      btnAction = () => navigate("/ride-in-progress");
    } else if (currentRole === "Driver") {
      cardTitle = "Last Trip as Driver";
      destinationLabel = "To";
      btnLabel = "Go to Driver Dashboard";
      btnAction = () => navigate("/driver");
    } else {
      return null; // Admin and others: do not show
    }

    return (
      <Container maxWidth="sm" sx={{ my: 4 }}>
        <Paper elevation={4} sx={{ p: 3, textAlign: "left", borderRadius: 3 }}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {cardTitle}
          </Typography>
          <Typography>
            <b>From:</b> {lastRide.pickup}
          </Typography>
          <Typography>
            <b>{destinationLabel}:</b> {lastRide.dropoff}
          </Typography>
          <Typography>
            <b>Status:</b>{" "}
            {lastRide.status
              ? lastRide.status.replace("_", " ")
              : "In Progress"}
          </Typography>
          <Typography>
            <b>Fare:</b> {lastRide.fare ? `৳${lastRide.fare}` : "N/A"}
          </Typography>
          <Button
            variant="contained"
            sx={{ ...mainButtonStyle, mt: 2, px: 3 }}
            onClick={btnAction}
          >
            {btnLabel}
          </Button>
        </Paper>
      </Container>
    );
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        sx={{
          height: { xs: "70vh", md: "60vh" },
          backgroundImage: "url('/mustang.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          px: 2,
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(25,30,70,0.48)",
            zIndex: 1,
          }}
        />
        <Box sx={{ position: "relative", zIndex: 2 }}>
          {renderGreeting()}
          {renderCTA()}
        </Box>
      </Box>

      {/* Show last ride/trip summary only for relevant role */}
      {renderLastTripCard()}

      {/* --- Everything below this is unchanged --- */}

      {/* Features Section */}
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: "#fff" }}>
        <Container maxWidth="lg">
          <Typography
            component={motion.div}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            variant="h4"
            textAlign="center"
            mb={4}
            fontWeight="bold"
          >
            Why Choose Us?
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 4,
              justifyContent: "flex-start",
              alignItems: "stretch",
              overflowX: { xs: "auto", md: "visible" },
              px: { xs: 1, md: 0 },
              scrollbarWidth: "thin",
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#e0e0e0",
                borderRadius: 4,
              },
            }}
          >
            {[
              {
                icon: (
                  <DirectionsCarIcon
                    fontSize="large"
                    sx={{ color: "#1976d2" }}
                  />
                ),
                title: "Easy Booking",
              },
              {
                icon: (
                  <SecurityIcon fontSize="large" sx={{ color: "#43cea2" }} />
                ),
                title: "Secure Payments",
              },
              {
                icon: (
                  <TravelExploreIcon
                    fontSize="large"
                    sx={{ color: "#185a9d" }}
                  />
                ),
                title: "Live Tracking",
              },
              {
                icon: (
                  <AttachMoneyIcon fontSize="large" sx={{ color: "#00c853" }} />
                ),
                title: "Affordable Fares",
              },
              {
                icon: (
                  <SupportAgentIcon
                    fontSize="large"
                    sx={{ color: "#fbc02d" }}
                  />
                ),
                title: "24/7 Support",
              },
            ].map((item, index) => (
              <Box
                key={index}
                minWidth={{ xs: 180, sm: 200, md: 220, lg: 200 }}
                maxWidth={240}
                flex="0 0 auto"
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.11 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "center",
                    py: 3,
                    borderRadius: 3,
                    boxShadow: 4,
                    minHeight: 140,
                    transition: "transform 0.18s, box-shadow 0.18s",
                    "&:hover": { transform: "scale(1.05)", boxShadow: 8 },
                  }}
                >
                  <CardContent>
                    <Box
                      component={motion.div}
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: 10 }}
                      transition={{ type: "spring", stiffness: 120 }}
                      display="inline-block"
                      sx={{ mb: 1 }}
                    >
                      {item.icon}
                    </Box>
                    <Typography variant="h6" mt={1.5}>
                      {item.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
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
            fontWeight="bold"
          >
            How It Works
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 4,
              justifyContent: "center",
              alignItems: "stretch",
              overflowX: { xs: "auto", md: "visible" },
              px: { xs: 1, md: 0 },
              scrollbarWidth: "thin",
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#e0e0e0",
                borderRadius: 4,
              },
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
                minWidth={{ xs: 260, sm: 220, md: 240, lg: 260 }}
                maxWidth={300}
                flex="0 0 auto"
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "center",
                    p: 3,
                    borderRadius: 3,
                    boxShadow: 2,
                    minHeight: 190,
                    transition: "transform 0.22s, box-shadow 0.22s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ mb: 2, color: "#185a9d" }}
                    >
                      Step {i + 1}
                    </Typography>
                    <Typography variant="body1">{step}</Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* App Download Banner */}
      <Box
        sx={{
          py: 5,
          background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
          color: "white",
          textAlign: "center",
          mt: 6,
        }}
        component={motion.div}
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9 }}
      >
        <Typography variant="h4" fontWeight="bold" mb={2}>
          Get our app for a faster experience!
        </Typography>
        <Typography mb={3}>
          Book rides, track your driver, and pay securely – all from your phone.
        </Typography>
        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#fff",
              color: "#185a9d",
              fontWeight: "bold",
              borderRadius: 3,
              px: 3,
              "&:hover": { bgcolor: "#f4f4f4" },
            }}
            startIcon={
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                style={{ width: 24, height: 24 }}
              />
            }
            href="#"
            size="large"
          >
            Google Play
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#fff",
              color: "#185a9d",
              fontWeight: "bold",
              borderRadius: 3,
              px: 3,
              "&:hover": { bgcolor: "#f4f4f4" },
            }}
            startIcon={
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg"
                alt="App Store"
                style={{ width: 24, height: 24 }}
              />
            }
            href="#"
            size="large"
          >
            App Store
          </Button>
        </Box>
      </Box>

      {/* Meet the Developers Section */}
      <Box sx={{ py: 6, bgcolor: "#f0f4f8" }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            textAlign="center"
            mb={4}
            fontWeight="bold"
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Meet the Developers
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {developers.map((dev, idx) => (
              <Grid item xs={12} sm={4} key={idx}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.04)" },
                  }}
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.13 }}
                >
                  <Avatar
                    src={dev.avatar}
                    alt={dev.name}
                    sx={{
                      width: 84,
                      height: 84,
                      mx: "auto",
                      mb: 2,
                      boxShadow: 3,
                      border: "3px solid #185a9d",
                    }}
                    component={motion.div}
                    initial={{ scale: 0.7 }}
                    whileHover={{ scale: 1.07, rotate: 8 }}
                    transition={{ type: "spring", stiffness: 160 }}
                  />
                  <Typography variant="h6" fontWeight="bold" mb={0.5}>
                    {dev.name}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    mb={2}
                    fontStyle="italic"
                  >
                    {dev.role}
                  </Typography>
                  <Box display="flex" justifyContent="center" gap={1.5}>
                    <Tooltip title="Facebook">
                      <IconButton
                        component="a"
                        href={dev.socials.facebook}
                        target="_blank"
                        sx={{ color: "#4267B2" }}
                      >
                        <FacebookIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Instagram">
                      <IconButton
                        component="a"
                        href={dev.socials.instagram}
                        target="_blank"
                        sx={{ color: "#E1306C" }}
                      >
                        <InstagramIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="LinkedIn">
                      <IconButton
                        component="a"
                        href={dev.socials.linkedin}
                        target="_blank"
                        sx={{ color: "#0077B5" }}
                      >
                        <LinkedInIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="GitHub">
                      <IconButton
                        component="a"
                        href={dev.socials.github}
                        target="_blank"
                        sx={{ color: "#24292f" }}
                      >
                        <GitHubIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Final CTA Footer */}
      <Box
        component={motion.div}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        sx={{
          width: "100%",
          bgcolor: "#222a35", // dark, trustworthy, footer-style
          color: "white",
          py: { xs: 3, md: 3.5 },
          px: 2,
          textAlign: "center",
          position: "relative",
          mt: { xs: 6, md: 10 },
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 0.5, letterSpacing: 0.3 }}
          >
            Ready to ride or drive?
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 2, opacity: 0.8, fontWeight: 400, maxWidth: 450 }}
          >
            Join now and experience seamless, secure, and smart
            transportation—anytime, anywhere.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={mainButtonStyle}
            onClick={() => navigate("/select-role")}
          >
            Get Started
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

// Button style
const mainButtonStyle = {
  background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
  color: "#fff",
  fontWeight: "bold",
  borderRadius: 3,
  boxShadow: 2,
  px: 4,
  py: 1.2,
  letterSpacing: 1,
  fontSize: "1.1rem",
  transition: "background 0.2s, box-shadow 0.2s",
  "&:hover": {
    background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)",
    boxShadow: 4,
  },
};

export default HomePage;
