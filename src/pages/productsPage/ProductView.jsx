import React, { useState, useEffect, useMemo } from "react";
import axiosClient from "../../api/axiosClient";
import { useCart } from "../../context/CartContext";
import AddToCartDialog from "../../components/AddToCartDialog";
import {
  Box,
  Alert,
  Snackbar,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import FilterSidebar from "./product-catalog/FilterSidebar";
import ProductGrid from "./product-catalog/ProductGrid";
import LoadingSkeleton from "./product-catalog/LoadingSkeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchCategories } from "../../api/product.api";

const ITEMS_PER_PAGE = 20;

const ProductView = ({ isAdmin, isAuthenticated, onProductClick }) => {
  const [variantProduct, setVariantProduct] = useState(null);
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

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((product) => {
        const categoryId = product.categoryId?._id || product.categoryId;
        return categoryId === selectedCategory;
      });
    }

    if (searchTerm) {
      const lowerCaseSearch = (searchTerm || "").toLowerCase();
      filtered = (filtered || []).filter((product) => {
        const name = (product?.productName || "").toLowerCase();
        const desc = (product?.description || "").toLowerCase();
        return name.includes(lowerCaseSearch) || desc.includes(lowerCaseSearch);
      });
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    if (!Array.isArray(filteredProducts)) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts?.slice(startIndex, startIndex + ITEMS_PER_PAGE);
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
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    if (variants.length === 1) {
      addItemToCart(product, variants[0], 1);
      return;
    }
    setSelectedProduct({ ...product, variants });
    setAddToCartDialogOpen(true);
  };

  const handleSingleVariantAdd = (product, variant, qty) => {
    addItemToCart(product, variant, qty);
  };

  const handleMultipleVariantsAdd = (product, selectedVariants, quantities) => {
    addMultipleVariantsToCart(product, selectedVariants, quantities);
  };

  if (productsLoading || categoriesLoading) {
    return <LoadingSkeleton />;
  }

  if (productsError || categoriesError) {
    return (
      <Box sx={{ mt: 5, px: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 3, fontSize: "1.1rem" }}>
          Failed to fetch products or categories.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8faff 0%, #f1f5fd 100%)",
        pb: 6,
      }}
    >
      {/* ─── Single Unified Topbar ─── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 1.25, sm: 1.5 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 1, sm: 2 },
        }}
      >
        {/* Left: Title + count */}
        <Box sx={{ flexShrink: 0 }}>
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: 800,
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            Products Catalogue
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
            {filteredProducts.length}{" "}
            {filteredProducts.length !== 1 ? "products" : "product"} found
          </Typography>
        </Box>

        {/* Right: Search + Category + View toggle — all in one row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
            flexGrow: 1,
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
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

          {/* View mode toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            sx={{
              flexShrink: 0,
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              "& .MuiToggleButton-root": {
                border: "none",
                color: "rgba(255,255,255,0.7)",
                px: 1.1,
                py: 0.5,
                minWidth: 34,
              },
              "& .Mui-selected": {
                backgroundColor: "rgba(255,255,255,0.22) !important",
                color: "white !important",
                borderRadius: "8px !important",
              },
            }}
          >
            <ToggleButton value="grid" aria-label="grid view">
              <ViewModuleIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ─── Products Display ─── */}
      <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, pt: 2.5 }}>
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
          onAddSingleVariant={handleSingleVariantAdd}
          onProductClick={onProductClick}
        />

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
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
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                },
              }}
            />
          </Box>
        )}
      </Box>

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
