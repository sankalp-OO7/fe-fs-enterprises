// src/pages/AddProductPage.jsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Autocomplete,
  Snackbar,
  Chip,
} from "@mui/material";
import {
  Category,
  Image as ImageIcon,
  CloudUpload,
  Visibility,
  LocalOffer,
  Add as AddIcon,
  ArrowBack,
  CheckCircle,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { optimizeImage, validateImage } from "../../utils/imageOptimizer";
import {
  createProductAPI,
  fetchCategories,
  uploadImageDirectAPI,
} from "../../api/product.api";

/* ─── Styled helpers ─── */
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const GlassCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 20,
  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 4px 32px rgba(79,70,229,0.07)",
  padding: theme.spacing(3),
}));

const FieldLabel = styled(Typography)({
  fontSize: "0.78rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 6,
  color: "#6366f1",
});

/* ─── Component ─── */
const AddProductPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [productData, setProductData] = useState({
    productName: "",
    description: "",
    categoryId: "",
    categoryName: "",
    imageUrl: "",
  });

  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => createProductAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setSnackbar({ open: true, message: `"${productData.productName}" created successfully!`, severity: "success" });
      setTimeout(() => navigate("/products"), 1500);
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Failed: ${error.message}`, severity: "error" });
    },
  });

  const handleChange = useCallback((field, value) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCategoryChange = useCallback((_, newValue) => {
    setProductData((prev) => ({
      ...prev,
      categoryId: newValue ? newValue._id : "",
      categoryName: newValue ? newValue.name : "",
    }));
  }, []);

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const validation = validateImage(file);
      if (!validation.isValid) throw new Error(validation.errors.join(", "));
      const optimizedFile = await optimizeImage(file);
      const formData = new FormData();
      formData.append("image", optimizedFile);
      formData.append("folder", "products/main");
      const response = await uploadImageDirectAPI(formData);
      if (!response.success) throw new Error(response.message || "Upload failed");
      setProductData((prev) => ({ ...prev, imageUrl: response.data.url }));
      setSnackbar({ open: true, message: "Image uploaded!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: `Upload failed: ${error.message}`, severity: "error" });
    } finally {
      setImageUploading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!productData.productName.trim()) {
        setSnackbar({ open: true, message: "Product name is required", severity: "error" });
        return;
      }
      if (!productData.categoryId) {
        setSnackbar({ open: true, message: "Please select a category", severity: "error" });
        return;
      }
      await createProductMutation.mutateAsync(productData);
    },
    [productData, createProductMutation]
  );

  const selectedCategory = categories.find((c) => c._id === productData.categoryId) || null;
  const isSubmitting = createProductMutation.isPending;
  const isValid = productData.productName.trim() && productData.categoryId;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)",
        pb: 8,
      }}
    >
      {/* ─── Hero Topbar ─── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 2, sm: 2.5 },
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            color: "white",
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius: "12px",
            p: 1,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
          }}
        >
          <ArrowBack fontSize="small" />
        </IconButton>
        <Box>
          <Typography
            variant="h6"
            sx={{ color: "white", fontWeight: 800, fontSize: { xs: "1rem", sm: "1.1rem" }, lineHeight: 1.2 }}
          >
            Add New Product
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.62)", fontSize: "0.72rem" }}>
            Fill in the details below to create a product
          </Typography>
        </Box>
      </Box>

      {/* ─── Form Body ─── */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 860,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          pt: { xs: 3, sm: 4 },
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* ── Product Info Card ── */}
        <GlassCard>
          {/* Section header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalOffer sx={{ fontSize: 18, color: "white" }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
              Product Information
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Product Name */}
            <Box>
              <FieldLabel>Product Name *</FieldLabel>
              <TextField
                fullWidth
                placeholder="e.g. Industrial Safety Helmet"
                value={productData.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
                required
                disabled={isSubmitting}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalOffer sx={{ fontSize: 17, color: "primary.main" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
            </Box>

            {/* Category */}
            <Box>
              <FieldLabel>Category *</FieldLabel>
              <Autocomplete
                options={categories}
                getOptionLabel={(o) => o.name}
                value={selectedCategory}
                onChange={handleCategoryChange}
                loading={categoriesLoading}
                disabled={isSubmitting}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select a category…"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <Category sx={{ fontSize: 17, color: "primary.main" }} />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                  />
                )}
                isOptionEqualToValue={(o, v) => o._id === v._id}
              />
            </Box>

            {/* Description */}
            <Box>
              <FieldLabel>Description</FieldLabel>
              <TextField
                fullWidth
                placeholder="Describe the product — features, specs, use case…"
                value={productData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                multiline
                rows={4}
                disabled={isSubmitting}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
            </Box>
          </Box>
        </GlassCard>

        {/* ── Image Card ── */}
        <GlassCard>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ImageIcon sx={{ fontSize: 18, color: "white" }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
              Product Image
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
              alignItems: { xs: "stretch", sm: "flex-start" },
            }}
          >
            {/* Preview box */}
            <Box
              sx={{
                width: { xs: "100%", sm: 180 },
                height: 180,
                borderRadius: "16px",
                border: "2px dashed",
                borderColor: productData.imageUrl ? "primary.main" : "divider",
                overflow: "hidden",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: productData.imageUrl
                  ? "transparent"
                  : "linear-gradient(135deg,#f0f4ff,#e8f0fe)",
                position: "relative",
                transition: "border-color 0.3s",
              }}
            >
              {productData.imageUrl ? (
                <>
                  <Box
                    component="img"
                    src={productData.imageUrl}
                    alt="Preview"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      background: "rgba(99,102,241,0.9)",
                      borderRadius: "8px",
                      p: 0.25,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 18, color: "white" }} />
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <ImageIcon sx={{ fontSize: 40, color: "primary.light", mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                    No image yet
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Upload controls + URL */}
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                component="label"
                variant="contained"
                fullWidth
                startIcon={imageUploading ? <CircularProgress size={16} color="inherit" /> : <CloudUpload />}
                disabled={imageUploading || isSubmitting}
                sx={{
                  borderRadius: "12px",
                  py: 1.25,
                  fontWeight: 700,
                  textTransform: "none",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                  "&:hover": { background: "linear-gradient(135deg,#4f46e5,#7c3aed)" },
                }}
              >
                {imageUploading ? "Uploading…" : "Upload Image"}
                <VisuallyHiddenInput type="file" accept="image/*" onChange={handleImageUpload} />
              </Button>

              <Box>
                <FieldLabel>Or paste image URL</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="https://example.com/image.jpg"
                  value={productData.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  disabled={isSubmitting}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ImageIcon sx={{ fontSize: 17, color: "primary.main" }} />
                      </InputAdornment>
                    ),
                    endAdornment: productData.imageUrl && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setImagePreviewOpen(true)}>
                          <Visibility sx={{ fontSize: 17 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
              </Box>

              {/* Tips */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.75,
                }}
              >
                {["JPG / PNG / WebP", "Max 20 MB", "Auto-optimized"].map((tip) => (
                  <Chip
                    key={tip}
                    label={tip}
                    size="small"
                    sx={{
                      fontSize: "0.68rem",
                      height: 22,
                      bgcolor: "rgba(99,102,241,0.08)",
                      color: "primary.main",
                      fontWeight: 600,
                      border: "none",
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </GlassCard>

        {/* ── Action Buttons ── */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={() => navigate(-1)}
            variant="outlined"
            disabled={isSubmitting}
            sx={{
              borderRadius: "12px",
              px: 3,
              fontWeight: 600,
              textTransform: "none",
              order: { xs: 2, sm: 1 },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
            disabled={isSubmitting || !isValid}
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1.25,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.95rem",
              background: isValid
                ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                : undefined,
              boxShadow: isValid ? "0 4px 18px rgba(99,102,241,0.4)" : undefined,
              "&:hover": { background: "linear-gradient(135deg,#4f46e5,#7c3aed)" },
              order: { xs: 1, sm: 2 },
            }}
          >
            {isSubmitting ? "Creating…" : "Create Product"}
          </Button>
        </Box>
      </Box>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ── Full-screen image preview ── */}
      {imagePreviewOpen && (
        <Box
          onClick={() => setImagePreviewOpen(false)}
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1400,
            cursor: "zoom-out",
          }}
        >
          <Box sx={{ maxWidth: "90%", maxHeight: "90%" }}>
            <img
              src={productData.imageUrl}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: 12 }}
            />
            <Typography
              variant="caption"
              sx={{ display: "block", textAlign: "center", color: "rgba(255,255,255,0.5)", mt: 1.5 }}
            >
              Click anywhere to close
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AddProductPage;