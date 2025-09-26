// src/pages/UserManagement.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import axiosClient from "../../api/axiosClient";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const roles = ["user", "admin", "viewer"];
const initialUserState = {
  username: "",
  email: "",
  password: "",
  role: "user",
};

const UserManagement = () => {
  const { user, isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(initialUserState);
  const [isEditMode, setIsEditMode] = useState(false);

  // Protection and Data Fetching
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    } else if (!isAdmin()) {
      // User is authenticated but not an admin (shouldn't happen with AdminLogin)
      logout();
      navigate("/admin/login");
    } else {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin, navigate, logout]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      // GET /api/users is protected by auth, isAdmin
      const response = await axiosClient.get("/users");
      // Filter out the current admin user from the list
      setUsers(response.data.filter((u) => u._id !== user._id));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch users. Check server and token."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCurrentUser(initialUserState);
    setIsEditMode(false);
    setOpenDialog(true);
  };

  const handleOpenEdit = (user) => {
    setCurrentUser({ ...user, password: "" });
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setError("");
  };

  // CREATE and UPDATE Logic (POST /api/users or PUT /api/users/:id)
  const handleSave = async () => {
    setError("");
    try {
      if (isEditMode) {
        // PUT /api/users/:id
        if (!currentUser.password) {
          // Remove password from payload if it's empty, so the service doesn't try to hash an empty string
          const { ...updateData } = currentUser;
          await axiosClient.put(`/users/${currentUser._id}`, updateData);
        } else {
          await axiosClient.put(`/users/${currentUser._id}`, currentUser);
        }
      } else {
        // POST /api/users
        await axiosClient.post("/users", currentUser);
      }
      fetchUsers(); // Refresh the list
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user.");
    }
  };

  // DELETE Logic (DELETE /api/users/:id)
  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete user ID: ${id}?`))
      return;

    setError("");
    try {
      // DELETE /api/users/:id
      await axiosClient.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, boxShadow: 6 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenCreate}
              startIcon={<AddIcon />}
              sx={{ mr: 2 }}
            >
              Add User
            </Button>
            <Tooltip title="Logout">
              <IconButton color="error" onClick={logout}>
                <ExitToAppIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id} hover>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        p: 0.5,
                        borderRadius: 1,
                        color: "white",
                        bgcolor:
                          u.role === "admin"
                            ? "secondary.main"
                            : "primary.main",
                      }}
                    >
                      {u.role}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEdit(u)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(u._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>
            {isEditMode ? "Edit User" : "Create New User"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              value={currentUser.username}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, username: e.target.value })
              }
              required
              sx={{ mt: 1 }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={currentUser.email}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, email: e.target.value })
              }
              required
              disabled={isEditMode}
            />
            <TextField
              margin="dense"
              label={isEditMode ? "New Password (optional)" : "Password"}
              type="password"
              fullWidth
              variant="outlined"
              value={currentUser.password}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, password: e.target.value })
              }
              required={!isEditMode}
            />
            <TextField
              margin="dense"
              select
              label="Role"
              fullWidth
              variant="outlined"
              value={currentUser.role}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, role: e.target.value })
              }
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleSave}
              color="primary"
              variant="contained"
              disabled={
                !currentUser.username ||
                !currentUser.email ||
                (!isEditMode && !currentUser.password)
              }
            >
              {isEditMode ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default UserManagement;
