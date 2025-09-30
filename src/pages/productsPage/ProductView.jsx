// src/pages/ProductDisplayAndSearch.jsx - ProductView without floating cart dialog

import React, { useState, useEffect, useMemo } from "react";
import axiosClient from "../../api/axiosClient";
import { useCart } from "../../context/CartContext";
import AddToCartDialog from "../../components/AddToCartDialog";
import {
  Container,
  Box,
  Typography,
  Grid,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Paper,
  Avatar,
  Stack,
  Fade,
  Skeleton,
  InputAdornment,
  Badge,
  IconButton,
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import InventoryIcon from "@mui/icons-material/Inventory";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { styled, alpha } from "@mui/material/styles";

const API_PRODUCT_BASE = "/products";
const API_CATEGORY_BASE = "/categories";

// Styled Components (same as before)
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: "20px",
  overflow: "hidden",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
    "& .product-image": {
      transform: "scale(1.05)",
    },
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 240,
  position: "relative",
  overflow: "hidden",
  "&.product-image": {
    transition: "transform 0.4s ease",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, ${alpha(
      theme.palette.primary.main,
      0.1
    )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover::before": {
    opacity: 1,
  },
}));

const GradientBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: "20px",
  padding: theme.spacing(4),
  color: "white",
  marginBottom: theme.spacing(4),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    right: "-50%",
    width: "200%",
    height: "200%",
    background: `radial-gradient(circle, ${alpha(
      "#ffffff",
      0.1
    )} 0%, transparent 70%)`,
    animation: "float 6s ease-in-out infinite",
  },
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-20px) rotate(180deg)" },
  },
}));

