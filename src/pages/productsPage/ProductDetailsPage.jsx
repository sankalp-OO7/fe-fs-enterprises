import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import useAuth from "../../context/useAuth";
import SingleVariantDialog from "../../components/product/SingleVariantDialog";
import {
  Container,
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Pagination,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useQuery } from "@tanstack/react-query";
import { fetchProductWithVariants } from "../../api/product.api";
const defaultImages = [
  "https://res.cloudinary.com/ddwsobxhr/image/upload/v1765660477/fs/Fs3_iros0a.jpg",
  "https://res.cloudinary.com/ddwsobxhr/image/upload/v1765660467/fs/Fs2_n5g4lm.webp",
  "https://res.cloudinary.com/ddwsobxhr/image/upload/v1765660468/fs/Fs4_wnnaxc.jpg",
  "https://res.cloudinary.com/ddwsobxhr/image/upload/v1765660467/fs/Fs1_atrhyk.webp",
];

const getDefaultImageForProduct = (productId) => {
  if (!productId) return defaultImages[0];

  const hash = Array.from(productId).reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const index = Math.abs(hash) % defaultImages.length;
  return defaultImages[index];
};

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const { addItemToCart, snackbarOpen, snackbarMessage, closeSnackbar } =
    useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  const [variantSearchTerm, setVariantSearchTerm] = useState("");
  const [openVariantDialog, setOpenVariantDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedBrandCategory, setSelectedBrandCategory] = useState("");
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: product = { productDetails: {}, variants: [], priceRange: "" },
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product-details", productId],
    queryFn: () => fetchProductWithVariants(productId),
    enabled: !!productId, // only run when id exists
  });
  useEffect(() => {
    setCurrentPage(1);
  }, [variantSearchTerm, selectedBrandCategory]);

  const handlePageChange = (_, value) => {
    setCurrentPage(value);
  };

  // Filter variants based on search term
  const filteredVariants = useMemo(() => {
    if (!Array.isArray(product?.variants)) return [];

    let filtered = [...product.variants];

    // ✅ BRAND FILTER (always apply)
    if (selectedBrandCategory?.trim()) {
      filtered = filtered.filter(
        (item) => item.brand === selectedBrandCategory
      );
    }

    // ✅ SEARCH FILTER (optional)
    if (variantSearchTerm.trim()) {
      const search = variantSearchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.variantName?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [product.variants, variantSearchTerm, selectedBrandCategory]);

  const totalPages = Math.ceil(filteredVariants?.length / ITEMS_PER_PAGE);

  const paginatedVariants = useMemo(() => {
    if (!Array.isArray(filteredVariants)) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVariants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVariants, currentPage]);

  const handleOpenVariant = (variant) => {
    setSelectedVariant(variant);
    setOpenVariantDialog(true);
  };

  const handleClearVariantSearch = () => {
    setVariantSearchTerm("");
  };
  const handleBrandCategoryChange = (event) => {
    setSelectedBrandCategory(event.target.value);
  };

  const handleAddToCart = (variant, qty) => {
    if (product) {
      addItemToCart(product, variant, qty);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">Failed to load product details.</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="warning">Product not found.</Alert>
      </Container>
    );
  }

  const pickedImage = product.variants?.[0]?.imageUrl
    ? product.variants[0].imageUrl
    : getDefaultImageForProduct(product._id);

  const categoryName =
    product.categoryId?.name || product.categoryId?.label || "Uncategorized";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Product Details
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              {product.productDetails?.productName || "Unnamed Product"}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
              <Chip
                icon={<LocalOfferIcon sx={{ fontSize: 18 }} />}
                label={categoryName}
                color="primary"
                variant="outlined"
              />
              <Chip label={product?.priceRange} color="success" />
              <Chip
                label={`${product.variants?.length || 0} variant${
                  (product.variants?.length || 0) === 1 ? "" : "s"
                }`}
                variant="outlined"
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {product.variants && product.variants.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            All Variants ({product.variants.length})
          </Typography>

          {/* Search Bar for Variants */}
          <Paper
            elevation={3}
            sx={{
              mb: 4,
              p: 2,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8} lg={9}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search variants by name, description, or SKU..."
                  value={variantSearchTerm}
                  onChange={(e) => setVariantSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: variantSearchTerm && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleClearVariantSearch}
                            edge="end"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        backgroundColor: "white",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              {/* dropdown have all brands name*/}
              <Grid item xs={12} md={8} lg={9}>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    // Ensure full width on mobile, fixed width on tablets/desktop
                    minWidth: { xs: "100%", sm: 180 },
                    flexShrink: 0,
                  }}
                >
                  <InputLabel>Filter By Brand</InputLabel>
                  <Select
                    value={selectedBrandCategory}
                    onChange={(e) => handleBrandCategoryChange(e)}
                    label="Filter By Brand"
                    sx={{
                      borderRadius: "12px",
                      backgroundColor: theme.palette.background.default,
                    }}
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                    {Array.isArray(product.variants) &&
                      [
                        ...new Set(
                          product.variants.map((variant) => variant.brand)
                        ),
                      ].map((brand) => (
                        <MenuItem key={brand} value={brand}>
                          {brand}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4} lg={3}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: { md: "flex-end" },
                  }}
                >
                  <Chip
                    label={`${filteredVariants.length} variant${
                      filteredVariants.length !== 1 ? "s" : ""
                    } found`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                  {variantSearchTerm && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={handleClearVariantSearch}
                      sx={{ borderRadius: 2 }}
                    >
                      Clear
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {filteredVariants.length === 0 ? (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 3,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                mt: 4,
              }}
            >
              <Box sx={{ fontSize: "4rem", mb: 2, opacity: 0.5 }}>🔍</Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                No Variants Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {variantSearchTerm
                  ? `No variants match "${variantSearchTerm}"`
                  : "No variants available for this product."}
              </Typography>
              {variantSearchTerm && (
                <Button
                  variant="contained"
                  startIcon={<ClearIcon />}
                  onClick={handleClearVariantSearch}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  Clear Search
                </Button>
              )}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              <Grid container spacing={3}>
                {paginatedVariants?.map((variant) => (
                  <Grid key={variant._id} item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      <Box sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          image={
                            variant.imageUrl ||
                            getDefaultImageForProduct(product._id)
                          }
                          alt={variant.name}
                          sx={{ height: 180, objectFit: "cover" }}
                        />
                        {variant.sku && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              backgroundColor: "rgba(0,0,0,0.7)",
                              color: "white",
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 2,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backdropFilter: "blur(4px)",
                            }}
                          >
                            SKU: {variant.sku}
                          </Box>
                        )}
                      </Box>
                      <CardContent
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {variant.variantName}
                        </Typography>
                        <Typography variant="h7" fontWeight={700} gutterBottom>
                          Brand: {variant?.brand}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                          sx={{
                            mb: 2,
                            minHeight: 44,
                            maxHeight: 44,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {variant.description || "No description available."}
                        </Typography>
                        <Box sx={{ mt: "auto" }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 2 }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 900,
                                color: "success.main",
                                fontSize: "1.1rem",
                              }}
                            >
                              {isAuthenticated
                                ? `₹${
                                    variant?.actualPrice?.toFixed(2) || "N/A"
                                  }`
                                : "Please log in to view the price"}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontWeight: 600 }}
                            >
                              {isAuthenticated
                                ? `Stock: ${variant.stockQty ?? 0}`
                                : ""}
                            </Typography>
                          </Stack>
                          {!isAdmin() && isAuthenticated && (
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={<ShoppingCartIcon />}
                              onClick={() => handleOpenVariant(variant)}
                              // disabled={variant.stockQty <= 0}
                              sx={{
                                borderRadius: 2,
                                py: 1,
                                fontWeight: 700,
                                textTransform: "none",
                                fontSize: "0.875rem",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                "&:hover": {
                                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                                },
                              }}
                            >
                              Add to Cart
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="medium"
                    showFirstButton
                    showLastButton
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        borderRadius: 2,
                      },
                      "& .MuiPaginationItem-root.Mui-selected": {
                        background:
                          "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                      },
                    }}
                  />
                </Box>
              )}
            </Grid>
          )}
        </Box>
      )}

      <SingleVariantDialog
        open={openVariantDialog}
        onClose={() => setOpenVariantDialog(false)}
        variant={selectedVariant}
        onAddToCart={handleAddToCart}
      />

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
          sx={{ borderRadius: 3, fontWeight: 600 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetailsPage;
