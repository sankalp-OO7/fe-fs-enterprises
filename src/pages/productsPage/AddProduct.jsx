// src/pages/ProductForm.jsx - Simple Single Page Awesome Form

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import axiosClient from "../../api/axiosClient";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  IconButton,
  Divider,
  Fade,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  InputAdornment,
  Grid,
  Dialog,
  DialogContent,
  LinearProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BrandingWatermarkIcon from "@mui/icons-material/BrandingWatermark";
import ImageIcon from "@mui/icons-material/Image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import { styled, alpha, keyframes } from "@mui/material/styles";

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

// Styled Components
const GradientContainer = styled(Container)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha("#6366f1", 0.05)} 0%, ${alpha(
    "#8b5cf6",
    0.05
  )} 100%)`,
  borderRadius: "24px",
  padding: theme.spacing(4),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 20% 30%, ${alpha(
      "#6366f1",
      0.1
    )} 0%, transparent 50%), 
                     radial-gradient(circle at 80% 70%, ${alpha(
                       "#8b5cf6",
                       0.1
                     )} 0%, transparent 50%)`,
    pointerEvents: "none",
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  background: `linear-gradient(145deg, ${alpha("#ffffff", 0.9)}, ${alpha(
    "#f8fafc",
    0.9
  )})`,
  backdropFilter: "blur(20px)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 20px 40px ${alpha("#000000", 0.1)}, 0 0 0 1px ${alpha(
    "#ffffff",
    0.5
  )} inset`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 25px 50px ${alpha("#000000", 0.15)}`,
  },
}));

const AnimatedCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  background: `linear-gradient(145deg, ${alpha("#ffffff", 0.95)}, ${alpha(
    "#f1f5f9",
    0.95
  )})`,
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  marginBottom: theme.spacing(3),
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: `linear-gradient(90deg, transparent, ${alpha(
      "#6366f1",
      0.1
    )}, transparent)`,
    transition: "left 0.5s ease",
  },
  "&:hover": {
    transform: "translateY(-4px) scale(1.01)",
    borderColor: theme.palette.primary.main,
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
    "&::before": {
      left: "100%",
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    background: `linear-gradient(145deg, ${alpha("#ffffff", 0.8)}, ${alpha(
      "#f8fafc",
      0.8
    )})`,
    transition: "all 0.3s ease",
    "&:hover": {
      "& > fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: "2px",
      },
    },
    "&.Mui-focused": {
      transform: "scale(1.02)",
      "& > fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: "2px",
        boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
      },
    },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 600,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px",
  padding: "12px 32px",
  fontWeight: 700,
  fontSize: "1rem",
  textTransform: "none",
  position: "relative",
  overflow: "hidden",
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  color: "white",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
    transition: "left 0.5s ease",
  },
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 15px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
    "&::before": {
      left: "100%",
    },
  },
  "&:active": {
    transform: "translateY(0)",
  },
}));

const AddVariantButton = styled(GradientButton)(({ theme }) => ({
  width: "100%",
  padding: "16px 32px",
  fontSize: "1.1rem",
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
  "&:hover": {
    boxShadow: `0 15px 30px ${alpha(theme.palette.success.main, 0.4)}`,
  },
}));

const VariantAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  animation: `${float} 3s ease-in-out infinite`,
  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
}));

