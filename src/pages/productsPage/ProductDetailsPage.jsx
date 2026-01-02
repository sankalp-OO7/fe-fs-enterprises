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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
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

// Fixed card width constants for different screen sizes
const CARD_WIDTHS = {
  xs: "100%", // Full width on mobile
  sm: "100%", // Full width on small tablets
  md: "280px", // Fixed 280px on medium screens (2 per row)
  lg: "280px", // Fixed 280px on large screens (4 per row)
  xl: "300px", // Slightly larger on extra large screens
};

// Calculate grid columns based on screen size
const getGridColumns = (isMobile, isTablet, isDesktop, isLargeDesktop) => {
  if (isMobile) return 1;
  if (isTablet) return 2; // 2 cards per row on tablet
  if (isDesktop) return 4; // 4 cards per row on desktop
  return 4; // 4 cards per row on large desktop
};

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const { addItemToCart, snackbarOpen, snackbarMessage, closeSnackbar } =
    useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [variantSearchTerm, setVariantSearchTerm] = useState("");
  const [openVariantDialog, setOpenVariantDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedBrandCategory, setSelectedBrandCategory] = useState("");
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'list'
  const ITEMS_PER_PAGE = 12; // Changed to multiple of 4 for better alignment
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: product = { productDetails: {}, variants: [], priceRange: "" },
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product-details", productId],
    queryFn: () => fetchProductWithVariants(productId),
    enabled: !!productId,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [variantSearchTerm, selectedBrandCategory]);

  useEffect(() => {
    // Default to list view on mobile for better space utilization
    if (isMobile) {
      setViewMode("list");
    }
  }, [isMobile]);

  const handlePageChange = (_, value) => {
    setCurrentPage(value);
  };

  const filteredVariants = useMemo(() => {
    if (!Array.isArray(product?.variants)) return [];

    let filtered = [...product.variants];

    if (selectedBrandCategory?.trim()) {
      filtered = filtered.filter(
        (item) => item.brand === selectedBrandCategory
      );
    }

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

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleAddToCart = (variant, qty) => {
    if (product) {
      addItemToCart(product, variant, qty);
    }
  };

  // Get card width based on screen size
  const getCardWidth = () => {
    if (viewMode === "list") return "100%";

    if (isMobile) return CARD_WIDTHS.xs;
    if (isTablet) return CARD_WIDTHS.md;
    if (isLargeDesktop) return CARD_WIDTHS.xl;
    return CARD_WIDTHS.lg;
  };

  // Get number of grid columns
  const gridColumns = getGridColumns(
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop
  );

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Alert severity="error">Failed to load product details.</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
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
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" } }}
        >
          Product Details
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Typography
              variant="h4"
              fontWeight={800}
              gutterBottom
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                textAlign: "center",
              }}
            >
              {product.productDetails?.productName || "Unnamed Product"}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                mb: 2,
                flexWrap: "wrap",
                gap: 1,
                justifyContent: "center",
              }}
            >
              <Chip
                icon={<LocalOfferIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                label={categoryName}
                color="primary"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
              />
              <Chip
                label={product?.priceRange}
                color="success"
                size={isMobile ? "small" : "medium"}
              />
              <Chip
                label={`${product.variants?.length || 0} variant${
                  (product.variants?.length || 0) === 1 ? "" : "s"
                }`}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {product.variants && product.variants.length > 0 && (
        <Box sx={{ mt: { xs: 3, sm: 4, md: 5 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              mb: 3,
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                textAlign: { xs: "center", sm: "left" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              All Variants ({product.variants.length})
            </Typography>

            {/* View Mode Toggle - Centered on mobile */}
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-end" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    px: 2,
                    py: 0.5,
                    fontSize: "0.875rem",
                  },
                }}
              >
                <ToggleButton value="card">
                  <ViewModuleIcon sx={{ mr: 1, fontSize: 20 }} />
                  Card
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewListIcon sx={{ mr: 1, fontSize: 20 }} />
                  List
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* Search and Filter Section */}
          <Paper
            elevation={2}
            sx={{
              mb: 4,
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              backgroundColor: "background.paper",
            }}
          >
            <Grid
              container
              spacing={2}
              alignItems="center"
              justifyContent="center"
            >
              <Grid item xs={12} md={10} lg={8}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="center"
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search variants..."
                    value={variantSearchTerm}
                    onChange={(e) => setVariantSearchTerm(e.target.value)}
                    size="small"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="primary" fontSize="small" />
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
                      },
                    }}
                    sx={{
                      flex: 1,
                      minWidth: { xs: "100%", sm: 250 },
                    }}
                  />

                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{
                      minWidth: { xs: "100%", sm: 180 },
                      flexShrink: 0,
                    }}
                  >
                    <InputLabel>Filter By Brand</InputLabel>
                    <Select
                      value={selectedBrandCategory}
                      onChange={handleBrandCategoryChange}
                      label="Filter By Brand"
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
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Chip
                    label={`${filteredVariants.length} variant${
                      filteredVariants.length !== 1 ? "s" : ""
                    } found`}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  {variantSearchTerm && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={handleClearVariantSearch}
                      sx={{ borderRadius: 1 }}
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
                p: { xs: 4, sm: 6 },
                textAlign: "center",
                borderRadius: 2,
                backgroundColor: "background.default",
                mt: 4,
                maxWidth: 600,
                mx: "auto",
              }}
            >
              <Box sx={{ fontSize: "3rem", mb: 2, opacity: 0.5 }}>🔍</Box>
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
            <>
              {/* Card View */}
              {viewMode === "card" ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 4,
                  }}
                >
                  <Grid
                    container
                    spacing={3}
                    sx={{
                      maxWidth: {
                        xs: "100%",
                        sm: "600px",
                        md: "900px",
                        lg: "1200px",
                        xl: "1400px",
                      },
                      justifyContent: "center",
                    }}
                  >
                    {paginatedVariants?.map((variant) => (
                      <Grid
                        key={variant._id}
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        lg={3}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Card
                          sx={{
                            width: getCardWidth(),
                            borderRadius: 2,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: 4,
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
                              sx={{
                                height: 180,
                                width: "100%",
                                objectFit: "cover",
                              }}
                            />
                            {variant.sku && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  backgroundColor: "rgba(0,0,0,0.7)",
                                  color: "white",
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  fontSize: "0.7rem",
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
                              p: 2,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              gutterBottom
                              sx={{
                                fontSize: "1rem",
                                minHeight: "48px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {variant.variantName}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="primary"
                              gutterBottom
                            >
                              Brand: {variant?.brand}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                              sx={{
                                mb: 2,
                                minHeight: 40,
                                maxHeight: 40,
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                fontSize: "0.875rem",
                                textAlign: "center",
                              }}
                            >
                              {variant.description ||
                                "No description available."}
                            </Typography>
                            <Box sx={{ mt: "auto" }}>
                              <Stack
                                direction="column"
                                spacing={1}
                                sx={{ mb: 2, alignItems: "center" }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 900,
                                    color: "success.main",
                                    fontSize: "1.1rem",
                                    textAlign: "center",
                                  }}
                                >
                                  {isAuthenticated
                                    ? `₹${
                                        variant?.actualPrice?.toFixed(2) ||
                                        "N/A"
                                      }`
                                    : "Please log in"}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ fontWeight: 600, fontSize: "0.875rem" }}
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
                                  size="small"
                                  sx={{
                                    borderRadius: 1,
                                    py: 0.75,
                                    fontWeight: 700,
                                    textTransform: "none",
                                    fontSize: "0.875rem",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    "&:hover": {
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
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
                </Box>
              ) : (
                /* List View */
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <TableContainer
                    component={Paper}
                    sx={{
                      borderRadius: 2,
                      mb: 3,
                      maxWidth: {
                        xs: "100%",
                        sm: "800px",
                        md: "1000px",
                        lg: "1200px",
                      },
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "action.hover" }}>
                          <TableCell
                            sx={{ fontWeight: 700, textAlign: "center" }}
                          >
                            Variant
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, textAlign: "center" }}
                          >
                            Brand
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, textAlign: "center" }}
                          >
                            Price
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, textAlign: "center" }}
                          >
                            Stock
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, textAlign: "center" }}
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedVariants?.map((variant) => (
                          <TableRow key={variant._id} hover>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  src={
                                    variant.imageUrl ||
                                    getDefaultImageForProduct(product._id)
                                  }
                                  alt={variant.variantName}
                                  sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 1,
                                  }}
                                />
                                <Box sx={{ textAlign: "left" }}>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                  >
                                    {variant.variantName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {variant.description || "No description"}
                                  </Typography>
                                  {variant.sku && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ display: "block", mt: 0.5 }}
                                    >
                                      SKU: {variant.sku}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                              <Chip
                                label={variant.brand}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                              <Typography
                                variant="body1"
                                fontWeight={900}
                                color="success.main"
                              >
                                {isAuthenticated
                                  ? `₹${
                                      variant?.actualPrice?.toFixed(2) || "N/A"
                                    }`
                                  : "Login to view"}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                              <Typography
                                variant="body2"
                                color={
                                  variant.stockQty > 0
                                    ? "success.main"
                                    : "error.main"
                                }
                                fontWeight={600}
                              >
                                {isAuthenticated ? variant.stockQty ?? 0 : "-"}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                              {!isAdmin() && isAuthenticated && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<ShoppingCartIcon />}
                                  onClick={() => handleOpenVariant(variant)}
                                  sx={{
                                    borderRadius: 1,
                                    fontWeight: 600,
                                    textTransform: "none",
                                  }}
                                >
                                  Add to Cart
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Pagination - Centered */}
              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 4,
                    "& .MuiPagination-ul": {
                      flexWrap: "wrap",
                    },
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    showFirstButton={!isMobile}
                    showLastButton={!isMobile}
                    siblingCount={isMobile ? 0 : 1}
                    boundaryCount={isMobile ? 1 : 2}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        fontWeight: 600,
                        borderRadius: 1,
                        minWidth: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
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
            </>
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
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isMobile ? "center" : "left",
        }}
      >
        <Alert
          onClose={closeSnackbar}
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetailsPage;
