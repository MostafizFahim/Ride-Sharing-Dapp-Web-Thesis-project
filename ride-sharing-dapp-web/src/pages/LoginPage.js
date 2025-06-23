import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../components/UserContext";
import { SvgIcon } from "@mui/material";

const GoogleIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 48 48">
    <path
      fill="#EA4335"
      d="M24 9.5c3.23 0 6.14 1.15 8.44 3.04l6.26-6.26C34.19 2.42 29.38 0 24 0 14.96 0 7.39 5.67 4.28 13.61l7.33 5.69C13.39 13.27 18.34 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.52 24.48c0-1.6-.14-3.14-.4-4.63H24v9.1h12.7c-.55 2.94-2.18 5.44-4.66 7.13l7.33 5.69C43.82 37.46 46.52 31.38 46.52 24.48z"
    />
    <path
      fill="#FBBC05"
      d="M11.61 28.71a14.8 14.8 0 0 1 0-9.43l-7.33-5.69a24.011 24.011 0 0 0 0 20.81l7.33-5.69z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.91-2.13 15.87-5.8l-7.33-5.69c-2.06 1.38-4.68 2.19-8.54 2.19-5.66 0-10.61-3.77-12.39-8.9l-7.33 5.69C7.39 42.33 14.96 48 24 48z"
    />
    <path fill="none" d="M0 0h48v48H0z" />
  </SvgIcon>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = () => {
    const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;

    if (form.email === adminEmail && form.password === adminPassword) {
      const adminUser = {
        name: "Admin",
        email: adminEmail,
        role: "Admin",
        roles: ["Admin"],
        currentRole: "Admin",
      };
      setUser(adminUser);
      localStorage.setItem("user", JSON.stringify(adminUser));
      localStorage.setItem("registeredUser", JSON.stringify(adminUser));
      toast.success("Logged in as Admin");
      navigate("/admin");
      return;
    }

    const registeredUser = JSON.parse(localStorage.getItem("registeredUser"));
    if (
      registeredUser &&
      form.email === registeredUser.email &&
      form.password === registeredUser.password
    ) {
      const userToStore = {
        ...registeredUser,
        roles: registeredUser.roles || [registeredUser.role || "Passenger"],
        currentRole:
          registeredUser.currentRole || registeredUser.role || "Passenger",
      };
      setUser(userToStore);
      localStorage.setItem("user", JSON.stringify(userToStore));
      toast.success("Login successful");

      const { currentRole } = userToStore;
      if (currentRole === "Driver") navigate("/driver");
      else if (currentRole === "Passenger") navigate("/passenger");
      else navigate("/");
      return;
    }

    toast.error("Invalid email or password");
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const decoded = await userInfoRes.json();

        const registeredUser = JSON.parse(
          localStorage.getItem("registeredUser")
        );
        if (registeredUser && registeredUser.email === decoded.email) {
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
          const role =
            userToStore.currentRole ||
            userToStore.role ||
            (userToStore.roles && userToStore.roles[0]) ||
            "Passenger";
          if (role === "Driver") navigate("/driver");
          else if (role === "Admin") navigate("/admin");
          else navigate("/passenger");
        } else {
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
      } catch {
        toast.error("Google login failed");
      }
    },
    onError: () => toast.error("Google login failed"),
  });

  const socialIconStyle = {
    width: 44,
    height: 44,
    borderRadius: "50%",
    backgroundColor: "#fff",
    border: "2px solid #ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.3s",
    "&:hover": {
      backgroundColor: "#f0f0f0",
      transform: "scale(1.08)",
    },
  };

  const GoogleLogo = () => (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
      alt="Google"
      style={{ width: 24, height: 24 }}
    />
  );

  return (
    <Box display="flex" height="100vh">
      {/* Login Section - 70% */}
      <Box
        flex={7}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        px={10}
        bgcolor="#fff"
      >
        <Typography
          variant="h3"
          fontWeight={900}
          gutterBottom
          sx={{ color: "#43cea2" }}
        >
          Welcome Back
        </Typography>
        <Typography variant="h5" color="textSecondary" mb={4}>
          Sign in using social platforms
        </Typography>

        {/* Social logins */}
        <Box display="flex" gap={2} mb={4}>
          <Tooltip title="Google login">
            <IconButton sx={socialIconStyle} onClick={handleGoogleLogin}>
              <GoogleIcon sx={{ fontSize: 26 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Facebook login not available">
            <IconButton
              sx={socialIconStyle}
              onClick={() => toast.info("Facebook login not available for now")}
            >
              <FacebookIcon sx={{ color: "#3b5998", fontSize: 24 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="X login not available">
            <IconButton
              sx={socialIconStyle}
              onClick={() => toast.info("X login not available for now")}
            >
              <TwitterIcon sx={{ color: "#1da1f2", fontSize: 24 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography color="textSecondary" mb={2}>
          — OR —
        </Typography>

        <TextField
          size="small"
          label="Email"
          type="email"
          name="email"
          fullWidth
          value={form.email}
          onChange={handleChange}
          margin="normal"
          InputProps={{
            sx: { borderRadius: "12px" },
          }}
        />
        <TextField
          size="small"
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          fullWidth
          value={form.password}
          onChange={handleChange}
          margin="normal"
          InputProps={{
            sx: { borderRadius: "12px" },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={handleLogin}
          disabled={!form.email || !form.password}
          sx={{
            mt: 4,
            py: 1.1,
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "12px",
            background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
            "&:hover": {
              background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)",
            },
          }}
        >
          Sign In
        </Button>
      </Box>

      {/* Right Panel - 30% */}
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
        }}
      >
        <Typography variant="h3" fontWeight={900} gutterBottom>
          New Here?
        </Typography>
        <Typography variant="h6" maxWidth="80%" mb={4}>
          Sign up and discover a great amount of new opportunities!
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/register")}
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
          Sign Up
        </Button>
      </Box>
    </Box>
  );
}
