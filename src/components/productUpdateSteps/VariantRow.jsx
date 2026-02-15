// src/pages/components/VariantRow.jsx
import React, { memo } from 'react';
import {
  TableRow,
  TableCell,
  Checkbox,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Delete,
  Edit,
  Upload,
  ContentCopy,
  Refresh,
  LocalOffer,
  ExpandMore,
  ExpandLess,
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

const VariantRow = memo(({
  variant,
  isSelected,
  productImage,
  onSelect,
  onImagePreview,
  onEdit,
  onDuplicate,
  onRemove,
  onFileUpload,
  onResetImage,
  imageUploading,
}) => {
  return (
    <TableRow 
      hover 
      selected={isSelected}
      sx={{ 
        opacity: variant.itemOnFlag ? 1 : 0.7,
        bgcolor: variant.itemOnFlag ? 'inherit' : 'action.disabledBackground'
      }}
    >
      {/* Checkbox */}
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={onSelect}
        />
      </TableCell>
      
      {/* Variant Name & Basic Info */}
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
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
            ₹{variant.invoicePrice?.toFixed(2) || '0.00'}
          </Typography>
          {variant.mrp > 0 && variant.mrp > variant.invoicePrice && (
            <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              MRP: ₹{variant.mrp.toFixed(2)}
            </Typography>
          )}
        </Box>
      </TableCell>
      
      {/* estimate price */}
      <TableCell>
        <Box>
          <Badge 
            badgeContent={variant.estimatePrice || 0} 
              color={variant.estimatePrice > 0 ? 'success' : 'error'}
            sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem' } }}
          >
            <Typography variant="body2">
              ₹{variant.estimatePrice?.toFixed(2) || '0.00'}
            </Typography>
          </Badge>
        </Box>
      </TableCell>
      
      {/* Image */}
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={variant.imageUrl || productImage || '/placeholder-image.jpg'}
            variant="rounded"
            sx={{ 
              width: 40, 
              height: 40, 
              border: '2px solid', 
              borderColor: variant.hasCustomImage ? 'primary.main' : 'grey.300',
              cursor: 'pointer'
            }}
            onClick={onImagePreview}
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
                  onClick={onResetImage}
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
          <Tooltip title="Edit All Fields">
            <IconButton
              size="small"
              onClick={onEdit}
              color="primary"
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          
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
                onChange={onFileUpload}
              />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Duplicate Variant">
            <IconButton
              size="small"
              onClick={onDuplicate}
              color="info"
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Remove Variant">
            <IconButton
              size="small"
              onClick={onRemove}
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
});

export default VariantRow;