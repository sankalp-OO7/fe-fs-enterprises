// src/pages/Register.jsx (MUI Refactor with Secret Key)

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Import MUI Components
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link as MuiLink,
} from "@mui/material";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    secretKey: "", // ✅ Added secret key field
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Registering user...");
    setIsError(false);

    try {
      await axios.post(`${API_URL}/api/auth/register-admin`, formData);

      setMessage("User registered successfully! Redirecting to login...");
      setIsError(false);

      setFormData({ username: "", email: "", password: "", secretKey: "" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please check server status.";
      setMessage(errorMessage);
      setIsError(true);
      console.error("User Registration Error:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Create an Account
        </Typography>

        {message && (
          <Alert
            severity={isError ? "error" : "success"}
            sx={{ width: "100%", mb: 2 }}
          >
            {message}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1, width: "100%" }}
        >
          {/* Username */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
          />

          {/* Email */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />

          {/* Password */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Secret Key */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="secretKey"
            label="Secret Key"
            type="password"
            id="secretKey"
            value={formData.secretKey}
            onChange={handleChange}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Register
          </Button>

          {/* Login Link */}
          <Box textAlign="center">
            <MuiLink component={Link} to="/login" variant="body2">
              Already have an account? Log In
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
