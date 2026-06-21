// components/admin/shared/PaymentStatusChip.jsx
import React from "react";
import { Chip } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: 12,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
}));

const PaymentStatusChip = ({ paymentStatus }) => {
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

export default PaymentStatusChip;