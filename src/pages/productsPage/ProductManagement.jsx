// src/pages/ProductManagement.jsx - Updated Version

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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Grid,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddIcon from "@mui/icons-material/Add";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const API_PRODUCT_BASE = "/products";
const API_CATEGORY_BASE = "/categories";

const initialVariantState = {
  name: "",
  brand: "",
  price: 0,
  stockQty: 0,
  imageUrl: "",
};

const ProductManagement = () => {
  const { isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for Update Dialog
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // Full product object with variants

  // State for Delete Confirmation
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // State for expanded variant rows
  const [expandedRow, setExpandedRow] = useState(null);
  const handleExpandRow = (productId) => {
    setExpandedRow(expandedRow === productId ? null : productId);
  };
  // --- 1. Data Fetching (READ) ---
  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      isAuthenticated ? logout() : navigate("/admin/login");
    } else {
      fetchData();
    }
  }, [isAuthenticated, isAdmin, navigate, logout]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch Products (assumes backend populates categoryId)
      const productsResponse = await axiosClient.get(API_PRODUCT_BASE);
      // Fetch Categories (for the Update dropdown)
      const categoriesResponse = await axiosClient.get(API_CATEGORY_BASE);

      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. DELETE Product ---
  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    setError("");
    setOpenDeleteDialog(false);
    try {
      await axiosClient.delete(`${API_PRODUCT_BASE}/${deleteId}`);
      setError("Product deleted successfully.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product.");
    }
  };

  // --- 3. UPDATE Product (including Variants) ---
  const handleOpenUpdate = (product) => {
    // Ensure price and stockQty are loaded as strings for TextField
    const variantsForForm = product.variants.map((v) => ({
      ...v,
      price: v.price?.toString() || "0",
      stockQty: v.stockQty?.toString() || "0",
    }));

    const categoryId = product.categoryId?._id || product.categoryId;

    setCurrentProduct({
      ...product,
      categoryId: categoryId,
      variants: variantsForForm, // Use stringified variants
    });
    setOpenUpdateDialog(true);
  };

  const handleCoreChange = (e) => {
    setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const newVariants = currentProduct.variants.map((v, i) => {
      if (i === index) {
        return { ...v, [name]: value };
      }
      return v;
    });
    setCurrentProduct({ ...currentProduct, variants: newVariants });
  };

  const handleAddVariant = () => {
    setCurrentProduct({
      ...currentProduct,
      variants: [...currentProduct.variants, initialVariantState],
    });
  };

  const handleRemoveVariant = (index) => {
    const newVariants = currentProduct.variants.filter((_, i) => i !== index);
    setCurrentProduct({ ...currentProduct, variants: newVariants });
  };

  const handleUpdate = async () => {
    setError("");

    // Final payload structure matches productSchema
    const payload = {
      name: currentProduct.name,
      description: currentProduct.description,
      categoryId: currentProduct.categoryId,
      variants: currentProduct.variants
        .map((v) => ({
          // Must ensure numerical types before sending to backend
          ...v,
          price: parseFloat(v.price),
          stockQty: parseInt(v.stockQty),
        }))
        .filter((v) => v.name && v.price >= 0 && v.stockQty != null), // Filter out incomplete variants
    };

    if (payload.variants.length === 0) {
      setError("Update failed: Product must have at least one valid variant.");
      return;
    }

    try {
      await axiosClient.put(
        `${API_PRODUCT_BASE}/${currentProduct._id}`,
        payload
      );
      setError(`Product ${payload.name} updated successfully.`);
      setOpenUpdateDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product.");
    }
  };

  // --- Render Component ---
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, boxShadow: 6 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" component="h1">
            Product Management
          </Typography>
          <Tooltip title="Logout">
            <IconButton color="error" onClick={logout}>
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {error && (
          <Alert
            severity={error.includes("successfully") ? "success" : "error"}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Products Table (READ) is the same as before */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Variants</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <React.Fragment key={product._id}>
                    <TableRow hover>
                      <TableCell sx={{ maxWidth: 200 }}>
                        {product.name}
                        <Tooltip title={product.description}>
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                            noWrap
                          >
                            {product.description}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {product.categoryId?.name ||
                          categories.find((c) => c._id === product.categoryId)
                            ?.name ||
                          "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleExpandRow(product._id)}
                          endIcon={
                            expandedRow === product._id ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )
                          }
                          size="small"
                        >
                          {product.variants.length} Variants
                        </Button>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenUpdate(product)}
                          aria-label="edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDelete(product._id)}
                          aria-label="delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {/* Variants Sub-table */}
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={4}
                      >
                        <Collapse
                          in={expandedRow === product._id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box
                            sx={{
                              margin: 1,
                              borderLeft: "3px solid #1976d2",
                              p: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              gutterBottom
                              component="div"
                            >
                              Product Variants
                            </Typography>
                            <List dense disablePadding>
                              {product.variants.map((variant, vIndex) => (
                                <ListItem key={variant._id || vIndex} divider>
                                  <Grid container spacing={2}>
                                    <Grid item xs={3}>
                                      <ListItemText
                                        primary={variant.name}
                                        secondary={`Brand: ${variant.brand}`}
                                      />
                                    </Grid>
                                    <Grid item xs={3}>
                                      <ListItemText
                                        primary={`Price: $${variant.price?.toFixed(
                                          2
                                        )}`}
                                      />
                                    </Grid>
                                    <Grid item xs={3}>
                                      <ListItemText
                                        primary={`Stock: ${variant.stockQty}`}
                                      />
                                    </Grid>
                                    <Grid item xs={3}>
                                      <ListItemText
                                        primary={
                                          <a
                                            href={variant.imageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            Image Link
                                          </a>
                                        }
                                        secondary={`ID: ${variant._id}`}
                                      />
                                    </Grid>
                                  </Grid>
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- Update Product Dialog (Full Edit) --- */}
      <Dialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Edit Product: {currentProduct?.name}</DialogTitle>
        <DialogContent>
          {currentProduct && (
            <>
              {/* --- Core Details Section --- */}
              <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Core Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      margin="dense"
                      label="Product Name"
                      name="name"
                      type="text"
                      fullWidth
                      variant="outlined"
                      required
                      value={currentProduct.name}
                      onChange={handleCoreChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      margin="dense"
                      label="Description"
                      name="description"
                      type="text"
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={3}
                      required
                      value={currentProduct.description}
                      onChange={handleCoreChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required margin="dense">
                      <InputLabel id="update-category-label">
                        Category
                      </InputLabel>
                      <Select
                        labelId="update-category-label"
                        name="categoryId"
                        label="Category"
                        value={currentProduct.categoryId}
                        onChange={handleCoreChange}
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>

              {/* --- Variants Management Section --- */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Product Variants ({currentProduct.variants.length})
              </Typography>

              {currentProduct.variants.map((variant, index) => (
                <Paper
                  key={variant._id || index}
                  elevation={2}
                  sx={{ p: 3, mb: 3 }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="subtitle1">
                      Variant #{index + 1} (ID: {variant._id || "New"})
                    </Typography>
                    {currentProduct.variants.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveVariant(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        margin="dense"
                        label="Variant Name"
                        name="name"
                        fullWidth
                        required
                        value={variant.name}
                        onChange={(e) => handleVariantChange(index, e)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        margin="dense"
                        label="Brand"
                        name="brand"
                        fullWidth
                        required
                        value={variant.brand}
                        onChange={(e) => handleVariantChange(index, e)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        margin="dense"
                        label="Price"
                        name="price"
                        type="number"
                        fullWidth
                        required
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, e)}
                        inputProps={{ min: 0.01, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        margin="dense"
                        label="Stock Quantity"
                        name="stockQty"
                        type="number"
                        fullWidth
                        required
                        value={variant.stockQty}
                        onChange={(e) => handleVariantChange(index, e)}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        margin="dense"
                        label="Image URL"
                        name="imageUrl"
                        type="url"
                        fullWidth
                        required
                        value={variant.imageUrl}
                        onChange={(e) => handleVariantChange(index, e)}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddVariant}
                sx={{ mt: 1 }}
              >
                Add New Variant
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Delete Confirmation Dialog is the same as before --- */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this product? This action is
            permanent.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductManagement;
