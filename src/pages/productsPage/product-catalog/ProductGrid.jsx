import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import ProductCard from "./ProductCard";

const ProductGrid = ({
  products,
  categories,
  searchTerm,
  selectedCategory,
  onClearFilters,
  isAdmin,
  isAuthenticated,
  onAddToCart,
  viewMode,
}) => {
  return (
    <Box sx={{ width: "100%" }}>
      {products.length > 0 ? (
        viewMode === "list" ? (
          <Stack spacing={1} sx={{ width: "100%" }}>
            {products.map((product) => (
              <Paper
                key={product._id}
                elevation={1}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 2,
                  width: "100%",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: 3,
                    bgcolor: "grey.50",
                  },
                }}
              >
                {/* Product Details - Compact */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexGrow: 1,
                    minWidth: 0,
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      minWidth: { xs: 100, sm: 200 },
                      maxWidth: { xs: 150, sm: 300 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      display: { xs: "none", md: "block" },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.description}
                  </Typography>

                  <Chip
                    label={`${product.variants.length} variant${
                      product.variants.length > 1 ? "s" : ""
                    }`}
                    size="small"
                    sx={{ display: { xs: "none", sm: "flex" } }}
                  />
                </Box>

                {/* Price & Button */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{ fontWeight: 700, minWidth: 80, textAlign: "right" }}
                  >
                    ₹{product.variants[0]?.price?.toFixed(2)}
                  </Typography>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onAddToCart(product)}
                    sx={{
                      borderRadius: 2,
                      px: 2,
                      py: 0.75,
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "0.875rem",
                    }}
                  >
                    Add
                  </Button>
                </Box>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Grid container spacing={2}>
            {products.map((product, index) => (
              <Grid item key={product._id} xs={6} sm={4} md={3} lg={2.4} xl={2}>
                <ProductCard
                  product={product}
                  categories={categories}
                  index={index}
                  isAdmin={isAdmin}
                  isAuthenticated={isAuthenticated}
                  onAddToCart={onAddToCart}
                />
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            background: "linear-gradient(145deg, #f8f9fa, #e9ecef)",
          }}
        >
          <Box sx={{ fontSize: "4rem", mb: 2, opacity: 0.5 }}>😔</Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            No Products Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your filters
          </Typography>
          {(searchTerm || selectedCategory) && (
            <Button
              variant="contained"
              size="medium"
              startIcon={<ClearIcon />}
              onClick={onClearFilters}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Clear All Filters
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default ProductGrid;
