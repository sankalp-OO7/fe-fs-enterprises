// components/admin/AdminMemoOrdersPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Card,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Snackbar,
  Tabs,
  Tab,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axiosClient from "../../api/axiosClient";
import ConfirmDialog from "../../components/ConfirmDialog";

// Import split components
import PageHeader from "./adminMemoPages/PageHeader";
import MemoOrderFilters from "./adminMemoPages/MemoOrderFilters";
import MemoOrderTable from "./adminMemoPages/MemoOrderTable";
import MemoOrderDetailDialog from "./adminMemoPages/MemoOrderDetailDialog";
import StatusChip from "./adminMemoPages/StatusChip";
import PaymentStatusChip from "./adminMemoPages/PaymentStatusChip";
import { StyledTab } from "./adminMemoPages/StyledComponents";
import { fadeIn } from "./adminMemoPages/Animations";

const GradientBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: "24px",
  padding: theme.spacing(4),
  color: "white",
  marginBottom: theme.spacing(3),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    right: "-50%",
    width: "200%",
    height: "200%",
    // background: `radial-gradient(circle, ${alpha("#ffffff", 0.15)} 0%, transparent 70%)`,
    animation: "float 8s ease-in-out infinite",
  },
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-20px) rotate(180deg)" },
  },
}));

const AdminMemoOrdersPage = () => {
  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [deleteOrderLoading, setDeleteOrderLoading] = useState(false);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [tabValue, setTabValue] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch orders
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

  // Filter & Sort
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

  // Handlers
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
        handleCloseOrderDetail();
      }
    } catch (err) {
      setSnackbarMessage("Failed to update order status");
      setSnackbarOpen(true);
    } finally {
      setStatusUpdateLoading(false);
      
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setConfirmDeleteOrderId(null);
    setDeleteOrderLoading(true);
    try {
      await axiosClient.delete(`/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      setSnackbarMessage("Order deleted successfully");
      setSnackbarOpen(true);
      handleCloseOrderDetail();
    } catch (err) {
      setSnackbarMessage(err.response?.data?.message || "Failed to delete order");
      setSnackbarOpen(true);
    } finally {
      setDeleteOrderLoading(false);
    }
  };

  const handleDeleteConfirm = (orderId) => {
    setConfirmDeleteOrderId(orderId);
  };

  // Loading & Error states
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
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
        <Alert severity="error" sx={{ borderRadius: 3, animation: `${fadeIn} 0.6s ease` }}>
          <Typography variant="h6">{error}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 6, px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <GradientBox sx={{ animation: `${fadeIn} 0.6s ease` }}>
        <PageHeader />
      </GradientBox>

      {/* Tabs */}
      <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 2, animation: `${fadeIn} 0.8s ease` }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" } }}
        >
          <StyledTab value="All" label={`All (${orders.length})`} />
          <StyledTab value="Pending" label={`Pending (${orders.filter((o) => o.status === "Pending").length})`} />
          <StyledTab value="Completed" label={`Completed (${orders.filter((o) => o.status === "Completed").length})`} />
          <StyledTab value="Cancelled" label={`Cancelled (${orders.filter((o) => o.status === "Cancelled").length})`} />
        </Tabs>
      </Card>

      {/* Filters */}
      <MemoOrderFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        page={page}
        setPage={setPage}
        totalItems={filteredAndSortedOrders.length}
        totalPages={totalPages}
      />

      {/* Table */}
      <Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden", animation: `${fadeIn} 1.2s ease` }}>
        <MemoOrderTable
          orders={paginatedOrders}
          onOrderClick={handleOrderClick}
          getStatusChip={(status) => <StatusChip status={status} />}
          getPaymentStatusChip={(paymentStatus) => <PaymentStatusChip paymentStatus={paymentStatus} />}
        />
      </Card>

      {/* Detail Dialog */}
      <MemoOrderDetailDialog
        open={orderDetailOpen}
        order={selectedOrder}
        onClose={handleCloseOrderDetail}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteConfirm}
        statusUpdateLoading={statusUpdateLoading}
        deleteOrderLoading={deleteOrderLoading}
      />

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

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!confirmDeleteOrderId}
        title="Delete Order"
        message="Permanently delete this order? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        icon="delete"
        onConfirm={() => handleDeleteOrder(confirmDeleteOrderId)}
        onCancel={() => setConfirmDeleteOrderId(null)}
      />
    </Container>
  );
};

export default AdminMemoOrdersPage;