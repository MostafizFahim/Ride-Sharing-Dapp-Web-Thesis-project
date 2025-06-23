import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { CssBaseline } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";

// Layout & Context
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserProvider } from "./components/UserContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DriverRegistration from "./pages/DriverRegistration";
import SelectRolePage from "./pages/SelectRolePage";
import PassengerDashboard from "./pages/PassengerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RideInProgress from "./pages/RideInProgress";
import RideHistory from "./pages/RideHistory";
import ProfilePage from "./pages/ProfilePage";
// import PaymentPage from "./pages/PaymentPage"; // ← Coming Soon

export default function App() {
  return (
    <UserProvider>
      <CssBaseline />
      <NavBar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes by Role */}
        <Route
          path="/select-role"
          element={
            <ProtectedRoute>
              <SelectRolePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passenger"
          element={
            <ProtectedRoute requiredRole="Passenger">
              <PassengerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver"
          element={
            <ProtectedRoute requiredRole="Driver">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ride-in-progress"
          element={
            <ProtectedRoute>
              <RideInProgress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ride-history"
          element={
            <ProtectedRoute>
              <RideHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Future Route: Payment */}
        {/* <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        /> */}
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </UserProvider>
  );
}
