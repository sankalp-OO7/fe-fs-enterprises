import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import EditIcon from "@mui/icons-material/Edit";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { styled, alpha } from "@mui/material/styles";
import Lottie from "lottie-react";
import gearsAnimation from "../../../lottie-animations/settings-gears.json";

const StyledCard = styled(Card)(({ theme }) => ({
  width: "300px",
  height: "340px",
  display: "flex",
  flexDirection: "column",
  borderRadius: "16px",
  overflow: "hidden",
  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  cursor: "pointer",
  background: theme.palette.background.paper,
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    height: "auto",
    minHeight: "300px",
  },
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 16px 48px rgba(0,0,0,0.13)",
    borderColor: alpha(theme.palette.primary.main, 0.28),
    "& .product-image": {
      transform: "scale(1.06)",
    },
    "& .view-btn": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

const ImageBox = styled(Box)({
  position: "relative",
  overflow: "hidden",
  width: "100%",
  height: "160px",
  flexShrink: 0,
});

const ProductCard = ({
  product,
  categories,
  isAdmin,
  isAuthenticated,
  onAddToCart,
  onAddSingleVariant,
  onProductClick, // optional override — used in memo popup context
}) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const categoryName =
    product.categoryId?.name ||
    categories.find((c) => c._id === product.categoryId)?.name ||
    "Uncategorized";

  const mainVariant = product?.variants?.[0] || {};

  const displayImage =
    mainVariant?.imageUrl ||
    (product.imageUrl &&
    product.imageUrl !== "https://example.com/default-product.jpg"
      ? product.imageUrl
      : null);

  const handleUpdateClick = (e) => {
    e.stopPropagation();
    navigate(`/product/update/${product._id}`);
  };

  return (
    <StyledCard
      ref={cardRef}
      onClick={() => onProductClick ? onProductClick(product) : navigate(`/products/${product._id}`)}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition:
          "opacity 0.45s ease, transform 0.45s ease, box-shadow 0.35s ease, border-color 0.35s ease",
      }}
    >
      {/* ─── Image / Lottie area ─── */}
      <ImageBox>
        {displayImage ? (
          <Box
            component="img"
            src={displayImage}
            alt={product.productName}
            className="product-image"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
            }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #f0f9ff 100%)",
            }}
          >
            <Lottie
              animationData={gearsAnimation}
              loop
              autoplay
              style={{ width: "55%", maxWidth: 140 }}
            />
          </Box>
        )}

        {/* Category chip */}
        <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
          <Chip
            icon={<LocalOfferIcon sx={{ fontSize: 14 }} />}
            label={categoryName}
            size="small"
            sx={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              fontWeight: 700,
              fontSize: "0.7rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              height: 24,
            }}
          />
        </Box>

        {/* Admin Edit button */}
        {isAdmin && (
          <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon sx={{ fontSize: 14 }} />}
              onClick={handleUpdateClick}
              sx={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(8px)",
                color: "primary.main",
                fontWeight: 600,
                fontSize: "0.7rem",
                px: 1.2,
                py: 0.4,
                minWidth: "unset",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                "&:hover": { background: "rgba(255,255,255,1)" },
              }}
            >
              Edit
            </Button>
          </Box>
        )}
      </ImageBox>

      {/* ─── Card body ─── */}
      <CardContent
        sx={{
          p: 2,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "0.85rem", sm: "0.9rem" },
            lineHeight: 1.35,
            color: "text.primary",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            height: "2.7em",
          }}
        >
          {product.productName}
        </Typography>

        {/* Description – always 2 lines, clipped with ellipsis */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            height: "3em",        // fixed 2-line height
            textOverflow: "ellipsis",
          }}
        >
          {product.description || "\u00a0"}
        </Typography>

        {/* View Details CTA */}
        <Box
          className="view-btn"
          sx={{
            mt: "auto",
            pt: 1,
            opacity: { xs: 1, sm: 0 },
            transform: { xs: "none", sm: "translateY(4px)" },
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "none",
              color: "primary.main",
              p: 0,
              "&:hover": { background: "transparent", textDecoration: "underline" },
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default ProductCard;