import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Avatar,
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [profilePic, setProfilePic] = useState(null);

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
      localStorage.setItem("user", JSON.stringify(registeredUser));
      toast.success("Login successful");
      navigate("/select-role");
    } else {
      toast.error("Invalid email or password");
    }
  };

  const handleGoogleLogin = (response) => {
    try {
      const decoded = jwtDecode(response.credential);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          role: null,
        })
      );
      toast.success("Google login successful");
      navigate("/select-role");
    } catch (err) {
      toast.error("Google login failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={4} sx={{ mt: 8, p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          Welcome Back
        </Typography>
        <Typography align="center" color="text.secondary" gutterBottom>
          Sign in to continue
        </Typography>

        <Box mt={3} display="flex" flexDirection="column" gap={2}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={!form.email || !form.password}
          >
            Sign In
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>or</Divider>

        <Box display="flex" justifyContent="center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => toast.error("Google login failed")}
          />
        </Box>

        <Typography align="center" mt={3}>
          Don't have an account?{" "}
          <Button variant="text" onClick={() => navigate("/register")}>
            Sign Up
          </Button>
        </Typography>
      </Paper>
    </Container>
  );
}
