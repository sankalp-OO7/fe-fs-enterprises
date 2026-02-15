import React, { useState, useMemo, useCallback, memo } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Alert,
  Stack,
  Divider,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Inventory2,
  AddPhotoAlternate,
  ArrowBack,
  Search,
  Clear,
  Save,
  CheckCircle,
  FilterList,
  Sort,
  Refresh,
} from "@mui/icons-material";
import VariantsTable from "./VariantsTable";
import VariantStats from "./VariantStats";
import BulkEditDialog from "./BulkEditDialog";
import VariantFormDialog from "./VariantFormDialog";
import ImagePreviewDialog from "./ImagePreviewDialog";
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

const VariantsManagementPage = memo(
  ({
    productData,
    variants,
    onUpdate,
    onImageUpload,
    onSave,
    isSaving,
    isDirty,
    navigate,
    switchToProduct,
  }) => {
    const [selectedVariants, setSelectedVariants] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [variantFormOpen, setVariantFormOpen] = useState(false);
    const [selectedVariantForForm, setSelectedVariantForForm] = useState(null);
    const [bulkEditDialog, setBulkEditDialog] = useState(false);
    const [bulkEditField, setBulkEditField] = useState("");
    const [bulkEditValue, setBulkEditValue] = useState("");
    const [imageDialog, setImageDialog] = useState({
      open: false,
      currentImage: "",
    });
    const [sortBy, setSortBy] = useState("name");
    const [filterBy, setFilterBy] = useState("all");

    // Filtered and sorted variants
    const filteredVariants = useMemo(() => {
      let filtered = variants;

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.variantName?.toLowerCase().includes(term) ||
            v.brand?.toLowerCase().includes(term) ||
            v.itemCode?.toString().includes(term),
        );
      }

      // Sorting
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "name":
            return (a.variantName || "").localeCompare(b.variantName || "");
          case "price":
            return (b.invoicePrice || 0) - (a.invoicePrice || 0);
          case "stock":
            return (b.stockQty || 0) - (a.stockQty || 0);
          case "recent":
            return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
          default:
            return 0;
        }
      });

      return filtered;
    }, [variants, searchTerm, sortBy, filterBy]);

    console.log("Rendering VariantsManagementPage with variants:", variants);
    // Handlers
    const handleAddVariant = useCallback(() => {
      const variantId = `new-${Date.now()}`;
      const newVariantData = {
        id: variantId, // Temporary ID for frontend tracking
        variantName: "New Variant",
        brand: "",
        variantDescription: "",
        invoicePrice: 0,
        estimatePrice: 0,
        stockQty: 0,
        imageUrl: productData.imageUrl,
        hasCustomImage: false,
        isNew: true, // Flag to indicate this is new
        itemCode: "",
      };
      setSelectedVariantForForm(newVariantData);
      setVariantFormOpen(true);
    }, [productData.imageUrl]);

    const handleSaveVariantForm = useCallback(
      (formData) => {
        console.log("Saving variant form data:", formData);
        if (selectedVariantForForm?.isNew) {
          const newVariant = {
            ...formData,
            id: selectedVariantForForm.id,
            isNew: true,
          };

          onUpdate([...variants, newVariant]);
        } else {
          const updatedVariants = variants.map((variant) => {
            const variantKey = variant.id || variant._id;
            const selectedKey =
              selectedVariantForForm.id || selectedVariantForForm._id;

            if (variantKey === selectedKey) {
              return { ...variant, ...formData };
            }

            return variant;
          });

          onUpdate(updatedVariants);
        }

        setVariantFormOpen(false);
        setSelectedVariantForForm(null);
      },
      [selectedVariantForForm, variants, onUpdate],
    );

    const handleBulkEdit = useCallback(() => {
      if (!bulkEditField || selectedVariants.length === 0) return;

      const updatedVariants = variants.map((variant) => {
        if (selectedVariants.includes(variant.id)) {
          return { ...variant, [bulkEditField]: bulkEditValue };
        }
        return variant;
      });

      onUpdate(updatedVariants);
      setBulkEditDialog(false);
      setBulkEditField("");
      setBulkEditValue("");
      setSelectedVariants([]);
    }, [variants, selectedVariants, bulkEditField, bulkEditValue, onUpdate]);
    const validateVariants = useCallback(() => {
      const errors = [];

      // Check for duplicate itemCodes
      const itemCodes = variants
        .map((v) => v.itemCode)
        .filter((code) => code && code !== "");
      const duplicateCodes = itemCodes.filter(
        (code, index) => itemCodes.indexOf(code) !== index,
      );

      if (duplicateCodes.length > 0) {
        errors.push(
          `Duplicate item codes found: ${[...new Set(duplicateCodes)].join(", ")}`,
        );
      }

      // Check for empty required fields
      variants.forEach((v, index) => {
        if (!v.variantName) {
          errors.push(`Variant at position ${index + 1} has no name`);
        }
      });

      return errors;
    }, [variants]);

    const handleSaveAndExit = useCallback(
      async (includeProduct = false) => {
        const errors = validateVariants();
        if (errors.length > 0) {
          alert(`Cannot save: \n${errors.join("\n")}`);
          return;
        }

        await onSave(includeProduct);
        setTimeout(() => navigate(-1), 1000);
      },
      [onSave, navigate, validateVariants],
    );
    return (
      <Box>
        {/* Header Section */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Inventory2 /> Manage Variants
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Edit {variants.length} variants for {productData.productName}
                {selectedVariants.length > 0 &&
                  ` • ${selectedVariants.length} selected`}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                onClick={() => switchToProduct()}
                variant="outlined"
                startIcon={<ArrowBack />}
              >
                Back to Product
              </Button>

              <Button
                onClick={handleAddVariant}
                variant="contained"
                startIcon={<AddPhotoAlternate />}
                color="primary"
              >
                Add Variant
              </Button>
            </Stack>
          </Box>

          {/* Stats Section */}
          <VariantStats
            totalVariants={variants.length}
            totalStock={variants.reduce((sum, v) => sum + (v.stockQty || 0), 0)}
            customImages={variants.filter((v) => v.hasCustomImage).length}
            totalValue={variants.reduce(
              (sum, v) => sum + (v.stockQty || 0) * (v.variantPrice || 0),
              0,
            )}
          />
        </Paper>

        {/* Controls Section */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search variants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>

            {/* Filters */}
            <Grid item xs={12} md={8}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="flex-end"
              >
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>
                    <FilterList fontSize="small" sx={{ mr: 1 }} /> Filter
                  </InputLabel>
                  <Select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    label="Filter"
                  >
                    <MenuItem value="all">All Variants</MenuItem>
                    <MenuItem value="active">Active Only</MenuItem>
                    <MenuItem value="inactive">Inactive Only</MenuItem>
                    <MenuItem value="customImage">Custom Images</MenuItem>
                    <MenuItem value="noStock">Out of Stock</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>
                    <Sort fontSize="small" sx={{ mr: 1 }} /> Sort By
                  </InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="name">Name A-Z</MenuItem>
                    <MenuItem value="price">Price High-Low</MenuItem>
                    <MenuItem value="stock">Stock High-Low</MenuItem>
                    <MenuItem value="recent">Recently Updated</MenuItem>
                  </Select>
                </FormControl>

                {selectedVariants.length > 0 && (
                  <>
                    <Chip
                      label={`${selectedVariants.length} selected`}
                      color="primary"
                      onDelete={() => setSelectedVariants([])}
                    />
                    <Button
                      onClick={() => setBulkEditDialog(true)}
                      variant="outlined"
                      size="small"
                    >
                      Bulk Edit
                    </Button>
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Unsaved Changes Alert */}
        {isDirty && (
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  onClick={() => onSave(false)}
                  variant="outlined"
                  size="small"
                  startIcon={
                    isSaving ? <CircularProgress size={16} /> : <Save />
                  }
                  disabled={isSaving}
                >
                  Save Variants
                </Button>
                <Button
                  onClick={() => handleSaveAndExit(true)}
                  variant="contained"
                  size="small"
                  startIcon={
                    isSaving ? <CircularProgress size={16} /> : <CheckCircle />
                  }
                  disabled={isSaving}
                  color="success"
                >
                  Save All & Exit
                </Button>
              </Stack>
            }
          >
            You have unsaved changes to {variants.length} variants
          </Alert>
        )}

        {/* Variants Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <VariantsTable
            variants={filteredVariants}
            selectedVariants={selectedVariants}
            productData={productData}
            onSelectVariant={(id) =>
              setSelectedVariants((prev) =>
                prev.includes(id)
                  ? prev.filter((v) => v !== id)
                  : [...prev, id],
              )
            }
            onSelectAll={() => {
              if (selectedVariants.length === filteredVariants.length) {
                setSelectedVariants([]);
              } else {
                setSelectedVariants(filteredVariants.map((v) => v.id));
              }
            }}
            onRemoveVariant={(variantId) => {
              console.log(
                "VariantsManagementPage: onRemoveVariant called with ID:",
                variantId,
              );
              // Filter out the variant and notify parent
              const updatedVariants = variants.filter(
                (v) => v.id !== variantId,
              );
              onUpdate(updatedVariants, variantId); // Pass the ID to track deletion
            }}
            onVariantChange={(newVariants) => onUpdate(newVariants)}
            onResetVariantImage={(id) =>
              onUpdate(
                variants.map((v) =>
                  v.id === id
                    ? {
                        ...v,
                        imageUrl: productData.imageUrl,
                        hasCustomImage: false,
                      }
                    : v,
                ),
              )
            }
            onDuplicateVariant={(variant) => {
              console.log("Duplicating variant:", variant);

              // Create a new variant with unique values
              const newVariant = {
                ...variant,
                id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Unique ID
                _id: undefined, // Remove MongoDB ID
                variantName: `${variant.variantName || "Variant"} (Copy)`,
                itemCode: "", // IMPORTANT: Clear itemCode to avoid duplicate key error
                isNew: true,
                hasCustomImage: false,
                // Reset other unique fields
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              // Remove any fields that shouldn't be copied
              delete newVariant.__v; // Remove Mongoose version key if present

              onUpdate([...variants, newVariant]);
            }}
            onFileUpload={onImageUpload}
            onOpenVariantForm={(variant) => {
              setSelectedVariantForForm(variant);
              setVariantFormOpen(true);
            }}
            onImagePreview={(image) =>
              setImageDialog({ open: true, currentImage: image })
            }
          />
        </Paper>

        {/* Save Actions Section */}
        <Paper sx={{ p: 3, borderRadius: 2, bgcolor: "grey.50" }}>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                {variants.length} variants • Last updated:{" "}
                {new Date().toLocaleDateString()}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                onClick={() => navigate(-1)}
                variant="outlined"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSaveAndExit(true)}
                variant="contained"
                startIcon={<CheckCircle />}
                disabled={isSaving}
                color="success"
              >
                Save All & Exit
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Dialogs */}
        <BulkEditDialog
          open={bulkEditDialog}
          onClose={() => setBulkEditDialog(false)}
          selectedVariants={selectedVariants}
          bulkEditField={bulkEditField}
          bulkEditValue={bulkEditValue}
          onFieldChange={setBulkEditField}
          onValueChange={setBulkEditValue}
          onApply={handleBulkEdit}
        />

        <VariantFormDialog
          open={variantFormOpen}
          onClose={() => {
            setVariantFormOpen(false);
            setSelectedVariantForForm(null);
          }}
          variant={selectedVariantForForm}
          productImage={productData.imageUrl}
          onSave={handleSaveVariantForm}
          onImageUpload={onImageUpload}
          loading={false}
        />

        <ImagePreviewDialog
          open={imageDialog.open}
          imageUrl={imageDialog.currentImage}
          onClose={() => setImageDialog({ open: false, currentImage: "" })}
        />
      </Box>
    );
  },
);

export default VariantsManagementPage;
