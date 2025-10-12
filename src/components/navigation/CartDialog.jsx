import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  IconButton,
  List,
  Box,
  Button,
} from "@mui/material";
import { ShoppingCart, Close } from "@mui/icons-material";
import CartItem from "./CartItem";
import axiosClient from "../../api/axiosClient";

const CartDialog = ({
  cart,
  cartOpen,
  getTotalCartItems,
  getTotalCartValue,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  closeCart,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      if (cart.length === 0) {
        setError("Your cart is empty.");
        return;
      }

      const orderPayload = {
        items: cart.map((item) => ({
          productId: item.product._id,
          variantId: item.variant._id,
          quantity: item.quantity,
          price: item.variant.price,
        })),
        totalAmount: cart.reduce(
          (sum, item) => sum + item.variant.price * item.quantity,
          0
        ),
        shippingAddress: "123 Demo St, Sample City, Country",
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Paid",
      };

      const response = await axiosClient.post("/orders", orderPayload);
      if (response.status === 201) {
        alert("Order placed successfully!");
        clearCart();
        closeCart();
      } else {
        setError("Failed to place the order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={cartOpen}
      onClose={closeCart}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: { xs: "90vh", sm: "85vh" },
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <ShoppingCart sx={{ fontSize: 28 }} />
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, lineHeight: 1.2 }}
              >
                Shopping Cart
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {getTotalCartItems()}{" "}
                {getTotalCartItems() === 1 ? "item" : "items"}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={closeCart}
            sx={{
              color: "white",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
            }}
          >
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {cart.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <ShoppingCart
              sx={{
                fontSize: "5rem",
                color: "text.secondary",
                opacity: 0.3,
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add some products to get started!
            </Typography>
          </Box>
        ) : (
          <>
            <List
              sx={{
                maxHeight: { xs: 360, sm: 420 },
                overflowY: "auto",
                p: 0,
                "&::-webkit-scrollbar": { width: 8 },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0,0,0,0.2)",
                  borderRadius: 8,
                },
              }}
            >
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  updateQuantity={updateCartItemQuantity}
                  removeItem={removeFromCart}
                />
              ))}
            </List>

            <Box
              sx={{
                p: 3,
                bgcolor: "grey.50",
                borderTop: "2px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={2.5}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      ₹{getTotalCartValue().toFixed(2)}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={clearCart}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    Clear Cart
                  </Button>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleCheckout}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    textTransform: "none",
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #5a6fd8 0%, #6a4292 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 25px rgba(102, 126, 234, 0.5)",
                    },
                  }}
                >
                  {loading ? "Processing..." : "Proceed to Checkout"}
                </Button>

                {error && (
                  <Typography
                    color="error"
                    variant="body2"
                    sx={{ textAlign: "center", fontWeight: 500 }}
                  >
                    {error}
                  </Typography>
                )}
              </Stack>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartDialog;
