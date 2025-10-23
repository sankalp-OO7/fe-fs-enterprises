import React, { useState, useEffect, useMemo } from "react";
import axiosClient from "../../api/axiosClient";
import { useCart } from "../../context/CartContext";
import AddToCartDialog from "../../components/AddToCartDialog";
import {
  Container,
  Box,
  Grid,
  Alert,
  Snackbar,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import FilterSidebar from "./product-catalog/FilterSidebar";
import ProductGrid from "./product-catalog/ProductGrid";
import LoadingSkeleton from "./product-catalog/LoadingSkeleton";

const API_PRODUCT_BASE = "/products";
const API_CATEGORY_BASE = "/categories";
const ITEMS_PER_PAGE = 20; // Increased from 12

const ProductView = ({ isAdmin, isAuthenticated }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addToCartDialogOpen, setAddToCartDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) setViewMode(newMode);
  };

  const {
    snackbarOpen,
    snackbarMessage,
    addMultipleVariantsToCart,
    addItemToCart,
    closeSnackbar,
  } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          axiosClient.get(API_PRODUCT_BASE),
          axiosClient.get(API_CATEGORY_BASE),
        ]);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        setError("Failed to fetch products or categories.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((product) => {
        const categoryId = product.categoryId?._id || product.categoryId;
        return categoryId === selectedCategory;
      });
    }

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerCaseSearch) ||
          product.description.toLowerCase().includes(lowerCaseSearch)
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (product) => {
    if (product.variants.length === 1) {
      addItemToCart(product, product.variants[0], 1);
    } else {
      setSelectedProduct(product);
      setAddToCartDialogOpen(true);
    }
  };

  const handleMultipleVariantsAdd = (product, selectedVariants, quantities) => {
    addMultipleVariantsToCart(product, selectedVariants, quantities);
  };

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Box sx={{ mt: 5, px: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 3, fontSize: "1.1rem" }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      <Grid container spacing={2} sx={{ width: "100%", m: 0 }}>
        {/* Filter Sidebar */}
        <Grid item xs={12} md={3} lg={2.5} sx={{ pl: 2 }}>
          <Box sx={{ position: { md: "sticky" }, top: { md: 20 } }}>
            <FilterSidebar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              filteredCount={filteredProducts.length}
              onClearFilters={handleClearFilters}
            />
          </Box>
        </Grid>

        {/* Product Display Area */}
        <Grid item xs={12} md={9} lg={9.5} sx={{ pr: 2 }}>
          {/* View Toggle */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mb: 2,
            }}
          >
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="small"
              sx={{
                backgroundColor: "background.paper",
                borderRadius: 2,
                boxShadow: 1,
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  border: "1px solid",
                  borderColor: "divider",
                  px: 2,
                  py: 0.75,
                },
                "& .Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white !important",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                },
              }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <ViewModuleIcon sx={{ mr: { xs: 0, sm: 0.5 }, fontSize: 20 }} />
                <Box
                  component="span"
                  sx={{
                    display: { xs: "none", sm: "inline" },
                    fontSize: "0.875rem",
                  }}
                >
                  Grid
                </Box>
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon sx={{ mr: { xs: 0, sm: 0.5 }, fontSize: 20 }} />
                <Box
                  component="span"
                  sx={{
                    display: { xs: "none", sm: "inline" },
                    fontSize: "0.875rem",
                  }}
                >
                  List
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Products Display */}
          <ProductGrid
            products={paginatedProducts}
            categories={categories}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            onClearFilters={handleClearFilters}
            isAdmin={isAdmin}
            isAuthenticated={isAuthenticated}
            onAddToCart={handleAddToCart}
            viewMode={viewMode}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="medium"
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    borderRadius: 2,
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
        </Grid>
      </Grid>

      <AddToCartDialog
        open={addToCartDialogOpen}
        onClose={() => setAddToCartDialogOpen(false)}
        product={selectedProduct}
        onAddToCart={handleMultipleVariantsAdd}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ borderRadius: 3, fontWeight: 600 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductView;
