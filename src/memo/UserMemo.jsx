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
import { useLocation } from "react-router-dom";
import ProductPage from "../pages/productsPage/ProductsPage";

const UserMemo = () => {

    const [openDialog, setOpenDialog] = useState(false);

  //get data from router state
  const location = useLocation();
  const { cart } = location.state || {};
//   console.log("cart", cart);

  const [formData, setFormData] = useState({
    name: "",
    gstNo: "",
    billType: "GST",
  });

  const [products, setProducts] = useState(
    Array.isArray(cart) && cart.length > 0
      ? cart.map((item) => ({
          id: item._id,
          name: item.variant.name,
          price: item.variant.price,
          quantity: item.quantity ?? "",
          total: 0,
        }))
      : [{ id: 1, name: "", quantity: "", price: "", total: 0 }]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductChange = (id, field, value) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === id) {
          const updated = { ...product, [field]: value };

          // Calculate total if quantity or price changes
          if (field === "quantity" || field === "price") {
            const qty =
              field === "quantity"
                ? parseFloat(value) || 0
                : parseFloat(product.quantity) || 0;
            const price =
              field === "price"
                ? parseFloat(value) || 0
                : parseFloat(product.price) || 0;
            updated.total = qty * price;
          }

          return updated;
        }
        return product;
      })
    );
  };

  const addProduct = () => {
    const newId = products.length + 1;
    setProducts((prev) => [
      ...prev,
      { id: newId, name: "", quantity: "", price: "", total: 0 },
    ]);
  };

  const deleteProduct = (id) => {
    if (products.length > 1) {
      setProducts((prev) => prev.filter((product) => product.id !== id));
    }
  };

  const calculateEstimateCost = () => {
    return products.reduce((sum, product) => sum + product.total, 0).toFixed(2);
  };

  const handlePlaceOrder = () => {
    const orderData = {
      ...formData,
      products: products.filter((p) => p.name && p.quantity && p.price),
      estimateCost: calculateEstimateCost(),
    };
    console.log("Order placed:", orderData);
    // Add your order submission logic here
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          sx={{ flex: 1, minWidth: 200 }}
          variant="outlined"
        />

        <TextField
          label="GST No"
          name="gstNo"
          value={formData.gstNo}
          onChange={handleInputChange}
          sx={{ flex: 1, minWidth: 200 }}
          variant="outlined"
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
            <MenuItem value="Estimate">Estimate Cost</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Add Product Button */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
        //   onClick={addProduct}
            onClick={() => setOpenDialog(true)}
          size="small"
        >
          Add the product
        </Button>
      </Box>

      {/* Products Table */}
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
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => deleteProduct(product.id)}
                    disabled={products.length === 1}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={product.name}
                    onChange={(e) =>
                      handleProductChange(product.id, "name", e.target.value)
                    }
                    placeholder="Enter product name"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={product.quantity}
                    onChange={(e) =>
                      handleProductChange(
                        product.id,
                        "quantity",
                        e.target.value
                      )
                    }
                    placeholder="Qty"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={product.price}
                    onChange={(e) =>
                      handleProductChange(product.id, "price", e.target.value)
                    }
                    placeholder="Price"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    ₹{product.total?.toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
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

      {/* Place Order Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="large"
          onClick={handlePlaceOrder}
          disabled={!formData.name || products.every((p) => !p.name)}
        >
          Place the order
        </Button>
      </Box>
      <Dialog fullWidth={true} maxWidth="xl" open={openDialog} onClose={() => setOpenDialog(false)}>
        <ProductPage />
      </Dialog>
    </Box>
  );
};

export default UserMemo;
