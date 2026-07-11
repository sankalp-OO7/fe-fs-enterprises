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
import ConfirmDialog from "../../../components/ConfirmDialog";
import { useProductValidation } from "../../../hooks/useProductValidation";
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
  // Confirm dialogs
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
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
  const { errors, isValid, errorCount } = useProductValidation(
    productData,
    variants,
    deletedVariants,
  );

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
      console.error("Bulk update error:", error);

      // Check if it's a duplicate variant name error
      if (error.response?.status === 409 && error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("already exists for this product")) {
          // Extract the duplicate name from error
          const duplicateName = errorMessage.replace(
            /Variant name "|" already exists for this product/g,
            "",
          );

          setSnackbar({
            open: true,
            message: `Duplicate variant name: "${duplicateName}". Please rename the variant before saving.`,
            severity: "error",
          });
          return;
        }
      }

      setSnackbar({
        open: true,
        message: `Bulk update failed: ${error.message}`,
        severity: "error",
      });
    },
  });

  const handleImageUpload = async (file, target = "product") => {
    if (!file) return;

    setImageUploading(true);

    try {
      const validation = validateImage(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      setSnackbar({
        open: true,
        message: "Optimizing image...",
        severity: "info",
      });

      const optimizedFile = await optimizeImage(file);

      const formData = new FormData();
      formData.append("image", optimizedFile);
      formData.append(
        "folder",
        target === "product" ? "products/main" : "products/variants",
      );

      setSnackbar({
        open: true,
        message: "Uploading to server...",
        severity: "info",
      });

      const response = await uploadImageDirectAPI(formData);

      if (!response.success) {
        throw new Error(response.message || "Upload failed");
      }

      const imageUrl = response.data.url;

      if (target === "product") {
        const updatedProductData = { ...productData, imageUrl };
        setProductData(updatedProductData);

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
        const updatedVariants = variants.map((variant) =>
          variant.id === target
            ? { ...variant, imageUrl, hasCustomImage: true }
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
      return imageUrl; // ← ADDED
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
          id: variant.id || variant._id,
          _id: variant._id || variant.id,
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
      // Update the variants state first
      setVariants(newVariants);

      // Then track deletion if needed
      if (deletedVariantId) {
        // Check if it's a valid MongoDB ObjectId (not a temp ID like 'new-xxx')
        const isValidObjectId =
          deletedVariantId && /^[0-9a-fA-F]{24}$/.test(deletedVariantId);

        if (isValidObjectId) {
          setDeletedVariants((prev) => {
            // Check if already in the array to avoid duplicates
            if (prev.includes(deletedVariantId)) {
              return prev;
            }
            const updated = [...prev, deletedVariantId];
            return updated;
          });
        } else {
          console.log(
            " Not a valid ObjectId (probably a temp variant), skipping deletion tracking",
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
  // Update handleSaveVariants to include deleted variants Replace the handleSaveVariants function
  const handleSaveVariants = async (includeProduct = false) => {
    // Get fresh validation state
    const currentErrors = errors;
    const currentIsValid = isValid;
    const currentErrorCount = errorCount;

    // Check validation before saving
    if (!currentIsValid) {
      // Show detailed error in snackbar
      const errorMessages = currentErrors
        .filter((e) => e.severity === "error")
        .map((e) => e.message)
        .join("; ");

      setSnackbar({
        open: true,
        message: `Cannot save: ${currentErrorCount} error(s) found. ${errorMessages}`,
        severity: "error",
      });

      // Also log to console for debugging
      console.error("❌ Save blocked - Validation errors:", currentErrors);
      return;
    }

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

        // IMPORTANT: Always keep _id if it exists
        const variantToSend = {
          ...variantData,
        };

        // If variant has _id, include it
        if (variant._id) {
          variantToSend._id = variant._id;
        }

        // If variant has id and no _id, use id as _id
        if (!variant._id && id && /^[0-9a-fA-F]{24}$/.test(id)) {
          variantToSend._id = id;
        }

        return variantToSend;
      });
      // Check for variants without IDs
      const missingIds = variantsUpdateData.filter((v) => !v._id);
      if (missingIds.length > 0) {
        console.warn(
          "⚠️ Variants without IDs:",
          missingIds.map((v) => v.variantName),
        );
      }

      let updateData;
      if (includeProduct && productData) {
        const { originalData, ...productUpdateData } = productData;
        updateData = {
          product: productUpdateData,
          variants: variantsUpdateData,
          variantsToDelete: deletedVariants,
        };
      } else {
        updateData = {
          variants: variantsUpdateData,
          variantsToDelete: deletedVariants,
        };
      }

      await bulkUpdateMutation.mutateAsync(updateData);
      setDeletedVariants([]);
    } catch (error) {
      console.error("❌ Save variants error:", error);

      // Handle specific error types
      if (error.response?.status === 409) {
        setSnackbar({
          open: true,
          message: `Duplicate variant found: ${error.response?.data?.message || "Please check for duplicate names or codes"}`,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Save failed: ${error.message}`,
          severity: "error",
        });
      }
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
              setConfirmLeave(true);
            } else {
              navigate(-1);
            }
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
                onClick={() => setConfirmDiscard(true)}
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
            validationErrors={errors} // ADD THIS
            isValid={isValid}
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
      {/* Confirm: Leave with unsaved changes */}
      <ConfirmDialog
        open={confirmLeave}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmLabel="Leave"
        cancelLabel="Stay"
        confirmColor="warning"
        icon="warning"
        onConfirm={() => {
          setConfirmLeave(false);
          navigate(-1);
        }}
        onCancel={() => setConfirmLeave(false)}
      />

      {/* Confirm: Discard changes */}
      <ConfirmDialog
        open={confirmDiscard}
        title="Discard Changes"
        message="Are you sure you want to discard all unsaved changes? This cannot be undone."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        confirmColor="error"
        icon="delete"
        onConfirm={() => {
          setConfirmDiscard(false);
          setProductData(null);
          setVariants([]);
          refetch();
          setIsDirty(false);
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </Container>
  );
};

export default ProductUpdatePage;
