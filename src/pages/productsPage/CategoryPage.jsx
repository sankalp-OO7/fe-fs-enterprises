// src/pages/CategoryManagement.jsx
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
  Tooltip,
  Card,
  CardContent,
  InputAdornment,
  Chip,
  Stack,
  Grid,
  Avatar,
  TablePagination,
  LinearProgress,
  Snackbar,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExitToApp as ExitToAppIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 48px rgba(0,0,0,0.12)",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  borderRadius: 12,
  fontWeight: 500,
  padding: "4px 12px",
}));

const CategoryManagement = () => {
  const { isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search and Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Category Form States
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  // Dialog States
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    _id: "",
    name: "",
    description: "",
    createdAt: "",
  });

  // Protection and Initial Data Fetch
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    } else if (!isAdmin()) {
      logout();
      navigate("/admin/login");
    } else {
      fetchCategories();
    }
  }, [isAuthenticated, isAdmin, navigate, logout]);

  // Fetch Categories
  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get("/categories");
      setCategories(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter Categories
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // CREATE: Add New Category
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    
    try {
      const response = await axiosClient.post("/categories", newCategory);
      
      setSuccess(`Category "${newCategory.name}" created successfully!`);
      setNewCategory({ name: "", description: "" });
      setOpenCreateDialog(false);
      fetchCategories();
      
      // Auto-clear success message
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create category. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  // UPDATE: Edit Category
  const handleEditSubmit = async () => {
    setProcessing(true);
    setError("");
    
    try {
      const response = await axiosClient.put(
        `/categories/${currentCategory._id}`,
        {
          name: currentCategory.name,
          description: currentCategory.description,
        }
      );
      
      setSuccess(`Category updated to "${currentCategory.name}" successfully!`);
      setOpenEditDialog(false);
      fetchCategories();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update category. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  // DELETE: Remove Category
  const handleDeleteSubmit = async () => {
    setProcessing(true);
    setError("");
    
    try {
      await axiosClient.delete(`/categories/${currentCategory._id}`);
      
      setSuccess(`Category "${currentCategory.name}" deleted successfully!`);
      setOpenDeleteDialog(false);
      fetchCategories();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete category. It may have associated products."
      );
    } finally {
      setProcessing(false);
    }
  };

  // Format Date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
          Loading categories...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Category Management
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Manage product categories for your store
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="secondary"
                onClick={logout}
                startIcon={<ExitToAppIcon />}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
                }}
              >
                Logout
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => setOpenCreateDialog(true)}
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "white",
                  color: "#667eea",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                Add Category
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: "primary.light",
                    color: "primary.main",
                    width: 56,
                    height: 56,
                  }}
                >
                  <CategoryIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Categories
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {categories.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: "success.light",
                    color: "success.main",
                    width: 56,
                    height: 56,
                  }}
                >
                  <FolderIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Categories
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {categories.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Search and Actions Bar */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <TextField
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchCategories}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Messages */}
      <Fade in={!!error}>
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 2, borderRadius: 2 }}
          icon={<WarningIcon />}
        >
          {error}
        </Alert>
      </Fade>

      <Fade in={!!success}>
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{ mb: 2, borderRadius: 2 }}
          icon={<CheckCircleIcon />}
        >
          {success}
        </Alert>
      </Fade>

      {/* Categories Table */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        {processing && <LinearProgress />}
        
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>CATEGORY</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>DESCRIPTION</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>CREATED DATE</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <CategoryIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        {searchTerm ? "No categories found" : "No categories yet"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Click 'Add Category' to get started"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((category) => (
                  <Zoom in key={category._id}>
                    <StyledTableRow>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{
                              bgcolor: "primary.light",
                              color: "primary.main",
                            }}
                          >
                            <CategoryIcon />
                          </Avatar>
                          <Box>
                            <Typography fontWeight="medium">
                              {category.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {category._id.substring(0, 8)}...
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {category.description || "No description"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(category.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => {
                                setCurrentCategory(category);
                                setOpenEditDialog(true);
                              }}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => {
                                setCurrentCategory(category);
                                setOpenDeleteDialog(true);
                              }}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </StyledTableRow>
                  </Zoom>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredCategories.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
        />
      </Paper>

      {/* Create Category Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Create New Category
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreateSubmit} sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              type="text"
              fullWidth
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              required
              disabled={processing}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CategoryIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="dense"
              label="Description (Optional)"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              disabled={processing}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setOpenCreateDialog(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            color="primary"
            disabled={processing || !newCategory.name}
            startIcon={processing ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {processing ? "Creating..." : "Create Category"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Edit Category
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              type="text"
              fullWidth
              value={currentCategory.name}
              onChange={(e) =>
                setCurrentCategory({ ...currentCategory, name: e.target.value })
              }
              required
              disabled={processing}
              sx={{ mb: 3 }}
            />
            <TextField
              margin="dense"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={currentCategory.description || ""}
              onChange={(e) =>
                setCurrentCategory({
                  ...currentCategory,
                  description: e.target.value,
                })
              }
              disabled={processing}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setOpenEditDialog(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
            disabled={processing || !currentCategory.name}
            startIcon={processing ? <CircularProgress size={20} /> : <EditIcon />}
          >
            {processing ? "Updating..." : "Update Category"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" color="error">
            Delete Category
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Avatar
              sx={{
                bgcolor: "error.light",
                color: "error.main",
                width: 60,
                height: 60,
                mx: "auto",
                mb: 2,
              }}
            >
              <WarningIcon fontSize="large" />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Are you sure?
            </Typography>
            <Typography color="text.secondary">
              You are about to delete the category{" "}
              <strong>"{currentCategory.name}"</strong>. This action cannot be
              undone.
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Note: This will fail if products are associated with this
                category.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteSubmit}
            variant="contained"
            color="error"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {processing ? "Deleting..." : "Delete Category"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoryManagement;