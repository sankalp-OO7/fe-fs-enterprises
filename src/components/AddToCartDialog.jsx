import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  Stack,
  Box,
  Paper,
  Checkbox,
  FormControlLabel,
  TextField,
  Chip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const AddToCartDialog = ({ open, onClose, product, onAddToCart }) => {
  const [selectedVariants, setSelectedVariants] = useState(new Set());
  const [quantities, setQuantities] = useState({});

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open && product) {
      setSelectedVariants(new Set());
      setQuantities({});
    }
  }, [open, product]);

  const handleVariantToggle = (variantId) => {
    const newSelected = new Set(selectedVariants);
    if (newSelected.has(variantId)) {
      newSelected.delete(variantId);
      const newQuantities = { ...quantities };
      delete newQuantities[variantId];
      setQuantities(newQuantities);
    } else {
      newSelected.add(variantId);
      setQuantities(prev => ({ ...prev, [variantId]: 1 }));
    }
    setSelectedVariants(newSelected);
  };

  const handleQuantityChange = (variantId, newQuantity) => {
    if (newQuantity > 0) {
      setQuantities(prev => ({ ...prev, [variantId]: newQuantity }));
    }
  };

const handleConfirm = () => {
  if (selectedVariants.size > 0) {
    onAddToCart(product, Array.from(selectedVariants), quantities);
    // Reset locally here as well or after dialog closes
    setSelectedVariants(new Set());
    setQuantities({});
    onClose();
  }
};


  const getTotalSelectedItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Array.from(selectedVariants).reduce((total, variantId) => {
      const variant = product?.variants.find(v => v._id === variantId);
      const quantity = quantities[variantId] || 1;
      return total + (variant ? variant.price * quantity : 0);
    }, 0);
  };

  if (!product) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "20px" }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Select Variants
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.description}
          </Typography>
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Available Variants ({product.variants.length}):
        </Typography>
        
        <Stack spacing={2}>
          {product.variants.map((variant) => {
            const isSelected = selectedVariants.has(variant._id);
            const isOutOfStock = variant.stockQty === 0;
            const currentQuantity = quantities[variant._id] || 1;

            return (
              <Paper
                key={variant._id}
                elevation={isSelected ? 3 : 1}
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  border: isSelected ? "2px solid" : "1px solid",
                  borderColor: isSelected ? "primary.main" : "rgba(0,0,0,0.12)",
                  opacity: isOutOfStock ? 0.5 : 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: isOutOfStock ? 1 : 3,
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleVariantToggle(variant._id)}
                        disabled={isOutOfStock}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        {/* <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {variant.name}
                          {isOutOfStock && (
                            <Chip
                              label="Out of Stock"
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ ml: 1, fontSize: "0.7rem" }}
                            />
                          )}
                        </Typography> */}
                        <Typography variant="caption" color="text.secondary">
                          Stock: {variant.stockQty} units
                        </Typography>
                      </Box>
                    }
                    sx={{ flexGrow: 1 }}
                  />

                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography
                      variant="h6"
                      sx={{ 
                        fontWeight: 600, 
                        color: 'primary.main',
                        minWidth: '80px',
                        textAlign: 'right'
                      }}
                    >
                      ₹{variant.price.toFixed(2)}
                    </Typography>

                    {isSelected && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(variant._id, currentQuantity - 1)}
                          disabled={currentQuantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        
                        <TextField
                          type="number"
                          value={currentQuantity}
                          onChange={(e) => {
                            const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                            handleQuantityChange(variant._id, newQuantity);
                          }}
                          sx={{ width: '60px' }}
                          size="small"
                          inputProps={{ 
                            min: 1, 
                            style: { textAlign: 'center', padding: '4px' } 
                          }}
                        />
                        
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(variant._id, currentQuantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>

        {selectedVariants.size > 0 && (
          <Paper
            elevation={2}
            sx={{
              p: 2,
              mt: 3,
              borderRadius: "12px",
              background: "linear-gradient(145deg, #e3f2fd, #f3e5f5)",
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Selected Items:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {getTotalSelectedItems()} items
                </Typography>
              </Stack>
              
              <Divider />
              
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total Price:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  ₹{getTotalPrice().toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          sx={{ borderRadius: '10px' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          // disabled={selectedVariants.size === 0}
          startIcon={<ShoppingCartIcon />}
          sx={{
            borderRadius: '10px',
            background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF5252, #FF7979)',
            },
            '&:disabled': {
              background: 'linear-gradient(45deg, #9E9E9E, #BDBDBD)',
            },
          }}
        >
          Add to Memo ({selectedVariants.size} )
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToCartDialog;
