import React, { useState, useEffect } from "react";
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
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useCart } from "../../context/CartContext";
import axiosClient from "../../api/axiosClient";
import ConfirmDialog from "../../components/ConfirmDialog";
import MemoProductBrowser from "../../components/memo/MemoProductBrowser";

const COMPANY = {
  name: "FS Interprises",
  address: "Your Business Address Here",
  phone: "+91 XXXXXXXXXX",
  email: "info@fs-interprises.com",
  gstin: "GSTIN Number",
};

const UserMemo = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(false); // pre-place confirmation
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // My Orders (history)
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState(null); // for confirm dialog

  const fetchMyOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axiosClient.get("/orders/myorders");
      setMyOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleDeleteMyOrder = async (orderId) => {
    setConfirmDeleteOrderId(null);
    setDeletingOrderId(orderId);
    try {
      await axiosClient.delete(`/orders/myorders/${orderId}`);
      setMyOrders((prev) => prev.filter((o) => o._id !== orderId));
      setSnackbar({ open: true, message: "Order deleted", severity: "success" });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete order",
        severity: "error",
      });
    } finally {
      setDeletingOrderId(null);
    }
  };


  const {
    cart = [],
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const SAVED_FORM_KEY = "memo_form_data";

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_FORM_KEY);
      if (saved) return { ...JSON.parse(saved), billType: JSON.parse(saved).billType || "INVOICE", materialType: JSON.parse(saved).materialType || "Cash" };
    } catch {}
    return { name: "", gstNo: "", billType: "INVOICE", materialType: "Cash", mobileNo: "", address: "" };
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

    if (!formData.name.trim()) {
      newErrors.name = "Customer name is required";
    } else if (!validateName(formData.name)) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = "Mobile number is required";
    } else if (!validateMobile(formData.mobileNo)) {
      newErrors.mobileNo = "Mobile number must be exactly 10 digits";
    }

    if (formData.gstNo.trim() && !validateGST(formData.gstNo)) {
      newErrors.gstNo = "Invalid GST format";
    }

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
        return variant.invoicePrice ?? 0;
      case "SPECIAL PRICE":
        return variant.estimatePrice ?? 0;
      default:
        return variant.invoicePrice ?? 0;
    }
  };

  /* ---------------- FORM HANDLERS ---------------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updated;
    if (name === "mobileNo") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length > 10) return;
      updated = { ...formData, [name]: digitsOnly };
    } else {
      updated = { ...formData, [name]: value };
    }
    setFormData(updated);
    // Persist to localStorage (skip billType/materialType — those are per-order)
    localStorage.setItem(SAVED_FORM_KEY, JSON.stringify(updated));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
    if (isSubmitting) return; // guard against double-click

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

    setIsSubmitting(true);

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
      paymentStatus: formData.materialType === "Credit" ? "Pending" : "Paid",
    };

    try {
      const res = await axiosClient.post("/orders", payload);
      if (res.status === 201) {
        // Build a local snapshot for the success popup before clearing cart
        const orderSnapshot = {
          customerName: formData.name,
          mobileNo: formData.mobileNo,
          gstNo: formData.gstNo,
          billType: formData.billType,
          materialType: formData.materialType,
          shippingAddress: formData.address,
          paymentStatus: payload.paymentStatus,
          totalAmount: payload.totalAmount,
          createdAt: new Date().toISOString(),
          items: cart.map((item) => ({
            name: item.variant?.variantName || "Product",
            quantity: item.quantity,
            price: getPriceByBillType(item.variant, formData.billType),
          })),
        };

        clearCart();
        // Keep form data in localStorage but reset only order-transient fields
        setFormData(prev => {
          const persisted = { ...prev };
          localStorage.setItem(SAVED_FORM_KEY, JSON.stringify(persisted));
          return persisted;
        });
        setErrors({});

        // Show success popup with order details
        setSuccessOrder(orderSnapshot);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to place order",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  /* ---------------- PRINT INVOICE ---------------- */
  const handlePrintInvoice = (order) => {
    const printWindow = window.open("", "_blank", "width=800,height=700");
    if (!printWindow) return;

    const itemRows = order.items
      .map(
        (item, i) => `
      <tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#fff"}">
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">₹${item.price.toFixed(2)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${COMPANY.name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; color: #222; padding: 32px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
          .company-name { font-size: 26px; font-weight: 800; color: #1e3c72; }
          .company-sub { font-size: 12px; color: #555; margin-top: 4px; }
          .invoice-title { font-size: 20px; font-weight: 700; color: #333; text-align: right; }
          .invoice-meta { font-size: 12px; color: #555; text-align: right; margin-top: 4px; }
          .divider { border: none; border-top: 2px solid #1e3c72; margin: 20px 0; }
          .section-title { font-size: 13px; font-weight: 700; color: #1e3c72; text-transform: uppercase; margin-bottom: 6px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .info-box p { font-size: 13px; line-height: 1.7; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          thead { background: #1e3c72; color: white; }
          thead th { padding: 10px 12px; text-align: left; font-size: 13px; }
          thead th:nth-child(2) { text-align: center; }
          thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
          .total-row { font-weight: 700; font-size: 15px; background: #f0f4ff; }
          .total-row td { padding: 10px 12px; }
          .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; }
          .badge-paid { background: #d1fae5; color: #065f46; }
          .badge-pending { background: #fef3c7; color: #92400e; }
          .footer { margin-top: 40px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 16px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company-name">${COMPANY.name}</div>
            <div class="company-sub">${COMPANY.address}<br>${COMPANY.phone} | ${COMPANY.email}<br>GSTIN: ${COMPANY.gstin}</div>
          </div>
          <div>
            <div class="invoice-title">${order.billType === "SPECIAL PRICE" ? "ESTIMATE" : "INVOICE"}</div>
            <div class="invoice-meta">Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
            <div class="invoice-meta">Bill Type: ${order.billType}</div>
            <div class="invoice-meta">Payment: <span class="badge ${order.paymentStatus === "Paid" ? "badge-paid" : "badge-pending"}">${order.paymentStatus}</span></div>
          </div>
        </div>

        <hr class="divider">

        <div class="info-grid">
          <div class="info-box">
            <div class="section-title">Bill To</div>
            <p><strong>${order.customerName}</strong></p>
            <p>📞 ${order.mobileNo}</p>
            ${order.gstNo ? `<p>GSTIN: ${order.gstNo}</p>` : ""}
            <p>${order.shippingAddress}</p>
          </div>
          <div class="info-box">
            <div class="section-title">Order Info</div>
            <p>Material Type: ${order.materialType}</p>
            <p>Payment Status: ${order.paymentStatus}</p>
          </div>
        </div>

        <div class="section-title">Order Items</div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" style="text-align:right;padding:10px 12px;">GRAND TOTAL</td>
              <td style="text-align:right;padding:10px 12px;">₹${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div class="footer">
          Thank you for your business! — ${COMPANY.name}
        </div>
        <script>window.onload = function(){ window.print(); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
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

      {/* Add Product Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
        sx={{
          mb: 2,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          borderRadius: 2.5, fontWeight: 700, textTransform: "none", px: 3,
          boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
          "&:hover": { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", transform: "translateY(-1px)" },
          transition: "all 0.2s",
        }}
      >
        🛍️ Browse &amp; Add Products
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
                const price = getPriceByBillType(item.variant, formData.billType);
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
                        inputProps={{ min: 1, style: { width: "70px" } }}
                      />
                    </TableCell>
                    <TableCell>₹{price.toFixed(2)}</TableCell>
                    <TableCell>₹{(price * item.quantity).toFixed(2)}</TableCell>
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
          onClick={() => {
            if (!validateForm()) {
              setSnackbar({ open: true, message: "Please fix the validation errors", severity: "error" });
              return;
            }
            if (!cart.length) {
              setSnackbar({ open: true, message: "Cart is empty", severity: "error" });
              return;
            }
            setConfirmOrder(true);
          }}
          disabled={isSubmitting || !formData.name || !formData.mobileNo || !formData.address || !cart.length}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
          sx={{ px: 4, py: 1.5, fontSize: "1.1rem", borderRadius: 2.5, fontWeight: 700,
            background: "linear-gradient(135deg,#16a34a,#15803d)",
            "&:hover": { background: "linear-gradient(135deg,#15803d,#166534)" } }}
        >
          {isSubmitting ? "Placing Order…" : "Place Order"}
        </Button>
      </Box>

      {/* PRODUCT BROWSER — two-level popup */}
      <MemoProductBrowser open={openDialog} onClose={() => setOpenDialog(false)} />

      {/* ORDER CONFIRMATION */}
      <ConfirmDialog
        open={confirmOrder}
        title="Confirm Order"
        message={`Place order for ${cart.length} item(s) totalling ₹${calculateEstimateCost()} for ${formData.name}?`}
        confirmLabel="Yes, Place Order"
        cancelLabel="Review Again"
        confirmColor="success"
        icon="warning"
        onConfirm={() => { setConfirmOrder(false); handlePlaceOrder(); }}
        onCancel={() => setConfirmOrder(false)}
      />

      {/* SUCCESS POPUP */}
      <Dialog
        open={!!successOrder}
        onClose={() => setSuccessOrder(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            color: "white",
            py: 2.5,
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CheckCircleIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Order Placed Successfully!
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {successOrder &&
                  new Date(successOrder.createdAt).toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: "grey.50" }}>
          {successOrder && (
            <Box>
              {/* Customer Summary */}
              <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  textTransform="uppercase"
                  display="block"
                  mb={0.5}
                >
                  Customer
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {successOrder.customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📞 {successOrder.mobileNo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📍 {successOrder.shippingAddress}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={successOrder.billType}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={successOrder.materialType}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`Payment: ${successOrder.paymentStatus}`}
                    size="small"
                    color={
                      successOrder.paymentStatus === "Paid"
                        ? "success"
                        : "warning"
                    }
                    variant="outlined"
                  />
                </Box>
              </Paper>

              {/* Items Summary */}
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  textTransform="uppercase"
                  display="block"
                  mb={1}
                >
                  Items Ordered
                </Typography>
                {successOrder.items.map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 0.75,
                      borderBottom:
                        i < successOrder.items.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                    }}
                  >
                    <Typography variant="body2">
                      {item.name}{" "}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        × {item.quantity}
                      </Typography>
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography fontWeight={700}>Grand Total</Typography>
                  <Typography fontWeight={700} color="success.main">
                    ₹{successOrder.totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1, bgcolor: "grey.50" }}>
          <Button
            variant="outlined"
            onClick={() => setSuccessOrder(null)}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<PrintIcon />}
            onClick={() => handlePrintInvoice(successOrder)}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Print Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* MY ORDER HISTORY */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          📦 My Order History
        </Typography>

        {ordersLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : myOrders.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            No orders placed yet.
          </Typography>
        ) : (
          /* Mobile-responsive: horizontal scroll on small screens */
          <TableContainer
            component={Paper}
            sx={{ overflowX: "auto", borderRadius: 2 }}
          >
            <Table size="small" sx={{ minWidth: { xs: 500, sm: 700 } }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f0f4ff" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  {/* Hide some cols on xs for readability */}
                  <TableCell
                    sx={{ fontWeight: 700, display: { xs: "none", sm: "table-cell" } }}
                  >
                    Bill Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myOrders.map((order) => {
                  const statusColors = {
                    Pending: "warning",
                    Completed: "success",
                    Cancelled: "error",
                  };
                  return (
                    <TableRow key={order._id} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{order.customerName || "—"}</TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", sm: "table-cell" } }}
                      >
                        {order.billType || "—"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        ₹{order.totalAmount?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={statusColors[order.status] || "default"}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        {order.status === "Completed" ? (
                          <IconButton
                            size="small"
                            color="error"
                            disabled={deletingOrderId === order._id}
                            onClick={() => setConfirmDeleteOrderId(order._id)}
                          >
                            {deletingOrderId === order._id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </IconButton>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* SNACKBAR FOR NOTIFICATIONS */}

      {/* Delete Order Confirm */}
      <ConfirmDialog
        open={!!confirmDeleteOrderId}
        title="Delete Order"
        message="Are you sure you want to delete this completed order? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        icon="delete"
        onConfirm={() => handleDeleteMyOrder(confirmDeleteOrderId)}
        onCancel={() => setConfirmDeleteOrderId(null)}
      />

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