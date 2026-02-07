import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Button, // ADDED: Button import
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import EditIcon from "@mui/icons-material/Edit"; // ADDED: Edit icon import
import { styled, alpha } from "@mui/material/styles";

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

const ProductCard = ({
  product,
  categories,
  isAdmin,
  isAuthenticated,
  onAddToCart,
  onAddSingleVariant,
}) => {
  const navigate = useNavigate();
console.log("Rendering ProductCard for:", product);
  const categoryName =
    product.categoryId?.name ||
    categories.find((c) => c._id === product.categoryId)?.name ||
    "Uncategorized";

  const mainVariant = product?.variants?.[0] || {};
  const hasMultipleVariants = product?.variants?.length > 1;
  const totalStock = product?.variants?.reduce((sum, v) => sum + v.stockQty, 0);
  const isOutOfStock = totalStock === 0;

  const prices = product?.variants?.map((v) => v.price);
  const minPrice = prices?.length ? Math.min(...prices) : 0;
  const maxPrice = prices?.length ? Math.max(...prices) : 0;
  const priceDisplay = hasMultipleVariants && minPrice !== maxPrice
    ? `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`
    : `₹${mainVariant ? mainVariant.price?.toFixed(2) || "0.00" : "N/A"}`;

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
  
  const pickedImage = product.imageUrl === "https://example.com/default-product.jpg" ? getDefaultImageForProduct(product._id) : product.imageUrl || getRandomDefaultImage();
  
  // Handle update button click
  const handleUpdateClick = (e) => {
    e.stopPropagation(); // Prevent card navigation
    navigate(`/product/update/${product._id}`);
  };

  return (
    <StyledCard onClick={() => navigate(`/products/${product._id}`)}>
      <Box sx={{ position: "relative" }}>
        <StyledCardMedia
          component="img"
          image={mainVariant?.imageUrl || pickedImage}
          alt={product.productName}
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
        
        {isAdmin && (
          <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon />}
              onClick={handleUpdateClick}
              sx={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                color: "primary.main",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                "&:hover": {
                  background: "rgba(255,255,255,1)",
                }
              }}
            >
              Update
            </Button>
          </Box>
        )}
      </Box>
      
      <CardContent
        sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        {/* PRODUCT NAME */}
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
          {product.productName}
        </Typography>

        {/* DESCRIPTION */}
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

        {/* PRICE - Uncomment if needed */}
        {/* <Stack
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
        </Stack> */}
      </CardContent>
    </StyledCard>
  );
};

export default ProductCard;