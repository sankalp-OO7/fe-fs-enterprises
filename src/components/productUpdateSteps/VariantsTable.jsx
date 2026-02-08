// src/pages/components/VariantsTable.jsx
import React, { useState, useCallback, memo } from 'react';
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  Avatar,
  Collapse,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  AddPhotoAlternate,
  Delete,
  Edit,
  Upload,
  ContentCopy,
  Refresh,
  LocalOffer,
  ExpandMore,
  ExpandLess,
  Inventory2,
} from '@mui/icons-material';
import VariantRow from './VariantRow';
import VariantExpandedRow from './VariantExpandedRow';
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

const VariantsTable = memo(({
  variants,
  selectedVariants,
  searchTerm,
  productData,
  onSelectVariant,
  onSelectAll,
  onRemoveVariant,
  onVariantChange,
  onResetVariantImage,
  onDuplicateVariant,
  onFileUpload,
  onOpenVariantForm,
  onImagePreview,
  imageUploading,
}) => {
  const [expandedVariants, setExpandedVariants] = useState([]);

  const handleToggleExpand = useCallback((variantId) => {
    setExpandedVariants(prev => 
      prev.includes(variantId)
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  }, []);

const handleRemoveVariant = useCallback((variantId) => {
  onRemoveVariant(variantId);
}, [onRemoveVariant]);

  const handleVariantChange = useCallback((variantId, field, value) => {
    const updatedVariants = variants.map(variant => 
      variant.id === variantId 
        ? { ...variant, [field]: value }
        : variant
    );
    onVariantChange(updatedVariants);
  }, [variants, onVariantChange]);

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
    onResetVariantImage(updatedVariants);
  }, [variants, productData.imageUrl, onResetVariantImage]);

  const handleDuplicateVariant = useCallback((variant) => {
    const newVariant = {
      ...variant,
      id: `copy-${Date.now()}`,
      _id: `copy-${Date.now()}`,
      variantName: `${variant.variantName} (Copy)`,
      isNew: true,
    };
    const updatedVariants = [...variants, newVariant];
    onDuplicateVariant(updatedVariants);
  }, [variants, onDuplicateVariant]);

  const handleFileUpload = useCallback(async (event, variantId) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      if (onFileUpload) {
        await onFileUpload(file, variantId);
      }
      
      const updatedVariants = variants.map(variant => 
        variant.id === variantId 
          ? { ...variant, hasCustomImage: true }
          : variant
      );
      onVariantChange(updatedVariants);
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  }, [onFileUpload, variants, onVariantChange]);

  if (variants.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
        <Inventory2 sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {searchTerm ? 'No variants match your search' : 'No variants found'}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell padding="checkbox" width="50">
              <Checkbox
                indeterminate={selectedVariants.length > 0 && selectedVariants.length < variants.length}
                checked={variants.length > 0 && selectedVariants.length === variants.length}
                onChange={onSelectAll}
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
          {variants.map((variant) => (
            <React.Fragment key={variant.id}>
              <VariantRow
                variant={variant}
                isSelected={selectedVariants.includes(variant.id)}
                isExpanded={expandedVariants.includes(variant.id)}
                productImage={productData.imageUrl}
                onSelect={() => onSelectVariant(variant.id)}
                onToggleExpand={() => handleToggleExpand(variant.id)}
                onImagePreview={() => onImagePreview(variant.imageUrl || productData.imageUrl)}
                onEdit={() => onOpenVariantForm(variant)}
                onDuplicate={() => handleDuplicateVariant(variant)}
               onRemove={() => handleRemoveVariant(variant.id)}
                onFileUpload={(e) => handleFileUpload(e, variant.id)}
                onResetImage={() => handleResetVariantImage(variant.id)}
                imageUploading={imageUploading}
              />
              
              <VariantExpandedRow
                variant={variant}
                isExpanded={expandedVariants.includes(variant.id)}
                onEdit={() => onOpenVariantForm(variant)}
              />
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export default VariantsTable;