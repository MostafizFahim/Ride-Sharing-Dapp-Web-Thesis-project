import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "@mui/material/styles";
import { useUser } from "../components/UserContext";

const gradientButtonStyle = {
  background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
  color: "#fff",
  fontWeight: "bold",
  borderRadius: 2,
  boxShadow: 2,
  py: 1,
  fontSize: "1rem",
  letterSpacing: 0.8,
  transition: "0.3s ease-in-out",
  "&:hover": {
    background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)",
    boxShadow: 4,
  },
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { setUser } = useUser();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    city: "",
    role: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      city,
      role,
      password,
      confirmPassword,
      image,
    } = form;

    if (
      !fullName ||
      !email ||
      !phone ||
      !dateOfBirth ||
      !gender ||
      !city ||
      !role ||
      !password ||
      !confirmPassword ||
      !image
    ) {
      return toast.error("Please fill in all fields");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const baseUser = {
        fullName,
        email,
        phone,
        dateOfBirth,
        gender,
        city,
        password,
        picture: reader.result,
        roles: [role],
        currentRole: role,
        role,
      };

      if (role === "Driver") {
        navigate("/driver-registration", {
          state: { driverBase: baseUser },
        });
      } else {
        setUser(baseUser);
        localStorage.setItem("user", JSON.stringify(baseUser));
        localStorage.setItem("registeredUser", JSON.stringify(baseUser));
        toast.success("Registration successful. Please log in.");
        navigate("/login");
      }
    };
    reader.readAsDataURL(image);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* Left Side - Static, Centered */}
      <Box
        flex={4}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          background: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
          color: "#fff",
          textAlign: "center",
          px: 4,
          py: 6,
          position: "sticky", // keeps it from scrolling
          top: 0,
          height: "100vh",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome Back!
        </Typography>
        <Typography sx={{ mb: 4 }}>
          Already have an account? Click below to sign in.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{
            bgcolor: "#fff",
            color: "#333",
            fontWeight: "bold",
            fontSize: "1rem",
            px: 4,
            py: 1.2,
            borderRadius: "25px",
            ":hover": {
              bgcolor: "#f0f0f0",
            },
          }}
        >
          Sign In
        </Button>
      </Box>

      {/* Right Panel - 60% */}
      <Box
        flex={7}
        sx={{
          height: "100vh",
          overflowY: "auto",
          bgcolor: "#fff",
          px: isMobile ? 2 : 8,
          py: isMobile ? 4 : 6,
        }}
      >
        <Paper
          elevation={3}
          sx={{ maxWidth: 600, mx: "auto", borderRadius: 4, p: 4 }}
        >
          <Typography
            variant="h4"
            align="center"
            fontWeight={900}
            sx={{
              background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1,
              mb: 2,
            }}
          >
            Create Account
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                component="label"
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  color: "#43cea2",
                  borderColor: "#43cea2",
                  "&:hover": {
                    borderColor: "#185a9d",
                    color: "#185a9d",
                  },
                }}
              >
                Upload Profile Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>

              {imagePreview && (
                <Avatar
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    width: 80,
                    height: 80,
                    mx: "auto",
                    my: 1,
                    boxShadow: 2,
                    border: "2px solid #43cea2",
                  }}
                />
              )}

              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
              />
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
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
              <FormControl fullWidth>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  label="Role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Passenger">Passenger</MenuItem>
                  <MenuItem value="Driver">Driver</MenuItem>
                  {/* <MenuItem value="Admin">Admin</MenuItem> */}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={gradientButtonStyle}
              >
                Register
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
