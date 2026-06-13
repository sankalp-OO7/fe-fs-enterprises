import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, IconButton, Slide, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchCategories } from "../../api/product.api";
import MemoProductCatalog from "./MemoProductCatalog";
import MemoProductDetail from "./MemoProductDetail";
import { useCart } from "../../context/CartContext";

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const MemoProductBrowser = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductImg, setSelectedProductImg] = useState(null);
  const [toast, setToast] = useState("");
  const { getTotalCartItems } = useCart();

  // Pre-fetched on mount — instant when dialog opens
  const { data: products = [], isLoading: pLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts, staleTime: 5 * 60 * 1000 });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories, staleTime: 10 * 60 * 1000 });

  const handleSelect = (id, img) => { setSelectedProductId(id); setSelectedProductImg(img); };
  const handleBack = () => { setSelectedProductId(null); setSelectedProductImg(null); };
  const handleAdded = name => { setToast(`✅ ${name} added`); setTimeout(() => setToast(""), 2500); };

  const totalInCart = getTotalCartItems();

  return (
    <Dialog open={open} onClose={onClose} fullWidth
      maxWidth={false}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          height: { xs: "100dvh", sm: "90vh" },
          width: { xs: "100%", sm: "92vw" },
          maxWidth: { xs: "100%", sm: "92vw" },
          m: { xs: 0, sm: "auto" },
          display: "flex", flexDirection: "column",
        }
      }}>
      {/* Header */}
      <DialogTitle sx={{ p: 0, flexShrink: 0 }}>
        <Box sx={{ background: "linear-gradient(135deg,#1e3c72 0%,#6366f1 100%)", px: 3, py: { xs: 1.5, sm: 2 }, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="white" fontSize={{ xs: "0.95rem", sm: "1.1rem" }}>
              {selectedProductId ? "📦 Select Variants" : "🛍️ Product Catalogue"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
              {selectedProductId ? "Set quantities and add to order" : `${products.length} products available`}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {totalInCart > 0 && (
              <Box sx={{ bgcolor: "#16a34a", color: "white", px: 1.5, py: 0.5, borderRadius: 2, fontSize: "0.78rem", fontWeight: 700 }}>
                🛒 {totalInCart} in cart
              </Box>
            )}
            <IconButton onClick={onClose} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" } }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        {toast && (
          <Box sx={{ bgcolor: "#d1fae5", color: "#065f46", px: 3, py: 0.75, fontSize: "0.83rem", fontWeight: 700 }}>{toast}</Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 }, overflow: "auto", flex: 1 }}>
        {selectedProductId ? (
          <MemoProductDetail productId={selectedProductId} productImg={selectedProductImg} onBack={handleBack} onAdded={handleAdded} />
        ) : (
          <MemoProductCatalog products={products} categories={categories} loading={pLoading} onSelectProduct={handleSelect} />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.75, borderTop: "1px solid", borderColor: "divider", flexShrink: 0, justifyContent: "space-between" }}>
        {selectedProductId
          ? <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ borderRadius: 2, fontWeight: 600 }}>Back to Catalogue</Button>
          : <Box />
        }
        <Button variant="contained" onClick={onClose} sx={{ borderRadius: 2, fontWeight: 700, background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          ✓ Done — View Cart {totalInCart > 0 && `(${totalInCart})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemoProductBrowser;
