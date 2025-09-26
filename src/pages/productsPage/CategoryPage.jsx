// src/pages/CategoryManagement.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth"; // Assumed location of your Auth hook
import axiosClient from "../../api/axiosClient"; // Assumed location of your configured Axios client
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
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const CategoryManagement = () => {
  // Use the admin check logic from your UserManagement component
  const { isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for Create/New Category Form
  const [newCategoryName, setNewCategoryName] = useState("");

  // State for Update Dialog
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ _id: "", name: "" });

  // State for Delete Confirmation
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // --- 1. Protection and Data Fetching (READ) ---
  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated) {
      navigate("/admin/login");
    } else if (!isAdmin()) {
      logout();
      navigate("/admin/login");
    } else {
      fetchCategories();
    }
  }, [isAuthenticated, isAdmin, navigate, logout]);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      // GET /api/categories is NOT protected by auth,
      // but we use axiosClient which likely includes the base URL
      const response = await axiosClient.get("/categories");
      setCategories(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch categories. Check server connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- 2. CREATE: Add New Category (POST /categories) ---
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!newCategoryName) return;

    try {
      // POST /api/categories IS protected by auth, isAdmin
      // axiosClient automatically sends the admin token
      await axiosClient.post("/categories", { name: newCategoryName });
      setError("Category created successfully!");
      setNewCategoryName("");
      fetchCategories(); // Refresh the list
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create category. Check your admin token."
      );
    }
  };

  // --- 3. UPDATE: Edit Category (PUT /categories/:id) ---
  const handleOpenUpdate = (category) => {
    setCurrentCategory(category);
    setOpenUpdateDialog(true);
  };

  const handleUpdate = async () => {
    setError("");
    try {
      // PUT /api/categories/:id IS protected by auth, isAdmin
      await axiosClient.put(`/categories/${currentCategory._id}`, {
        name: currentCategory.name,
      });
      setError(`Category updated to '${currentCategory.name}' successfully.`);
      setOpenUpdateDialog(false);
      fetchCategories(); // Refresh the list
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update category. Check your admin token."
      );
    }
  };

  // --- 4. DELETE: Remove Category (DELETE /categories/:id) ---
  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    setError("");
    setOpenDeleteDialog(false);
    try {
      // DELETE /api/categories/:id IS protected by auth, isAdmin
      await axiosClient.delete(`/categories/${deleteId}`);
      setError("Category deleted successfully.");
      fetchCategories(); // Refresh the list
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete category. Check your admin token."
      );
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
            Category Management
          </Typography>
          <Tooltip title="Logout">
            <IconButton color="error" onClick={logout}>
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* --- Message/Error Alert --- */}
        {error && (
          <Alert
            severity={error.includes("successfully") ? "success" : "error"}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* --- 2. Create Category Form --- */}
        <Paper sx={{ p: 3, mb: 4, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Add New Category
          </Typography>
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", gap: "10px" }}
          >
            <TextField
              label="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              fullWidth
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ minWidth: "150px" }}
              disabled={!newCategoryName}
            >
              Create
            </Button>
          </form>
        </Paper>

        {/* --- 1. Read/List Categories Table --- */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Existing Categories
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                <TableCell>Name</TableCell>
                <TableCell>ID</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id} hover>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category._id}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenUpdate(category)}
                        aria-label="edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDelete(category._id)}
                        aria-label="delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* --- 3. Update Dialog --- */}
        <Dialog
          open={openUpdateDialog}
          onClose={() => setOpenUpdateDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Edit Category</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              type="text"
              fullWidth
              variant="outlined"
              value={currentCategory.name}
              onChange={(e) =>
                setCurrentCategory({ ...currentCategory, name: e.target.value })
              }
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdate} variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* --- 4. Delete Confirmation Dialog --- */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this category? This will fail if
              products still belong to it.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDelete} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default CategoryManagement;
