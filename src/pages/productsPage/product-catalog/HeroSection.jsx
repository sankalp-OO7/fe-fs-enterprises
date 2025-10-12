import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

const GradientBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: "24px",
  padding: theme.spacing(4),
  color: "white",
  marginBottom: theme.spacing(4),
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    right: "-50%",
    width: "200%",
    height: "200%",
    background: `radial-gradient(circle, ${alpha(
      "#ffffff",
      0.15
    )} 0%, transparent 70%)`,
    animation: "float 8s ease-in-out infinite",
  },
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-30px) rotate(180deg)" },
  },
}));

const HeroSection = () => {
  return (
    <GradientBox>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              textShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            Product Catalog ✨
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.95,
              fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.25rem" },
              fontWeight: 500,
            }}
          >
            Discover amazing products with our smart filtering system
          </Typography>
        </Box>
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            fontSize: "5rem",
            opacity: 0.25,
            position: "relative",
            zIndex: 1,
          }}
        >
          🛍️
        </Box>
      </Stack>
    </GradientBox>
  );
};

export default HeroSection;
