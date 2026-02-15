// src/components/variant/VariantFormDialog.jsx
import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
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
} from '@mui/material';
import {
  Close,
  CloudUpload,
  Save,
  Refresh,
  Inventory,
  AttachMoney,
  Percent,
  Description,
  BrandingWatermark,
  QrCode,
  Error,
  PhotoCamera,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ImageUploadBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minHeight: 140,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const SectionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const FieldsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  flexDirection: 'row',
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const VariantFormDialog = memo(({
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

  // Initialize form data - UPDATED field names to match schema
  useEffect(() => {
    if (variant) {
      setFormData({
        variantName: variant.variantName || '',
        brand: variant.brand || 'Others', // Default to "Others" as per schema
        variantDescription: variant.variantDescription || variant.varientDescription || '', // Handle both spellings
        invoicePrice: variant.invoicePrice || 0,
        estimatePrice: variant.estimatePrice || 0,
        stockQty: variant.stockQty || 0,
        imageUrl: variant.imageUrl || '',
        hasCustomImage: variant.hasCustomImage || false,
        gst: variant.gst || 0,
        itemCode: variant.itemCode || '',
      });
      setPreviewImage(variant.imageUrl || productImage);
    }
  }, [variant, productImage]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleNumberChange = useCallback((field, value) => {
    let parsedValue;
    if (field === 'stockQty') {
      parsedValue = parseInt(value) || 0;
    } else {
      parsedValue = parseFloat(value) || 0;
    }
    
    const safeValue = Math.max(0, parsedValue);
    setFormData(prev => ({ ...prev, [field]: safeValue }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const processImageUpload = useCallback(async (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);

    setImageUploading(true);
    try {
      if (onImageUpload) {
        await onImageUpload(file, variant.id);
      }
      handleChange('hasCustomImage', true);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setImageUploading(false);
    }
  }, [onImageUpload, variant?.id, handleChange]);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    await processImageUpload(file);
  }, [processImageUpload]);

  const handleResetImage = useCallback(() => {
    setPreviewImage(productImage);
    handleChange('imageUrl', productImage);
    handleChange('hasCustomImage', false);
  }, [handleChange, productImage]);

  const handleSave = useCallback(() => {
    // Map to schema field names - UPDATED to match backend
    const saveData = {
      variantName: formData.variantName,
      brand: formData.brand || 'Others', // Ensure brand has default
      variantDescription: formData.variantDescription,
      invoicePrice: formData.invoicePrice,
      estimatePrice: formData.estimatePrice,
      stockQty: formData.stockQty,
      imageUrl: formData.imageUrl,
      hasCustomImage: formData.hasCustomImage,
      gst: formData.gst,
      itemCode: formData.itemCode ? parseInt(formData.itemCode) : undefined, // Convert to number as per schema
    };
    
    // Remove undefined fields
    Object.keys(saveData).forEach(key => 
      saveData[key] === undefined && delete saveData[key]
    );
    
    onSave(saveData);
  }, [formData, onSave]);

  if (!variant) return null;

  const isFormValid = formData.variantName?.trim() && formData.brand?.trim();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        py: 2,
        px: 3,
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Edit Variant : {variant.variantName}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Image Upload Section */}
        <Grid container spacing={3} sx={{ mb: 1, mt: 1, justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <Grid item xs={12} sm={4}>
            <Avatar
              src={previewImage || '/placeholder-image.jpg'}
              variant="rounded"
              sx={{
                width: '100%',
                height: 'auto',
                aspectRatio: '1/1',
                maxWidth: 140,
                border: '2px solid',
                borderColor: formData.hasCustomImage ? 'primary.main' : 'divider',
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={8}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="image-upload-input"
            />
            
            <label htmlFor="image-upload-input" style={{ width: '100%' }}>
              <ImageUploadBox>
                {imageUploading ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={30} />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Uploading...
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <PhotoCamera sx={{ fontSize: 30, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" fontWeight="500">
                      Click to upload
                    </Typography>
                    <Typography variant="caption" color="text.secondary" align="center">
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
                Reset
              </Button>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Form Sections */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Basic Information Section */}
          <SectionContainer>
            <SectionHeader>
              <Description fontSize="small" /> Basic Information
            </SectionHeader>
            
            <FieldsRow>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="Variant Name *"
                  value={formData.variantName}
                  onChange={(e) => handleChange('variantName', e.target.value)}
                  size="small"
                  error={touched.variantName && !formData.variantName}
                  helperText={touched.variantName && !formData.variantName ? 'Required' : ''}
                />
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="Brand"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  size="small"
                  placeholder="Others"
                  helperText="Defaults to 'Others' if not specified"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.variantDescription}
                  onChange={(e) => handleChange('variantDescription', e.target.value)}
                  multiline
                  rows={2}
                  size="small"
                  placeholder="Enter variant description..."
                />
              </Box>
            </FieldsRow>
          </SectionContainer>

          {/* Pricing Section - UPDATED field names */}
          <SectionContainer>
            <SectionHeader>
              <AttachMoney fontSize="small" /> Pricing
            </SectionHeader>
            
            <FieldsRow>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="Invoice Price *"
                  type="number"
                  value={formData.invoicePrice}
                  onChange={(e) => handleNumberChange('invoicePrice', e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    inputProps: { min: 0, step: "0.01" }
                  }}
                />
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="Estimate Price *"
                  type="number"
                  value={formData.estimatePrice}
                  onChange={(e) => handleNumberChange('estimatePrice', e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    inputProps: { min: 0, step: "0.01" }
                  }}
                />
              </Box>
            </FieldsRow>
          </SectionContainer>

          {/* Stock & Additional Info Section - UPDATED field names */}
          <SectionContainer>
            <SectionHeader>
              <Inventory fontSize="small" /> Stock & More
            </SectionHeader>
            
            <FieldsRow>
              <Box sx={{ flex: '1 1 calc(33.333% - 11px)', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Stock Quantity *"
                  type="number"
                  value={formData.stockQty}
                  onChange={(e) => handleNumberChange('stockQty', e.target.value)}
                  size="small"
                  InputProps={{
                    inputProps: { min: 0, step: "1" }
                  }}
                />
              </Box>
              
              <Box sx={{ flex: '1 1 calc(33.333% - 11px)', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="GST %"
                  type="number"
                  value={formData.gst}
                  onChange={(e) => handleNumberChange('gst', e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100, step: "0.01" }
                  }}
                />
              </Box>
              
              <Box sx={{ flex: '1 1 calc(33.333% - 11px)', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Item Code"
                  type="number"
                  value={formData.itemCode}
                  onChange={(e) => handleNumberChange('itemCode', e.target.value)}
                  size="small"
                  helperText="Unique identifier (auto-generated if empty)"
                />
              </Box>
            </FieldsRow>
          </SectionContainer>
        </Box>

        {/* Validation Alert */}
        {!isFormValid && (
          <Alert 
            severity="warning" 
            icon={<Error />}
            sx={{ mt: 1, borderRadius: 2 }}
            size="small"
          >
            Please fill in all required fields (*)
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2,
        borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        <Button onClick={onClose} variant="outlined" size="medium">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={loading ? <CircularProgress size={18} /> : <Save />}
          disabled={loading || !isFormValid}
          size="medium"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default VariantFormDialog;