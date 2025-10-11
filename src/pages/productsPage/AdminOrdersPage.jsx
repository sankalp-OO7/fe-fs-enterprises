import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Alert,
  Card,
  CardContent,
  Container,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  TableFooter,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentIcon from "@mui/icons-material/Payment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axiosClient from "../../api/axiosClient";

// Styled Components with fixed spacing
const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: "white",
  fontWeight: 700,
  fontSize: "0.95rem",
  borderBottom: "none",
  padding: theme.spacing(2), // Fixed spacing
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: "translateY(-1px)",
    transition: "all 0.2s ease-in-out",
  },
  cursor: "pointer",
  "& .MuiTableCell-root": {
    padding: theme.spacing(2), // Consistent cell padding
  },
}));

const GradientBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: "20px",
  padding: theme.spacing(4),
  color: "white",
  marginBottom: theme.spacing(3), // Fixed margin
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    right: "-50%",
    width: "200%",
    height: "200%",
    background: `radial-gradient(circle, ${alpha(
      "#ffffff",
      0.1
    )} 0%, transparent 70%)`,
    animation: "float 6s ease-in-out infinite",
  },
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-20px) rotate(180deg)" },
  },
}));

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axiosClient.get("/orders");
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const handleCloseOrderDetail = () => {
    setOrderDetailOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdateLoading(true);
    try {
      const response = await axiosClient.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      if (response.status === 200) {
        // Update the orders list
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );

        // Update selected order if it's currently open
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }

        setSnackbarMessage(`Order status updated to ${newStatus}`);
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      setSnackbarMessage("Failed to update order status");
      setSnackbarOpen(true);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Status color mapping
  const getStatusChip = (status) => {
    const statusConfig = {
      Pending: { color: "warning", icon: "⏳" },
      Completed: { color: "success", icon: "✅" },
      Cancelled: { color: "error", icon: "❌" },
    };
    const config = statusConfig[status] || { color: "default", icon: "📦" };

    return (
      <Chip
        label={`${config.icon} ${status}`}
        color={config.color}
        size="small"
        sx={{
          fontWeight: 600,
          borderRadius: "8px",
        }}
      />
    );
  };

  const getPaymentStatusChip = (paymentStatus) => {
    const paymentConfig = {
      Paid: { color: "success", icon: "💳" },
      Pending: { color: "warning", icon: "⏰" },
      Failed: { color: "error", icon: "❌" },
    };
    const config = paymentConfig[paymentStatus] || {
      color: "default",
      icon: "💰",
    };

    return (
      <Chip
        label={`${config.icon} ${paymentStatus}`}
        color={config.color}
        variant="outlined"
        size="small"
        sx={{
          fontWeight: 600,
          borderRadius: "8px",
        }}
      />
    );
  };

  if (loading) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
            Loading orders...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: "15px" }}>
          <Typography variant="h6">{error}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 6, px: { xs: 2, sm: 3 } }}>
      {/* Hero Section */}
      <GradientBox>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 900, fontSize: { xs: "2rem", md: "3rem" }, mb: 2 }}
        >
          Memo Management 📋
        </Typography>
        <Typography
          variant="h6"
          sx={{ opacity: 0.9, fontSize: { xs: "1rem", md: "1.25rem" } }}
        >
          Track and manage all customer orders
        </Typography>
      </GradientBox>

      {/* Orders Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          Orders Overview ({orders.length} total)
        </Typography>
      </Box>

      {/* Orders Table */}
      <Card elevation={3} sx={{ borderRadius: "20px", overflow: "hidden" }}>
        <TableContainer>
          <Table aria-label="orders table" sx={{ minWidth: 1200 }}>
            <StyledTableHead>
              <TableRow>
                <StyledTableCell>Order ID</StyledTableCell>
                <StyledTableCell>Customer</StyledTableCell>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Amount</StyledTableCell>
                <StyledTableCell>Payment</StyledTableCell>
                <StyledTableCell>Address</StyledTableCell>
                <StyledTableCell>Items</StyledTableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {orders.map((order, index) => (
                <StyledTableRow
                  key={order._id}
                  onClick={() => handleOrderClick(order)}
                  sx={{
                    "&:hover": {
                      backgroundColor: alpha("#2196F3", 0.12),
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", color: "primary.main" }}
                    >
                      #{order._id.slice(-8)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        minHeight: "48px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, lineHeight: 1.2, mb: 0.5 }}
                      >
                        {order.userId?.username || "Deleted User"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.userId?.email}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        minHeight: "48px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, lineHeight: 1.2, mb: 0.5 }}
                      >
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        minHeight: "48px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {getStatusChip(order.status)}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        minHeight: "48px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "success.main" }}
                      >
                        ₹{order.totalAmount?.toFixed(2)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        minHeight: "48px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {getPaymentStatusChip(order.paymentStatus)}
                    </Box>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 180 }}>
                    <Box
                      sx={{
                        minHeight: "48px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          lineHeight: 1.4,
                        }}
                        title={order.shippingAddress}
                      >
                        {order.shippingAddress}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        minHeight: "48px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "primary.main",
                          fontWeight: 600,
                          lineHeight: 1.2,
                          mb: 0.5,
                        }}
                      >
                        {order.items.length} item(s)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Click to view
                      </Typography>
                    </Box>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {orders.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="h4" color="text.secondary" gutterBottom>
            📦
          </Typography>
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Orders will appear here once customers start placing them.
          </Typography>
        </Box>
      )}

      {/* Order Detail Modal */}
      <Dialog
        open={orderDetailOpen}
        onClose={handleCloseOrderDetail}
        maxWidth="md"
        fullWidth
        scroll="paper"
        keepMounted
        BackdropProps={{
          transitionDuration: 200,
          sx: {
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(3px)",
          },
        }}
        // Prefer slotProps.paper; if using older MUI, copy sx into PaperProps.sx
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              overflow: "hidden",
              outline: "1px solid rgba(0,0,0,0.08)",
              boxShadow: (t) => t.shadows[10],
              backgroundImage: "linear-gradient(145deg, #ffffff, #f8f9fa)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            px: 3,
            py: 1.5,
            bgcolor: "background.paper",
            backdropFilter: "saturate(180%) blur(6px)",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              Memo Details
            </Typography>
            <IconButton onClick={handleCloseOrderDetail} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            "& .MuiCard-root": { boxShadow: "none" },
            "&::-webkit-scrollbar": { width: 8 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: 8,
            },
          }}
        >
          {selectedOrder && (
            <Box sx={{ p: 3 }}>
              {/* --- Customer details panel --- */}
              <Box
                sx={{
                  borderRadius: 3,
                  border: "2px solid",
                  borderColor: "grey.300",
                  mb: 3,
                  overflow: "hidden",
                  bgcolor: "background.paper",
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 1.25,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    customer details
                  </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "text.secondary", mb: 0.5 }}
                      >
                        Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedOrder.userId?.username || "Deleted User"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedOrder.userId?.email || "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "text.secondary", mb: 0.5 }}
                      >
                        Address
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                        {selectedOrder.shippingAddress}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              {/* --- Order details panel --- */}
              <Box
                sx={{
                  borderRadius: 3,
                  border: "2px solid",
                  borderColor: "grey.300",
                  overflow: "hidden",
                  bgcolor: "background.paper",
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 1.25,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    order details
                  </Typography>
                </Box>

                {/* Items table */}
<TableContainer
  sx={{
    boxShadow: "none",
    minHeight: { xs: 220, sm: 280 },
    maxHeight: { xs: 360, sm: 440 },
    overflowY: "auto",
  }}
>
  <Table size="small" stickyHeader aria-label="order items table">
    <TableHead>
      <TableRow sx={{ "& th": { fontWeight: 700 } }}>
        <TableCell sx={{ width: "70%", borderRight: "1px solid", borderColor: "divider" }}>
          product name
        </TableCell>
        <TableCell align="right" sx={{ width: "15%", borderRight: "1px solid", borderColor: "divider" }}>
          withGST
        </TableCell>
        <TableCell align="right" sx={{ width: "15%" }}>
          without GST
        </TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {selectedOrder.items.map((item, i) => {
        const priceWithGst = (item.priceWithGst ?? item.price) * item.quantity;
        const priceWithoutGst = (item.priceWithoutGst ?? item.price) * item.quantity;
        return (
          <TableRow key={item._id || i} hover>
            <TableCell sx={{ borderRight: "1px solid", borderColor: "divider" }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {item.productId?.name || "Product N/A"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Qty: {item.quantity}
              </Typography>
            </TableCell>
            <TableCell align="right" sx={{ borderRight: "1px solid", borderColor: "divider" }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.main" }}>
                ₹{priceWithGst.toFixed(2)}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                ₹{priceWithoutGst.toFixed(2)}
              </Typography>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
    <TableFooter
      sx={{
        "& .MuiTableCell-root": {
          position: "sticky",
          bottom: 0,
          zIndex: 3,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          fontWeight: 700,
        },
      }}
    >
      {(() => {
        const totals = selectedOrder.items.reduce(
          (acc, it) => {
            acc.with += (it.priceWithGst ?? it.price) * it.quantity;
            acc.without += (it.priceWithoutGst ?? it.price) * it.quantity;
            return acc;
          },
          { with: 0, without: 0 }
        );
        return (
          <TableRow>
            <TableCell sx={{ borderRight: "1px solid", borderColor: "divider" }}>
              total
            </TableCell>
            <TableCell align="right" sx={{ borderRight: "1px solid", borderColor: "divider" }}>
              ₹{totals.with.toFixed(2)}
            </TableCell>
            <TableCell align="right">
              ₹{totals.without.toFixed(2)}
            </TableCell>
          </TableRow>
        );
      })()}
    </TableFooter>
  </Table>
</TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            position: "sticky",
            bottom: 0,
            zIndex: 2,
            px: 3,
            py: 2,
            gap: 1.5,
            flexWrap: "wrap",
            justifyContent: "flex-start",
            bgcolor: "background.paper",
            backdropFilter: "saturate(180%) blur(6px)",
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Button
            onClick={handleCloseOrderDetail}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            close
          </Button>

          <Button
            onClick={() => handleStatusChange(selectedOrder._id, "Cancelled")}
            color="error"
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
            disabled={statusUpdateLoading}
          >
            canceled
          </Button>

          <Button
            onClick={() => handleStatusChange(selectedOrder._id, "Pending")}
            color="warning"
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
            disabled={statusUpdateLoading}
          >
            pending
          </Button>

          <Button
            onClick={() => handleStatusChange(selectedOrder._id, "Completed")}
            color="success"
            variant="contained"
            sx={{ borderRadius: 2, px: 3 }}
            disabled={statusUpdateLoading}
          >
            completed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMessage.includes("Failed") ? "error" : "success"}
          icon={<CheckCircleIcon />}
          sx={{ borderRadius: "12px", fontWeight: 600 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminOrdersPage;
