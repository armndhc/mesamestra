"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Modal,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

const SignIn = ({ open, onClose }) => {
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed.username || parsed.name || "User");
      } catch (e) {
        console.warn("Invalid user data in localStorage");
      }
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const username = data.get("email");
    const password = data.get("password");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/login`,
        { username, password },
        { withCredentials: true }
      );

      localStorage.setItem("user", JSON.stringify(response.data));
      setUser(response.data.username || response.data.name);
      if (onClose) onClose();
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.error || "Invalid username or password");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    if (onClose) onClose();
  };

  if (user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6">Welcome, {user}</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="sign-in-modal"
      aria-describedby="sign-in-form-modal"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxWidth: 500,
          width: "100%",
        }}
      >
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Username"
                name="email"
                autoComplete="username"
                autoFocus
                disabled={isLoading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: "#5188a7" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </Box>
          </Box>
        </Container>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Modal>
  );
};

export default SignIn;
