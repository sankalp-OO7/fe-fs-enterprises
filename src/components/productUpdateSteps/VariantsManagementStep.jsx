// src/pages/components/VariantsManagementStep.jsx
import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
  Button,
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Collapse,
} from '@mui/material';
import {
  Inventory2,
  AddPhotoAlternate,
  Delete,
  Edit,
  Upload,
  ContentCopy,
  Refresh,
  LocalOffer,
  Search,
  Clear,
  Save,
  CheckCircle,
  ArrowBack,
  ExpandMore,
  ExpandLess,
  Image as ImageIcon,
  Visibility,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import VariantFormDialog from './VariantFormDialog';

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

const VariantsManagementStep = memo(({ 
  productData, 
  variants, 
  onUpdate, 
  onImageUpload, 
  onSaveVariant,
  isSavingVariant,
  onPrev, 
  onNext 
}) => {
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newVariant, setNewVariant] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [expandedVariants, setExpandedVariants] = useState([]);
  const [imageDialog, setImageDialog] = useState({
    open: false,
    currentImage: '',
  });
  const [bulkEditDialog, setBulkEditDialog] = useState(false);
  const [bulkEditField, setBulkEditField] = useState('');
  const [bulkEditValue, setBulkEditValue] = useState('');
  const [variantFormOpen, setVariantFormOpen] = useState(false);
  const [selectedVariantForForm, setSelectedVariantForForm] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Filtered variants
  const filteredVariants = useMemo(() => {
    if (!searchTerm.trim()) return variants;
    const term = searchTerm.toLowerCase();
    return variants.filter(v => 
      v.variantName?.toLowerCase().includes(term) ||
      v.brand?.toLowerCase().includes(term) ||
      v.itemCode?.toString().includes(term) ||
      v.rackNo?.toLowerCase().includes(term) ||
      v.spNo?.toString().includes(term)
    );
  }, [variants, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalStock = variants.reduce((sum, v) => sum + (v.stockQty || 0), 0);
    const totalValue = variants.reduce((sum, v) => sum + ((v.stockQty || 0) * (v.variantPrice || 0)), 0);
    const customImages = variants.filter(v => v.hasCustomImage).length;
    const activeVariants = variants.filter(v => v.itemOnFlag).length;
    
    return { totalStock, totalValue, customImages, activeVariants };
  }, [variants]);

  // Handlers
  const handleSelectVariant = useCallback((variantId) => {
    setSelectedVariants(prev => 
      prev.includes(variantId)
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedVariants.length === variants.length) {
      setSelectedVariants([]);
    } else {
      setSelectedVariants(variants.map(v => v.id));
    }
  }, [variants, selectedVariants.length]);

  const handleAddVariant = useCallback(() => {
    const variantId = `new-${Date.now()}`;
    const newVariantData = {
      id: variantId,
      _id: variantId,
      variantName: 'New Variant',
      brand: '',
      variantPrice: 0,
      actualPrice: 0,
      stockQty: 0,
      imageUrl: productData.imageUrl,
      hasCustomImage: false,
      isNew: true,
      itemCode: '',
      spNo: '',
      uom: 'Piece',
      defUom: 'Piece',
      itemOnFlag: true,
      rackNo: '',
      opStock: 0,
      hsnCode: '',
      gst: 0,
      stockItem: 'Yes',
      itemDisc: '',
      mrp: 0,
      purRate: 0,
      invoiceRate: 0,
      cashMemoRate: 0,
      estimateRate: 0,
      cashSalesRate: 0,
      agRate: 0,
      invDisc: 0,
      cashMemoDisc: 0,
      estimateDisc: 0,
      agDisc: 0,
    };
    setSelectedVariantForForm(newVariantData);
    setVariantFormOpen(true);
  }, [productData.imageUrl]);

  const handleRemoveVariant = useCallback((variantId) => {
    const updatedVariants = variants.filter(v => v.id !== variantId);
    onUpdate(updatedVariants);
    setSelectedVariants(prev => prev.filter(id => id !== variantId));
  }, [variants, onUpdate]);

  const handleVariantChange = useCallback((variantId, field, value) => {
    const updatedVariants = variants.map(variant => 
      variant.id === variantId 
        ? { ...variant, [field]: value }
        : variant
    );
    onUpdate(updatedVariants);
  }, [variants, onUpdate]);

  const handleResetVariantImage = useCallback((variantId) => {
    const updatedVariants = variants.map(variant => 
      variant.id === variantId 
        ? { 
            ...variant, 
            imageUrl: productData.imageUrl, 
            hasCustomImage: false 
          }
        : variant
    );
    onUpdate(updatedVariants);
  }, [variants, productData.imageUrl, onUpdate]);

  const handleDuplicateVariant = useCallback((variant) => {
    const newVariant = {
      ...variant,
      id: `copy-${Date.now()}`,
      _id: `copy-${Date.now()}`,
      variantName: `${variant.variantName} (Copy)`,
      isNew: true,
    };
    const updatedVariants = [...variants, newVariant];
    onUpdate(updatedVariants);
  }, [variants, onUpdate]);

  const handleFileUpload = useCallback(async (event, variantId) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageUploading(true);
    try {
      if (onImageUpload) {
        await onImageUpload(file, variantId);
      }
      
      // Update variant to show custom image
      const updatedVariants = variants.map(variant => 
        variant.id === variantId 
          ? { ...variant, hasCustomImage: true }
          : variant
      );
      onUpdate(updatedVariants);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setImageUploading(false);
    }
  }, [onImageUpload, variants, onUpdate]);

  const handleBulkEdit = useCallback(() => {
    if (!bulkEditField || selectedVariants.length === 0) return;
    
    const updatedVariants = variants.map(variant => {
      if (selectedVariants.includes(variant.id)) {
        return { ...variant, [bulkEditField]: bulkEditValue };
      }
      return variant;
    });
    
    onUpdate(updatedVariants);
    setBulkEditDialog(false);
    setBulkEditField('');
    setBulkEditValue('');
  }, [variants, selectedVariants, bulkEditField, bulkEditValue, onUpdate]);

  const handleToggleExpand = useCallback((variantId) => {
    setExpandedVariants(prev => 
      prev.includes(variantId)
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  }, []);

  const handleOpenVariantForm = useCallback((variant) => {
    setSelectedVariantForForm(variant);
    setVariantFormOpen(true);
  }, []);

  const handleSaveVariantForm = useCallback(async (formData) => {
    if (selectedVariantForForm?.isNew) {
      // Add new variant
      const updatedVariants = [...variants, { ...formData, id: selectedVariantForForm.id }];
      onUpdate(updatedVariants);
    } else {
      // Update existing variant
      if (onSaveVariant) {
        await onSaveVariant(formData);
      } else {
        const updatedVariants = variants.map(variant => 
          variant.id === selectedVariantForForm.id 
            ? { ...variant, ...formData }
            : variant
        );
        onUpdate(updatedVariants);
      }
    }
    setVariantFormOpen(false);
    setSelectedVariantForForm(null);
  }, [selectedVariantForForm, variants, onUpdate, onSaveVariant]);

  const bulkEditFields = [
    { value: 'brand', label: 'Brand' },
    { value: 'rackNo', label: 'Rack Number' },
    { value: 'gst', label: 'GST %' },
    { value: 'itemOnFlag', label: 'Active Status' },
    { value: 'stockItem', label: 'Stock Item Status' },
    { value: 'uom', label: 'UOM' },
    { value: 'defUom', label: 'Default UOM' },
    { value: 'itemDisc', label: 'Item Discount' },
    { value: 'variantPrice', label: 'Variant Price' },
    { value: 'stockQty', label: 'Stock Quantity' },
  ];

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory2 /> Product Variants
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage {variants.length} variants for {productData.productName}
              {selectedVariants.length > 0 && ` • ${selectedVariants.length} selected`}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              onClick={handleAddVariant}
              variant="contained"
              startIcon={<AddPhotoAlternate />}
              size="small"
            >
              Add Variant
            </Button>
            
            {selectedVariants.length > 0 && (
              <Button
                onClick={() => setBulkEditDialog(true)}
                variant="outlined"
                size="small"
              >
                Bulk Edit ({selectedVariants.length})
              </Button>
            )}
            
            <Button
              onClick={onPrev}
              variant="outlined"
              size="small"
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            
            <Button
              onClick={onNext}
              variant="contained"
              color="primary"
              size="small"
            >
              Review & Save
            </Button>
          </Box>
        </Box>

        {/* Variants Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.50', border: 1, borderColor: 'primary.100' }}>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {variants.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Variants
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', border: 1, borderColor: 'success.100' }}>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {totals.totalStock}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Stock
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'info.50', border: 1, borderColor: 'info.100' }}>
              <Typography variant="h6" fontWeight="bold" color="info.main">
                {totals.customImages}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Custom Images
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50', border: 1, borderColor: 'warning.100' }}>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                ₹{totals.totalValue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search variants by name, brand, code, or rack..."
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
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Box>

        {/* Variants Table */}
        {filteredVariants.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <Inventory2 sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'No variants match your search' : 'No variants found'}
            </Typography>
            {!searchTerm && (
              <Button
                onClick={handleAddVariant}
                variant="contained"
                startIcon={<AddPhotoAlternate />}
                sx={{ mt: 2 }}
              >
                Add Your First Variant
              </Button>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell padding="checkbox" width="50">
                    <Checkbox
                      indeterminate={selectedVariants.length > 0 && selectedVariants.length < variants.length}
                      checked={variants.length > 0 && selectedVariants.length === variants.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell width="300">Variant Details</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell width="150">Image</TableCell>
                  <TableCell align="right" width="200">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVariants.map((variant) => (
                  <React.Fragment key={variant.id}>
                    <TableRow 
                      hover 
                      selected={selectedVariants.includes(variant.id)}
                      sx={{ 
                        opacity: variant.itemOnFlag ? 1 : 0.7,
                        bgcolor: variant.itemOnFlag ? 'inherit' : 'action.disabledBackground'
                      }}
                    >
                      {/* Checkbox */}
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedVariants.includes(variant.id)}
                          onChange={() => handleSelectVariant(variant.id)}
                        />
                      </TableCell>
                      
                      {/* Variant Name & Basic Info */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleExpand(variant.id)}
                          >
                            {expandedVariants.includes(variant.id) ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                          
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {variant.variantName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                              {variant.itemCode && (
                                <Chip 
                                  label={`Code: ${variant.itemCode}`} 
                                  size="small" 
                                  variant="outlined" 
                                />
                              )}
                              {variant.spNo && (
                                <Chip 
                                  label={`SP: ${variant.spNo}`} 
                                  size="small" 
                                  variant="outlined" 
                                />
                              )}
                              {!variant.itemOnFlag && (
                                <Chip 
                                  label="Inactive" 
                                  size="small" 
                                  color="default" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      {/* Brand */}
                      <TableCell>
                        <Chip 
                          label={variant.brand || 'No Brand'} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          icon={<LocalOffer fontSize="small" />}
                        />
                      </TableCell>
                      
                      {/* Price */}
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            ₹{variant.variantPrice?.toFixed(2) || '0.00'}
                          </Typography>
                          {variant.mrp > 0 && variant.mrp > variant.variantPrice && (
                            <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                              MRP: ₹{variant.mrp.toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      {/* Stock */}
                      <TableCell>
                        <Box>
                          <Badge 
                            badgeContent={variant.stockQty || 0} 
                            color={
                              variant.stockQty > 50 ? "success" : 
                              variant.stockQty > 10 ? "warning" : 
                              "error"
                            }
                            sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem' } }}
                          >
                            <Typography variant="body2">
                              {variant.stockQty > 0 ? 'In Stock' : 'Out of Stock'}
                            </Typography>
                          </Badge>
                          {variant.rackNo && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              Rack: {variant.rackNo}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      {/* Image */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={variant.imageUrl || productData.imageUrl || '/placeholder-image.jpg'}
                            variant="rounded"
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              border: '2px solid', 
                              borderColor: variant.hasCustomImage ? 'primary.main' : 'grey.300',
                              cursor: 'pointer'
                            }}
                            onClick={() => setImageDialog({
                              open: true,
                              currentImage: variant.imageUrl || productData.imageUrl,
                            })}
                          />
                          
                          <Box>
                            <Chip
                              size="small"
                              label={variant.hasCustomImage ? 'Custom' : 'Inherited'}
                              color={variant.hasCustomImage ? 'primary' : 'default'}
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            
                            {variant.hasCustomImage && (
                              <Tooltip title="Reset to product image">
                                <IconButton
                                  size="small"
                                  onClick={() => handleResetVariantImage(variant.id)}
                                  sx={{ ml: 0.5 }}
                                >
                                  <Refresh fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      
                      {/* Actions */}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {/* Edit Button */}
                          <Tooltip title="Edit All Fields">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenVariantForm(variant)}
                              color="primary"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {/* Image Upload Button */}
                          <Tooltip title="Upload Custom Image">
                            <IconButton
                              size="small"
                              component="label"
                              disabled={imageUploading}
                            >
                              {imageUploading ? <CircularProgress size={20} /> : <Upload fontSize="small" />}
                              <VisuallyHiddenInput
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, variant.id)}
                              />
                            </IconButton>
                          </Tooltip>
                          
                          {/* Duplicate Button */}
                          <Tooltip title="Duplicate Variant">
                            <IconButton
                              size="small"
                              onClick={() => handleDuplicateVariant(variant)}
                              color="info"
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {/* Delete Button */}
                          <Tooltip title="Remove Variant">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveVariant(variant.id)}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row for Additional Fields */}
                    <TableRow>
                      <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
                        <Collapse in={expandedVariants.includes(variant.id)} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider' }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Additional Details
                            </Typography>
                            
                            <Grid container spacing={2}>
                              {/* Basic Info */}
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">
                                  UOM
                                </Typography>
                                <Typography variant="body2">
                                  {variant.uom || 'N/A'}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Default UOM
                                </Typography>
                                <Typography variant="body2">
                                  {variant.defUom || 'N/A'}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">
                                  HSN Code
                                </Typography>
                                <Typography variant="body2">
                                  {variant.hsnCode || 'N/A'}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">
                                  GST %
                                </Typography>
                                <Typography variant="body2">
                                  {variant.gst || 0}%
                                </Typography>
                              </Grid>
                              
                              {/* Pricing Details */}
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Purchase Rate
                                </Typography>
                                <Typography variant="body2">
                                  ₹{variant.purRate?.toFixed(2) || '0.00'}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Invoice Rate
                                </Typography>
                                <Typography variant="body2">
                                  ₹{variant.invoiceRate?.toFixed(2) || '0.00'}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Cash Memo Rate
                                </Typography>
                                <Typography variant="body2">
                                  ₹{variant.cashMemoRate?.toFixed(2) || '0.00'}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Estimate Rate
                                </Typography>
                                <Typography variant="body2">
                                  ₹{variant.estimateRate?.toFixed(2) || '0.00'}
                                </Typography>
                              </Grid>
                              
                              {/* Discounts */}
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Item Discount
                                </Typography>
                                <Typography variant="body2">
                                  {variant.itemDisc || 'N/A'}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Invoice Discount
                                </Typography>
                                <Typography variant="body2">
                                  {variant.invDisc || 0}%
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Cash Memo Discount
                                </Typography>
                                <Typography variant="body2">
                                  {variant.cashMemoDisc || 0}%
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary">
                                  AG Discount
                                </Typography>
                                <Typography variant="body2">
                                  {variant.agDisc || 0}%
                                </Typography>
                              </Grid>
                            </Grid>
                            
                            <Button
                              size="small"
                              onClick={() => handleOpenVariantForm(variant)}
                              startIcon={<Edit />}
                              sx={{ mt: 2 }}
                            >
                              Edit All Fields
                            </Button>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditDialog} onClose={() => setBulkEditDialog(false)}>
        <DialogTitle>Bulk Edit Variants</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 300 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Applying to {selectedVariants.length} selected variants
            </Alert>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Field to Edit</InputLabel>
              <Select
                value={bulkEditField}
                onChange={(e) => setBulkEditField(e.target.value)}
                label="Field to Edit"
              >
                {bulkEditFields.map(field => (
                  <MenuItem key={field.value} value={field.value}>
                    {field.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {bulkEditField && (
              <TextField
                fullWidth
                label={`New Value for ${bulkEditField}`}
                value={bulkEditValue}
                onChange={(e) => setBulkEditValue(e.target.value)}
                size="small"
                type={bulkEditField === 'itemOnFlag' ? 'text' : 'text'}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkEdit} 
            variant="contained"
            disabled={!bulkEditField || !bulkEditValue}
          >
            Apply to {selectedVariants.length} variants
          </Button>
        </DialogActions>
      </Dialog>

      {/* Variant Form Dialog */}
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
        loading={isSavingVariant}
      />

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
          <Box sx={{ maxWidth: '90%', maxHeight: '90%', textAlign: 'center' }}>
            <img
              src={imageDialog.currentImage}
              alt="Preview"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '90vh', 
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            <Typography variant="caption" color="white" sx={{ mt: 1, display: 'block' }}>
              Click anywhere to close
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
});

export default VariantsManagementStep;