import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  MenuItem,
  InputAdornment,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CloudUpload,
  ArrowBack,
  CheckCircle,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const steps = ["Personal Info", "Vehicle Details", "Documents"];

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

export default function DriverRegistration() {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicleType: "Car",
    vehicleModel: "",
    vehicleYear: "",
    licensePlate: "",
    vehicleColor: "",
    licenseFile: null,
    registrationFile: null,
    profilePhoto: null,
    profilePhotoUrl: null,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Autofill fields from RegisterPage
  useEffect(() => {
    if (location.state && location.state.driverBase) {
      setFormData((prev) => ({
        ...prev,
        ...location.state.driverBase,
        name: location.state.driverBase.fullName || "",
        profilePhotoUrl: location.state.driverBase.picture || null,
      }));
    }
  }, [location]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleFileUpload = (field) => (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, [field]: file });
    if (field === "profilePhoto" && file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({
          ...prev,
          profilePhotoUrl: reader.result,
        }));
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Finish registration (with profile photo if uploaded)
      const finishRegistration = (profilePhotoUrl = "") => {
        // Get the pre-registration user from RegisterPage
        let user = JSON.parse(localStorage.getItem("registeredUser")) || {};
        // If not present, fallback to old driver registration shape
        if (!user.roles) {
          user = {
            ...user,
            roles: ["Passenger"],
            currentRole: "Driver",
          };
        }
        // Ensure driver is in roles
        let roles = user.roles || ["Passenger"];
        if (!roles.includes("Driver")) roles.push("Driver");

        const updatedUser = {
          ...user,
          name: formData.name || user.fullName || "",
          fullName: formData.name || user.fullName || "",
          phone: formData.phone || user.phone || "",
          email: formData.email || user.email || "",
          password: formData.password || user.password || "",
          roles,
          currentRole: "Driver",
          picture:
            profilePhotoUrl || formData.profilePhotoUrl || user.picture || "",
          vehicleType: formData.vehicleType,
          vehicleModel: formData.vehicleModel,
          vehicleYear: formData.vehicleYear,
          licensePlate: formData.licensePlate,
          vehicleColor: formData.vehicleColor,
          // Store these files if you want, or upload to backend in real app
          licenseFile: formData.licenseFile?.name,
          registrationFile: formData.registrationFile?.name,
        };

        // Save as registeredUser and logged-in user
        localStorage.setItem("registeredUser", JSON.stringify(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser)); // Auto-login
        localStorage.setItem("driverRegistered", "true");
        toast.success(
          "Driver registration complete. Redirecting to dashboard..."
        );
        navigate("/driver");
      };

      if (formData.profilePhoto) {
        const reader = new FileReader();
        reader.onload = function (e) {
          finishRegistration(e.target.result);
        };
        reader.readAsDataURL(formData.profilePhoto);
      } else {
        finishRegistration(formData.profilePhotoUrl);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            {formData.profilePhotoUrl && (
              <Avatar
                src={formData.profilePhotoUrl}
                alt="Profile"
                sx={{
                  width: 72,
                  height: 72,
                  mx: "auto",
                  my: 1,
                  boxShadow: 2,
                  border: "2px solid #53a0fd",
                }}
              />
            )}
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              required
              value={formData.name}
              onChange={handleChange("name")}
              InputProps={{
                readOnly: true, // Read-only since comes from registration
              }}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              required
              value={formData.email}
              onChange={handleChange("email")}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Phone Number"
              fullWidth
              margin="normal"
              required
              value={formData.phone}
              onChange={handleChange("phone")}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              required
              value={formData.password}
              onChange={handleChange("password")}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              label="Vehicle Type"
              fullWidth
              margin="normal"
              value={formData.vehicleType}
              onChange={handleChange("vehicleType")}
            >
              {["Car", "Bike", "CNG", "SUV"].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Model"
              fullWidth
              margin="normal"
              required
              value={formData.vehicleModel}
              onChange={handleChange("vehicleModel")}
            />
            <TextField
              label="Year"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ min: 2000, max: new Date().getFullYear() }}
              value={formData.vehicleYear}
              onChange={handleChange("vehicleYear")}
            />
            <TextField
              label="License Plate"
              fullWidth
              margin="normal"
              required
              value={formData.licensePlate}
              onChange={handleChange("licensePlate")}
            />
            <TextField
              label="Color"
              fullWidth
              margin="normal"
              value={formData.vehicleColor}
              onChange={handleChange("vehicleColor")}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography gutterBottom>Driver's License</Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  {formData.licenseFile?.name || "Upload License"}
                  <input
                    type="file"
                    hidden
                    accept="image/*,.pdf"
                    onChange={handleFileUpload("licenseFile")}
                  />
                </Button>
              </CardContent>
            </Card>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography gutterBottom>Vehicle Registration</Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  {formData.registrationFile?.name || "Upload Registration"}
                  <input
                    type="file"
                    hidden
                    accept="image/*,.pdf"
                    onChange={handleFileUpload("registrationFile")}
                  />
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography gutterBottom>Profile Photo</Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  {formData.profilePhoto?.name || "Upload Photo"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileUpload("profilePhoto")}
                  />
                </Button>
              </CardContent>
            </Card>
          </Box>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return (
          formData.name &&
          formData.email &&
          formData.phone &&
          formData.password?.length >= 6
        );
      case 1:
        return formData.vehicleModel && formData.licensePlate;
      case 2:
        return formData.licenseFile && formData.registrationFile;
      default:
        return false;
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
        py: { xs: 2, md: 6 },
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 1, md: 4 } }}>
        <Box sx={{ my: { xs: 1, md: 3 } }}>
          <Typography
            variant="h4"
            align="center"
            fontWeight={900}
            sx={{ color: "#3793e0", letterSpacing: 1, mb: 2 }}
          >
            Driver Registration
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Card sx={{ mt: 2, p: { xs: 2, sm: 4 } }}>
            {renderStepContent(activeStep)}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
                sx={{ minWidth: 110 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid()}
                endIcon={
                  activeStep === steps.length - 1 ? <CheckCircle /> : null
                }
                sx={mustangButtonStyle}
              >
                {activeStep === steps.length - 1
                  ? "Finish Registration"
                  : "Continue"}
              </Button>
            </Box>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
