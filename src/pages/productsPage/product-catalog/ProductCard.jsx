import React from "react";
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
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { styled, alpha } from "@mui/material/styles";
import VariantCard from "./VariantCard";

const StyledCard = styled(Card)(({ theme }) => ({
  // --- Start of Fixed Dimensions Changes ---
  width: "320px", // Fixed width for all cards
  minHeight: "650px", // Minimum height to enforce consistent card size
  // --- End of Fixed Dimensions Changes ---
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

const ProductCard = ({
  product,
  categories,
  isAdmin,
  isAuthenticated,
  onAddToCart,
}) => {
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

        {hasMultipleVariants && (
          <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>
            <Chip
              icon={<InventoryIcon sx={{ fontSize: 16 }} />}
              label={`${product.variants.length} Options`}
              size="small"
              sx={{
                background: "rgba(33, 150, 243, 0.95)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.75rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
          </Box>
        )}

        {isOutOfStock && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(244, 67, 54, 0.95)",
              color: "white",
              py: 1,
              textAlign: "center",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          >
            OUT OF STOCK
          </Box>
        )}
      </Box>

      <CardContent
        sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
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
          {product.name}
        </Typography>

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
          {product.description}
        </Typography>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          {!isAdmin && isAuthenticated && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: "success.main",
                fontSize: "1.1rem",
              }}
            >
              {priceDisplay}
            </Typography>
          )}
          <Chip
            icon={<TrendingUpIcon />}
            label={`${totalStock} in stock`}
            size="small"
            color={
              totalStock > 10 ? "success" : totalStock > 0 ? "warning" : "error"
            }
          />
        </Stack>

        {!isAdmin && isAuthenticated && (
          <Button
            fullWidth
            variant="contained"
            size="medium"
            startIcon={<ShoppingCartIcon />}
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            sx={{
              mb: 2,
              borderRadius: "12px",
              py: 1.2,
              fontWeight: 600,
              fontSize: "0.9rem",
              textTransform: "none",
            }}
          >
            {isOutOfStock
              ? "Out of Stock"
              : hasMultipleVariants
              ? "Select Variants"
              : "Add to Cart"}
          </Button>
        )}

        <Box sx={{ mt: "auto" }}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1.5,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <InventoryIcon fontSize="small" color="primary" />
            Variants ({product.variants.length})
          </Typography>

          <Grid container spacing={1}>
            {product.variants.map((variant) => (
              <Grid item xs={12} key={variant._id}>
                <VariantCard variant={variant} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default ProductCard;
