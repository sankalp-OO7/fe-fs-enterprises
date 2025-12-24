import React from "react";
import {
  CardContent,
  Typography,
} from "@mui/material";


const ProductCardDetails = ({
  product,
  isAdmin,
  isAuthenticated,
  priceDisplay,
  onAddToCart,
}) => {
  return (
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

      {/* PRICE
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
      </Stack> */}
    </CardContent>
  );
};

export default ProductCardDetails;
