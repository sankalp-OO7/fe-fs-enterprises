import React from "react";
import { Paper, Typography, Stack, Box, Chip } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

const VariantPaper = styled(Paper)(({ theme, outofstock }) => ({
  padding: theme.spacing(1.5),
  borderRadius: "12px",
  background: outofstock
    ? "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)"
    : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
  border: `2px solid ${
    outofstock
      ? alpha(theme.palette.error.main, 0.2)
      : alpha(theme.palette.primary.main, 0.15)
  }`,
  transition: "all 0.3s ease",
  opacity: outofstock ? 0.6 : 1,
  "&:hover": {
    transform: outofstock ? "none" : "translateX(4px)",
    boxShadow: outofstock
      ? "none"
      : `0 3px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const PriceChip = styled(Chip)(({ theme }) => ({
  borderRadius: "10px",
  fontWeight: 800,
  fontSize: "0.8rem",
  height: 28,
  background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
  color: "white",
  "& .MuiChip-label": {
    px: 1.5,
  },
}));

const VariantCard = ({ variant }) => {
  const isOutOfStock = variant.stockQty === 0;

  return (
    <VariantPaper elevation={0} outofstock={isOutOfStock ? 1 : 0}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              mb: 0.3,
              fontSize: "0.85rem",
              color: isOutOfStock ? "text.disabled" : "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {variant.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: isOutOfStock ? "text.disabled" : "text.secondary",
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          >
            Stock: {variant.stockQty}
            {isOutOfStock && (
              <Chip
                label="Out"
                size="small"
                color="error"
                sx={{
                  ml: 0.5,
                  height: 16,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                }}
              />
            )}
          </Typography>
        </Box>

        <PriceChip label={`₹${variant.price.toFixed(2)}`} />
      </Stack>
    </VariantPaper>
  );
};

export default VariantCard;
