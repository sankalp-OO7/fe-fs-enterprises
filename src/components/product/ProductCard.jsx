import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const StyledCard = styled(Card)(({ theme }) => ({
  width: "250px",
  minHeight: "350px",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "0.3s",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
}));

const ProductCard = ({ product, categoryName, onSelect }) => {
  const mainVariant = product.variants?.[0];

  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const priceDisplay =
    minPrice !== maxPrice ? `₹${minPrice} - ₹${maxPrice}` : `₹${minPrice}`;

  return (
    <StyledCard onClick={() => onSelect(product)}>
      {/* Image */}
      <CardMedia
        component="img"
        sx={{
          height: 180,
          objectFit: "contain",
          background: "#f5f5f5",
          p: 1,
        }}
        image={
          mainVariant?.imageUrl ||
          "https://via.placeholder.com/400x300?text=No+Image"
        }
      />

      <CardContent>
        {/* Category */}
        <Chip
          icon={<LocalOfferIcon />}
          label={categoryName}
          size="small"
          sx={{
            background: "#e3f2fd",
            fontSize: "0.7rem",
            fontWeight: 600,
            mb: 1,
          }}
        />

        {/* Title */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            minHeight: 40,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            mb: 1,
          }}
        >
          {product.name}
        </Typography>

        {/* Price */}
        <Typography
          variant="h6"
          sx={{ color: "success.main", fontWeight: 900 }}
        >
          {priceDisplay}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default ProductCard;
