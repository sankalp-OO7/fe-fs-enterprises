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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { ShoppingCart, Close } from "@mui/icons-material";
import CartItem from "./CartItem";
import axiosClient from "../../api/axiosClient";

const CartDialog = ({
  cart,
  cartOpen,
  getTotalCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  closeCart,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    gstNo: "",
    billType: "GST",
    materialType: "Cash",
    shippingAddress: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Get price based on bill type
  const getPriceByBillType = (variant, billType) => {
    if (!variant) return 0;

    switch (billType) {
      case "GST":
        return variant.invoiceRate ?? variant.actualPrice ?? 0;
      case "Bill":
        return variant.cashMemoRate ?? variant.actualPrice ?? 0;
      case "Estimate":
        return variant.estimateRate ?? variant.actualPrice ?? 0;
      default:
        return variant.actualPrice ?? 0;
    }
  };

  // Calculate total cart value
  const getTotalCartValue = () => {
    return cart.reduce((sum, item) => {
      const price = getPriceByBillType(item.variant, formData.billType);
      return sum + price * item.quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      if (cart.length === 0) {
        setError("Your cart is empty.");
        return;
      }

      if (!formData.customerName) {
        setError("Please enter customer name");
        return;
      }

      const payload = {
        customerName: formData.customerName,
        gstNo: formData.gstNo,
        billType: formData.billType,
        materialType: formData.materialType,
        shippingAddress: formData.shippingAddress,
        items: cart.map((item) => {
          const price = getPriceByBillType(item.variant, formData.billType);
          return {
            productId: item.product.productDetails.id,
            variantId: item.variant._id,
            quantity: item.quantity,
            price: price,
          };
        }),
        totalAmount: getTotalCartValue(),
        paymentStatus: formData.materialType === "Credit" ? "Pending" : "Paid",
      };

      const response = await axiosClient.post("/orders", payload);
      
      if (response.status === 201) {
        alert("Order placed successfully!");
        clearCart();
        setFormData({
          customerName: "",
          gstNo: "",
          billType: "GST",
          materialType: "Cash",
          shippingAddress: "",
        });
        closeCart();
      } else {
        setError("Failed to place the order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={cartOpen}
      onClose={closeCart}
      maxWidth="sm"
      fullWidth
      fullScreen={window.innerWidth < 600}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          maxHeight: { xs: "100vh", sm: "90vh" },
          m: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: "100%" },
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          position: "sticky",
          top: 0,
          zIndex: 1,
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

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
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
            {/* Customer Details Form */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Customer Details
              </Typography>
              
              <Stack spacing={2}>
                <TextField
                  label="Customer Name"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  required
                />

                <TextField
                  label="GST No"
                  name="gstNo"
                  value={formData.gstNo}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                />

                <Stack direction="row" spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Bill Type</InputLabel>
                    <Select
                      name="billType"
                      value={formData.billType}
                      onChange={handleInputChange}
                      label="Bill Type"
                    >
                      <MenuItem value="GST">GST</MenuItem>
                      <MenuItem value="Bill">Bill</MenuItem>
                      <MenuItem value="Estimate">Estimate</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Material Type</InputLabel>
                    <Select
                      name="materialType"
                      value={formData.materialType}
                      onChange={handleInputChange}
                      label="Material Type"
                    >
                      <MenuItem value="Cash">Cash</MenuItem>
                      <MenuItem value="Credit">Credit</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <TextField
                  label="Shipping Address"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                />
              </Stack>
            </Box>

            {/* Cart Items */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Cart Items
            </Typography>
            
            <List
              sx={{
                maxHeight: { xs: 300, sm: 350 },
                overflowY: "auto",
                p: 0,
                mb: 2,
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
                  billType={formData.billType}
                  getPriceByBillType={getPriceByBillType}
                />
              ))}
            </List>

            {/* Summary */}
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Bill Type
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formData.billType}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" align="right">
                      Total Amount
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      ₹{getTotalCartValue().toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>

                {error && (
                  <Alert severity="error" sx={{ borderRadius: 1 }}>
                    {error}
                  </Alert>
                )}

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={clearCart}
                    sx={{
                      flex: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      py: 1.5,
                    }}
                  >
                    Clear Cart
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleCheckout}
                    disabled={loading || !formData.customerName}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      py: 1.5,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      textTransform: "none",
                      boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5a6fd8 0%, #6a4292 100%)",
                      },
                    }}
                  >
                    {loading ? "Processing..." : "Place Order"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartDialog;