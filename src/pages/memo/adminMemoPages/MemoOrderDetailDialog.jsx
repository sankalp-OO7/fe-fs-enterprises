// components/admin/MemoOrders/MemoOrderDetailDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Card,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import MemoOrderPrint from "./MemoOrderPrint";

const MemoOrderDetailDialog = ({
  open,
  order,
  onClose,
  onStatusChange,
  onDelete,
  statusUpdateLoading,
  deleteOrderLoading,
}) => {
  if (!order) return null;

  // Calculate totals
  const totals = order.items.reduce(
    (acc, it) => {
      acc.with += (it.priceWithGst ?? it.price) * it.quantity;
      acc.without += (it.priceWithoutGst ?? it.price) * it.quantity;
      return acc;
    },
    { with: 0, without: 0 }
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            📋 Memo Details
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "grey.50" }}>
        <Box>
          {/* Customer Details */}
          <Card sx={{ borderRadius: 3, mb: 2, mt: 2, overflow: "hidden", boxShadow: 2 }}>
            <Box sx={{ px: 3, py: 1.5, bgcolor: "primary.main", color: "white" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                👤 Customer Details
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">NAME</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {order.userId?.username || "Deleted User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.userId?.email || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">CONTACT</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {order.mobileNo || "—"}
                  </Typography>
                  <Typography variant="body2">{order.shippingAddress}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">BILL TYPE</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {order.billType || "Regular"}
                    {order.gstNo && ` | GST: ${order.gstNo}`}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Card>

          {/* Order Items */}
          <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 2 }}>
            <Box sx={{ px: 3, py: 1.5, bgcolor: "success.main", color: "white" }}>
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
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "grey.100" }}>
                      With GST
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "grey.100" }}>
                      Without GST
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, i) => {
                    const priceWithGst = (item.priceWithGst ?? item.price) * item.quantity;
                    const priceWithoutGst = (item.priceWithoutGst ?? item.price) * item.quantity;
                    return (
                      <TableRow key={item._id || i} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.productId?.productName || "Product N/A"}
                          </Typography>
                          <Chip label={`Qty: ${item.quantity}`} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
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
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>
                      TOTAL
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "grey.100" }}>
                      ₹{totals.with.toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "grey.100" }}>
                      ₹{totals.without.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          px: 3,
          py: 2,
          gap: 1,
          bgcolor: "grey.50",
          flexWrap: "wrap",
        }}
      >
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>
          Close
        </Button>
        <Button
          onClick={() => onStatusChange(order._id, "Cancelled")}
          color="error"
          variant="outlined"
          sx={{ borderRadius: 2, fontWeight: 600 }}
          disabled={statusUpdateLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onStatusChange(order._id, "Pending")}
          color="warning"
          variant="outlined"
          sx={{ borderRadius: 2, fontWeight: 600 }}
          disabled={statusUpdateLoading}
        >
          Pending
        </Button>
        <Button
          onClick={() => onStatusChange(order._id, "Completed")}
          color="success"
          variant="contained"
          sx={{ borderRadius: 2, fontWeight: 600 }}
          disabled={statusUpdateLoading}
        >
          Complete
        </Button>

        {/* NEW: Print component */}
        <MemoOrderPrint order={order} />

        {order.status === "Completed" && (
          <Button
            onClick={() => onDelete(order._id)}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={deleteOrderLoading}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {deleteOrderLoading ? "Deleting…" : "Delete Order"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MemoOrderDetailDialog;