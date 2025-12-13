import React, { useState } from "react";
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
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CloseIcon from "@mui/icons-material/Close";
import { styled, alpha } from "@mui/material/styles";
import SingleVariantDialog from "../../../components/product/SingleVariantDialog";
import ProductCardDetails from "../../../components/product/ProductCardDetails";
const StyledCard = styled(Card)(({ theme }) => ({
  width: "320px",
  minHeight: "650px",
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

const FullScreenImage = styled(CardMedia)({
  width: "100%",
  height: "400px",
  objectFit: "contain",
  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
});

// Enhanced Variant Card for full-screen view
const EnhancedVariantCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: theme.spacing(2),
  borderRadius: "16px",
  transition: "all 0.3s ease",
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(10px)",
  minHeight: "120px",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
}));

const VariantImage = styled(CardMedia)({
  width: "100px",
  height: "100px",
  minWidth: "100px",
  borderRadius: "12px",
  objectFit: "cover",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
});

const ProductCard = ({
  product,
  categories,
  isAdmin,
  isAuthenticated,
  onAddToCart,
  onAddSingleVariant,
  openForVariants,
  handleOpenForVariants,
  handleCloseForVariants
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));


  const [openVariantDialog, setOpenVariantDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleOpenVariant = (variant) => {
    setSelectedVariant(variant);
    setOpenVariantDialog(true);
  };
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

  return (
    <>
      <StyledCard onClick={handleOpenForVariants}>
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

      {/* Full Screen Dialog for the variant */}
      <Dialog
        fullScreen
        open={openForVariants}
        onClose={handleCloseForVariants}
        sx={{
          "& .MuiDialog-paper": {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
              {product.name}
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
          maxWidth="xl" // Changed to xl for more space
          sx={{
            py: 4,
            height: "calc(100vh - 64px)",
            overflow: "auto",
          }}
        >
          <Grid container spacing={4}>
            {/* Variants Section - Bottom */}
            <Grid item xs={12} lg={7}>
              <Box
                sx={{
                  p: 4,
                  borderRadius: 4,
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  height: "fit-content",
                  maxHeight: "80vh",
                  overflow: "auto",
                }}
              >
                <Grid container spacing={3}>
                  {product.variants.map((variant) => (
                    <Grid item xs={12} key={variant._id}>
                      <EnhancedVariantCard>
                        {/* Variant Image */}

                        <VariantImage
                          component="img"
                          image={
                            variant.imageUrl ||
                            "https://via.placeholder.com/100x100?text=No+Image"
                          }
                          alt={variant.name}
                          sx={{ mr: 3 }}
                        />

                        {/* Variant Details */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              mb: 1,
                              color: "primary.main",
                              fontSize: { xs: "1rem", md: "1.2rem" },
                            }}
                          >
                            {variant.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              mb: 2,
                              color: "text.secondary",
                              fontSize: "0.95rem",
                            }}
                          >
                            {variant.description || "No description available"}
                          </Typography>

                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 800,
                                color: "success.main",
                                fontSize: "1.1rem",
                              }}
                            >
                              ₹{variant.price?.toFixed(2) || "N/A"}
                            </Typography>
                            <Button
                              variant="contained"
                              onClick={() => handleOpenVariant(variant)}
                              sx={{ mt: 2 }}
                            >
                              Add
                            </Button>
                          </Stack>
                        </Box>
                      </EnhancedVariantCard>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
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
