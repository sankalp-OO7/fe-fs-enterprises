import React, { Suspense, lazy, useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Routes, Route } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Snackbar,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  Error as ErrorIcon,
  Warning,
  CheckCircle,
  Inventory2,
  Category,
  Save,
} from "@mui/icons-material";
import {
  optimizeImage,
  fileToOptimizedBase64,
  validateImage,
} from "../../../utils/imageOptimizer";
import {
  fetchProductWithVariants,
  updateProductAPI,
  bulkUpdateProductWithVariantsAPI,
  uploadImageAPI,
  uploadImageDirectAPI,
} from "../../../api/product.api";

// Lazy load components
const ProductDetailsPage = lazy(
  () => import("../../../components/productUpdateSteps/ProductDetailsPage"),
);
const VariantsManagementPage = lazy(
  () => import("../../../components/productUpdateSteps/VariantsManagementPage"),
);

// Loading fallback component
const LoadingFallback = () => (
  <Container
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
      gap: 3,
    }}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" color="text.secondary">
      Loading product data...
    </Typography>
  </Container>
);

// Error boundary component
const ErrorState = ({ error, navigate }) => (
  <Container sx={{ py: 6 }}>
    <Alert
      severity="error"
      icon={<ErrorIcon />}
      sx={{ mb: 3, borderRadius: 2 }}
    >
      <Typography variant="h6" gutterBottom>
        Failed to load product
      </Typography>
      <Typography variant="body2">
        {error?.message || "An error occurred while fetching product data"}
      </Typography>
    </Alert>

    <Button
      startIcon={<ArrowBack />}
      onClick={() => navigate(-1)}
      variant="contained"
      sx={{ borderRadius: 2 }}
    >
      Go Back
    </Button>
  </Container>
);

