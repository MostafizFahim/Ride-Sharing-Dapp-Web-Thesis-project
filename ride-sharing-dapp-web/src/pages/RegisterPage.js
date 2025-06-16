import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
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
    const { email, password, confirmPassword, image } = form;

    if (!email || !password || !confirmPassword || !image) {
      return toast.error("Please fill in all fields");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const userData = {
        email,
        password,
        picture: reader.result,
        role: null,
      };

      // Simulate backend: save to localStorage
      localStorage.setItem("registeredUser", JSON.stringify(userData));
      toast.success("Registration successful. Please log in.");
      navigate("/login");
    };
    reader.readAsDataURL(image);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={4} sx={{ mt: 8, p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          Create Account
        </Typography>
        <Typography align="center" color="text.secondary" gutterBottom>
          Register to get started
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box mt={3} display="flex" flexDirection="column" gap={2}>
            <Button variant="outlined" component="label">
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
                sx={{ width: 80, height: 80, mx: "auto" }}
              />
            )}

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
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <Button fullWidth variant="contained" type="submit" size="large">
              Register
            </Button>
          </Box>
        </form>

        <Typography align="center" mt={3}>
          Already have an account?{" "}
          <Button variant="text" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        </Typography>
      </Paper>
    </Container>
  );
}
