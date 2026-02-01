// import ImageUpload from '../../optimized/ImageUpload';
// src/pages/components/ProductDetailsStep.jsx
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
  Divider,
  CircularProgress,
  Avatar,
  InputAdornment,
  Tooltip,
  Box,
  Autocomplete,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Category,
  Image,
  CloudUpload,
  Visibility,
  LocalOffer,
  Save,
  Upload,
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

const ProductDetailsStep = memo(({ 
  productData, 
  variants, 
  onUpdate, 
  onImageUpload, 
  imageUploading, 
  onNext, 
  onSave, 
  isSaving 
}) => {
  const [imageDialog, setImageDialog] = useState({
    open: false,
    currentImage: '',
  });

  // Fetch categories using React Query
  const { data: categories = [], isLoading } = useQuery({
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

  const handleSelectChange = useCallback((e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(cat => cat._id === categoryId);
    onUpdate({
      categoryId: categoryId,
      categoryName: selectedCategory ? selectedCategory.name : '',
    });
  }, [categories, onUpdate]);

  const handleFileUpload = useCallback((event, target) => {
    const file = event.target.files[0];
    if (file && onImageUpload) {
      onImageUpload(file, target);
    }
  }, [onImageUpload]);

  const inheritedVariants = variants.filter(v => !v.hasCustomImage).length;

  return (
    <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Category /> Product Information
      </Typography>
      
      <Grid container spacing={3}>
        {/* Product Image Section */}
        <Grid item xs={12} sm={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Image /> Product Image
              </Typography>
              
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar
                  src={productData.imageUrl || '/placeholder-image.jpg'}
                  variant="rounded"
                  sx={{
                    width: 200,
                    height: 200,
                    mx: 'auto',
                    mb: 2,
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    boxShadow: 3,
                  }}
                >
                  <Image sx={{ fontSize: 60, color: 'action.disabled' }} />
                </Avatar>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={imageUploading ? <CircularProgress size={20} /> : <CloudUpload />}
                    disabled={imageUploading}
                  >
                    Upload New Image
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'product')}
                    />
                  </Button>
                  
                  {productData.imageUrl && (
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => setImageDialog({
                        open: true,
                        currentImage: productData.imageUrl,
                      })}
                    >
                      Preview
                    </Button>
                  )}
                </Box>
              </Box>
              
              <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Image Inheritance:</strong> Variants without custom images will use this image.
                  {inheritedVariants} variants currently inherit this image.
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Form */}
        <Grid item xs={12} sm={12} md={8}>
          <Grid container spacing={2}>
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
                helperText="Describe your product in detail"
              />
            </Grid>
            
            {/* Category Dropdown - Option 1: Autocomplete (Recommended) */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.name}
                value={selectedCategory}
                onChange={handleCategoryChange}
                loading={isLoading}
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
            
            {/* Category Dropdown - Option 2: Traditional Select */}
            {/* <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!productData.categoryId}>
                <InputLabel id="category-select-label">Category *</InputLabel>
                <Select
                  labelId="category-select-label"
                  value={productData.categoryId || ''}
                  label="Category *"
                  onChange={handleSelectChange}
                  disabled={isLoading}
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {!productData.categoryId && (
                  <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 2 }}>
                    Category is required
                  </Typography>
                )}
              </FormControl>
            </Grid> */}
            
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
                helperText="Direct image URL or upload using button above"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {productData.originalData?.createdAt && 
                  `Created: ${new Date(productData.originalData.createdAt).toLocaleDateString()} • `
                }
                {productData.originalData?.updatedAt && 
                  `Updated: ${new Date(productData.originalData.updatedAt).toLocaleDateString()}`
                }
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={onNext}
                variant="contained"
                disabled={variants.length === 0}
              >
                Next: Variants ({variants.length})
              </Button>
              
              <Button
                onClick={onSave}
                variant="contained"
                startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                disabled={isSaving || !productData.productName.trim() || !productData.categoryId}
                color="primary"
              >
                Save Product
              </Button>
            </Box>
          </Box>
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
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
        }} onClick={() => setImageDialog({ open: false, currentImage: '' })}>
          <Box sx={{ maxWidth: '90%', maxHeight: '90%' }}>
            <img
              src={imageDialog.currentImage}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }}
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
});

export default ProductDetailsStep;