const ProductUpdatePage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [productData, setProductData] = useState(null);
  const [deletedVariants, setDeletedVariants] = useState([]);
  const [variants, setVariants] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [isDirty, setIsDirty] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  // React Query: Fetch product and variants
  const {
    data: productResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["product-update", productId],
    queryFn: () => fetchProductWithVariants(productId),
    enabled: !!productId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
  console.log("Fetched productResponse:", productResponse);
  // React Query Mutations
  const updateProductMutation = useMutation({
    mutationFn: (data) => updateProductAPI(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["product-update", productId]);
      setSnackbar({
        open: true,
        message: "Product updated successfully!",
        severity: "success",
      });
      setIsDirty(false);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to update product: ${error.message}`,
        severity: "error",
      });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data) => bulkUpdateProductWithVariantsAPI(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["product-update", productId]);
      setSnackbar({
        open: true,
        message: "Product and variants updated successfully!",
        severity: "success",
      });
      setIsDirty(false);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Bulk update failed: ${error.message}`,
        severity: "error",
      });
    },
  });

  const handleImageUpload = async (file, target = "product") => {
    console.log("Starting image upload for:", target, "File:", file.name);
    if (!file) return;

    setImageUploading(true);

    try {
      // 1. Validate the image
      const validation = validateImage(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      // Show optimization status
      setSnackbar({
        open: true,
        message: "Optimizing image...",
        severity: "info",
      });

      // 2. Optimize the image
      const optimizedFile = await optimizeImage(file);

      // 3. Create FormData for direct upload
      const formData = new FormData();
      formData.append("image", optimizedFile);
      formData.append(
        "folder",
        target === "product" ? "products/main" : "products/variants",
      );

      // Show upload status
      setSnackbar({
        open: true,
        message: "Uploading to server...",
        severity: "info",
      });

      // 4. Upload using direct file upload (more efficient)
      const response = await uploadImageDirectAPI(formData);

      if (!response.success) {
        throw new Error(response.message || "Upload failed");
      }

      const imageUrl = response.data.url;

      // 5. Update state
      if (target === "product") {
        // Update product image
        const updatedProductData = { ...productData, imageUrl };
        setProductData(updatedProductData);

        // Update variants that inherit product image
        const updatedVariants = variants.map((variant) => ({
          ...variant,
          imageUrl: !variant.hasCustomImage ? imageUrl : variant.imageUrl,
        }));
        setVariants(updatedVariants);

        setSnackbar({
          open: true,
          message: "Product image updated successfully",
          severity: "success",
        });
      } else {
        // Update specific variant
        const updatedVariants = variants.map((variant) =>
          variant.id === target
            ? {
                ...variant,
                imageUrl,
                hasCustomImage: true,
              }
            : variant,
        );
        setVariants(updatedVariants);

        setSnackbar({
          open: true,
          message: "Variant image updated successfully",
          severity: "success",
        });
      }

      setIsDirty(true);
    } catch (error) {
      console.error("Image upload error:", error);
      setSnackbar({
        open: true,
        message: `Upload failed: ${error.message}`,
        severity: "error",
      });
      throw error;
    } finally {
      setImageUploading(false);
    }
  };
  // Initialize form data when data is loaded
  useEffect(() => {
    if (productResponse && !productData) {
      const { productDetails, variants: fetchedVariants } = productResponse;

      setProductData({
        productName: productDetails.productName || "",
        description: productDetails.description || "",
        categoryId:
          productDetails.categoryId?._id || productDetails.categoryId || "",
        imageUrl: productDetails.imageUrl || "",
        originalData: productDetails,
      });

      if (fetchedVariants && Array.isArray(fetchedVariants)) {
        const processedVariants = fetchedVariants.map((variant) => ({
          id: variant._id, // MongoDB _id
          variantName: variant.variantName || "",
          variantDescription: variant.variantDescription || "",
          brand: variant.brand || "Others",
          invoicePrice: variant.invoicePrice || 0,
          estimatePrice: variant.estimatePrice || 0,
          stockQty: variant.stockQty || 0,
          gst: variant.gst || 0,
          imageUrl: variant.imageUrl || "",
          itemCode: variant.itemCode || "",
          hasCustomImage:
            !!variant.imageUrl && variant.imageUrl !== productDetails.imageUrl,
          _id: variant._id, // Keep original _id for updates
        }));

        setVariants(processedVariants);
      }
      setDeletedVariants([]);
    }
  }, [productResponse, productData]);
  // Handle product data update
  const handleProductUpdate = (updates) => {
    setProductData((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  // Replace your handleVariantsUpdate function with this:
  const handleVariantsUpdate = useCallback(
    (newVariants, deletedVariantId = null) => {
      console.log("🔄 handleVariantsUpdate called:", {
        newVariantsCount: newVariants.length,
        deletedVariantId,
        currentVariantsCount: variants.length,
      });

      // Update the variants state first
      setVariants(newVariants);

      // Then track deletion if needed
      if (deletedVariantId) {
        console.log("🗑️ Tracking deletion for variant:", deletedVariantId);

        // Check if it's a valid MongoDB ObjectId (not a temp ID like 'new-xxx')
        const isValidObjectId =
          deletedVariantId && /^[0-9a-fA-F]{24}$/.test(deletedVariantId);

        if (isValidObjectId) {
          console.log("✅ Valid ObjectId, adding to deletedVariants");
          setDeletedVariants((prev) => {
            // Check if already in the array to avoid duplicates
            if (prev.includes(deletedVariantId)) {
              console.log("⚠️ Variant already in deletedVariants");
              return prev;
            }
            const updated = [...prev, deletedVariantId];
            console.log("📝 Updated deletedVariants:", updated);
            return updated;
          });
        } else {
          console.log(
            "⚠️ Not a valid ObjectId (probably a temp variant), skipping deletion tracking",
          );
        }
      }

      setIsDirty(true);
    },
    [variants],
  ); // Add variants as dependency
  // Save product individually
  const handleSaveProduct = async () => {
    if (!productData) return;

    const { originalData, ...updateData } = productData;
    await updateProductMutation.mutateAsync(updateData);
  };

  // Save all variants and optionally product
  // Update handleSaveVariants to include deleted variants
  const handleSaveVariants = async (includeProduct = false) => {
    if (!variants.length && !deletedVariants.length) {
      setSnackbar({
        open: true,
        message: "No changes to save",
        severity: "warning",
      });
      return;
    }

    try {
      // Prepare variants data
      const variantsUpdateData = variants.map((variant) => {
        const { id, isNew, hasCustomImage, ...variantData } = variant;

        // Check if this is a new variant (has temp ID like 'new-' or 'copy-')
        const isNewVariant =
          id &&
          (id.toString().startsWith("new-") ||
            id.toString().startsWith("copy-"));

        // For new variants, don't send _id
        // For existing variants, send _id if it's a valid ObjectId
        const isValidObjectId = id && /^[0-9a-fA-F]{24}$/.test(id);

        return {
          ...variantData,
          // Only include _id for existing variants with valid ObjectId
          ...(isValidObjectId && !isNewVariant ? { _id: id } : {}),
        };
      });

      let updateData;
      if (includeProduct && productData) {
        const { originalData, ...productUpdateData } = productData;
        updateData = {
          product: productUpdateData,
          variants: variantsUpdateData,
          variantsToDelete: deletedVariants, // Send IDs to delete
        };
      } else {
        updateData = {
          variants: variantsUpdateData,
          variantsToDelete: deletedVariants, // Send IDs to delete
        };
      }

      console.log("Sending bulk update data with deletions:", updateData);

      await bulkUpdateMutation.mutateAsync(updateData);

      // Clear deleted variants after successful save
      setDeletedVariants([]);
    } catch (error) {
      console.error("Save variants error:", error);
    }
  };

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Loading state
  if (isLoading) {
    return <LoadingFallback />;
  }

  // Error state
  if (isError) {
    return <ErrorState error={error} navigate={navigate} />;
  }

  // No product found
  if (!productResponse?.productDetails) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert
          severity="warning"
          icon={<Warning />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="h6">Product Not Found</Typography>
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!productData) {
    return <LoadingFallback />;
  }

  const product = productResponse.productDetails;
  const categoryName = product.categoryId?.name || "Uncategorized";

  // Calculate totals for display
  const totals = {
    stock: variants.reduce((sum, v) => sum + (v.stockQty || 0), 0),
    value: variants.reduce(
      (sum, v) => sum + (v.stockQty || 0) * (v.variantPrice || 0),
      0,
    ),
    customImages: variants.filter((v) => v.hasCustomImage).length,
    active: variants.filter((v) => v.itemOnFlag).length,
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => {
            if (isDirty) {
              const confirmed = window.confirm(
                "You have unsaved changes. Do you want to leave without saving?",
              );
              if (!confirmed) return;
            }
            navigate(-1);
          }}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          Back to Products
        </Button>

        {/* Product Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              src={productData.imageUrl}
              variant="rounded"
              sx={{ width: 80, height: 80 }}
            />
            <Box flex={1}>
              <Typography variant="h4" fontWeight="bold">
                {product.productName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {categoryName} • ID: {productId}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  icon={<Inventory2 />}
                  label={`${variants.length} Variants`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`₹${totals.value.toFixed(0)} Value`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`${totals.stock} in Stock`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </Stack>
            </Box>

            {isDirty && (
              <Button
                variant="outlined"
                color="warning"
                onClick={() => {
                  const confirmed = window.confirm(
                    "Are you sure you want to discard all changes?",
                  );
                  if (confirmed) {
                    setProductData(null);
                    setVariants([]);
                    refetch();
                    setIsDirty(false);
                  }
                }}
              >
                Discard Changes
              </Button>
            )}
          </Stack>
        </Paper>

        {/* Navigation Tabs */}
        <Paper sx={{ borderRadius: 2, mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                py: 2,
                fontSize: "1rem",
                fontWeight: 600,
              },
            }}
          >
            <Tab
              icon={<Category />}
              iconPosition="start"
              label="Product Details"
              value={0}
            />
            <Tab
              icon={<Inventory2 />}
              iconPosition="start"
              label={`Variants (${variants.length})`}
              value={1}
            />
          </Tabs>
        </Paper>
      </Box>

      {/* Tab Content */}
      <Suspense fallback={<LoadingFallback />}>
        {activeTab === 0 ? (
          <ProductDetailsPage
            productData={productData}
            variants={variants}
            onUpdate={handleProductUpdate}
            onImageUpload={handleImageUpload}
            onSave={handleSaveProduct}
            isSaving={updateProductMutation.isPending}
            isDirty={isDirty}
            navigate={navigate}
            imageUploading={imageUploading}
          />
        ) : (
          <VariantsManagementPage
            productData={productData}
            variants={variants}
            onUpdate={handleVariantsUpdate}
            onImageUpload={handleImageUpload}
            onSave={handleSaveVariants}
            isSaving={bulkUpdateMutation.isPending}
            isDirty={isDirty}
            navigate={navigate}
            switchToProduct={() => setActiveTab(0)}
          />
        )}
      </Suspense>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}
          icon={snackbar.severity === "success" ? <CheckCircle /> : undefined}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductUpdatePage;
