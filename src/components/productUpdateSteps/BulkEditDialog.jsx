// src/pages/components/dialogs/BulkEditDialog.jsx
import React, { memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';

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

const BulkEditDialog = memo(({
  open,
  onClose,
  selectedVariants,
  bulkEditField,
  bulkEditValue,
  onFieldChange,
  onValueChange,
  onApply,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
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
              onChange={(e) => onFieldChange(e.target.value)}
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
              onChange={(e) => onValueChange(e.target.value)}
              size="small"
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onApply} 
          variant="contained"
          disabled={!bulkEditField || !bulkEditValue}
        >
          Apply to {selectedVariants.length} variants
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default BulkEditDialog;