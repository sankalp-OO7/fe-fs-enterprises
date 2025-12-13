import React from "react";
import {
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ProductDetailsDialog = ({
  open,
  product,
  onClose,
  isAdmin,
  isAuthenticated,
  onAddToCart,
}) => {
  if (!product) return null;

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }}>{product.name}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box p={4}>
        <Typography variant="h5">{product.description}</Typography>

        {product.variants.map((v) => (
          <Box key={v._id} mt={2}>
            <Typography>{v.name}</Typography>
            <Typography>₹{v.price}</Typography>
          </Box>
        ))}
      </Box>
    </Dialog>
  );
};

export default ProductDetailsDialog;