const VariantChip = styled(Chip)(({ theme, variant: chipVariant }) => ({
  borderRadius: "12px",
  fontWeight: 600,
  fontSize: "0.75rem",
  margin: "2px",
  transition: "all 0.2s ease",
  background:
    chipVariant === "primary"
      ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
      : `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
  color: "white",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const FilterPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "20px",
  background: `linear-gradient(145deg, ${alpha("#ffffff", 0.9)}, ${alpha(
    "#f8f9fa",
    0.9
  )})`,
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: "sticky",
  top: 20,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "15px",
    transition: "all 0.3s ease",
    "&:hover": {
      "& > fieldset": {
        borderColor: theme.palette.primary.main,
      },
    },
    "&.Mui-focused": {
      "& > fieldset": {
        borderWidth: "2px",
        borderColor: theme.palette.primary.main,
      },
    },
  },
}));

const ProductView = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [addToCartDialogOpen, setAddToCartDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Use the custom cart hook
  const {
    snackbarOpen,
    snackbarMessage,
    addMultipleVariantsToCart,
    addItemToCart,
    closeSnackbar,
  } = useCart();

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const productsResponse = await axiosClient.get(API_PRODUCT_BASE);
        const categoriesResponse = await axiosClient.get(API_CATEGORY_BASE);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        setError(
          "Failed to fetch products or categories. Check server connection."
        );
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((product) => {
        const categoryId = product.categoryId?._id || product.categoryId;
        return categoryId === selectedCategory;
      });
    }

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerCaseSearch) ||
          product.description.toLowerCase().includes(lowerCaseSearch)
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const handleAddToCart = (product) => {
    if (product.variants.length === 1) {
      // Single variant - add directly
      addItemToCart(product, product.variants[0], 1);
    } else {
      // Multiple variants - open checkbox dialog
      setSelectedProduct(product);
      setAddToCartDialogOpen(true);
    }
  };

const handleMultipleVariantsAdd = (product, selectedVariants, quantities) => {
  addMultipleVariantsToCart(product, selectedVariants, quantities);
};


  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  // Loading Skeleton Component
  const ProductSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item key={index} xs={12} sm={6} lg={4}>
          <Card sx={{ borderRadius: "20px" }}>
            <Skeleton variant="rectangular" height={240} />
            <CardContent>
              <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
              <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
              <Skeleton width="100%" height={60} sx={{ mb: 2 }} />
              <Skeleton width="80%" height={32} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton width="300px" height={48} sx={{ mb: 2 }} />
          <Skeleton width="500px" height={24} />
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ borderRadius: "20px" }}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <ProductSkeleton />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 5 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: "15px",
            fontSize: "1.1rem",
            "& .MuiAlert-icon": { fontSize: "1.5rem" },
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // Enhanced Product Card Component
  const ProductCard = ({ product, index }) => {
    const categoryName =
      product.categoryId?.name ||
      categories.find((c) => c._id === product.categoryId)?.name ||
      "Uncategorized";
    const mainVariant = product.variants[0];
    const hasMultipleVariants = product.variants.length > 1;
    const totalStock = product.variants.reduce(
      (sum, variant) => sum + variant.stockQty,
      0
    );
    const isOutOfStock = totalStock === 0;

    // Calculate price range for multiple variants
    const prices = product.variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceDisplay = hasMultipleVariants && minPrice !== maxPrice 
      ? `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`
      : `₹${mainVariant ? mainVariant.price.toFixed(2) : "N/A"}`;

    return (
      <Fade in={true} timeout={300 + index * 100}>
        <StyledCard>
          <Box sx={{ position: "relative" }}>
            <StyledCardMedia
              component="img"
              image={
                mainVariant?.imageUrl ||
                "https://via.placeholder.com/400x300?text=No+Image"
              }
              alt={product.name}
              className="product-image"
            />
            <Box
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                zIndex: 1,
              }}
            >
              <Chip
                icon={<LocalOfferIcon />}
                label={categoryName}
                size="small"
                sx={{
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(10px)",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
            </Box>
            {hasMultipleVariants && (
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 1,
                }}
              >
                <Badge
                  badgeContent={product.variants.length}
                  color="primary"
                  sx={{
                    "& .MuiBadge-badge": {
                      background: "linear-gradient(45deg, #FF6B6B, #FF8E8E)",
                      color: "white",
                      fontWeight: 700,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.9)",
                      color: "primary.main",
                      width: 36,
                      height: 36,
                    }}
                  >
                    <InventoryIcon fontSize="small" />
                  </Avatar>
                </Badge>
              </Box>
            )}
            {isOutOfStock && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  zIndex: 1,
                }}
              >
                <Chip
                  label="Out of Stock"
                  color="error"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              </Box>
            )}
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 800,
                mb: 1,
                background: "linear-gradient(45deg, #2196F3, #21CBF3)",
                backgroundClip: "text",
                textFillColor: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {product.name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.description}
            </Typography>

            {/* Price and Stock Info */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  background: "linear-gradient(45deg, #4CAF50, #8BC34A)",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {priceDisplay}
              </Typography>
              <Chip
                icon={<TrendingUpIcon />}
                label={`${totalStock} in stock`}
                color={
                  totalStock > 10
                    ? "success"
                    : totalStock > 0
                    ? "warning"
                    : "error"
                }
                variant="outlined"
              />
            </Stack>

            {/* Add to Cart Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              onClick={() => handleAddToCart(product)}
              disabled={isOutOfStock}
              sx={{
                mb: 3,
                borderRadius: "15px",
                py: 1.5,
                background: isOutOfStock
                  ? "linear-gradient(45deg, #9E9E9E, #BDBDBD)"
                  : hasMultipleVariants
                  ? "linear-gradient(45deg, #2196F3, #21CBF3)"
                  : "linear-gradient(45deg, #FF6B6B, #FF8E8E)",
                "&:hover": {
                  background: isOutOfStock
                    ? "linear-gradient(45deg, #9E9E9E, #BDBDBD)"
                    : hasMultipleVariants
                    ? "linear-gradient(45deg, #1976D2, #0288D1)"
                    : "linear-gradient(45deg, #FF5252, #FF7979)",
                  transform: isOutOfStock ? "none" : "translateY(-2px)",
                },
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              {isOutOfStock 
                ? "Out of Stock" 
                : hasMultipleVariants 
                ? "Select Variants"
                : "Add to Cart"
              }
            </Button>

            {/* Variants Display */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <InventoryIcon color="primary" fontSize="small" />
                Available Options ({product.variants.length})
              </Typography>

              <Box
                sx={{
                  maxHeight: 200,
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#f1f1f1",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#c1c1c1",
                    borderRadius: "10px",
                  },
                }}
              >
                <Stack spacing={1.5}>
                  {product.variants.map((variant, vIndex) => (
                    <Paper
                      key={variant._id || vIndex}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        background: "linear-gradient(145deg, #f8f9fa, #e9ecef)",
                        border: "1px solid rgba(0,0,0,0.05)",
                        transition: "all 0.2s ease",
                        opacity: variant.stockQty === 0 ? 0.5 : 1,
                        "&:hover": {
                          transform: variant.stockQty > 0 ? "translateX(4px)" : "none",
                          boxShadow: variant.stockQty > 0 ? "4px 4px 12px rgba(0,0,0,0.1)" : "none",
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            {variant.name}
                            {variant.stockQty === 0 && (
                              <Chip
                                label="Out of Stock"
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{ ml: 1, fontSize: "0.7rem" }}
                              />
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Stock: {variant.stockQty} units
                          </Typography>
                        </Box>
                        <VariantChip
                          label={`₹${variant.price.toFixed(2)}`}
                          variant="primary"
                          size="small"
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </StyledCard>
      </Fade>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 8, px: { xs: 2, sm: 3 } }}>
      {/* Hero Section */}
      <GradientBox>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Box>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 900, fontSize: { xs: "2rem", md: "3rem" } }}
            >
              Product Catalog ✨
            </Typography>
            <Typography
              variant="h6"
              sx={{ opacity: 0.9, fontSize: { xs: "1rem", md: "1.25rem" } }}
            >
              Discover amazing products with our smart filtering system
            </Typography>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              fontSize: "4rem",
              opacity: 0.3,
            }}
          >
            🛍️
          </Box>
        </Stack>
      </GradientBox>

      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Sidebar Filters */}
        <Grid item xs={12} lg={3}>
          <FilterPaper elevation={0}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                borderBottom: "3px solid transparent",
                borderImage: "linear-gradient(45deg, #2196F3, #21CBF3) 1",
                pb: 1,
                mb: 3,
                fontWeight: 700,
              }}
            >
              🔍 Smart Filters
            </Typography>

            <Stack spacing={3}>
              {/* Search Field */}
              <StyledTextField
                label="Search Products"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Type to search..."
              />

              {/* Category Filter */}
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category-filter-label">
                  Category Filter
                </InputLabel>
                <Select
                  labelId="category-filter-label"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category Filter"
                  sx={{
                    borderRadius: "15px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderRadius: "15px",
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Clear Filters */}
              {(searchTerm || selectedCategory) && (
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  sx={{
                    borderRadius: "15px",
                    py: 1.5,
                    background: "linear-gradient(45deg, #FF6B6B, #FF8E8E)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #FF5252, #FF7979)",
                    },
                  }}
                >
                  Clear Filters
                </Button>
              )}

              {/* Filter Summary */}
              <Paper
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  background: "linear-gradient(145deg, #e3f2fd, #f3e5f5)",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  <strong>{filteredProducts.length}</strong> products found
                </Typography>
              </Paper>
            </Stack>
          </FilterPaper>
        </Grid>

        {/* Product Grid */}
        <Grid item xs={12} lg={9}>
          <Box mb={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
            >
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Featured Products ({filteredProducts.length})
              </Typography>
              {filteredProducts.length > 0 && (
                <Chip
                  icon={<TrendingUpIcon />}
                  label="Live Inventory"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3, lg: 4 }}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <Grid item key={product._id} xs={12} sm={6} xl={4}>
                  <ProductCard product={product} index={index} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 6,
                    textAlign: "center",
                    borderRadius: "20px",
                    background: "linear-gradient(145deg, #f8f9fa, #e9ecef)",
                  }}
                >
                  <Box sx={{ fontSize: "4rem", mb: 2 }}>😔</Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    No Products Found
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Try adjusting your search criteria or clear the filters
                  </Typography>
                  {(searchTerm || selectedCategory) && (
                    <Button
                      variant="contained"
                      startIcon={<ClearIcon />}
                      onClick={handleClearFilters}
                      sx={{
                        borderRadius: "15px",
                        px: 4,
                      }}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Add to Cart Dialog with Checkbox Variants */}
      <AddToCartDialog
        open={addToCartDialogOpen}
        onClose={() => setAddToCartDialogOpen(false)}
        product={selectedProduct}
        onAddToCart={handleMultipleVariantsAdd}
      />

      {/* Success Snackbar for cart additions */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{
            borderRadius: "12px",
            fontWeight: 600,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductView;
