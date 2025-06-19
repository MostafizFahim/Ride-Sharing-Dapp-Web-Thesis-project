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

export default function RegisterPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

    // Convert image file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      // --- Roles logic ---
      // Everyone is a passenger by default, unless registering as Admin only.
      let roles = [];
      if (role === "Admin") {
        roles = ["Admin"];
      } else if (role === "Passenger") {
        roles = ["Passenger"];
      } else if (role === "Driver") {
        // By default, most apps treat a driver as also a passenger!
        roles = ["Passenger"];
      }
      const userData = {
        fullName,
        email,
        phone,
        dateOfBirth,
        gender,
        city,
        roles, // <== Array of roles
        currentRole: role, // <== Current role, as selected in form
        password,
        picture: reader.result,
      };

      if (role === "Driver") {
        // Pass data to DriverRegistration, don't save as registered yet
        navigate("/driver-registration", {
          state: {
            driverBase: {
              ...userData,
            },
          },
        });
      } else {
        // For Passenger/Admin, save now
        localStorage.setItem("registeredUser", JSON.stringify(userData));
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
        minWidth: "100vw",
        bgcolor: "#f4f6fb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 0,
        px: 0,
      }}
    >
      <Box
        sx={{
          width: isMobile ? "100vw" : "100vw",
          maxWidth: isMobile ? "100vw" : 800,
          mx: "auto",
          py: isMobile ? 2 : 4,
          px: isMobile ? 1 : 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: "100%",
            maxWidth: isMobile ? "100vw" : 600,
            borderRadius: 4,
            background: "#fff",
            boxShadow: "0 8px 24px 0 rgba(80, 120, 255, 0.08)",
            p: isMobile ? 2 : 4,
            mx: "auto",
            overflow: "auto",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            fontWeight={900}
            sx={{ color: "#3793e0", letterSpacing: 1.1, mb: 0.5 }}
          >
            Create Account
          </Typography>
          <Typography
            align="center"
            color="text.secondary"
            gutterBottom
            sx={{ fontSize: "1.10rem", mb: 1.5 }}
          >
            Register to get started
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box
              mt={2}
              display="flex"
              flexDirection="column"
              gap={isMobile ? 2 : 2.5}
            >
              <Button
                variant="outlined"
                component="label"
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  color: "#3793e0",
                  borderColor: "#3793e0",
                  "&:hover": { borderColor: "#53a0fd", color: "#53a0fd" },
                  width: "100%",
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
                    border: "2px solid #53a0fd",
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
                InputLabelProps={{
                  shrink: true,
                }}
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
                  <MenuItem value="Admin">Admin</MenuItem>
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
                size="large"
                sx={mustangButtonStyle}
              >
                Register
              </Button>
            </Box>
          </form>

          <Typography align="center" mt={3} sx={{ fontSize: "1rem" }}>
            Already have an account?{" "}
            <Button
              variant="text"
              onClick={() => navigate("/login")}
              sx={{
                color: "#3793e0",
                fontWeight: 700,
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              Sign In
            </Button>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
