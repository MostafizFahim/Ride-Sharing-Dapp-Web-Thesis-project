import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
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
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CloudUpload,
  ArrowBack,
  CheckCircle,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useUser } from "../components/UserContext";

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];

const steps = ["Personal Info", "Vehicle Details", "Documents"];

const mustangButtonStyle = {
  background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
  color: "#fff",
  fontWeight: "bold",
  borderRadius: 3,
  boxShadow: 2,
  py: 1.2,
  letterSpacing: 1,
  fontSize: "1.07rem",
  transition: "background 0.2s, box-shadow 0.2s",
  "&:hover": {
    background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
    boxShadow: 4,
  },
};

export default function DriverRegistration() {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
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
  const { setUser } = useUser();

  // Autofill fields from RegisterPage
  useEffect(() => {
    if (location.state?.driverBase) {
      setFormData((prev) => ({
        ...prev,
        ...location.state.driverBase,
        name: location.state.driverBase.fullName || "",
        profilePhotoUrl: location.state.driverBase.picture || null,
      }));
    }
  }, [location]);

  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "name":
        if (!value.trim()) error = "Name is required";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email format";
        break;
      case "phone":
        if (!/^\d{10,15}$/.test(value)) error = "Invalid phone number";
        break;
      case "password":
        if (value.length < 6) error = "Password must be at least 6 characters";
        break;
      case "vehicleModel":
        if (!value.trim()) error = "Model is required";
        break;
      case "licensePlate":
        if (!value.trim()) error = "License plate is required";
        break;
      case "vehicleYear":
        if (value < 2000 || value > new Date().getFullYear()) {
          error = `Year must be between 2000 and ${new Date().getFullYear()}`;
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    const error = validateField(field, value);

    setFormErrors((prev) => ({ ...prev, [field]: error }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateFile = (file) => {
    if (!file) return "File is required";
    if (file.size > MAX_FILE_SIZE) return "File is too large (max 5MB)";
    if (!ALLOWED_FILE_TYPES.includes(file.type)) return "Invalid file type";
    return "";
  };

  const handleFileUpload = (field) => (e) => {
    const file = e.target.files[0];
    const error = validateFile(file);

    setFormErrors((prev) => ({ ...prev, [field]: error }));

    if (error) {
      toast.error(error);
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: file }));

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

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return (
          formData.name &&
          formData.email &&
          formData.phone &&
          formData.password?.length >= 6 &&
          !Object.keys(formErrors).some(
            (key) =>
              ["name", "email", "phone", "password"].includes(key) &&
              formErrors[key]
          )
        );
      case 1:
        return (
          formData.vehicleModel &&
          formData.licensePlate &&
          !Object.keys(formErrors).some(
            (key) =>
              ["vehicleModel", "licensePlate", "vehicleYear"].includes(key) &&
              formErrors[key]
          )
        );
      case 2:
        return (
          formData.licenseFile &&
          formData.registrationFile &&
          !Object.keys(formErrors).some(
            (key) =>
              ["licenseFile", "registrationFile"].includes(key) &&
              formErrors[key]
          )
        );
      default:
        return false;
    }
  };

  const finishRegistration = async (profilePhotoUrl = "") => {
    setIsSubmitting(true);

    try {
      // In a real app, you would upload files to a server here
      // const licenseUrl = await uploadFile(formData.licenseFile);
      // const registrationUrl = await uploadFile(formData.registrationFile);
      // const photoUrl = profilePhotoUrl || await uploadFile(formData.profilePhoto);

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
        role: "Driver", // legacy for compatibility
        picture:
          profilePhotoUrl || formData.profilePhotoUrl || user.picture || "",
        vehicleType: formData.vehicleType,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear,
        licensePlate: formData.licensePlate,
        vehicleColor: formData.vehicleColor,
        licenseFile: formData.licenseFile?.name,
        registrationFile: formData.registrationFile?.name,
      };

      // Update context for immediate global effect
      setUser(updatedUser);

      // Save as registeredUser and logged-in user for persistence
      localStorage.setItem("registeredUser", JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("driverRegistered", "true");

      toast.success(
        "Driver registration complete. Redirecting to dashboard..."
      );
      navigate("/driver");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isSubmitting) return;

    if (activeStep === steps.length - 1) {
      if (formData.profilePhoto) {
        const reader = new FileReader();
        reader.onload = function (e) {
          finishRegistration(e.target.result);
        };
        reader.onerror = () => {
          toast.error("Error processing profile photo");
          setIsSubmitting(false);
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
                  color: "#185a9d",
                  borderColor: "#43cea2",
                  fontWeight: "bold",
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "#185a9d",
                    color: "#43cea2",
                  },
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
              error={!!formErrors.name}
              helperText={formErrors.name}
              InputProps={{
                readOnly: !!location.state?.driverBase?.fullName,
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
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                readOnly: !!location.state?.driverBase?.email,
              }}
            />
            <TextField
              label="Phone Number"
              fullWidth
              margin="normal"
              required
              value={formData.phone}
              onChange={handleChange("phone")}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              InputProps={{
                readOnly: !!location.state?.driverBase?.phone,
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
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                readOnly: !!location.state?.driverBase?.password,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
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
              error={!!formErrors.vehicleModel}
              helperText={formErrors.vehicleModel}
            />
            <TextField
              label="Year"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ min: 2000, max: new Date().getFullYear() }}
              value={formData.vehicleYear}
              onChange={handleChange("vehicleYear")}
              error={!!formErrors.vehicleYear}
              helperText={formErrors.vehicleYear}
            />
            <TextField
              label="License Plate"
              fullWidth
              margin="normal"
              required
              value={formData.licensePlate}
              onChange={handleChange("licensePlate")}
              error={!!formErrors.licensePlate}
              helperText={formErrors.licensePlate}
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
                <Typography gutterBottom>
                  Driver's License (required)
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload a clear photo or scan of your driver's license (JPEG,
                  PNG, PDF, max 5MB)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  fullWidth
                  disabled={isSubmitting}
                >
                  {formData.licenseFile?.name || "Upload License"}
                  <input
                    type="file"
                    hidden
                    accept="image/*,.pdf"
                    onChange={handleFileUpload("licenseFile")}
                  />
                </Button>
                {formErrors.licenseFile && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {formErrors.licenseFile}
                  </Typography>
                )}
              </CardContent>
            </Card>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography gutterBottom>
                  Vehicle Registration (required)
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload a clear photo or scan of your vehicle registration
                  (JPEG, PNG, PDF, max 5MB)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  fullWidth
                  disabled={isSubmitting}
                >
                  {formData.registrationFile?.name || "Upload Registration"}
                  <input
                    type="file"
                    hidden
                    accept="image/*,.pdf"
                    onChange={handleFileUpload("registrationFile")}
                  />
                </Button>
                {formErrors.registrationFile && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {formErrors.registrationFile}
                  </Typography>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography gutterBottom>Profile Photo (optional)</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload a clear photo of yourself (JPEG, PNG, max 5MB)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  fullWidth
                  disabled={isSubmitting}
                >
                  {formData.profilePhoto?.name || "Upload Photo"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileUpload("profilePhoto")}
                  />
                </Button>
                {formErrors.profilePhoto && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {formErrors.profilePhoto}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        );
      default:
        return null;
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
            sx={{
              background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1,
              mb: 2,
            }}
          >
            Driver Registration
          </Typography>

          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              mb: 3,
              "& .MuiStepLabel-label": {
                color: "#999", // default label color
                fontWeight: 600,
              },
              "& .MuiStepLabel-root.Mui-completed .MuiStepLabel-label": {
                color: "#185a9d", // completed step label
              },
              "& .MuiStepLabel-root.Mui-active .MuiStepLabel-label": {
                background: "linear-gradient(90deg, #43cea2, #185a9d)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              },
              "& .MuiStepIcon-root": {
                color: "#ccc", // default icon color
              },
              "& .MuiStepIcon-root.Mui-active": {
                color: "#43cea2", // active step icon color
              },
              "& .MuiStepIcon-root.Mui-completed": {
                color: "#185a9d", // completed step icon color
              },
            }}
          >
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
                disabled={activeStep === 0 || isSubmitting}
                startIcon={<ArrowBack />}
                sx={{ minWidth: 110 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                endIcon={
                  activeStep === steps.length - 1 ? (
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <CheckCircle />
                    )
                  ) : null
                }
                sx={mustangButtonStyle}
              >
                {activeStep === steps.length - 1
                  ? isSubmitting
                    ? "Processing..."
                    : "Finish Registration"
                  : "Continue"}
              </Button>
            </Box>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}

DriverRegistration.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      driverBase: PropTypes.shape({
        fullName: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
        password: PropTypes.string,
        picture: PropTypes.string,
      }),
    }),
  }),
};
