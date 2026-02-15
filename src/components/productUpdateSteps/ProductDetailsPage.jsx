import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Avatar,
  InputAdornment,
  Tooltip,
  Box,
  Stack,
  Alert,
  Divider,
  alpha,
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
  PhotoCamera,
  Description,
  Clear,
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

const ImageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  height: '100%',
  minHeight: 400,
}));

const ProductDetailsPage = memo(({ 
  productData, 
  variants, 
  onUpdate, 
  onImageUpload, 
  onSave, 
  isSaving,
  isDirty,
  navigate,
  imageUploading 
}) => {
  const [imageDialog, setImageDialog] = useState({
    open: false,
    currentImage: '',
  });
  const [previewImage, setPreviewImage] = useState(productData?.imageUrl || '');
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setPreviewImage(productData?.imageUrl || '');
  }, [productData?.imageUrl]);

  const handleChange = useCallback((field, value) => {
    onUpdate({ [field]: value });
    setTouched(prev => ({ ...prev, [field]: true }));
  }, [onUpdate]);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file && onImageUpload) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
      await onImageUpload(file, 'product');
    }
  }, [onImageUpload]);

  const handleSaveAndExit = useCallback(async () => {
    await onSave();
    setTimeout(() => navigate(-1), 1000);
  }, [onSave, navigate]);

  const inheritedVariants = variants.filter(v => !v.hasCustomImage).length;
  const isFormValid = productData?.productName?.trim() && productData?.categoryId;

  return (
    <Box>
      {isDirty && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          You have unsaved changes
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Image */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
            <ImageContainer>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar
                  src={previewImage || '/placeholder-image.jpg'}
                  variant="rounded"
                  sx={{
                    width: 280,
                    height: 280,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    boxShadow: 3,
                  }}
                />
                {imageUploading && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    borderRadius: 1,
                  }}>
                    <CircularProgress sx={{ color: 'white' }} />
                  </Box>
                )}
              </Box>

              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUpload />}
                  disabled={imageUploading}
                  size="small"
                >
                  Upload
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </Button>
                
                {previewImage && (
                  <>
                    <IconButton 
                      onClick={() => setImageDialog({ open: true, currentImage: previewImage })}
                      size="small"
                      sx={{ bgcolor: 'action.hover' }}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton 
                      onClick={() => {
                        setPreviewImage('');
                        onUpdate({ imageUrl: '' });
                      }}
                      size="small"
                      sx={{ bgcolor: 'action.hover' }}
                    >
                      <Clear />
                    </IconButton>
                  </>
                )}
              </Stack>

              <Paper variant="outlined" sx={{ p: 2, width: '100%', bgcolor: 'grey.50' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  <Info fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  {inheritedVariants} variant{inheritedVariants !== 1 ? 's' : ''} using this image
                </Typography>
              </Paper>
            </ImageContainer>
          </Paper>
        </Grid>

        {/* Right Column - Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Product Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Name *"
                  value={productData?.productName || ''}
                  onChange={(e) => handleChange('productName', e.target.value)}
                  error={touched.productName && !productData?.productName?.trim()}
                  helperText={touched.productName && !productData?.productName?.trim() ? 'Required' : ''}
                  size="medium"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={productData?.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Enter product description..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Category *"
                  value={productData?.categoryId || ''}
                  onChange={(e) => handleChange('categoryId', e.target.value)}
                  error={touched.categoryId && !productData?.categoryId}
                  helperText={touched.categoryId && !productData?.categoryId ? 'Required' : ''}
                  placeholder="Enter category name"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  value={productData?.imageUrl || ''}
                  onChange={(e) => {
                    handleChange('imageUrl', e.target.value);
                    setPreviewImage(e.target.value);
                  }}
                  InputProps={{
                    endAdornment: previewImage && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setImageDialog({ open: true, currentImage: previewImage })}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

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
                disabled={isSaving || !isFormValid}
              >
                {isSaving ? 'Saving...' : 'Save Product'}
              </Button>
              
              <Button
                onClick={handleSaveAndExit}
                variant="contained"
                startIcon={<CheckCircle />}
                disabled={isSaving || !isFormValid}
                color="success"
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
          bgcolor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
        }} onClick={() => setImageDialog({ open: false, currentImage: '' })}>
          <img
            src={imageDialog.currentImage}
            alt="Preview"
            style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain' }}
          />
        </Box>
      )}
    </Box>
  );
});

export default ProductDetailsPage;