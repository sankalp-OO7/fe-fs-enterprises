// src/pages/components/ReviewSaveStep.jsx
import React, { memo, useMemo } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import { CheckCircle, Save, ArrowBack, Inventory2, PriceCheck, Image as ImageIcon } from '@mui/icons-material';

const ReviewSaveStep = memo(({ productData, variants, productId, onPrev, onSave, isSaving, navigate }) => {
  
  // Memoized calculations
  const summary = useMemo(() => {
    const totalStock = variants.reduce((sum, v) => sum + (v.stockQty || 0), 0);
    const totalValue = variants.reduce((sum, v) => sum + ((v.stockQty || 0) * (v.variantPrice || 0)), 0);
    const customImages = variants.filter(v => v.hasCustomImage).length;
    const activeVariants = variants.filter(v => v.itemOnFlag).length;
    
    return { totalStock, totalValue, customImages, activeVariants };
  }, [variants]);

  const handleSaveAndExit = async () => {
    await onSave();
    // Navigate after successful save
    setTimeout(() => navigate(-1), 1000);
  };

  return (
    <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircle /> Review Changes
      </Typography>
      
      <Grid container spacing={3}>
        {/* Product Summary */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Product Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={productData.imageUrl}
                      variant="rounded"
                      sx={{ width: 80, height: 80 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {productData.productName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Category ID: {productData.categoryId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {productId}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {productData.description || 'No description provided'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Stats */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Inventory Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {variants.length}
                    </Typography>
                    <Typography variant="body2">Total Variants</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {summary.totalStock}
                    </Typography>
                    <Typography variant="body2">Total Stock</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {summary.customImages}
                    </Typography>
                    <Typography variant="body2">Custom Images</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      ₹{summary.totalValue.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">Total Value</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sample Variants Preview */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Variants Preview (First 5)
              </Typography>
              
              <List>
                {variants.slice(0, 5).map((variant, index) => (
                  <React.Fragment key={variant.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          src={variant.imageUrl || productData.imageUrl}
                          variant="rounded"
                          sx={{ width: 50, height: 50 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={variant.variantName}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography variant="body2" component="span">
                              Brand: {variant.brand}
                            </Typography>
                            <Typography variant="body2" component="span" color="success.main">
                              ₹{variant.variantPrice?.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" component="span">
                              Stock: {variant.stockQty}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < Math.min(4, variants.length - 1) && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
              
              {variants.length > 5 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  ... and {variants.length - 5} more variants
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.50', border: 1, borderColor: 'primary.100' }}>
            <Typography variant="h6" gutterBottom color="primary.main">
              Ready to Save Changes?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review all changes before saving. This will update both product and all variants.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  onClick={onPrev} 
                  variant="outlined"
                  startIcon={<ArrowBack />}
                >
                  Back to Variants
                </Button>
                
                <Button
                  onClick={() => navigate(-1)}
                  variant="text"
                  color="inherit"
                >
                  Cancel
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={onSave}
                  variant="contained"
                  size="large"
                  startIcon={isSaving ? <CircularProgress size={24} /> : <Save />}
                  disabled={isSaving}
                >
                  Save All Changes
                </Button>
                
                <Button
                  variant="contained"
                  size="large"
                  color="success"
                  onClick={handleSaveAndExit}
                  disabled={isSaving}
                >
                  Save & Exit
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
});

export default ReviewSaveStep;