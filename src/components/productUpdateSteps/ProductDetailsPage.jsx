import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Avatar,
  InputAdornment,
  Tooltip,
  Box,
  Autocomplete,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import {
  Category,
  Image,
  CloudUpload,
  Visibility,
  LocalOffer,
  Save,
  ArrowBack,
  Info,
  CheckCircle,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../../api/product.api';

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

const ProductDetailsPage = memo(({ 
  productData, 
  variants, 
  onUpdate, 
  onImageUpload, 
  onSave, 
  isSaving,
  isDirty,
  navigate
}) => {
  const [imageDialog, setImageDialog] = useState({
    open: false,
    currentImage: '',
  });
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch categories using React Query
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Find the selected category object based on categoryId
  const selectedCategory = categories.find(cat => cat._id === productData.categoryId) || null;

  const handleChange = useCallback((field, value) => {
    onUpdate({ [field]: value });
  }, [onUpdate]);

  const handleCategoryChange = useCallback((event, newValue) => {
    // newValue will be the category object or null
    onUpdate({
      categoryId: newValue ? newValue._id : '',
      categoryName: newValue ? newValue.name : '',
    });
  }, [onUpdate]);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file && onImageUpload) {
      setImageUploading(true);
      await onImageUpload(file, 'product');
      setImageUploading(false);
    }
  }, [onImageUpload]);

  const inheritedVariants = variants.filter(v => !v.hasCustomImage).length;

  const handleSaveAndExit = useCallback(async () => {
    await onSave();
    // Navigate after successful save
    setTimeout(() => navigate(-1), 1000);
  }, [onSave, navigate]);

  return (
    <Box>
      {/* Save Status Banner */}
      {isDirty && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: 2 }}
          icon={<Info />}
        >
          You have unsaved changes
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Product Image */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Image /> Product Image
            </Typography>
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                src={productData.imageUrl || '/placeholder-image.jpg'}
                variant="rounded"
                sx={{
                  width: 250,
                  height: 250,
                  mx: 'auto',
                  mb: 3,
                  border: '3px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <Image sx={{ fontSize: 80, color: 'action.disabled' }} />
              </Avatar>
              
              <Stack spacing={2}>
                <Button
                  component="label"
                  variant="contained"
                  fullWidth
                  startIcon={imageUploading ? <CircularProgress size={20} /> : <CloudUpload />}
                  disabled={imageUploading}
                  size="large"
                >
                  Upload New Image
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </Button>
                
                {productData.imageUrl && (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Visibility />}
                    onClick={() => setImageDialog({
                      open: true,
                      currentImage: productData.imageUrl,
                    })}
                  >
                    Preview Image
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Image Info Card */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'info.50' }}>
              <Typography variant="subtitle2" gutterBottom color="info.main">
                <Info fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Image Inheritance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{inheritedVariants} variants</strong> are currently using this product image.
                When you update this image, all variants without custom images will be updated automatically.
              </Typography>
            </Paper>
          </Paper>
        </Grid>

        {/* Right Column - Product Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
              <Category /> Product Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Name *"
                  value={productData.productName}
                  onChange={(e) => handleChange('productName', e.target.value)}
                  required
                  error={!productData.productName.trim()}
                  helperText={!productData.productName.trim() ? 'Product name is required' : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOffer fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  size="medium"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={productData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  multiline
                  rows={4}
                  helperText="Describe your product in detail. This will appear on your store."
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.name}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  loading={categoriesLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category *"
                      required
                      error={!productData.categoryId}
                      helperText={!productData.categoryId ? 'Category is required' : ''}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  disableClearable={false}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category Name"
                  value={productData.categoryName || ''}
                  onChange={(e) => handleChange('categoryName', e.target.value)}
                  helperText="Display name for the category"
                  disabled
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  value={productData.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Image fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: productData.imageUrl && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setImageDialog({
                            open: true,
                            currentImage: productData.imageUrl,
                          })}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText="Direct image URL or upload using button"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                onClick={() => navigate(-1)}
                variant="outlined"
                startIcon={<ArrowBack />}
                disabled={isSaving}
              >
                Cancel
              </Button>
              
              <Button
                onClick={onSave}
                variant="contained"
                startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                disabled={isSaving || !productData.productName.trim() || !productData.categoryId}
                color="primary"
                size="large"
              >
                {isSaving ? 'Saving...' : 'Save Product'}
              </Button>
              
              <Button
                onClick={handleSaveAndExit}
                variant="contained"
                startIcon={<CheckCircle />}
                disabled={isSaving || !productData.productName.trim() || !productData.categoryId}
                color="success"
                size="large"
              >
                Save & Exit
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Image Preview Dialog */}
      {imageDialog.open && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
        }} onClick={() => setImageDialog({ open: false, currentImage: '' })}>
          <Box sx={{ maxWidth: '90%', maxHeight: '90%', position: 'relative' }}>
            <img
              src={imageDialog.currentImage}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                bottom: -40, 
                left: '50%', 
                transform: 'translateX(-50%)',
                color: 'white',
                opacity: 0.7 
              }}
            >
              Click anywhere to close
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
});

export default ProductDetailsPage;