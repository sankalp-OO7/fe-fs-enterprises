import React, { useState, useMemo } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton, Chip, Grid,
  TextField, InputAdornment, CircularProgress, Alert,
  Slide, useMediaQuery, useTheme, Divider, Avatar,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import Lottie from "lottie-react";
import gearsAnimation from "../../lottie-animations/settings-gears.json";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchCategories, fetchProductWithVariants } from "../../api/product.api";
import { useCart } from "../../context/CartContext";

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const VariantCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 16,
  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.2s ease",
  "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(99,102,241,0.15)" },
}));

/* ─── Level 2: Product Detail ─── */
const ProductDetailPanel = ({ productId, onBack, onAdded }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { addItemToCart } = useCart();
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState({});

  const { data: product = { productDetails: {}, variants: [] }, isLoading } = useQuery({
    queryKey: ["product-details", productId],
    queryFn: () => fetchProductWithVariants(productId),
    enabled: !!productId,
  });

  const variants = useMemo(() => {
    if (!product.variants) return [];
    if (!search.trim()) return product.variants;
    return product.variants.filter(v =>
      v.variantName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [product.variants, search]);

  const getQty = (id) => qty[id] || 1;

  const handleAdd = (variant) => {
    addItemToCart(product, variant, getQty(variant._id));
    onAdded(variant.variantName);
  };

  if (isLoading) return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress sx={{ color: "#6366f1" }} />
    </Box>
  );

  const productName = product.productDetails?.productName || "Product";
  const productImg = product.productDetails?.imageUrl;

  return (
    <Box>
      {/* Sub-header */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5,
        background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
        borderRadius: "0 0 12px 12px", mb: 2,
      }}>
        <IconButton size="small" onClick={onBack}
          sx={{ color: "white", bgcolor: "rgba(255,255,255,0.2)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        {productImg && (
          <Avatar src={productImg} variant="rounded" sx={{ width: 36, height: 36, border: "2px solid rgba(255,255,255,0.3)" }} />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={800} sx={{ color: "white", fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {productName}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {product.variants?.length} variant{product.variants?.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <TextField
          size="small" placeholder="Search variants…" value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.7)" }} /></InputAdornment> }}
          sx={{
            width: { xs: 130, sm: 200 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 3, color: "white", fontSize: "0.8rem",
              "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
            },
            "& input::placeholder": { color: "rgba(255,255,255,0.5)" },
          }}
        />
      </Box>

      {variants.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No variants found.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ px: 2 }}>
          {variants.map(variant => (
            <Grid key={variant._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <VariantCard>
                <Box sx={{ height: 140, overflow: "hidden", position: "relative" }}>
                  {variant.imageUrl || productImg ? (
                    <Box component="img" src={variant.imageUrl || productImg} alt=""
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: alpha("#6366f1", 0.06) }}>
                      <Lottie animationData={gearsAnimation} loop style={{ width: 80 }} />
                    </Box>
                  )}
                  {variant.brand && (
                    <Chip label={variant.brand} size="small"
                      sx={{ position: "absolute", bottom: 8, left: 8, height: 20, fontSize: "0.62rem", fontWeight: 700, bgcolor: alpha("#6366f1", 0.85), color: "white" }} />
                  )}
                </Box>
                <Box sx={{ p: 1.5, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography fontWeight={700} fontSize="0.85rem" sx={{ mb: 0.5, lineHeight: 1.3 }}>
                    {variant.variantName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {variant.variantDescription || "No description"}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Invoice</Typography>
                    <Typography fontWeight={800} fontSize="0.9rem" color="success.main">₹{variant.invoicePrice?.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Est.</Typography>
                    <Typography fontWeight={700} fontSize="0.85rem" color="primary.main">₹{variant.estimatePrice?.toFixed(2)}</Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={700}
                    color={variant.stockQty > 0 ? "success.main" : "error.main"} sx={{ mb: 1.5 }}>
                    Stock: {variant.stockQty ?? 0}
                  </Typography>

                  {/* Qty + Add */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: "auto" }}>
                    <IconButton size="small" onClick={() => setQty(q => ({ ...q, [variant._id]: Math.max(1, (q[variant._id] || 1) - 1) }))}
                      sx={{ bgcolor: alpha("#6366f1", 0.08), borderRadius: 1.5 }}>
                      <RemoveIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Typography fontWeight={800} sx={{ minWidth: 28, textAlign: "center" }}>
                      {getQty(variant._id)}
                    </Typography>
                    <IconButton size="small" onClick={() => setQty(q => ({ ...q, [variant._id]: (q[variant._id] || 1) + 1 }))}
                      sx={{ bgcolor: alpha("#6366f1", 0.08), borderRadius: 1.5 }}>
                      <AddIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Button variant="contained" size="small" fullWidth
                      startIcon={<ShoppingCartIcon sx={{ fontSize: 13 }} />}
                      onClick={() => handleAdd(variant)}
                      sx={{ ml: 0.5, borderRadius: 2, fontWeight: 700, textTransform: "none", fontSize: "0.75rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                      Add
                    </Button>
                  </Box>
                </Box>
              </VariantCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

/* ─── Level 1: Product Catalog ─── */
const ProductCatalogPanel = ({ onSelectProduct }) => {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("");

  const { data: products = [], isLoading: pLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const filtered = useMemo(() => {
    let list = products;
    if (selectedCat) list = list.filter(p => (p.categoryId?._id || p.categoryId) === selectedCat);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(p => p.productName?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
    }
    return list;
  }, [products, search, selectedCat]);

  return (
    <Box>
      {/* Search + filter bar */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small" placeholder="Search products…" value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "#6366f1" }} /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 180, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
        />
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          <Chip label="All" size="small" onClick={() => setSelectedCat("")}
            color={!selectedCat ? "primary" : "default"} sx={{ fontWeight: 700 }} />
          {categories.map(c => (
            <Chip key={c._id} label={c.name} size="small" onClick={() => setSelectedCat(c._id)}
              color={selectedCat === c._id ? "primary" : "default"} sx={{ fontWeight: 600 }} />
          ))}
        </Box>
      </Box>

      {pLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No products found.</Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {filtered.map(product => {
            const img = product.variants?.[0]?.imageUrl || (product.imageUrl !== "https://example.com/default-product.jpg" ? product.imageUrl : null);
            const cat = categories.find(c => c._id === (product.categoryId?._id || product.categoryId))?.name || "—";
            return (
              <Grid key={product._id} size={{ xs: 6, sm: 4, md: 3 }}>
                <Box onClick={() => onSelectProduct(product._id)}
                  sx={{
                    borderRadius: 3, overflow: "hidden", cursor: "pointer",
                    border: "1.5px solid", borderColor: alpha("#6366f1", 0.1),
                    background: "white", transition: "all 0.2s ease",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(99,102,241,0.18)", borderColor: alpha("#6366f1", 0.35) },
                  }}>
                  <Box sx={{ height: 110, overflow: "hidden", bgcolor: alpha("#6366f1", 0.04) }}>
                    {img ? (
                      <Box component="img" src={img} alt={product.productName}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Lottie animationData={gearsAnimation} loop style={{ width: 60 }} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ p: 1.25 }}>
                    <Typography fontWeight={700} fontSize="0.8rem" sx={{ lineHeight: 1.3, mb: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {product.productName}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocalOfferIcon sx={{ fontSize: 10, color: alpha("#6366f1", 0.6) }} />
                      <Typography variant="caption" color="text.secondary" fontSize="0.65rem">{cat}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

/* ─── Main exported component ─── */
const MemoProductBrowser = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [toast, setToast] = useState("");

  const handleAdded = (name) => {
    setToast(`✅ ${name} added to cart`);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <Dialog
      open={open} onClose={onClose} fullWidth
      maxWidth={selectedProductId ? "lg" : "md"}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 }, overflow: "hidden",
          height: { xs: "100dvh", sm: "90vh" },
          m: { xs: 0, sm: 2 },
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{
          background: "linear-gradient(135deg,#1e3c72 0%,#6366f1 100%)",
          px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="white">
              {selectedProductId ? "Select Variants" : "🛍️ Product Catalogue"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {selectedProductId ? "Pick items and set quantities" : "Click a product to view variants"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Toast notification */}
        {toast && (
          <Box sx={{ bgcolor: "#d1fae5", color: "#065f46", px: 3, py: 0.75, fontSize: "0.85rem", fontWeight: 600 }}>
            {toast}
          </Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 }, overflow: "auto" }}>
        {selectedProductId ? (
          <ProductDetailPanel
            productId={selectedProductId}
            onBack={() => setSelectedProductId(null)}
            onAdded={handleAdded}
          />
        ) : (
          <ProductCatalogPanel onSelectProduct={setSelectedProductId} />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", justifyContent: "space-between" }}>
        {selectedProductId ? (
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setSelectedProductId(null)}
            sx={{ borderRadius: 2, fontWeight: 600 }}>
            Back to Catalogue
          </Button>
        ) : <Box />}
        <Button variant="contained" onClick={onClose}
          sx={{ borderRadius: 2, fontWeight: 700, background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          Done — View Cart
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemoProductBrowser;
