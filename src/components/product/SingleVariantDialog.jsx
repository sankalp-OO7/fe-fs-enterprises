import React, { useState, useEffect } from "react";
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
  Divider,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const SingleVariantDialog = ({ open, onClose, variant, onAddToCart }) => {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (open) {
      setQty(1);
    }
  }, [open]);

  if (!variant) return null;

  const handleAdd = () => {
    onAddToCart(variant, qty);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px" } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Add to Memo
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: "12px",
            display: "flex",
            gap: 2,
            alignItems: "center",
            mb: 3,
          }}
        >
          <img
            src={variant.imageUrl || "https://via.placeholder.com/100"}
            alt={variant.name}
            style={{ width: 100, height: 100, borderRadius: 8 }}
          />

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {variant.name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {variant.description || "No description available"}
            </Typography>

            <Typography
              variant="h6"
              sx={{ color: "primary.main", mt: 1, fontWeight: 700 }}
            >
              ₹{variant.price?.toFixed(2)}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Stock: {variant.stockQty}
            </Typography>
          </Box>
        </Paper>

        {/* Quantity Controls */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
          >
            <RemoveIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {qty}
          </Typography>

          <IconButton onClick={() => setQty((q) => q + 1)}>
            <AddIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Total Price
          </Typography>

          <Typography variant="h6" sx={{ color: "success.main", fontWeight: 700 }}>
            ₹{(variant.price * qty).toFixed(2)}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
            textTransform: "none",
            background: "linear-gradient(45deg, #FF6B6B, #FF8E8E)",
          }}
          onClick={handleAdd}
        >
          Add {qty} to Memo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SingleVariantDialog;
