// components/admin/MemoOrders/MemoOrderRow.jsx
import React from "react";
import { TableCell, Typography, Chip, Tooltip } from "@mui/material";
import { StyledTableRow } from "./StyledComponents"; // ✅ Import from shared
import { fadeIn } from "./Animations";

const MemoOrderRow = ({
  order,
  index,
  onClick,
  getStatusChip,
  getPaymentStatusChip,
}) => {
  return (
    <StyledTableRow
      onClick={onClick}
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
        <Typography variant="h6" sx={{ fontWeight: 700, color: "success.main" }}>
          ₹{order.totalAmount?.toFixed(2)}
        </Typography>
      </TableCell>
      <TableCell sx={{ p: 2 }}>
        {getPaymentStatusChip(order.paymentStatus)}
      </TableCell>
      <TableCell sx={{ p: 2 }}>
        {order.mobileNo || "—"}
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
  );
};

export default MemoOrderRow;