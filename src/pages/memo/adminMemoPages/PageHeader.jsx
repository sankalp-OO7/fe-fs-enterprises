// components/admin/MemoOrders/shared/PageHeader.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const PageHeader = () => {
  return (
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
          sx={{ 
            opacity: 0.95, 
            fontSize: { xs: "0.9rem", md: "1rem" } 
          }}
        >
          Track and manage all customer orders with ease
        </Typography>
      </Box>
    </Box>
  );
};

export default PageHeader;