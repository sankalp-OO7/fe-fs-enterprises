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
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Avatar,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Close,
  CloudUpload,
  Image as ImageIcon,
  Save,
  Refresh,
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
  const [activeTab, setActiveTab] = useState(0);
  const [imageUploading, setImageUploading] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (variant) {
      setFormData({
        variantName: variant.variantName || '',
        brand: variant.brand || '',
        variantPrice: variant.variantPrice || 0,
        actualPrice: variant.actualPrice || variant.variantPrice || 0,
        stockQty: variant.stockQty || 0,
        imageUrl: variant.imageUrl || '',
        hasCustomImage: variant.hasCustomImage || false,
        
        // Excel fields
        itemCode: variant.itemCode || '',
        spNo: variant.spNo || '',
        uom: variant.uom || '',
        defUom: variant.defUom || '',
        itemOnFlag: variant.itemOnFlag !== undefined ? variant.itemOnFlag : true,
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
      });
    }
  }, [variant]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-update actualPrice when variantPrice changes
    if (field === 'variantPrice') {
      setFormData(prev => ({ ...prev, actualPrice: value }));
    }
  }, []);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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

  const handleResetImage = useCallback(() => {
    handleChange('imageUrl', productImage);
    handleChange('hasCustomImage', false);
  }, [handleChange, productImage]);

  const handleSave = useCallback(() => {
    onSave(formData);
  }, [formData, onSave]);

  if (!variant) return null;

  const tabs = [
    { label: 'Basic Info', value: 0 },
    { label: 'Pricing', value: 1 },
    { label: 'Inventory', value: 2 },
    { label: 'Advanced', value: 3 },
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Edit Variant: {variant.variantName}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Image Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar
            src={formData.imageUrl || productImage || '/placeholder-image.jpg'}
            variant="rounded"
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 2,
              border: '2px solid',
              borderColor: formData.hasCustomImage ? 'primary.main' : 'grey.300',
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={imageUploading ? <CircularProgress size={20} /> : <CloudUpload />}
              disabled={imageUploading}
              size="small"
            >
              Upload Custom Image
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </Button>
            
            {formData.hasCustomImage && (
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleResetImage}
                size="small"
                color="secondary"
              >
                Reset to Product Image
              </Button>
            )}
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            {formData.hasCustomImage ? 'Using custom image' : 'Inheriting product image'}
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map(tab => (
              <Tab key={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </Paper>

        {/* Basic Info Tab */}
        {activeTab === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Variant Name *"
                value={formData.variantName}
                onChange={(e) => handleChange('variantName', e.target.value)}
                required
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand *"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                required
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="UOM (Unit of Measure)"
                value={formData.uom}
                onChange={(e) => handleChange('uom', e.target.value)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Default UOM"
                value={formData.defUom}
                onChange={(e) => handleChange('defUom', e.target.value)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.itemOnFlag}
                    onChange={(e) => handleChange('itemOnFlag', e.target.checked)}
                  />
                }
                label="Active Item"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Item Status"
                value={formData.stockItem}
                onChange={(e) => handleChange('stockItem', e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        )}

        {/* Pricing Tab */}
        {activeTab === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Variant Price *"
                type="number"
                value={formData.variantPrice}
                onChange={(e) => handleChange('variantPrice', parseFloat(e.target.value) || 0)}
                required
                size="small"
                InputProps={{ startAdornment: '₹' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Actual Price"
                type="number"
                value={formData.actualPrice}
                onChange={(e) => handleChange('actualPrice', parseFloat(e.target.value) || 0)}
                size="small"
                InputProps={{ startAdornment: '₹' }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="MRP"
                type="number"
                value={formData.mrp}
                onChange={(e) => handleChange('mrp', parseFloat(e.target.value) || 0)}
                size="small"
                InputProps={{ startAdornment: '₹' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Purchase Rate"
                type="number"
                value={formData.purRate}
                onChange={(e) => handleChange('purRate', parseFloat(e.target.value) || 0)}
                size="small"
                InputProps={{ startAdornment: '₹' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Invoice Rate"
                type="number"
                value={formData.invoiceRate}
                onChange={(e) => handleChange('invoiceRate', parseFloat(e.target.value) || 0)}
                size="small"
                InputProps={{ startAdornment: '₹' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cash Memo Rate"
                type="number"
                value={formData.cashMemoRate}
                onChange={(e) => handleChange('cashMemoRate', parseFloat(e.target.value) || 0)}
                size="small"
                InputProps={{ startAdornment: '₹' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimate Rate"
                type="number"
                value={formData.estimateRate}
                onChange={(e) => handleChange('estimateRate', parseFloat(e.target.value) || 0)}
                size="small"
                InputProps={{ startAdornment: '₹' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cash Sales Rate"
                type="number"
                value={formData.cashSalesRate}
                onChange={(e) => handleChange('cashSalesRate', parseFloat(e.target.value) || 0)}
                size="small"
                InputProps={{ startAdornment: '₹' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="AG Rate"
                type="number"
                value={formData.agRate}
                onChange={(e) => handleChange('agRate', parseFloat(e.target.value) || 0)}
                size="small"
                InputProps={{ startAdornment: '₹' }}
              />
            </Grid>
          </Grid>
        )}

        {/* Inventory Tab */}
        {activeTab === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Quantity *"
                type="number"
                value={formData.stockQty}
                onChange={(e) => handleChange('stockQty', parseInt(e.target.value) || 0)}
                required
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Opening Stock"
                type="number"
                value={formData.opStock}
                onChange={(e) => handleChange('opStock', parseInt(e.target.value) || 0)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rack Number"
                value={formData.rackNo}
                onChange={(e) => handleChange('rackNo', e.target.value)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Code"
                type="number"
                value={formData.itemCode}
                onChange={(e) => handleChange('itemCode', parseInt(e.target.value) || '')}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SP Number"
                type="number"
                value={formData.spNo}
                onChange={(e) => handleChange('spNo', parseInt(e.target.value) || '')}
                size="small"
              />
            </Grid>
          </Grid>
        )}

        {/* Advanced Tab */}
        {activeTab === 3 && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="HSN Code"
                type="number"
                value={formData.hsnCode}
                onChange={(e) => handleChange('hsnCode', parseInt(e.target.value) || '')}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GST %"
                type="number"
                value={formData.gst}
                onChange={(e) => handleChange('gst', parseFloat(e.target.value) || 0)}
                size="small"
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Discount"
                value={formData.itemDisc}
                onChange={(e) => handleChange('itemDisc', e.target.value)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Invoice Discount %"
                type="number"
                value={formData.invDisc}
                onChange={(e) => handleChange('invDisc', parseFloat(e.target.value) || 0)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cash Memo Discount %"
                type="number"
                value={formData.cashMemoDisc}
                onChange={(e) => handleChange('cashMemoDisc', parseFloat(e.target.value) || 0)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimate Discount %"
                type="number"
                value={formData.estimateDisc}
                onChange={(e) => handleChange('estimateDisc', parseFloat(e.target.value) || 0)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="AG Discount %"
                type="number"
                value={formData.agDisc}
                onChange={(e) => handleChange('agDisc', parseFloat(e.target.value) || 0)}
                size="small"
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          disabled={loading || !formData.variantName || !formData.brand}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default VariantFormDialog;