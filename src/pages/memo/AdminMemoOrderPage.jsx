import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Alert,
  Card,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Grid,
  Snackbar,
  TableFooter,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination as MuiPagination,
  Tooltip,
} from "@mui/material";
import { styled, alpha, keyframes } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import axiosClient from "../../api/axiosClient";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  position: "sticky",
  top: 0,
  zIndex: 10,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.common.black,
  fontWeight: 700,
  fontSize: "0.875rem",
  borderBottom: "none",
  padding: theme.spacing(2),
  textTransform: "uppercase",
  letterSpacing: "0.5px",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
    transform: "translateY(-2px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  cursor: "pointer",
  transition: "all 0.3s ease",
  borderLeft: "3px solid transparent",
  "&:hover": {
    borderLeftColor: theme.palette.primary.main,
  },
}));

const GradientBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: "24px",
  padding: theme.spacing(4),
  color: "white",
  marginBottom: theme.spacing(3),
  position: "relative",
  overflow: "hidden",
  // boxShadow: "0 8px 32px rgba(33, 150, 243, 0.3)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    right: "-50%",
    width: "200%",
    height: "200%",
    background: `radial-gradient(circle, ${alpha("#ffffff", 0.15)} 0%, transparent 70%)`,
    animation: "float 8s ease-in-out infinite",
  },
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-20px) rotate(180deg)" },
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 600,
  textTransform: "capitalize",
  fontSize: "0.875rem",
  minHeight: 48,
  transition: "all 0.3s ease",
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
    },
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: 12,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
}));

const AdminMemoOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [tabValue, setTabValue] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders;

    if (tabValue !== "All") {
      filtered = filtered.filter((order) => order.status === tabValue);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.userId?.username?.toLowerCase().includes(query) ||
          order.userId?.email?.toLowerCase().includes(query) ||
          order.customerName?.toLowerCase().includes(query) ||
          order.gstNo?.toLowerCase().includes(query) ||
          order.shippingAddress?.toLowerCase().includes(query)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "-createdAt":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "createdAt":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "-totalAmount":
          return b.totalAmount - a.totalAmount;
        case "totalAmount":
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

    return sorted;
  }, [orders, tabValue, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / rowsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredAndSortedOrders.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedOrders, page, rowsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [tabValue, searchQuery, sortBy]);

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
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );

        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }

        setSnackbarMessage(`Order status updated to ${newStatus}`);
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarMessage("Failed to update order status");
      setSnackbarOpen(true);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      Pending: { color: "warning", icon: "⏳" },
      Completed: { color: "success", icon: "✅" },
      Cancelled: { color: "error", icon: "❌" },
    };
    const config = statusConfig[status] || { color: "default", icon: "📦" };

    return (
      <StyledChip
        label={`${config.icon} ${status}`}
        color={config.color}
        size="small"
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
      <StyledChip
        label={`${config.icon} ${paymentStatus}`}
        color={config.color}
        variant="outlined"
        size="small"
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
        <Box textAlign="center" sx={{ animation: `${fadeIn} 0.6s ease` }}>
          <CircularProgress size={60} thickness={4} />
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
        <Alert
          severity="error"
          sx={{ borderRadius: 3, animation: `${fadeIn} 0.6s ease` }}
        >
          <Typography variant="h6">{error}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 6, px: { xs: 2, sm: 3 } }}>
      {/* Hero Section */}
      <GradientBox sx={{ animation: `${fadeIn} 0.6s ease` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TrendingUpIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                mb: 0.5,
              }}
            >
              Memo Management 📋
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.95, fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              Track and manage all customer orders with ease
            </Typography>
          </Box>
        </Box>
      </GradientBox>

      {/* Status Tabs */}
      <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 2, animation: `${fadeIn} 0.8s ease` }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <StyledTab value="All" label={`All (${orders.length})`} />
          <StyledTab
            value="Pending"
            label={`Pending (${orders.filter((o) => o.status === "Pending").length})`}
          />
          <StyledTab
            value="Completed"
            label={`Completed (${orders.filter((o) => o.status === "Completed").length})`}
          />
          <StyledTab
            value="Cancelled"
            label={`Cancelled (${orders.filter((o) => o.status === "Cancelled").length})`}
          />
        </Tabs>
      </Card>

      {/* Controls */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          alignItems: "center",
          animation: `${fadeIn} 1s ease`,
        }}
      >
        <SearchField
          size="small"
          placeholder="Search orders, email, name, GST..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: { xs: "100%", sm: 300 } }}
        />

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Rows</InputLabel>
          <Select
            label="Rows"
            value={rowsPerPage}
            onChange={(e) => {
              setPage(1);
              setRowsPerPage(e.target.value);
            }}
            sx={{ borderRadius: 2 }}
          >
            {[10, 25, 50, 100].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sort</InputLabel>
          <Select
            label="Sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="-createdAt">Newest First</MenuItem>
            <MenuItem value="createdAt">Oldest First</MenuItem>
            <MenuItem value="-totalAmount">Amount ↓</MenuItem>
            <MenuItem value="totalAmount">Amount ↑</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Showing {paginatedOrders.length > 0 ? (page - 1) * rowsPerPage + 1 : 0}-
          {Math.min(page * rowsPerPage, filteredAndSortedOrders.length)} of{" "}
          {filteredAndSortedOrders.length}
        </Typography>
      </Box>

      {/* Table */}
      <Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden", animation: `${fadeIn} 1.2s ease` }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 420px)" }}>
          <Table stickyHeader size="medium" sx={{ minWidth: 1000 }}>
            <StyledTableHead>
              <TableRow>
                <StyledTableCell>Order By</StyledTableCell>
                <StyledTableCell>Customer</StyledTableCell>
                <StyledTableCell>GST No</StyledTableCell>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Amount</StyledTableCell>
                <StyledTableCell>Payment</StyledTableCell>
                <StyledTableCell>Method</StyledTableCell>
                <StyledTableCell>Address</StyledTableCell>
                <StyledTableCell>Items</StyledTableCell>
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order, index) => (
                  <StyledTableRow
                    key={order._id}
                    onClick={() => handleOrderClick(order)}
                    sx={{
                      animation: `${fadeIn} ${0.3 + index * 0.05}s ease`,
                    }}
                  >
                    <TableCell sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {order.userId?.username || "Deleted User"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.userId?.email || "N/A"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 2 }}>
                      {order.customerName || "—"}
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>{order.gstNo || "N/A"}</TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 2 }}>
                      {getStatusChip(order.status)}
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "success.main" }}
                      >
                        ₹{order.totalAmount?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      {getPaymentStatusChip(order.paymentStatus)}
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      {order.paymentMethod || "—"}
                    </TableCell>
                    <Tooltip title={order.shippingAddress || "N/A"} arrow>
                      <TableCell
                        sx={{
                          p: 2,
                          maxWidth: 150,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {order.shippingAddress || "N/A"}
                      </TableCell>
                    </Tooltip>
                    <TableCell sx={{ p: 2 }}>
                      <Chip
                        label={`${order.items?.length || 0} items`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      😔 No orders found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your filters or search query
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 3,
            animation: `${fadeIn} 1.4s ease`,
          }}
        >
          <MuiPagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 600,
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              },
              "& .Mui-selected": {
                background:
                  "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%) !important",
                color: "white",
                boxShadow: "0 4px 12px rgba(33, 150, 243, 0.4)",
              },
            }}
          />
        </Box>
      )}

      {/* Order Detail Dialog */}
      <Dialog
        open={orderDetailOpen}
        onClose={handleCloseOrderDetail}
        maxWidth="md"
        fullWidth
        scroll="paper"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              boxShadow: 24,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
            color: "white",
            px: 3,
            py: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              📋 Memo Details
            </Typography>
            <IconButton
              onClick={handleCloseOrderDetail}
              size="small"
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: "grey.50" }}>
          {selectedOrder && (
            <Box>
              {/* Customer Details */}
              <Card
                sx={{
                  borderRadius: 3,
                  mb: 2,
                  overflow: "hidden",
                  boxShadow: 2,
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 1.5,
                    bgcolor: "primary.main",
                    color: "white",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    👤 Customer Details
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        NAME
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedOrder.userId?.username || "Deleted User"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedOrder.userId?.email || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        ADDRESS
                      </Typography>
                      <Typography variant="body2">
                        {selectedOrder.shippingAddress}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Card>

              {/* Order Items */}
              <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 2 }}>
                <Box
                  sx={{
                    px: 3,
                    py: 1.5,
                    bgcolor: "success.main",
                    color: "white",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    🛒 Order Items
                  </Typography>
                </Box>

                <TableContainer sx={{ maxHeight: 350 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>
                          Product
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 700, bgcolor: "grey.100" }}
                        >
                          With GST
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 700, bgcolor: "grey.100" }}
                        >
                          Without GST
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item, i) => {
                        const priceWithGst =
                          (item.priceWithGst ?? item.price) * item.quantity;
                        const priceWithoutGst =
                          (item.priceWithoutGst ?? item.price) * item.quantity;
                        return (
                          <TableRow key={item._id || i} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.productId?.name || "Product N/A"}
                              </Typography>
                              <Chip
                                label={`Qty: ${item.quantity}`}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "primary.main" }}
                              >
                                ₹{priceWithGst.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ₹{priceWithoutGst.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <TableFooter>
                      {(() => {
                        const totals = selectedOrder.items.reduce(
                          (acc, it) => {
                            acc.with +=
                              (it.priceWithGst ?? it.price) * it.quantity;
                            acc.without +=
                              (it.priceWithoutGst ?? it.price) * it.quantity;
                            return acc;
                          },
                          { with: 0, without: 0 }
                        );
                        return (
                          <TableRow>
                            <TableCell
                              sx={{ fontWeight: 700, bgcolor: "grey.100" }}
                            >
                              TOTAL
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 700, bgcolor: "grey.100" }}
                            >
                              ₹{totals.with.toFixed(2)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 700, bgcolor: "grey.100" }}
                            >
                              ₹{totals.without.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })()}
                    </TableFooter>
                  </Table>
                </TableContainer>
              </Card>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1, bgcolor: "grey.50" }}>
          <Button
            onClick={handleCloseOrderDetail}
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Close
          </Button>
          <Button
            onClick={() =>
              handleStatusChange(selectedOrder._id, "Cancelled")
            }
            color="error"
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 600 }}
            disabled={statusUpdateLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleStatusChange(selectedOrder._id, "Pending")}
            color="warning"
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 600 }}
            disabled={statusUpdateLoading}
          >
            Pending
          </Button>
          <Button
            onClick={() =>
              handleStatusChange(selectedOrder._id, "Completed")
            }
            color="success"
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 600 }}
            disabled={statusUpdateLoading}
          >
            Complete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
          sx={{ borderRadius: 3, fontWeight: 600, boxShadow: 8 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminMemoOrdersPage;
