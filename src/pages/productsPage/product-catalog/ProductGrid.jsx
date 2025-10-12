import React from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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
}) => {
  return (
    <Box>
      {products.length > 0 ? (
        <Grid
          container
          spacing={3}
          sx={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            // alignItems: "center",
          }}
        >
          {products.map((product, index) => (
            <Grid item key={product._id} xs={12} sm={6} md={6} lg={3}>
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
      ) : (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: "24px",
            background: "linear-gradient(145deg, #f8f9fa, #e9ecef)",
          }}
        >
          <Box sx={{ fontSize: "5rem", mb: 2, opacity: 0.5 }}>😔</Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            No Products Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your filters
          </Typography>
          {(searchTerm || selectedCategory) && (
            <Button
              variant="contained"
              size="large"
              startIcon={<ClearIcon />}
              onClick={onClearFilters}
              sx={{ borderRadius: "16px", px: 4 }}
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
