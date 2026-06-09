import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Avatar,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import InventoryIcon from "@mui/icons-material/Inventory";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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
  onAddSingleVariant,
}) => {
  const navigate = useNavigate();

  if (products.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 10,
          px: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            borderRadius: 4,
            background: "linear-gradient(145deg, #f8faff, #f0f4ff)",
            border: "1.5px dashed rgba(99,102,241,0.25)",
            maxWidth: 420,
            width: "100%",
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
              bgcolor: "rgba(99,102,241,0.1)",
              color: "primary.main",
            }}
          >
            <InventoryIcon fontSize="large" />
          </Avatar>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            No Products Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || selectedCategory
              ? "Try adjusting your search or category filters."
              : "No products are available right now."}
          </Typography>
          {(searchTerm || selectedCategory) && (
            <Button
              variant="contained"
              size="medium"
              startIcon={<ClearIcon />}
              onClick={onClearFilters}
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                textTransform: "none",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      </Box>
    );
  }

  /* ── List view ── */
  if (viewMode === "list") {
    return (
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
        {products.map((product) => {
          const categoryName =
            product.categoryId?.name ||
            categories.find((c) => c._id === product.categoryId)?.name ||
            "Uncategorized";

          return (
            <Paper
              key={product._id}
              elevation={0}
              onClick={() => navigate(`/products/${product._id}`)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2.5,
                border: "1px solid rgba(0,0,0,0.07)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  borderColor: "primary.light",
                  transform: "translateX(3px)",
                },
              }}
            >
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
                    maxWidth: { xs: 180, sm: 340 },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  }}
                >
                  {product.productName}
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
                    fontSize: "0.85rem",
                  }}
                >
                  {product.description}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                sx={{
                  borderRadius: 2,
                  px: { xs: 1.5, sm: 2 },
                  py: 0.75,
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.8rem",
                  flexShrink: 0,
                  ml: 2,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  },
                }}
              >
                View
              </Button>
            </Paper>
          );
        })}
      </Box>
    );
  }

  /* ── Grid view (centered) ── */
  return (
    <Grid
      container
      spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
      sx={{
        width: "100%",
        margin: "0 auto",
        justifyContent: "center",
      }}
    >
      {products.map((product, index) => (
        <Grid
          key={product._id}
          size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 3 }}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <ProductCard
            product={product}
            categories={categories}
            index={index}
            isAdmin={isAdmin}
            isAuthenticated={isAuthenticated}
            onAddToCart={onAddToCart}
            onAddSingleVariant={onAddSingleVariant}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductGrid;