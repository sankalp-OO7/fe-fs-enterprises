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
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    customerName: "",
    gstNo: "",
    billType: "INVOICE",
    materialType: "Cash",
    mobileNo: "",
    shippingAddress: "",
  });

  /* ---------------- VALIDATION FUNCTIONS ---------------- */
  const validateMobile = (mobile) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  const validateGST = (gst) => {
    if (!gst) return true; // GST is optional
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const validateName = (name) => {
    return name.trim().length >= 3;
  };

  const validateAddress = (address) => {
    return address.trim().length >= 10;
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    } else if (!validateName(formData.customerName)) {
      newErrors.customerName = "Name must be at least 3 characters";
    }

    // Mobile validation
    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = "Mobile number is required";
    } else if (!validateMobile(formData.mobileNo)) {
      newErrors.mobileNo = "Mobile number must be exactly 10 digits";
    }

    // GST validation (optional but must be valid if provided)
    if (formData.gstNo.trim() && !validateGST(formData.gstNo)) {
      newErrors.gstNo = "Invalid GST format";
    }

    // Address validation
    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = "Shipping address is required";
    } else if (!validateAddress(formData.shippingAddress)) {
      newErrors.shippingAddress = "Address must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for mobile number - only allow digits
    if (name === "mobileNo") {
      const digitsOnly = value.replace(/\D/g, "");
      // Limit to 10 digits
      if (digitsOnly.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      }
      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  // Get price based on bill type
  const getPriceByBillType = (variant, billType) => {
    if (!variant) return 0;

    switch (billType) {
      case "INVOICE":
        return variant.invoicePrice ?? variant.invoicePrice ?? 0;
      case "SPECIAL PRICE":
        return variant.estimatePrice ?? variant.estimatePrice ?? 0;
      default:
        return variant.invoicePrice ?? 0;
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
    // Validate form before proceeding
    if (!validateForm()) {
      setError("Please fix the validation errors");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        customerName: formData.customerName,
        gstNo: formData.gstNo || null,
        billType: formData.billType,
        materialType: formData.materialType,
        shippingAddress: formData.shippingAddress,
        mobileNo: formData.mobileNo,
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
          billType: "INVOICE",
          materialType: "Cash",
          mobileNo: "",
          shippingAddress: "",
        });
        setErrors({});
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

  // Check if mobile view
  const isMobile = window.innerWidth < 600;

  return (
    <Dialog
      open={cartOpen}
      onClose={closeCart}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          maxHeight: isMobile ? "100vh" : "90vh",
          m: isMobile ? 0 : 2,
          width: isMobile ? "100%" : "100%",
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
          px: isMobile ? 2 : 3,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <ShoppingCart sx={{ fontSize: isMobile ? 24 : 28 }} />
            <Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
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

      <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
        {cart.length === 0 ? (
          <Box sx={{ p: isMobile ? 4 : 6, textAlign: "center" }}>
            <ShoppingCart
              sx={{
                fontSize: isMobile ? "4rem" : "5rem",
                color: "text.secondary",
                opacity: 0.3,
                mb: 2,
              }}
            />
            <Typography
              variant={isMobile ? "body1" : "h6"}
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add some products to get started!
            </Typography>
            <Button
              variant="contained"
              onClick={closeCart}
              sx={{ mt: 3 }}
            >
              Continue Shopping
            </Button>
          </Box>
        ) : (
          <>
            {/* Customer Details Form */}
            <Box
              sx={{
                mb: 3,
                p: isMobile ? 1.5 : 2,
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
                  error={!!errors.customerName}
                  helperText={errors.customerName}
                  fullWidth
                  size="small"
                  required
                />

                <TextField
                  label="Mobile No"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  error={!!errors.mobileNo}
                  helperText={errors.mobileNo || "Exactly 10 digits"}
                  fullWidth
                  size="small"
                  required
                  inputProps={{
                    maxLength: 10,
                    pattern: "[0-9]*",
                    inputMode: "numeric",
                  }}
                />

                <TextField
                  label="GST No (Optional)"
                  name="gstNo"
                  value={formData.gstNo}
                  onChange={handleInputChange}
                  error={!!errors.gstNo}
                  helperText={errors.gstNo}
                  fullWidth
                  size="small"
                  placeholder="22AAAAA0000A1Z5"
                />

                <Stack 
                  direction={isMobile ? "column" : "row"} 
                  spacing={isMobile ? 1 : 2}
                >
                  <FormControl fullWidth size="small">
                    <InputLabel>Bill Type</InputLabel>
                    <Select
                      name="billType"
                      value={formData.billType}
                      onChange={handleInputChange}
                      label="Bill Type"
                    >
                      <MenuItem value="INVOICE">Invoice</MenuItem>
                      <MenuItem value="SPECIAL PRICE">Special Price</MenuItem>
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
                  error={!!errors.shippingAddress}
                  helperText={errors.shippingAddress}
                  fullWidth
                  multiline
                  rows={isMobile ? 2 : 2}
                  size="small"
                  required
                />
              </Stack>
            </Box>

            {/* Cart Items */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Cart Items ({cart.length})
            </Typography>
            
            <List
              sx={{
                maxHeight: isMobile ? 250 : 350,
                overflowY: "auto",
                p: 0,
                mb: 2,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0,0,0,0.2)",
                  borderRadius: 4,
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
                p: isMobile ? 1.5 : 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                position: isMobile ? "sticky" : "static",
                bottom: isMobile ? 0 : "auto",
                zIndex: isMobile ? 2 : 1,
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={isMobile ? "column" : "row"}
                  justifyContent="space-between"
                  alignItems={isMobile ? "flex-start" : "center"}
                  spacing={isMobile ? 1 : 0}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Bill Type
                    </Typography>
                    <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 700 }}>
                      {formData.billType === "INVOICE" ? "Invoice" : "Special Price"}
                    </Typography>
                  </Box>

                  <Box sx={{ width: isMobile ? "100%" : "auto" }}>
                    <Typography variant="body2" color="text.secondary" align={isMobile ? "left" : "right"}>
                      Total Amount
                    </Typography>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      ₹{getTotalCartValue().toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      borderRadius: 1,
                      fontSize: isMobile ? "0.875rem" : "1rem",
                    }}
                    onClose={() => setError("")}
                  >
                    {error}
                  </Alert>
                )}

                <Stack 
                  direction={isMobile ? "column-reverse" : "row"} 
                  spacing={2}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={clearCart}
                    sx={{
                      flex: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      py: isMobile ? 1.2 : 1.5,
                    }}
                  >
                    Clear Cart
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleCheckout}
                    disabled={
                      loading || 
                      !formData.customerName || 
                      !formData.mobileNo || 
                      !formData.shippingAddress || 
                      cart.length === 0
                    }
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      py: isMobile ? 1.2 : 1.5,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      fontWeight: 700,
                      fontSize: isMobile ? "0.95rem" : "1.05rem",
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