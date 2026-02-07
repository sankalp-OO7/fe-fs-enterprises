// src/pages/AddProductPage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  InputAdornment,
  IconButton,
  Stack,
  Divider,
  Autocomplete,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Category,
  Image as ImageIcon,
  CloudUpload,
  Visibility,
  LocalOffer,
  Save,
  ArrowBack,
  Add as AddIcon,
  Info,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { optimizeImage, validateImage } from '../../utils/imageOptimizer';
import { 
  createProductAPI,
  fetchCategories,
  uploadImageDirectAPI
} from '../../api/product.api';

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

const AddProductPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for product data
  const [productData, setProductData] = useState({
    productName: '',
    description: '',
    categoryId: '',
    categoryName: '',
    imageUrl: '',
  });

  // UI States
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDialog, setImageDialog] = useState({
    open: false,
    currentImage: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data) => createProductAPI(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['products']);
      setSnackbar({
        open: true,
        message: `Product "${productData.productName}" created successfully!`,
        severity: 'success',
      });
      
      // Navigate to the newly created product's edit page
      setTimeout(() => {
        navigate(`/products`);
      }, 1500);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to create product: ${error.message}`,
        severity: 'error',
      });
    },
  });

  // Handle form field changes
  const handleChange = useCallback((field, value) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle category selection
  const handleCategoryChange = useCallback((event, newValue) => {
    setProductData(prev => ({
      ...prev,
      categoryId: newValue ? newValue._id : '',
      categoryName: newValue ? newValue.name : '',
    }));
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageUploading(true);
    try {
      // Validate image
      const validation = validateImage(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Optimize image
      const optimizedFile = await optimizeImage(file);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('image', optimizedFile);
      formData.append('folder', 'products/main');

      // Upload image
      const response = await uploadImageDirectAPI(formData);
      
      if (!response.success) {
        throw new Error(response.message || 'Upload failed');
      }

      // Update product data with new image URL
      setProductData(prev => ({ 
        ...prev, 
        imageUrl: response.data.url 
      }));

      setSnackbar({
        open: true,
        message: 'Product image uploaded successfully!',
        severity: 'success',
      });

    } catch (error) {
      console.error('Image upload error:', error);
      setSnackbar({
        open: true,
        message: `Image upload failed: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setImageUploading(false);
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // Validate form
    if (!productData.productName.trim()) {
      setSnackbar({
        open: true,
        message: 'Product name is required',
        severity: 'error',
      });
      return;
    }

    if (!productData.categoryId) {
      setSnackbar({
        open: true,
        message: 'Please select a category',
        severity: 'error',
      });
      return;
    }

    // Create product
    await createProductMutation.mutateAsync(productData);
  }, [productData, createProductMutation]);

  // Find selected category
  const selectedCategory = categories.find(cat => cat._id === productData.categoryId) || null;

  const isSubmitting = createProductMutation.isPending;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                Back
              </Button>
              <Typography variant="h4" fontWeight="bold">
                Add New Product
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Fill in the details to create a new product
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* Messages */}
      {snackbar.open && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}

      {/* Product Form */}
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Left Column - Product Details */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LocalOffer /> Product Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Name *"
                    value={productData.productName}
                    onChange={(e) => handleChange('productName', e.target.value)}
                    required
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOffer fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Enter a descriptive name for your product"
                    error={!productData.productName.trim() && productData.productName !== ''}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    options={categories}
                    getOptionLabel={(option) => option.name}
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    loading={categoriesLoading}
                    disabled={isSubmitting}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category *"
                        required
                        helperText="Select a category for your product"
                        error={!productData.categoryId && productData.categoryId !== ''}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <Category fontSize="small" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Description"
                    value={productData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    multiline
                    rows={4}
                    disabled={isSubmitting}
                    helperText="Describe your product in detail (optional)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    value={productData.imageUrl}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ImageIcon fontSize="small" />
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
                    helperText="Or paste an image URL directly"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column - Image Upload */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <ImageIcon /> Product Image
                  </Typography>
                  
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar
                      src={productData.imageUrl || '/placeholder-image.jpg'}
                      variant="rounded"
                      sx={{
                        width: 200,
                        height: 200,
                        mx: 'auto',
                        mb: 3,
                        border: '2px solid',
                        borderColor: productData.imageUrl ? 'primary.main' : 'grey.300',
                        borderRadius: 2,
                      }}
                    >
                      {!productData.imageUrl && (
                        <ImageIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                      )}
                    </Avatar>
                    
                    <Stack spacing={2}>
                      <Button
                        component="label"
                        variant="contained"
                        fullWidth
                        startIcon={imageUploading ? <CircularProgress size={20} /> : <CloudUpload />}
                        disabled={imageUploading || isSubmitting}
                      >
                        Upload Image
                        <VisuallyHiddenInput
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
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
                          disabled={isSubmitting}
                        >
                          Preview
                        </Button>
                      )}
                    </Stack>
                  </Box>

                  {/* Image Guidelines */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'info.50' }}>
                    <Typography variant="subtitle2" gutterBottom color="info.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Info fontSize="small" /> Image Guidelines
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        <li>Use high-quality images</li>
                        <li>Formats: JPG, PNG, WebP</li>
                        <li>Max size: 20MB</li>
                        <li>Images auto-optimized</li>
                      </Box>
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={() => navigate(-1)}
              variant="outlined"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="success"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
              disabled={isSubmitting || !productData.productName.trim() || !productData.categoryId}
              size="large"
            >
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Image Preview Dialog */}
      {imageDialog.open && (
        <Box
          sx={{
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
          }}
          onClick={() => setImageDialog({ open: false, currentImage: '' })}
        >
          <Box sx={{ maxWidth: '90%', maxHeight: '90%', position: 'relative' }}>
            <img
              src={imageDialog.currentImage}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: 8,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: -40,
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                opacity: 0.7,
              }}
            >
              Click anywhere to close
            </Typography>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default AddProductPage;