import React from "react";
import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Hardware } from "@mui/icons-material";

const NavBrand = () => {
  return (
    <Box
      component={RouterLink}
      to="/products"
      sx={{
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
    >
      <Box
        sx={{
          width: { xs: 36, sm: 42 },
          height: { xs: 36, sm: 42 },
          borderRadius: 2,
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mr: { xs: 1.5, sm: 2 },
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 6px 30px rgba(0,0,0,0.4)",
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: { xs: "1rem", sm: "1.2rem" },
            color: "white",
          }}
        >
          FS
        </Typography>
      </Box>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: 0.5,
            color: "white",
            fontSize: { xs: "0.95rem", sm: "1.15rem", md: "1.25rem" },
            lineHeight: 1.2,
            background: "linear-gradient(to right, #ffffff, #e8e8e8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          FS Enterprises
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.8)",
            fontSize: { xs: "0.65rem", sm: "0.7rem" },
            fontWeight: 500,
            display: { xs: "none", sm: "block" },
          }}
        >
          Hardware Solutions
        </Typography>
      </Box>
    </Box>
  );
};

export default NavBrand;
