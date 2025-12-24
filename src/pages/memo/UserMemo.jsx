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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useCart } from "../../context/CartContext";
import ProductPage from "../productsPage/ProductsPage";
import axiosClient from "../../api/axiosClient";

const UserMemo = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const {
    cart = [],
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    gstNo: "",
    billType: "GST", // GST | Bill | Estimate
    materialType: "Cash", // Cash | Credit
    address: "",
  });

  /* ---------------- PRICE SELECTION LOGIC ---------------- */
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

  /* ---------------- FORM HANDLERS ---------------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  /* ---------------- PLACE ORDER ---------------- */
  const handlePlaceOrder = async () => {
    if (!cart.length) return;

    const payload = {
      customerName: formData.name,
      gstNo: formData.gstNo,
      billType: formData.billType,
      materialType: formData.materialType,
      shippingAddress: formData.address,

      items: cart.map((item) => {
        const price = getPriceByBillType(item.variant, formData.billType);
        return {
          productId: item.product.productDetails.id,
          variantId: item.variant._id,
          quantity: item.quantity,
          price: price,
          // totalPrice: price * item.quantity,
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
        alert("Order placed successfully");
        clearCart();
        setFormData({
          name: "",
          gstNo: "",
          billType: "GST",
          materialType: "Cash",
          address: "",
        });
        setOpenDialog(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
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
          sx={{ flex: 1, minWidth: 200 }}
        />

        <TextField
          label="GST No"
          name="gstNo"
          value={formData.gstNo}
          onChange={handleInputChange}
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
            <MenuItem value="GST">GST</MenuItem>
            <MenuItem value="Bill">Bill</MenuItem>
            <MenuItem value="Estimate">Estimate</MenuItem>
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
                  No products added
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell colSpan={4} align="right">
                <Typography fontWeight="bold">
                  Total Amount
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="primary" fontWeight="bold">
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
          disabled={!formData.name || !cart.length}
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
    </Box>
  );
};

export default UserMemo;
