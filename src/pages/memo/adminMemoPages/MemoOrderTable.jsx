// components/admin/MemoOrders/MemoOrderTable.jsx
import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  Typography,
  Chip,
  Tooltip,
  Box,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import MemoOrderRow from "./MemoOrderRow";
import { StyledTableHead, StyledTableCell } from "./StyledComponents";
import { fadeIn } from "./Animations";

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

const MemoOrderTable = ({
  orders,
  onOrderClick,
  getStatusChip,
  getPaymentStatusChip,
}) => {
  return (
    <TableContainer sx={{ maxHeight: "calc(100vh - 420px)", overflowX: "auto" }}>
      <Table stickyHeader size="medium" sx={{ minWidth: { xs: 700, md: 1000 } }}>
        <StyledTableHead>
          <TableRow>
            <StyledTableCell>Order By</StyledTableCell>
            <StyledTableCell>Customer</StyledTableCell>
            <StyledTableCell>GST No</StyledTableCell>
            <StyledTableCell>Date</StyledTableCell>
            <StyledTableCell>Status</StyledTableCell>
            <StyledTableCell>Amount</StyledTableCell>
            <StyledTableCell>Payment</StyledTableCell>
            <StyledTableCell>Customer Number</StyledTableCell>
            <StyledTableCell>Address</StyledTableCell>
            <StyledTableCell>Items</StyledTableCell>
          </TableRow>
        </StyledTableHead>

        <TableBody>
          {orders.length > 0 ? (
            orders.map((order, index) => (
              <MemoOrderRow
                key={order._id}
                order={order}
                index={index}
                onClick={() => onOrderClick(order)}
                getStatusChip={getStatusChip}
                getPaymentStatusChip={getPaymentStatusChip}
              />
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
  );
};

export default MemoOrderTable;