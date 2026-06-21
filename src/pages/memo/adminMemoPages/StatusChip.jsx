// components/admin/shared/StatusChip.jsx
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

const StatusChip = ({ status }) => {
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

export default StatusChip;