// Helper function to create unique IDs for variants
const generateUniqueId = () =>
  `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialVariantState = () => ({
  id: generateUniqueId(),
  name: "",
  brand: "",
  price: "",
  stockQty: "",
  imageUrl: "",
});

const initialProductState = {
  name: "",
  description: "",
  categoryId: "",
  variants: [initialVariantState()],
};

const ProductForm = () => {
  const { isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(initialProductState);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Protection and Data Fetching
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

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await axiosClient.get("/categories");
      setCategories(response.data);
    } catch (err) {
      setError(
        "Failed to load categories. Cannot create product without them."
      );
      console.log(err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fixed handlers with proper state isolation
  const handleProductChange = useCallback((e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleVariantChange = useCallback((variantId, field, value) => {
    setProduct((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant
      ),
    }));
  }, []);

  const handleAddVariant = useCallback(() => {
    setProduct((prev) => ({
      ...prev,
      variants: [...prev.variants, initialVariantState()],
    }));
  }, []);

  const handleRemoveVariant = useCallback((variantId) => {
    setProduct((prev) => ({
      ...prev,
      variants: prev.variants.filter((variant) => variant.id !== variantId),
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { variants, ...baseProduct } = product;

    // Basic validation
    if (variants.length === 0 || !baseProduct.categoryId) {
      setError(
        "Product must have at least one variant and a selected category."
      );
      setLoading(false);
      return;
    }

    const payload = {
      ...baseProduct,
      variants: variants
        .map(({ id, ...v }) => ({
          ...v,
          price: parseFloat(v.price),
          stockQty: parseInt(v.stockQty),
        }))
        .filter(
          (v) =>
            v.name && v.brand && v.price && v.stockQty != null && v.imageUrl
        ),
    };

    if (payload.variants.length === 0) {
      setError("At least one variant must be completely filled out.");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosClient.post("/products", payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        setProduct({
          name: "",
          description: "",
          categoryId: "",
          variants: [initialVariantState()],
        });
        setSubmitSuccess(false);
        setError(`Product "${response.data.name}" created successfully!`);
        setTimeout(() => setError(""), 5000);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  if (categoriesLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 8,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
          Loading Categories...
        </Typography>
      </Box>
    );
  }

  if (categories.length === 0 && !categoriesLoading) {
    return (
      <GradientContainer maxWidth="md" sx={{ mt: 5 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: "16px",
            fontSize: "1.1rem",
            "& .MuiAlert-icon": { fontSize: "2rem" },
          }}
        >
          <Typography variant="h6" gutterBottom>
            No Categories Found
          </Typography>
          Please create categories first using the Category Management page.
        </Alert>
      </GradientContainer>
    );
  }

  // Success Dialog
  const SuccessDialog = () => (
    <Dialog open={submitSuccess} maxWidth="sm" fullWidth>
      <DialogContent sx={{ textAlign: "center", py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Product Created Successfully! 🎉
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your product has been added to the catalog.
        </Typography>
        <LinearProgress sx={{ mt: 3, borderRadius: "4px" }} />
      </DialogContent>
    </Dialog>
  );

  return (
    <GradientContainer component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 900, mb: 1 }}
          >
            Create New Product ✨
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Add amazing products to your catalog
          </Typography>
        </Box>

        {/* Error/Success Alert */}
        {error && (
          <Alert
            severity={error.includes("successfully") ? "success" : "error"}
            sx={{ mb: 3, borderRadius: "12px", fontSize: "1rem" }}
          >
            {error}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Product Information Section */}
          <StyledPaper sx={{ p: 4, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <ProductionQuantityLimitsIcon
                sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Product Information
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Product Name"
                  name="name"
                  value={product.name}
                  onChange={handleProductChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ProductionQuantityLimitsIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required sx={{ minWidth: 280 }}>
                  <InputLabel
                    id="category-label"
                    sx={{ fontSize: "1.1rem", fontWeight: 600 }}
                  >
                    Product Category
                  </InputLabel>
                  <Select
                    fullWidth
                    labelId="category-label"
                    name="categoryId"
                    value={product.categoryId}
                    label="Product Category"
                    onChange={handleProductChange}
                    sx={{
                      borderRadius: "12px",
                      background: `linear-gradient(145deg, ${alpha(
                        "#ffffff",
                        0.8
                      )}, ${alpha("#f8fafc", 0.8)})`,
                      "& .MuiSelect-select": {
                        padding: "16.5px 14px",
                        fontSize: "1rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover": {
                          "& > fieldset": {
                            borderColor: "primary.main",
                            borderWidth: "2px",
                          },
                        },
                        "&.Mui-focused": {
                          transform: "scale(1.02)",
                          "& > fieldset": {
                            borderColor: "primary.main",
                            borderWidth: "2px",
                            boxShadow: `0 0 20px ${alpha("#1976d2", 0.2)}`,
                          },
                        },
                      },
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon color="primary" />
                      </InputAdornment>
                    }
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: "12px",
                          mt: 1,
                          "& .MuiMenuItem-root": {
                            fontSize: "1.1rem", // ✅ bigger text
                            fontWeight: 500,
                            padding: "14px 20px", // ✅ bigger clickable area
                            borderRadius: "8px",
                            margin: "4px 8px",
                            "&:hover": {
                              background: alpha("#1976d2", 0.1),
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ fontStyle: "italic" }}>
                      -- Select a Category --
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
                  label="Product Description"
                  name="description"
                  value={product.description}
                  onChange={handleProductChange}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  placeholder="Describe your product in detail..."
                />
              </Grid>
            </Grid>
          </StyledPaper>

          {/* Product Variants Section */}
          <StyledPaper sx={{ p: 4, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <InventoryIcon
                sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Product Variants ({product.variants.length})
              </Typography>
            </Box>

            {product.variants.map((variant, index) => (
              <Fade in timeout={300 + index * 100} key={variant.id}>
                <AnimatedCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <VariantAvatar>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            {index + 1}
                          </Typography>
                        </VariantAvatar>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Variant #{index + 1}
                        </Typography>
                      </Stack>

                      {product.variants.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveVariant(variant.id)}
                          sx={{
                            background: alpha("#ef4444", 0.1),
                            "&:hover": {
                              background: alpha("#ef4444", 0.2),
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          label="Variant Name"
                          value={variant.name}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "name",
                              e.target.value
                            )
                          }
                          fullWidth
                          required
                          placeholder="e.g., Red - Large"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          label="Brand"
                          value={variant.brand}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "brand",
                              e.target.value
                            )
                          }
                          fullWidth
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BrandingWatermarkIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          label="Price (₹)"
                          type="number"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "price",
                              e.target.value
                            )
                          }
                          fullWidth
                          required
                          inputProps={{ min: 0.01, step: 0.01 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoneyIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          label="Stock Quantity"
                          type="number"
                          value={variant.stockQty}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "stockQty",
                              e.target.value
                            )
                          }
                          fullWidth
                          required
                          inputProps={{ min: 0 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <InventoryIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <StyledTextField
                          label="Image URL"
                          type="url"
                          value={variant.imageUrl}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "imageUrl",
                              e.target.value
                            )
                          }
                          fullWidth
                          required
                          placeholder="https://example.com/image.jpg"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ImageIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </AnimatedCard>
              </Fade>
            ))}

            {/* Add Variant Button - Always at the bottom */}
            <AddVariantButton
              startIcon={<AddIcon />}
              onClick={handleAddVariant}
            >
              Add Another Variant
            </AddVariantButton>
          </StyledPaper>

          {/* Submit Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <GradientButton
              type="submit"
              disabled={
                loading ||
                !product.name ||
                !product.description ||
                !product.categoryId ||
                product.variants.length === 0
              }
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              size="large"
              sx={{ px: 6, py: 2, fontSize: "1.2rem" }}
            >
              {loading ? "Creating Product..." : "Create Product"}
            </GradientButton>
          </Box>
        </Box>

        <SuccessDialog />
      </Box>
    </GradientContainer>
  );
};

export default ProductForm;
