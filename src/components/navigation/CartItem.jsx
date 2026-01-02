import React from "react";
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  Typography,
  Stack,
  IconButton,
  Divider,
  Box,
} from "@mui/material";
import { Remove, Add, Delete } from "@mui/icons-material";

const CartItem = ({ item, updateQuantity, removeItem, billType, getPriceByBillType }) => {
  const price = getPriceByBillType(item.variant, billType);
  const total = price * item.quantity;

  return (
    <>
      <ListItem
        sx={{
          py: 1.5,
          px: { xs: 1, sm: 2 },
          alignItems: "flex-start",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "grey.50",
          },
        }}
      >
        {/* Product Image */}
        <ListItemAvatar sx={{ minWidth: 60, mt: 1 }}>
          <Avatar
            src={item.variant.imageUrl}
            alt={item.product.productDetails?.productName || "Product"}
            variant="rounded"
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              boxShadow: 1,
            }}
          />
        </ListItemAvatar>

        {/* Product Details */}
        <Box sx={{ ml: 2, mr: 1, flex: 1, minWidth: 0 }}>
          {/* Product Name */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {item.product.productDetails?.productName || "Product"}
          </Typography>
          
          {/* Variant Name - with proper text wrapping */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            }}
          >
            {item.variant.variantName}
          </Typography>
          
          {/* Brand and UOM in a row */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 1, flexWrap: "wrap", gap: 1 }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                bgcolor: "grey.100",
                px: 1,
                py: 0.3,
                borderRadius: 1,
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
              }}
            >
              Brand: {item.variant.brand}
            </Typography>
            
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                bgcolor: "grey.100",
                px: 1,
                py: 0.3,
                borderRadius: 1,
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
              }}
            >
              UOM: {item.variant.uom}
            </Typography>
          </Stack>
          
          {/* Price and Total */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={{ xs: 0.5, sm: 2 }}
            sx={{ mt: 1 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                ₹{price.toFixed(2)}
              </Typography>
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                × {item.quantity}
              </Typography>
            </Stack>
            
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: "success.main",
                fontSize: { xs: "0.9rem", sm: "1rem" },
              }}
            >
              ₹{total.toFixed(2)}
            </Typography>
          </Stack>
        </Box>

        {/* Quantity Controls and Delete Button */}
        <Stack
          direction="column"
          alignItems="flex-end"
          justifyContent="space-between"
          sx={{ minWidth: 100, height: "100%", ml: 1 }}
        >
          {/* Quantity Controls */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              px: 0.5,
              py: 0.3,
            }}
          >
            <IconButton
              size="small"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              sx={{
                p: 0.3,
                minWidth: 28,
                minHeight: 28,
                "&:hover": {
                  backgroundColor: "error.lighter",
                  color: "error.main",
                },
              }}
            >
              <Remove fontSize="small" />
            </IconButton>

            <Typography
              sx={{
                minWidth: 24,
                textAlign: "center",
                fontWeight: 700,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              {item.quantity}
            </Typography>

            <IconButton
              size="small"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              sx={{
                p: 0.3,
                minWidth: 28,
                minHeight: 28,
                "&:hover": {
                  backgroundColor: "success.lighter",
                  color: "success.main",
                },
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Stack>

          {/* Delete Button */}
          <IconButton
            size="small"
            color="error"
            onClick={() => removeItem(item.id)}
            sx={{
              mt: 1,
              p: 0.5,
              "&:hover": {
                backgroundColor: "error.lighter",
              },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      </ListItem>
      <Divider />
    </>
  );
};

export default CartItem;