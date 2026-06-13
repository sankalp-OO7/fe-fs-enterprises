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
  InputAdornment,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

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

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Password save reminder popup state
  const [passwordReminderOpen, setPasswordReminderOpen] = useState(false);
  const [createdPassword, setCreatedPassword] = useState("");
  const [createdUsername, setCreatedUsername] = useState("");
  const [copied, setCopied] = useState(false);

  // Protection and Data Fetching
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    } else if (!isAdmin()) {
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
      const response = await axiosClient.get("/users");
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
    setShowPassword(false);
    setOpenDialog(true);
  };

  const handleOpenEdit = (u) => {
    setCurrentUser({ ...u, password: "" });
    setIsEditMode(true);
    setShowPassword(false);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setError("");
    setShowPassword(false);
  };

  const handleSave = async () => {
    setError("");
    try {
      if (isEditMode) {
        if (!currentUser.password) {
          const { ...updateData } = currentUser;
          await axiosClient.put(`/users/${currentUser._id}`, updateData);
        } else {
          await axiosClient.put(`/users/${currentUser._id}`, currentUser);
        }
        fetchUsers();
        handleClose();
      } else {
        // Create mode — show password reminder after success
        await axiosClient.post("/users", currentUser);
        fetchUsers();
        handleClose();

        // Store for the reminder popup
        setCreatedUsername(currentUser.username);
        setCreatedPassword(currentUser.password);
        setCopied(false);
        setPasswordReminderOpen(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete user ID: ${id}?`))
      return;
    setError("");
    try {
      await axiosClient.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(createdPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* ───────── Create / Edit Dialog ───────── */}
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

            {/* Password with eye icon */}
            <TextField
              margin="dense"
              label={isEditMode ? "New Password (optional)" : "Password"}
              type={showPassword ? "text" : "password"}
              fullWidth
              variant="outlined"
              value={currentUser.password}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, password: e.target.value })
              }
              required={!isEditMode}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Role — only "user" shown in create mode; all roles in edit mode */}
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
              {(isEditMode ? roles : ["user"]).map((role) => (
                <MenuItem
                  key={role}
                  value={role}
                  disabled={!isEditMode && role !== "user"}
                >
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

        {/* ───────── Password Reminder Popup ───────── */}
        <Dialog
          open={passwordReminderOpen}
          onClose={() => setPasswordReminderOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              border: "2px solid #f59e0b",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 2,
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 30 }} />
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Save the Password Now!
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                पासवर्ड आत्ताच सेव्ह करा!
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            {/* English */}
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                ⚠️ You will <u>NOT</u> be able to see this password again after
                closing this popup. Please save it somewhere safe immediately.
              </Typography>
            </Alert>

            {/* Marathi */}
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                ⚠️ हा पासवर्ड बंद केल्यानंतर परत पाहता <u>येणार नाही</u>.
                कृपया तो आत्ताच कुठेतरी सुरक्षित ठिकाणी नोंदवा.
              </Typography>
            </Alert>

            <Divider sx={{ mb: 2 }} />

            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              textTransform="uppercase"
              display="block"
              mb={0.5}
            >
              User Created
            </Typography>
            <Typography variant="body1" fontWeight={700} mb={2}>
              👤 {createdUsername}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              textTransform="uppercase"
              display="block"
              mb={0.5}
            >
              Password / पासवर्ड
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "#1e293b",
                borderRadius: 2,
                px: 2,
                py: 1.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  flex: 1,
                  fontFamily: "monospace",
                  color: "#fbbf24",
                  letterSpacing: "0.1em",
                  wordBreak: "break-all",
                }}
              >
                {createdPassword}
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy password"}>
                <IconButton
                  onClick={handleCopyPassword}
                  sx={{ color: copied ? "#4ade80" : "#94a3b8" }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1.5, display: "block" }}
            >
              {copied
                ? "✅ Copied to clipboard! / क्लिपबोर्डवर कॉपी झाले!"
                : "Click the copy icon to copy / कॉपी करण्यासाठी वरील चिन्हावर क्लिक करा"}
            </Typography>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              variant="contained"
              color="warning"
              fullWidth
              onClick={() => setPasswordReminderOpen(false)}
              sx={{ borderRadius: 2, fontWeight: 700, py: 1.2 }}
            >
              ✅ I have saved the password / मी पासवर्ड सेव्ह केला आहे
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default UserManagement;
