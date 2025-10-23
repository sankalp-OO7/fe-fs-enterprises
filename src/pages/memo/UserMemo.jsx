import React, { useState } from "react";
import {
  Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Typography, Dialog
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useCart } from "../../context/CartContext";
import ProductPage from "../productsPage/ProductsPage";
import axiosClient from "../../api/axiosClient";

const UserMemo = () => {
  const [openDialog, setOpenDialog] = useState(false);

  // Use cart context for core items
  const {
    cart = [],
    getTotalCartItems,
    getTotalCartValue,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Form state only for non-product data
  const [formData, setFormData] = useState({
    name: "",
    gstNo: "",
    billType: "GST",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleQuantityChange = (cartItemId, value) => {
    console.log("Quantity change for item ID:", cartItemId, "New value:", value);
    const newQty = value === "" ? 0 : parseFloat(value);
    if(newQty <= 0) return;
    if (Number.isNaN(newQty)) return;
    updateCartItemQuantity(cartItemId, newQty);
};

  const calculateEstimateCost = () => {
    // Best to use cart context value for total, but you can also recalc:
    return cart
      .reduce((sum, item) => sum + ((item.variant?.price || 0) * (item.quantity || 0)), 0)
      .toFixed(2);
  };

  const handlePlaceOrder = async () => {
    try {
      if (cart.length === 0) {
        return;
      }

      const orderPayload = {
        customerName: formData.name,
        gstNo: formData.gstNo,
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
        paymentMethod: formData.billType,
        paymentStatus: "Paid",
      };

      const response = await axiosClient.post("/orders", orderPayload);
      if (response.status === 201) {
        alert("Order placed successfully!");
        clearCart();
        //clear all data
        setFormData({
          name: "",
          gstNo: "",
          billType: "GST",
        });
        setOpenDialog(false);
        // closeCart();
      } else {
        setError("Failed to place the order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during checkout.");
    } 
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField label="Name" name="name" value={formData.name} onChange={handleInputChange} sx={{ flex: 1, minWidth: 200 }} variant="outlined"/>
        <TextField label="GST No" name="gstNo" value={formData.gstNo} onChange={handleInputChange} sx={{ flex: 1, minWidth: 200 }} variant="outlined"/>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Bill Type</InputLabel>
          <Select name="billType" value={formData.billType} onChange={handleInputChange} label="Bill Type">
            <MenuItem value="GST">GST</MenuItem>
            <MenuItem value="Bill">Bill</MenuItem>
            <MenuItem value="Estimate">Estimate Cost</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          size="small"
        >
          Add the product
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell width="40px"></TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.length > 0 ? cart.map(item => (
              <TableRow key={item._id}>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{item.variant?.name || "-"}</Typography>
                </TableCell>
                <TableCell>
                  <TextField
                    value={item.quantity ?? ""}
                    onChange={e => handleQuantityChange(item.id, e.target.value)}
                    type="number"
                    inputProps={{ min: 0, step: "any" }}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {typeof item.variant?.price === "number"
                      ? `₹${item.variant.price.toFixed(2)}`
                      : "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {typeof item.variant?.price === "number" && typeof item.quantity === "number"
                      ? `₹${(item.variant.price * item.quantity).toFixed(2)}`
                      : "-"}
                  </Typography>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5}><Typography>No products in cart.</Typography></TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={4} align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  Estimate Cost:
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" color="primary">
                  ₹{calculateEstimateCost()}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" size="large" onClick={handlePlaceOrder} disabled={!formData.name || cart.length === 0}>
          Place the order
        </Button>
      </Box>
      <Dialog fullWidth maxWidth="md" open={openDialog} onClose={() => setOpenDialog(false)}>
        <ProductPage isAuthenticated={true} />
      </Dialog>
    </Box>
  );
};

export default UserMemo;
