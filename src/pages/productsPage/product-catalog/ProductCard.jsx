import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Grid,
  Button,
  Dialog,
  IconButton,
  AppBar,
  Toolbar,
  Container,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  Paper,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { styled, alpha } from "@mui/material/styles";
import SingleVariantDialog from "../../../components/product/SingleVariantDialog";
import ProductCardDetails from "../../../components/product/ProductCardDetails";

const StyledCard = styled(Card)(({ theme }) => ({
  width: "320px",
  minHeight: "150px",
  display: "flex",
  flexDirection: "column",
  borderRadius: "20px",
  overflow: "hidden",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
    "& .product-image": {
      transform: "scale(1.08)",
    },
  },
}));

const StyledCardMedia = styled(CardMedia)({
  height: 240,
  minHeight: 240,
  maxHeight: 240,
  position: "relative",
  overflow: "hidden",
  "&.product-image": {
    transition: "transform 0.5s ease",
  },
});

const VariantCard = styled(Card)(({ theme }) => ({
  width: "100%",
  minHeight: "150px",
  display: "flex",
  flexDirection: "column",
  borderRadius: "20px",
  overflow: "hidden",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const VariantCardMedia = styled(CardMedia)({
  height: 240,
  minHeight: 240,
  maxHeight: 240,
  position: "relative",
  overflow: "hidden",
});

const ProductCard = ({
  product,
  categories,
  isAdmin,
  isAuthenticated,
  onAddToCart,
  onAddSingleVariant,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openForVariants, setOpenForVariants] = useState(false);
  const [openVariantDialog, setOpenVariantDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantSearchTerm, setVariantSearchTerm] = useState("");

  // Handle opening from list view button
  useEffect(() => {
    const handleOpenVariants = (event) => {
      if (event.detail.productId === product._id) {
        setOpenForVariants(true);
      }
    };

    window.addEventListener("openProductVariants", handleOpenVariants);
    return () => {
      window.removeEventListener("openProductVariants", handleOpenVariants);
    };
  }, [product._id]);

  const handleOpenVariant = (variant) => {
    setSelectedVariant(variant);
    setOpenVariantDialog(true);
  };

  const handleCloseForVariants = () => {
    setOpenForVariants(false);
    setVariantSearchTerm(""); // Clear search when closing
  };

  const handleOpenForVariants = () => {
    setOpenForVariants(true);
  };

  const handleClearVariantSearch = () => {
    setVariantSearchTerm("");
  };

  // Filter variants based on search term
  const filteredVariants = useMemo(() => {
    if (!variantSearchTerm.trim()) return product.variants;

    const searchTermLower = variantSearchTerm.toLowerCase();
    return product.variants.filter((variant) => {
      return (
        (variant.name &&
          variant.name.toLowerCase().includes(searchTermLower)) ||
        (variant.description &&
          variant.description.toLowerCase().includes(searchTermLower)) ||
        (variant.sku && variant.sku.toLowerCase().includes(searchTermLower))
      );
    });
  }, [product.variants, variantSearchTerm]);

  const categoryName =
    product.categoryId?.name ||
    categories.find((c) => c._id === product.categoryId)?.name ||
    "Uncategorized";

  const mainVariant = product.variants[0];
  const hasMultipleVariants = product.variants.length > 1;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQty, 0);
  const isOutOfStock = totalStock === 0;

  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceDisplay =
    hasMultipleVariants && minPrice !== maxPrice
      ? `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`
      : `₹${mainVariant ? mainVariant.price.toFixed(2) : "N/A"}`;

  const defaultImages = [
    "https://res.cloudinary.com/ddwsobxhr/image/upload/v1765660477/fs/Fs3_iros0a.jpg",
    "https://res.cloudinary.com/ddwsobxhr/image/upload/v1765660467/fs/Fs2_n5g4lm.webp",
    "https://res.cloudinary.com/ddwsobxhr/image/upload/v1765660468/fs/Fs4_wnnaxc.jpg",
    "https://res.cloudinary.com/ddwsobxhr/image/upload/v1765660467/fs/Fs1_atrhyk.webp",
  ];
  const getDefaultImageForProduct = (productId) => {
    if (!productId) return defaultImages[0];

    // Create a simple hash from product ID to pick consistent image
    const hash = Array.from(productId).reduce((hash, char) => {
      return char.charCodeAt(0) + ((hash << 5) - hash);
    }, 0);

    const index = Math.abs(hash) % defaultImages.length;
    return defaultImages[index];
  };
  const getRandomDefaultImage = () => {
    const randomIndex = Math.floor(Math.random() * defaultImages.length);
    return defaultImages[randomIndex];
  };
  const pickedImage = getDefaultImageForProduct(product._id);
  return (
    <>
      <StyledCard onClick={handleOpenForVariants}>
        <Box sx={{ position: "relative" }}>
          <StyledCardMedia
            component="img"
            image={mainVariant?.imageUrl || pickedImage}
            alt={product.name}
            className="product-image"
          />

          <Box sx={{ position: "absolute", top: 12, left: 12, zIndex: 1 }}>
            <Chip
              icon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
              label={categoryName}
              size="small"
              sx={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                fontWeight: 700,
                fontSize: "0.75rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
          </Box>
        </Box>
        <ProductCardDetails
          product={product}
          isAdmin={isAdmin}
          isAuthenticated={isAuthenticated}
          priceDisplay={priceDisplay}
          onAddToCart={onAddToCart}
        />
      </StyledCard>

      {/* Full Screen Dialog for variants */}
      <Dialog
        fullScreen
        open={openForVariants}
        onClose={handleCloseForVariants}
        sx={{
          "& .MuiDialog-paper": {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            overflow: "auto",
          },
        }}
      >
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            color: "text.primary",
            boxShadow: "none",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flex: 1,
                fontWeight: 800,
                fontSize: isMobile ? "1.1rem" : "1.5rem",
              }}
            >
              {product.name} - All Variants ({product.variants.length})
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseForVariants}
              aria-label="close"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container
          maxWidth="xl"
          sx={{
            py: 4,
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {/* Search Bar for Variants */}
          <Paper
            elevation={3}
            sx={{
              mb: 4,
              p: 2,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
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
                  InputProps={{
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
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
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
                    label={`${filteredVariants.length} variants found`}
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

          <Typography
            variant="h5"
            sx={{
              mb: 4,
              color: "white",
              textAlign: "center",
              fontWeight: 700,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {variantSearchTerm ? "Search Results" : "Select a Variant"}
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {filteredVariants.map((variant) => (
              <Grid
                item
                key={variant._id}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                xl={2.4}
              >
                <VariantCard
                  onClick={() => handleOpenVariant(variant)}
                  sx={{ cursor: "pointer" }}
                >
                  <Box sx={{ position: "relative" }}>
                    <VariantCardMedia
                      component="img"
                      image={variant.imageUrl || pickedImage}
                      alt={variant.name}
                    />

                    {/* SKU Badge */}
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
                      p: 3,
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Variant Name */}
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontWeight: 800,
                        mb: 1.5,
                        fontSize: "1.1rem",
                        lineHeight: 1.3,
                        color: "primary.main",
                        minHeight: 50,
                        maxHeight: 50,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {variant.name}
                    </Typography>

                    {/* Variant Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        lineHeight: 1.6,
                        minHeight: 44,
                        maxHeight: 44,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {variant.description || "No description available"}
                    </Typography>

                    {/* Price and Add to Cart */}
                    <Box sx={{ mt: "auto" }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 900,
                            color: "success.main",
                            fontSize: "1.1rem",
                          }}
                        >
                          ₹{variant.price?.toFixed(2) || "N/A"}
                        </Typography>

                        {!isAdmin && isAuthenticated && (
                          <Button
                            variant="contained"
                            startIcon={<ShoppingCartIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenVariant(variant);
                            }}
                            disabled={variant.stockQty <= 0}
                            sx={{
                              borderRadius: 2,
                              px: 3,
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
                            {"Add to Cart"}
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </CardContent>
                </VariantCard>
              </Grid>
            ))}
          </Grid>

          {filteredVariants.length === 0 ? (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 3,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
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
          ) : product.variants.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "white",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                No variants available for this product.
              </Typography>
              <Button
                variant="contained"
                onClick={handleCloseForVariants}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                }}
              >
                Close
              </Button>
            </Box>
          ) : null}
        </Container>
      </Dialog>

      <SingleVariantDialog
        open={openVariantDialog}
        onClose={() => setOpenVariantDialog(false)}
        variant={selectedVariant}
        onAddToCart={(variant, qty) => {
          onAddSingleVariant(product, variant, qty);
        }}
      />
    </>
  );
};

export default ProductCard;
