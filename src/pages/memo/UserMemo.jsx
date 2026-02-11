import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Dialog,
  Alert,
  Snackbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useCart } from "../../context/CartContext";
import ProductPage from "../productsPage/ProductsPage";
import axiosClient from "../../api/axiosClient";

const UserMemo = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    cart = [],
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    gstNo: "",
    billType: "INVOICE",
    materialType: "Cash",
    mobileNo: "",
    address: "",
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
    if (!formData.name.trim()) {
      newErrors.name = "Customer name is required";
    } else if (!validateName(formData.name)) {
      newErrors.name = "Name must be at least 3 characters";
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
    if (!formData.address.trim()) {
      newErrors.address = "Shipping address is required";
    } else if (!validateAddress(formData.address)) {
      newErrors.address = "Address must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- PRICE SELECTION LOGIC ---------------- */
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

  /* ---------------- FORM HANDLERS ---------------- */
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

  const handleQuantityChange = (cartItemId, value) => {
    const qty = value === "" ? 0 : Number(value);
    if (Number.isNaN(qty) || qty <= 0) return;
    updateCartItemQuantity(cartItemId, qty);
  };

  /* ---------------- TOTAL CALCULATION ---------------- */
  const calculateEstimateCost = () => {
    return cart
      .reduce((sum, item) => {
        const price = getPriceByBillType(item.variant, formData.billType);
        return sum + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const handlePlaceOrder = async () => {
    // Validate form before proceeding
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fix the validation errors",
        severity: "error",
      });
      return;
    }

    if (!cart.length) {
      setSnackbar({
        open: true,
        message: "Cart is empty",
        severity: "error",
      });
      return;
    }

    const payload = {
      customerName: formData.name,
      gstNo: formData.gstNo || null,
      billType: formData.billType,
      materialType: formData.materialType,
      shippingAddress: formData.address,
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

      totalAmount: cart.reduce((sum, item) => {
        const price = getPriceByBillType(item.variant, formData.billType);
        return sum + price * item.quantity;
      }, 0),

      paymentStatus:
        formData.materialType === "Credit" ? "Pending" : "Paid",
    };

    try {
      const res = await axiosClient.post("/orders", payload);
      if (res.status === 201) {
        setSnackbar({
          open: true,
          message: "Order placed successfully!",
          severity: "success",
        });
        
        clearCart();
        setFormData({
          name: "",
          gstNo: "",
          billType: "INVOICE",
          materialType: "Cash",
          mobileNo: "",
          address: "",
        });
        setErrors({});
        setOpenDialog(false);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to place order",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  /* ---------------- UI ---------------- */
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* CUSTOMER DETAILS */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="Customer Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={!!errors.name}
          helperText={errors.name}
          required
          sx={{ flex: 1, minWidth: 200 }}
        />

        <TextField
          label="GST No (Optional)"
          name="gstNo"
          value={formData.gstNo}
          onChange={handleInputChange}
          error={!!errors.gstNo}
          helperText={errors.gstNo}
          placeholder="22AAAAA0000A1Z5"
          sx={{ flex: 1, minWidth: 200 }}
        />
        
        <TextField
          label="Mobile No"
          name="mobileNo"
          value={formData.mobileNo}
          onChange={handleInputChange}
          error={!!errors.mobileNo}
          helperText={errors.mobileNo || "Exactly 10 digits"}
          required
          inputProps={{
            maxLength: 10,
            pattern: "[0-9]*",
            inputMode: "numeric",
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />

        <FormControl sx={{ minWidth: 200 }}>
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

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Material Type</InputLabel>
          <Select
            name="materialType"
            value={formData.materialType}
            onChange={handleInputChange}
            label="Material Type"
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Credit">Material on Credit</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TextField
        label="Shipping Address"
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        error={!!errors.address}
        helperText={errors.address}
        required
        fullWidth
        multiline
        rows={2}
        sx={{ mb: 3 }}
      />

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 2 }}
      >
        Add Product
      </Button>

      {/* CART TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell />
              <TableCell>Product</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {cart.length ? (
              cart.map((item) => {
                const price = getPriceByBillType(
                  item.variant,
                  formData.billType
                );
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>

                    <TableCell>{item.variant.variantName}</TableCell>

                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.id, e.target.value)
                        }
                        inputProps={{
                          min: 1,
                          style: { width: "70px" },
                        }}
                      />
                    </TableCell>

                    <TableCell>₹{price.toFixed(2)}</TableCell>

                    <TableCell>
                      ₹{(price * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    No products added to cart
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell colSpan={4} align="right">
                <Typography fontWeight="bold" variant="h6">
                  Total Amount
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="primary" fontWeight="bold" variant="h6">
                  ₹{calculateEstimateCost()}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ textAlign: "right", mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handlePlaceOrder}
          disabled={!formData.name || !formData.mobileNo || !formData.address || !cart.length}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
          }}
        >
          Place Order
        </Button>
      </Box>

      {/* PRODUCT DIALOG */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <ProductPage isAuthenticated />
      </Dialog>

      {/* SNACKBAR FOR NOTIFICATIONS */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserMemo;