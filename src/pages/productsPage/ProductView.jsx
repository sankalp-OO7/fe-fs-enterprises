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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HeroSection from "./product-catalog/HeroSection";
import FilterSidebar from "./product-catalog/FilterSidebar";
import ProductGrid from "./product-catalog/ProductGrid";
import LoadingSkeleton from "./product-catalog/LoadingSkeleton";

const API_PRODUCT_BASE = "/products";
const API_CATEGORY_BASE = "/categories";
const ITEMS_PER_PAGE = 12; // 3 rows × 4 cards

const ProductDisplayAndSearch = ({ isAdmin, isAuthenticated }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addToCartDialogOpen, setAddToCartDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const {
    snackbarOpen,
    snackbarMessage,
    addMultipleVariantsToCart,
    addItemToCart,
    closeSnackbar,
  } = useCart();

  // Fetch data
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

  // Filtering logic
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

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when filters change
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
      <Container maxWidth="xl" sx={{ mt: 5 }}>
        <Alert severity="error" sx={{ borderRadius: 3, fontSize: "1.1rem" }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 0, mb: 8, px: { xs: 2, sm: 3 } }}>
      {/* <HeroSection /> */}

      <Grid
        container
        spacing={{ xs: 2 }}
        sx={{
          mt: 0,
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Filter Sidebar */}
        <Grid item xs={12} lg={3}>
          <FilterSidebar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            filteredCount={filteredProducts.length}
            onClearFilters={handleClearFilters}
            // Remove default margin top
          />
        </Grid>

        {/* Product Grid */}
        <Grid item xs={12} lg={9}>
          <ProductGrid
            products={paginatedProducts}
            categories={categories}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            onClearFilters={handleClearFilters}
            isAdmin={isAdmin}
            isAuthenticated={isAuthenticated}
            onAddToCart={handleAddToCart}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontSize: "1rem",
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

      {/* Add to Cart Dialog */}
      <AddToCartDialog
        open={addToCartDialogOpen}
        onClose={() => setAddToCartDialogOpen(false)}
        product={selectedProduct}
        onAddToCart={handleMultipleVariantsAdd}
      />

      {/* Success Snackbar */}
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
    </Container>
  );
};

export default ProductDisplayAndSearch;
