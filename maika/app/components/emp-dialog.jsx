"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Box,
  Container,
  Typography,
  MenuItem
} from "@mui/material";
import Image from "next/image";
import axios from "axios";
import { EMPLOYEE_API } from "../constants/employee/constants";

export default function EmpDialog({
  open,
  setOpen,
  emp,
  setemp,
  action,
  rows,
  setRows,
  setAlert,
  setOpenAlert,
}) {
  const [previewAvatar, setPreviewAvatar] = useState(emp.avatar || "");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setPreviewAvatar(emp.avatar || "");
  }, [emp, open]);

  const handleCloseDialog = () => {
    setOpen(false);
    setPreviewAvatar(emp.avatar || "");
    setErrors({});
  };

  const saveEmp = async () => {
    if (!validateForm()) return;

    try {
      if (!emp.avatar || !emp.avatar.startsWith("data:image/")) {
        setAlert({
          message: "Avatar must be a valid Base64-encoded image.",
          severity: "error",
        });
        setOpenAlert(true);
        return;
      }

      if (action === "add") {
        // Validar si username ya existe
        const check = await axios.get(`http://127.0.0.1:5000/api/v1/users`);
        const exists = check.data.some((user) => user.username === emp.username);

        if (exists) {
          setAlert({
            message: "Username already exists. Please choose another one.",
            severity: "error",
          });
          setOpenAlert(true);
          return;
        }

        // 1. Guardar en staff
        const response = await axios.post(EMPLOYEE_API, emp);
        setRows((prev) => [...prev, response.data]);

        // 2. Guardar en users
        const userPayload = {
          username: emp.username,
          password: emp.password,
          userType: emp.userType,
          name: emp.name
        };

        if (userPayload.username && userPayload.password && userPayload.userType) {
          await axios.post("http://127.0.0.1:5000/api/v1/users", userPayload);
        }

        setAlert({ message: "Employee added successfully", severity: "success" });
      } else {
        const response = await axios.put(`${EMPLOYEE_API}/${emp._id}`, emp);
        if (response.data === "The employee is already up-to-date") {
          setAlert({
            message: "No changes were made, the employee is already up-to-date.",
            severity: "info",
          });
          setOpen(false);
          setOpenAlert(true);
          return;
        }
        setRows((prev) =>
          prev.map((row) => (row._id === emp._id ? response.data : row))
        );
        setAlert({ message: "Employee updated successfully", severity: "success" });
      }

      setOpenAlert(true);
      setOpen(false);
    } catch (error) {
      console.error("Save employee error:", error);
      setAlert({ message: "Failed to save employee", severity: "error" });
      setOpenAlert(true);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setemp({
      ...emp,
      [name]:
        name === "salary"
          ? Number(value)
          : name === "status"
          ? value === "Active"
          : value,
    });

    const newErrors = { ...errors };

    if (name === "name") {
      if (!value.trim()) newErrors.name = "Name is required.";
      else delete newErrors.name;
    }

    if (name === "userType") {
      if (!value) newErrors.userType = "User Type is required.";
      else delete newErrors.userType;
    }

    if (name === "username") {
      if (!value.trim()) newErrors.username = "Username is required.";
      else delete newErrors.username;
    }

    if (name === "email") {
      if (!/\S+@\S+\.\S+/.test(value) || !value.trim())
        newErrors.email = "Enter a valid email address.";
      else delete newErrors.email;
    }

    if (name === "salary") {
      const isValid = /^[0-9]+(\.[0-9]{1,2})?$/.test(value);
      if (!isValid || !value.trim())
        newErrors.salary = "Salary must be a valid number with up to 2 decimals.";
      else delete newErrors.salary;
    }

    if (name === "birthday") {
      if (!value.trim()) newErrors.birthday = "Birthday is required.";
      else delete newErrors.birthday;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!emp.name) newErrors.name = "Name is required.";
    if (!emp.userType) newErrors.userType = "User Type is required.";
    if (!emp.username) newErrors.username = "Username is required.";
    if (!emp.email || !/\S+@\S+\.\S+/.test(emp.email))
      newErrors.email = "Enter a valid email address.";

    const pwdPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!emp.password) {
      newErrors.password = "Password is required.";
    } else if (!pwdPattern.test(emp.password)) {
      newErrors.password = "Password must contain at least one letter and one number.";
    }

    if (!emp.salary || isNaN(emp.salary))
      newErrors.salary = "Salary must be a valid number.";
    if (!emp.birthday) newErrors.birthday = "Birthday is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      if (base64.startsWith("data:image/")) {
        setPreviewAvatar(base64);
        setemp({ ...emp, avatar: base64 });
      } else {
        setAlert({ message: "Invalid image format.", severity: "error" });
        setOpenAlert(true);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog}>
      <DialogTitle>{action === "add" ? "Add Employee" : "Edit Employee"}</DialogTitle>
      <Container>
        <Typography variant="h4" color="#5188a7" gutterBottom>
          Employee details
        </Typography>
      </Container>
      <DialogContent>
        <TextField
          margin="dense"
          name="name"
          label="Full Name"
          fullWidth
          value={emp.name || ""}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          margin="normal"
          select
          required
          fullWidth
          name="userType"
          label="User Type"
          value={emp.userType || ""}
          onChange={handleChange}
          error={!!errors.userType}
          helperText={errors.userType}
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="service">Service</MenuItem>
          <MenuItem value="kitchen">Kitchen</MenuItem>
        </TextField>
        <TextField
          margin="dense"
          name="title"
          label="Title"
          fullWidth
          value={emp.title || ""}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="email"
          label="Email"
          type="email"
          fullWidth
          value={emp.email || ""}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="username"
          label="Username"
          autoComplete="username"
          value={emp.username || ""}
          onChange={handleChange}
          error={!!errors.username}
          helperText={errors.username}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={emp.password || ""}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
        />
        <TextField
          margin="dense"
          name="salary"
          label="Salary"
          type="number"
          fullWidth
          value={emp.salary || ""}
          onChange={handleChange}
          error={!!errors.salary}
          helperText={errors.salary}
        />
        <TextField
          margin="dense"
          name="birthday"
          label="Birthday"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={emp.birthday || ""}
          onChange={handleChange}
          error={!!errors.birthday}
          helperText={errors.birthday}
        />
        <RadioGroup
          name="status"
          value={emp.status === true ? "Active" : "Inactive"}
          onChange={handleChange}
          row
        >
          <FormControlLabel value="Active" control={<Radio />} label="Active" />
          <FormControlLabel value="Inactive" control={<Radio />} label="Inactive" />
        </RadioGroup>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            mt: 2,
          }}
        >
          <Button variant="outlined" component="label">
            Upload Avatar
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>
          {previewAvatar && (
            <Image
              src={previewAvatar}
              alt="Avatar preview"
              width={100}
              height={100}
              style={{ borderRadius: 8 }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} sx={{ fontSize: "1rem" }}>
          Cancel
        </Button>
        <Button
          onClick={saveEmp}
          variant="contained"
          size="large"
          sx={{
            borderRadius: 7,
            p: 1,
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "white",
            backgroundColor: "#5188a7",
          }}
        >
          {action === "add" ? "Add" : "Edit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}