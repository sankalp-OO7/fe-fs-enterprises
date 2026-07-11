import React, { useState, useCallback, memo, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
  CircularProgress,
  Divider,
  InputAdornment,
  Alert,
  Slide,
  alpha,
  Grid,
} from "@mui/material";
import {
  Close,
  Save,
  Refresh,
  Inventory,
  AttachMoney,
  Description,
  Error as ErrorIcon,
  PhotoCamera,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

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

const ImageUploadBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  cursor: "pointer",
  transition: "all 0.2s ease",
  minHeight: 140,
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

const SectionContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const FieldsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  flexDirection: "row",
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ─── Validation Rules ────────────────────────────────────────────────────────

const validate = (formData) => {
  const errors = {};

  if (!formData.variantName?.trim()) {
    errors.variantName = "Variant name is required";
  }

  if (!formData.brand?.trim()) {
    errors.brand = "Brand is required";
  }

  if (
    formData.invoicePrice === "" ||
    formData.invoicePrice === null ||
    formData.invoicePrice === undefined
  ) {
    errors.invoicePrice = "Invoice price is required";
  } else if (isNaN(Number(formData.invoicePrice))) {
    errors.invoicePrice = "Must be a valid number";
  } else if (Number(formData.invoicePrice) < 0) {
    errors.invoicePrice = "Cannot be negative";
  }

  if (
    formData.estimatePrice === "" ||
    formData.estimatePrice === null ||
    formData.estimatePrice === undefined
  ) {
    errors.estimatePrice = "Estimate price is required";
  } else if (isNaN(Number(formData.estimatePrice))) {
    errors.estimatePrice = "Must be a valid number";
  } else if (Number(formData.estimatePrice) < 0) {
    errors.estimatePrice = "Cannot be negative";
  }

  if (
    formData.stockQty === "" ||
    formData.stockQty === null ||
    formData.stockQty === undefined
  ) {
    errors.stockQty = "Stock quantity is required";
  } else if (!Number.isInteger(Number(formData.stockQty))) {
    errors.stockQty = "Must be a whole number";
  } else if (Number(formData.stockQty) < 0) {
    errors.stockQty = "Cannot be negative";
  }

  if (
    formData.gst !== "" &&
    formData.gst !== null &&
    formData.gst !== undefined
  ) {
    const gstVal = Number(formData.gst);
    if (isNaN(gstVal)) {
      errors.gst = "Must be a valid number";
    } else if (gstVal < 0 || gstVal > 100) {
      errors.gst = "GST must be between 0 and 100";
    }
  }

  if (
    formData.itemCode !== "" &&
    formData.itemCode !== null &&
    formData.itemCode !== undefined
  ) {
    const code = Number(formData.itemCode);
    if (isNaN(code) || !Number.isInteger(code)) {
      errors.itemCode = "Must be a whole number";
    } else if (code < 0) {
      errors.itemCode = "Cannot be negative";
    }
  }

  return errors;
};

// ─── Component ───────────────────────────────────────────────────────────────

const VariantFormDialog = memo(
  ({
    open,
    onClose,
    variant,
    productImage,
    onSave,
    onImageUpload,
    loading,
  }) => {
    const [formData, setFormData] = useState({});
    const [imageUploading, setImageUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [touched, setTouched] = useState({});

    // Use string values for number fields so user can clear them freely
    useEffect(() => {
      if (variant) {
        setFormData({
          variantName: variant.variantName || "",
          brand: variant.brand || "Others",
          variantDescription:
            variant.variantDescription || variant.varientDescription || "",
          invoicePrice: variant.invoicePrice ?? "", // ← string-friendly
          estimatePrice: variant.estimatePrice ?? "",
          stockQty: variant.stockQty ?? "",
          imageUrl: variant.imageUrl || "",
          hasCustomImage: variant.hasCustomImage || false,
          gst: variant.gst ?? "",
          itemCode: variant.itemCode ?? "",
        });
        setPreviewImage(variant.imageUrl || productImage);
        setTouched({});
      }
    }, [variant, productImage]);

    const errors = validate(formData);
    const isFormValid = Object.keys(errors).length === 0;

    // Generic change — keeps value as string so user can freely edit
    const handleChange = useCallback((field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
    }, []);

    // For number fields — store as raw string while typing, no forced conversion
    const handleNumberInput = useCallback((field, value) => {
      // Allow empty string so user can clear the field
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
    }, []);

    const processImageUpload = useCallback(
      async (file) => {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(e.target.result);
        reader.readAsDataURL(file);

        setImageUploading(true);
        try {
          if (onImageUpload) {
            const newImageUrl = await onImageUpload(file, variant.id);
            if (newImageUrl) {
              handleChange("imageUrl", newImageUrl);
              handleChange("hasCustomImage", true);
              setPreviewImage(newImageUrl);
            }
          }
        } catch (error) {
          console.error("Image upload failed:", error);
        } finally {
          setImageUploading(false);
        }
      },
      [onImageUpload, variant?.id, handleChange],
    );

    const handleFileUpload = useCallback(
      async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        await processImageUpload(file);
      },
      [processImageUpload],
    );

    const handleResetImage = useCallback(() => {
      setPreviewImage(productImage);
      handleChange("imageUrl", productImage || "");
      handleChange("hasCustomImage", false);
    }, [handleChange, productImage]);

    // Mark all fields touched on save attempt
    const handleSaveClick = useCallback(() => {
      // Touch all fields to show all errors
      setTouched({
        variantName: true,
        brand: true,
        invoicePrice: true,
        estimatePrice: true,
        stockQty: true,
        gst: true,
        itemCode: true,
      });

      if (!isFormValid) return;

      const saveData = {
        variantName: formData.variantName.trim(),
        brand: formData.brand.trim() || "Others",
        variantDescription: formData.variantDescription || "",
        invoicePrice: Number(formData.invoicePrice),
        estimatePrice: Number(formData.estimatePrice),
        stockQty: parseInt(formData.stockQty),
        imageUrl: formData.imageUrl,
        hasCustomImage: formData.hasCustomImage,
        gst: formData.gst !== "" ? Number(formData.gst) : 0,
        // Send undefined if empty — backend will auto-generate
        itemCode:
          formData.itemCode !== "" && formData.itemCode !== null
            ? parseInt(formData.itemCode)
            : undefined,
      };

      // IMPORTANT: Keep the _id if the variant has one
      if (variant._id) {
        saveData._id = variant._id;
      }

      // Keep the id if the variant has one
      if (variant.id) {
        saveData.id = variant.id;
      }

      // Remove undefined fields
      Object.keys(saveData).forEach(
        (key) => saveData[key] === undefined && delete saveData[key],
      );

      onSave(saveData);
    }, [formData, isFormValid, onSave]);

    if (!variant) return null;

    // Helper to show error only if field is touched
    const fieldError = (field) => (touched[field] ? errors[field] : undefined);

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{ sx: { borderRadius: 3, maxHeight: "90vh" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
            px: 3,
            borderBottom: (theme) =>
              `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {variant.isNew
              ? "Add Variant"
              : `Edit Variant: ${variant.variantName}`}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Image Section */}
          <Grid
            container
            spacing={3}
            sx={{
              mb: 1,
              mt: 1,
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Grid item xs={12} sm={4}>
              <Avatar
                src={previewImage || "/placeholder-image.jpg"}
                variant="rounded"
                sx={{
                  width: "100%",
                  height: "auto",
                  aspectRatio: "1/1",
                  maxWidth: 140,
                  border: "2px solid",
                  borderColor: formData.hasCustomImage
                    ? "primary.main"
                    : "divider",
                }}
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="variant-image-upload"
              />
              <label htmlFor="variant-image-upload" style={{ width: "100%" }}>
                <ImageUploadBox>
                  {imageUploading ? (
                    <Box sx={{ textAlign: "center" }}>
                      <CircularProgress size={30} />
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        Uploading...
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <PhotoCamera
                        sx={{ fontSize: 30, color: "primary.main", mb: 1 }}
                      />
                      <Typography variant="body2" fontWeight="500">
                        Click to upload
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        align="center"
                      >
                        JPG, PNG, GIF (Max 5MB)
                      </Typography>
                    </>
                  )}
                </ImageUploadBox>
              </label>

              {formData.hasCustomImage && (
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<Refresh />}
                  onClick={handleResetImage}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Reset to Product Image
                </Button>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Basic Info */}
            <SectionContainer>
              <SectionHeader>
                <Description fontSize="small" /> Basic Information
              </SectionHeader>
              <FieldsRow>
                <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "250px" }}>
                  <TextField
                    fullWidth
                    label="Variant Name *"
                    value={formData.variantName || ""}
                    onChange={(e) =>
                      handleChange("variantName", e.target.value)
                    }
                    size="small"
                    error={!!fieldError("variantName")}
                    helperText={fieldError("variantName")}
                  />
                </Box>

                <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "250px" }}>
                  <TextField
                    fullWidth
                    label="Brand *"
                    value={formData.brand || ""}
                    onChange={(e) => handleChange("brand", e.target.value)}
                    size="small"
                    placeholder="Others"
                    error={!!fieldError("brand")}
                    helperText={
                      fieldError("brand") ||
                      "Defaults to 'Others' if not specified"
                    }
                  />
                </Box>

                <Box sx={{ flex: "1 1 100%" }}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.variantDescription || ""}
                    onChange={(e) =>
                      handleChange("variantDescription", e.target.value)
                    }
                    multiline
                    rows={2}
                    size="small"
                    placeholder="Enter variant description..."
                  />
                </Box>
              </FieldsRow>
            </SectionContainer>

            {/* Pricing */}
            <SectionContainer>
              <SectionHeader>
                <AttachMoney fontSize="small" /> Pricing
              </SectionHeader>
              <FieldsRow>
                <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "250px" }}>
                  <TextField
                    fullWidth
                    label="Invoice Price *"
                    type="number"
                    value={formData.invoicePrice}
                    onChange={(e) =>
                      handleNumberInput("invoicePrice", e.target.value)
                    }
                    onFocus={(e) => {
                      // Select all on focus so user can just type new value
                      e.target.select();
                    }}
                    size="small"
                    error={!!fieldError("invoicePrice")}
                    helperText={fieldError("invoicePrice")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                      inputProps: { min: 0, step: "0.01" },
                    }}
                  />
                </Box>

                <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "250px" }}>
                  <TextField
                    fullWidth
                    label="Estimate Price *"
                    type="number"
                    value={formData.estimatePrice}
                    onChange={(e) =>
                      handleNumberInput("estimatePrice", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    size="small"
                    error={!!fieldError("estimatePrice")}
                    helperText={fieldError("estimatePrice")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                      inputProps: { min: 0, step: "0.01" },
                    }}
                  />
                </Box>
              </FieldsRow>
            </SectionContainer>

            {/* Stock & More */}
            <SectionContainer>
              <SectionHeader>
                <Inventory fontSize="small" /> Stock & More
              </SectionHeader>
              <FieldsRow>
                <Box
                  sx={{ flex: "1 1 calc(33.333% - 11px)", minWidth: "200px" }}
                >
                  <TextField
                    fullWidth
                    label="Stock Quantity *"
                    type="number"
                    value={formData.stockQty}
                    onChange={(e) =>
                      handleNumberInput("stockQty", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    size="small"
                    error={!!fieldError("stockQty")}
                    helperText={fieldError("stockQty")}
                    InputProps={{
                      inputProps: { min: 0, step: "1" },
                    }}
                  />
                </Box>

                <Box
                  sx={{ flex: "1 1 calc(33.333% - 11px)", minWidth: "200px" }}
                >
                  <TextField
                    fullWidth
                    label="GST %"
                    type="number"
                    value={formData.gst}
                    onChange={(e) => handleNumberInput("gst", e.target.value)}
                    onFocus={(e) => e.target.select()}
                    size="small"
                    error={!!fieldError("gst")}
                    helperText={fieldError("gst") || "0 – 100%"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                      inputProps: { min: 0, max: 100, step: "0.01" },
                    }}
                  />
                </Box>

                <Box
                  sx={{ flex: "1 1 calc(33.333% - 11px)", minWidth: "200px" }}
                >
                  <TextField
                    fullWidth
                    label="Item Code"
                    type="number"
                    value={formData.itemCode}
                    onChange={(e) =>
                      handleNumberInput("itemCode", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    size="small"
                    error={!!fieldError("itemCode")}
                    helperText={
                      fieldError("itemCode") || "Auto-generated if empty"
                    }
                    InputProps={{
                      inputProps: { min: 0, step: "1" },
                    }}
                  />
                </Box>
              </FieldsRow>
            </SectionContainer>
          </Box>

          {/* Show all errors summary if user tried to save */}
          {Object.keys(touched).length > 0 && !isFormValid && (
            <Alert
              severity="error"
              icon={<ErrorIcon />}
              sx={{ mt: 1, borderRadius: 2 }}
            >
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Please fix the following:
              </Typography>
              {Object.values(errors).map((err, i) => (
                <Typography key={i} variant="caption" display="block">
                  • {err}
                </Typography>
              ))}
            </Alert>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: (theme) =>
              `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            size="medium"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveClick}
            variant="contained"
            startIcon={loading ? <CircularProgress size={18} /> : <Save />}
            disabled={loading} // ← not disabled by validation, shows errors instead
            size="medium"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);

export default VariantFormDialog;
