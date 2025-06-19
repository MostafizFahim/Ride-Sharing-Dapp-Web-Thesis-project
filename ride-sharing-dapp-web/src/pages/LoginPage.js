import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../components/UserContext"; // <-- use your hook!

const mustangButtonStyle = {
  background: "linear-gradient(90deg, #3793e0 0%, #53a0fd 100%)",
  color: "#fff",
  fontWeight: "bold",
  borderRadius: 3,
  boxShadow: 2,
  py: 1.2,
  letterSpacing: 1,
  fontSize: "1.07rem",
  transition: "background 0.2s, box-shadow 0.2s",
  "&:hover": {
    background: "linear-gradient(90deg, #53a0fd 0%, #3793e0 100%)",
    boxShadow: 4,
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const { setUser } = useUser();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = () => {
    const registeredUser = JSON.parse(localStorage.getItem("registeredUser"));
    if (
      registeredUser &&
      form.email === registeredUser.email &&
      form.password === registeredUser.password
    ) {
      // Enrich with roles and currentRole for dual role support
      const userToStore = {
        ...registeredUser,
        roles: registeredUser.roles || [registeredUser.role || "Passenger"],
        currentRole:
          registeredUser.currentRole || registeredUser.role || "Passenger",
      };
      setUser(userToStore); // Update context
      toast.success("Login successful");

      // Redirect by currentRole
      const { currentRole } = userToStore;
      if (currentRole === "Driver") {
        navigate("/driver");
      } else if (currentRole === "Passenger") {
        navigate("/passenger");
      } else if (currentRole === "Admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      return;
    }
    toast.error("Invalid email or password");
  };

  const handleGoogleLogin = (response) => {
    try {
      const decoded = jwtDecode(response.credential);

      let registeredUser = JSON.parse(localStorage.getItem("registeredUser"));

      if (registeredUser && registeredUser.email === decoded.email) {
        // Existing user
        const userToStore = {
          ...registeredUser,
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          roles: registeredUser.roles || [registeredUser.role || "Passenger"],
          currentRole:
            registeredUser.currentRole || registeredUser.role || "Passenger",
        };
        setUser(userToStore);
        toast.success("Welcome back!");

        // Redirect by role
        const role =
          userToStore.currentRole ||
          userToStore.role ||
          (userToStore.roles && userToStore.roles[0]) ||
          "Passenger";
        if (role === "Driver") navigate("/driver");
        else if (role === "Admin") navigate("/admin");
        else navigate("/passenger");
      } else {
        // First time Google login: let them select role
        const googleUser = {
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          roles: [],
          currentRole: null,
        };
        setUser(googleUser);
        toast.success("Google login successful. Please select your role.");
        navigate("/select-role");
      }
    } catch (err) {
      toast.error("Google login failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f6fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 5,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            width: "100%",
            maxWidth: 460,
            mx: "auto",
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: "#fff",
            boxShadow: "0 8px 24px 0 rgba(80, 120, 255, 0.08)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            fontWeight={900}
            sx={{ color: "#3793e0", letterSpacing: 1.1, mb: 0.5 }}
          >
            Welcome Back
          </Typography>
          <Typography
            align="center"
            color="text.secondary"
            gutterBottom
            sx={{ fontSize: "1.10rem", mb: 1.5 }}
          >
            Sign in to your account to continue
          </Typography>

          <Box mt={3} display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={!form.email || !form.password}
              sx={mustangButtonStyle}
            >
              Sign In
            </Button>
          </Box>

          <Divider sx={{ my: 3, fontWeight: 500, color: "#aaa" }}>or</Divider>

          <Box display="flex" justifyContent="center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google login failed")}
            />
          </Box>

          <Typography align="center" mt={3} sx={{ fontSize: "1rem" }}>
            Don't have an account?{" "}
            <Button
              variant="text"
              sx={{
                color: "#3793e0",
                fontWeight: 700,
                textTransform: "none",
                fontSize: "1rem",
              }}
              onClick={() => navigate("/register")}
            >
              Sign Up
            </Button>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
