
import React, { Suspense, lazy, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  Error as ErrorIcon,
  Warning,
  CheckCircle,
} from '@mui/icons-material';

import { 
  fetchProductWithVariants,
  updateProductAPI,
  updateVariantAPI,
  bulkUpdateProductWithVariantsAPI,
  uploadImageAPI
} from '../../../api/product.api';

// Lazy load heavy components
const ProductDetailsStep = lazy(() => import('../../../components/productUpdateSteps/ProductDetailsStep'));
const VariantsManagementStep = lazy(() => import('../../../components/productUpdateSteps/VariantsManagementStep'));
const ReviewSaveStep = lazy(() => import('../../../components/productUpdateSteps/ReviewSaveStep'));
const StepNavigation = lazy(() => import('../../../components/productUpdateSteps/StepNavigation'));


// Loading fallback component
const LoadingFallback = () => (
  <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: 3 }}>
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
        {error?.message || 'An error occurred while fetching product data'}
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

const steps = ['Product Details', 'Variants Management', 'Review & Save'];

const ProductUpdatePage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State management
  const [activeStep, setActiveStep] = React.useState(0);
  const [productData, setProductData] = React.useState(null);
  const [variants, setVariants] = React.useState([]);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [isDirty, setIsDirty] = React.useState(false);
  const [imageUploading, setImageUploading] = React.useState(false);

  // React Query: Fetch product and variants
  const { 
    data: productResponse, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['product-update', productId],
    queryFn: () => fetchProductWithVariants(productId),
    enabled: !!productId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // React Query Mutations
  const updateProductMutation = useMutation({
    mutationFn: (data) => updateProductAPI(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['product-update', productId]);
      setSnackbar({
        open: true,
        message: 'Product updated successfully!',
        severity: 'success',
      });
      setIsDirty(false);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to update product: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: ({ variantId, data }) => updateVariantAPI(variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['product-update', productId]);
      setSnackbar({
        open: true,
        message: 'Variant updated successfully!',
        severity: 'success',
      });
      setIsDirty(false);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to update variant: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data) => bulkUpdateProductWithVariantsAPI(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['product-update', productId]);
      setSnackbar({
        open: true,
        message: 'Product and variants updated successfully!',
        severity: 'success',
      });
      setIsDirty(false);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Bulk update failed: ${error.message}`,
        severity: 'error',
      });
    },
  });

 // In your ProductUpdatePage.jsx, update the handleImageUpload function:

const handleImageUpload = async (file, target = 'product') => {
  if (!file) return;
  
  setImageUploading(true);
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // Call your image upload API
    const response = await uploadImageAPI(formData);
    const imageUrl = response.url;

    if (target === 'product') {
      // Update product image
      const updatedProductData = { ...productData, imageUrl };
      setProductData(updatedProductData);
      
      // Update variants that inherit from product
      const updatedVariants = variants.map(variant => ({
        ...variant,
        imageUrl: !variant.hasCustomImage ? imageUrl : variant.imageUrl,
      }));
      setVariants(updatedVariants);
      
      setSnackbar({
        open: true,
        message: 'Product image updated! Variants using product image will be updated.',
        severity: 'success',
      });
    } else {
      // Update specific variant
      const updatedVariants = variants.map(variant => 
        variant.id === target 
          ? { 
              ...variant, 
              imageUrl, 
              hasCustomImage: true 
            }
          : variant
      );
      setVariants(updatedVariants);
      
      setSnackbar({
        open: true,
        message: 'Variant image updated successfully!',
        severity: 'success',
      });
    }
    setIsDirty(true);
  } catch (error) {
    setSnackbar({
      open: true,
      message: `Image upload failed: ${error.message}`,
      severity: 'error',
    });
  } finally {
    setImageUploading(false);
  }
};

  // Initialize form data when data is loaded
  useEffect(() => {
    if (productResponse && !productData) {
      const { productDetails, variants: fetchedVariants } = productResponse;
      console.log('Fetched Product Details:', productDetails);
      setProductData({
        productName: productDetails.productName || '',
        description: productDetails.description || '',
        categoryId: productDetails.categoryId?._id || productDetails.categoryId || '',
        imageUrl: productDetails.imageUrl || '',
        originalData: productDetails,
      });

      if (fetchedVariants && Array.isArray(fetchedVariants)) {
        const processedVariants = fetchedVariants.map(variant => ({
          ...variant,
          id: variant._id,
          hasCustomImage: !!variant.imageUrl && variant.imageUrl !== productDetails.imageUrl,
          variantPrice: variant.variantPrice || 0,
          actualPrice: variant.actualPrice || 0,
          stockQty: variant.stockQty || 0,
          itemCode: variant.itemCode || '',
          spNo: variant.spNo || '',
          uom: variant.uom || '',
          defUom: variant.defUom || '',
          itemOnFlag: variant.itemOnFlag || false,
          rackNo: variant.rackNo || '',
          opStock: variant.opStock || 0,
          hsnCode: variant.hsnCode || '',
          gst: variant.gst || 0,
          stockItem: variant.stockItem || '',
          itemDisc: variant.itemDisc || '',
          mrp: variant.mrp || 0,
          purRate: variant.purRate || 0,
          invoiceRate: variant.invoiceRate || 0,
          cashMemoRate: variant.cashMemoRate || 0,
          estimateRate: variant.estimateRate || 0,
          cashSalesRate: variant.cashSalesRate || 0,
          agRate: variant.agRate || 0,
          invDisc: variant.invDisc || 0,
          cashMemoDisc: variant.cashMemoDisc || 0,
          estimateDisc: variant.estimateDisc || 0,
          agDisc: variant.agDisc || 0,
        }));
        setVariants(processedVariants);
      }
    }
  }, [productResponse, productData]);

  // Handle product data update
  const handleProductUpdate = (updates) => {
    setProductData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  // Handle variants update
  const handleVariantsUpdate = (newVariants) => {
    setVariants(newVariants);
    setIsDirty(true);
  };

  // Save product individually
  const handleSaveProduct = async () => {
    if (!productData) return;
    
    const { originalData, ...updateData } = productData;
    await updateProductMutation.mutateAsync(updateData);
  };

// In your ProductUpdatePage.jsx, update the handleSaveVariant function:

const handleSaveVariant = async (variantData) => {
  if (variantData.isNew) {
    // Handle new variant creation
    const newVariant = {
      ...variantData,
      productId: productId,
      // Remove temporary fields
      id: undefined,
      isNew: undefined,
      hasCustomImage: undefined,
    };
    
    // Call create variant API (you need to create this)
    try {
      const response = await createVariantAPI(newVariant);
      setSnackbar({
        open: true,
        message: 'Variant created successfully!',
        severity: 'success',
      });
      refetch(); // Refresh data
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to create variant: ${error.message}`,
        severity: 'error',
      });
    }
  } else {
    // Update existing variant
    const { id, isNew, hasCustomImage, ...updateData } = variantData;
    
    // Ensure all required fields are included
    const completeUpdateData = {
      variantName: updateData.variantName,
      brand: updateData.brand,
      variantPrice: updateData.variantPrice,
      actualPrice: updateData.actualPrice,
      stockQty: updateData.stockQty,
      imageUrl: updateData.imageUrl,
      
      // Excel fields
      itemCode: updateData.itemCode,
      spNo: updateData.spNo,
      uom: updateData.uom,
      defUom: updateData.defUom,
      itemOnFlag: updateData.itemOnFlag,
      rackNo: updateData.rackNo,
      opStock: updateData.opStock,
      hsnCode: updateData.hsnCode,
      gst: updateData.gst,
      stockItem: updateData.stockItem,
      itemDisc: updateData.itemDisc,
      mrp: updateData.mrp,
      purRate: updateData.purRate,
      invoiceRate: updateData.invoiceRate,
      cashMemoRate: updateData.cashMemoRate,
      estimateRate: updateData.estimateRate,
      cashSalesRate: updateData.cashSalesRate,
      agRate: updateData.agRate,
      invDisc: updateData.invDisc,
      cashMemoDisc: updateData.cashMemoDisc,
      estimateDisc: updateData.estimateDisc,
      agDisc: updateData.agDisc,
    };
    
    await updateVariantMutation.mutateAsync({
      variantId: id,
      data: completeUpdateData
    });
  }
};
  // Save all (bulk update)
  const handleSaveAll = async () => {
    if (!productData || !variants.length) return;

    const { originalData, ...productUpdateData } = productData;
    
    const variantsUpdateData = variants.map(variant => {
      const { id, isNew, hasCustomImage, ...variantData } = variant;
      return {
        _id: isNew ? undefined : id,
        ...variantData
      };
    });

    const bulkUpdateData = {
      product: productUpdateData,
      variants: variantsUpdateData,
    };

    await bulkUpdateMutation.mutateAsync(bulkUpdateData);
  };

  // Handle step change with confirmation if dirty
  const handleStepChange = (newStep) => {
    if (isDirty && newStep !== activeStep) {
      const confirmed = window.confirm(
        'You have unsaved changes. Do you want to continue without saving?'
      );
      if (!confirmed) return;
    }
    setActiveStep(newStep);
  };

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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
          <Typography variant="h6">
            Product Not Found
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
  }

  if (!productData) {
    return <LoadingFallback />;
  }

  const product = productResponse.productDetails;
  const categoryName = product.categoryId?.name || 'Uncategorized';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => {
            if (isDirty) {
              const confirmed = window.confirm(
                'You have unsaved changes. Do you want to leave without saving?'
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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Update Product: {product.productName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Category: {categoryName} • {variants.length} variants
              {isDirty && ' • Unsaved changes'}
            </Typography>
          </Box>
          
          {isDirty && (
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => {
                const confirmed = window.confirm(
                  'Are you sure you want to discard all changes?'
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
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Navigation */}
      <Suspense fallback={<CircularProgress />}>
        <StepNavigation 
          activeStep={activeStep}
          steps={steps}
          variantsCount={variants.length}
          onStepChange={handleStepChange}
        />
      </Suspense>

      {/* Current Step Content */}
      <Suspense fallback={<LoadingFallback />}>
        {activeStep === 0 && (
          <ProductDetailsStep
            productData={productData}
            variants={variants}
            onUpdate={handleProductUpdate}
            onImageUpload={handleImageUpload}
            imageUploading={imageUploading}
            onNext={() => handleStepChange(1)}
            onSave={handleSaveProduct}
            isSaving={updateProductMutation.isPending}
          />
        )}
        
        {activeStep === 1 && (
          <VariantsManagementStep
            productData={productData}
            variants={variants}
            onUpdate={handleVariantsUpdate}
            onImageUpload={handleImageUpload}
            onSaveVariant={handleSaveVariant}
            isSavingVariant={updateVariantMutation.isPending}
            onPrev={() => handleStepChange(0)}
            onNext={() => handleStepChange(2)}
          />
        )}
        
        {activeStep === 2 && (
          <ReviewSaveStep
            productData={productData}
            variants={variants}
            productId={productId}
            onPrev={() => handleStepChange(1)}
            onSave={handleSaveAll}
            isSaving={bulkUpdateMutation.isPending}
            navigate={navigate}
          />
        )}
      </Suspense>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
          icon={snackbar.severity === 'success' ? <CheckCircle /> : undefined}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Footer Status */}
      <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Product ID: {productId} • Step {activeStep + 1} of {steps.length}
          </Typography>
          <Typography variant="caption" color={isDirty ? 'warning.main' : 'text.secondary'}>
            {isDirty ? '⚠️ Unsaved changes' : '✅ All changes saved'}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ProductUpdatePage;