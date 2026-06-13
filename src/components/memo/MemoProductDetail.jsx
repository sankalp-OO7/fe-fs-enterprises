import React, { useState, useMemo } from "react";
import {
  Box, Typography, TextField, InputAdornment, IconButton, Button,
  CircularProgress, Pagination, Avatar, Chip, Divider,
  ToggleButtonGroup, ToggleButton, useMediaQuery, useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import Lottie from "lottie-react";
import gearsAnimation from "../../lottie-animations/settings-gears.json";
import { useQuery } from "@tanstack/react-query";
import { fetchProductWithVariants } from "../../api/product.api";
import { useCart } from "../../context/CartContext";

const PAGE = 12;

const MemoProductDetail = ({ productId, productImg: fallbackImg, onBack, onAdded }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { addItemToCart, cart, removeFromCart, updateCartItemQuantity } = useCart();
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState({});
  const [page, setPage] = useState(1);
  const [view, setView] = useState("card");

  const { data: product = { productDetails: {}, variants: [] }, isLoading } = useQuery({
    queryKey: ["product-details", productId],
    queryFn: () => fetchProductWithVariants(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

  const productName = product.productDetails?.productName || "Product";
  const productImg = product.productDetails?.imageUrl || fallbackImg;

  const filtered = useMemo(() => {
    if (!product.variants) return [];
    if (!search.trim()) return product.variants;
    return product.variants.filter(v => v.variantName?.toLowerCase().includes(search.toLowerCase()));
  }, [product.variants, search]);

  const totalPages = Math.ceil(filtered.length / PAGE);
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE, page * PAGE), [filtered, page]);

  const getQty = id => qty[id] || 1;
  const changeQty = (id, d) => setQty(q => ({ ...q, [id]: Math.max(1, (q[id] || 1) + d) }));
  const handleAdd = variant => { addItemToCart(product, variant, getQty(variant._id)); onAdded(variant.variantName); };

  // Cart items for THIS product only
  const productCartItems = useMemo(() =>
    cart.filter(item => {
      const pid = item.product?.productDetails?._id || item.product?._id;
      return pid === productId;
    }), [cart, productId]);

  const cartTotal = productCartItems.reduce((s, i) => s + i.quantity, 0);

  // Sub-header
  const SubHeader = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.25, mb: 2, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 3 }}>
      <IconButton size="small" onClick={onBack} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.18)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}>
        <ArrowBackIcon fontSize="small" />
      </IconButton>
      {productImg && <Avatar src={productImg} variant="rounded" sx={{ width: 32, height: 32, border: "2px solid rgba(255,255,255,0.3)" }} />}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={800} sx={{ color: "white", fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productName}</Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>{product.variants?.length ?? 0} variants</Typography>
      </Box>
      <TextField size="small" placeholder="Search…" value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }} /></InputAdornment> }}
        sx={{ width: { xs: 110, sm: 170 }, "& .MuiOutlinedInput-root": { borderRadius: 2, color: "white", fontSize: "0.78rem", "& fieldset": { borderColor: "rgba(255,255,255,0.3)" }, "&:hover fieldset,&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.7)" } }, "& input::placeholder": { color: "rgba(255,255,255,0.4)" } }} />
      <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small"
        sx={{ bgcolor: "rgba(255,255,255,0.12)", borderRadius: 1.5, "& .MuiToggleButton-root": { border: "none", color: "rgba(255,255,255,0.6)", px: 0.9, py: 0.4 }, "& .Mui-selected": { bgcolor: "rgba(255,255,255,0.22)!important", color: "white!important" } }}>
        <ToggleButton value="card"><ViewModuleIcon sx={{ fontSize: 16 }} /></ToggleButton>
        <ToggleButton value="list"><ViewListIcon sx={{ fontSize: 16 }} /></ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );

  // Cart summary panel
  const CartPanel = () => (
    <Box sx={{ background: "linear-gradient(180deg,#f8faff,#f1f5fd)", borderRadius: 3, p: 1.5, height: "100%", border: `1.5px solid ${alpha("#6366f1", 0.12)}` }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <ShoppingCartIcon sx={{ color: "#6366f1", fontSize: 18 }} />
        <Typography fontWeight={800} fontSize="0.88rem">Cart from this product</Typography>
        {cartTotal > 0 && <Chip label={cartTotal} size="small" color="success" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 800 }} />}
      </Box>
      {productCartItems.length === 0 ? (
        <Typography variant="caption" color="text.secondary">No items added yet.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {productCartItems.map(item => (
            <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, bgcolor: "white", borderRadius: 2, border: `1px solid ${alpha("#6366f1", 0.08)}` }}>
              {(item.variant?.imageUrl || productImg) && (
                <Box component="img" src={item.variant?.imageUrl || productImg} alt=""
                  sx={{ width: 32, height: 32, borderRadius: 1, objectFit: "cover", flexShrink: 0 }} />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontSize="0.72rem" fontWeight={700} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.variant?.variantName}</Typography>
                <Typography fontSize="0.65rem" color="text.secondary">₹{item.variant?.invoicePrice?.toFixed(2)} × {item.quantity}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <IconButton size="small" sx={{ p: 0.3 }} onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}><RemoveIcon sx={{ fontSize: 12 }} /></IconButton>
                <Typography fontSize="0.75rem" fontWeight={800} sx={{ minWidth: 16, textAlign: "center" }}>{item.quantity}</Typography>
                <IconButton size="small" sx={{ p: 0.3 }} onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}><AddIcon sx={{ fontSize: 12 }} /></IconButton>
                <IconButton size="small" sx={{ p: 0.3, color: "error.main" }} onClick={() => removeFromCart(item.id)}><DeleteIcon sx={{ fontSize: 12 }} /></IconButton>
              </Box>
            </Box>
          ))}
          <Divider />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography fontSize="0.75rem" fontWeight={700} color="text.secondary">Total</Typography>
            <Typography fontSize="0.8rem" fontWeight={800} color="success.main">
              ₹{productCartItems.reduce((s, i) => s + (i.variant?.invoicePrice || 0) * i.quantity, 0).toFixed(2)}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  // Card view variant
  const VariantCard = ({ variant }) => (
    <Box sx={{ borderRadius: 2.5, border: `1.5px solid ${alpha("#6366f1", 0.1)}`, overflow: "hidden", bgcolor: "white", display: "flex", flexDirection: "column", transition: "all 0.18s", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 6px 20px rgba(99,102,241,0.13)" } }}>
      <Box sx={{ height: 110, overflow: "hidden", bgcolor: alpha("#6366f1", 0.04), position: "relative" }}>
        {variant.imageUrl || productImg
          ? <Box component="img" src={variant.imageUrl || productImg} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Lottie animationData={gearsAnimation} loop style={{ width: 55 }} /></Box>
        }
      </Box>
      <Box sx={{ p: 1.25, flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography fontWeight={700} fontSize="0.78rem" sx={{ lineHeight: 1.3, mb: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{variant.variantName}</Typography>
        {variant.brand && <Typography variant="caption" color="text.disabled" sx={{ mb: 0.4 }}>{variant.brand}</Typography>}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Invoice</Typography>
          <Typography fontWeight={800} fontSize="0.8rem" color="success.main">₹{variant.invoicePrice?.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Est.</Typography>
          <Typography fontWeight={700} fontSize="0.76rem" color="primary.main">₹{variant.estimatePrice?.toFixed(2)}</Typography>
        </Box>
        <Typography variant="caption" fontWeight={700} color={variant.stockQty > 0 ? "success.main" : "error.main"} sx={{ mb: 1 }}>Stock: {variant.stockQty ?? 0}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: "auto" }}>
          <IconButton size="small" onClick={() => changeQty(variant._id, -1)} sx={{ bgcolor: alpha("#6366f1", 0.08), borderRadius: 1.5, p: 0.35 }}><RemoveIcon sx={{ fontSize: 13 }} /></IconButton>
          <Typography fontWeight={800} sx={{ minWidth: 22, textAlign: "center", fontSize: "0.82rem" }}>{getQty(variant._id)}</Typography>
          <IconButton size="small" onClick={() => changeQty(variant._id, 1)} sx={{ bgcolor: alpha("#6366f1", 0.08), borderRadius: 1.5, p: 0.35 }}><AddIcon sx={{ fontSize: 13 }} /></IconButton>
          <Button variant="contained" size="small" fullWidth onClick={() => handleAdd(variant)}
            sx={{ ml: 0.4, borderRadius: 2, fontWeight: 700, textTransform: "none", fontSize: "0.7rem", py: 0.45, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", "&:hover": { background: "linear-gradient(135deg,#4f46e5,#7c3aed)" } }}>
            Add
          </Button>
        </Box>
      </Box>
    </Box>
  );

  // List view variant row
  const VariantRow = ({ variant }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.25, bgcolor: "white", borderRadius: 2, border: `1px solid ${alpha("#6366f1", 0.08)}`, mb: 0.75, "&:hover": { borderColor: alpha("#6366f1", 0.25), boxShadow: "0 2px 8px rgba(99,102,241,0.08)" }, transition: "all 0.15s" }}>
      <Box sx={{ width: 44, height: 44, borderRadius: 1.5, overflow: "hidden", flexShrink: 0 }}>
        {variant.imageUrl || productImg
          ? <Box component="img" src={variant.imageUrl || productImg} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: alpha("#6366f1", 0.07) }}><Lottie animationData={gearsAnimation} loop style={{ width: 28 }} /></Box>
        }
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={700} fontSize="0.82rem" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{variant.variantName}</Typography>
        {variant.brand && <Typography variant="caption" color="text.disabled">{variant.brand}</Typography>}
      </Box>
      <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", alignItems: "flex-end", mr: 1 }}>
        <Typography fontWeight={800} fontSize="0.82rem" color="success.main">₹{variant.invoicePrice?.toFixed(2)}</Typography>
        <Typography variant="caption" color="primary.main" fontWeight={600}>₹{variant.estimatePrice?.toFixed(2)}</Typography>
      </Box>
      <Typography variant="caption" fontWeight={700} color={variant.stockQty > 0 ? "success.main" : "error.main"} sx={{ display: { xs: "none", sm: "block" }, mr: 1 }}>Stk:{variant.stockQty}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, flexShrink: 0 }}>
        <IconButton size="small" onClick={() => changeQty(variant._id, -1)} sx={{ p: 0.3, bgcolor: alpha("#6366f1", 0.07) }}><RemoveIcon sx={{ fontSize: 13 }} /></IconButton>
        <Typography fontWeight={800} sx={{ minWidth: 20, textAlign: "center", fontSize: "0.8rem" }}>{getQty(variant._id)}</Typography>
        <IconButton size="small" onClick={() => changeQty(variant._id, 1)} sx={{ p: 0.3, bgcolor: alpha("#6366f1", 0.07) }}><AddIcon sx={{ fontSize: 13 }} /></IconButton>
        <Button variant="contained" size="small" onClick={() => handleAdd(variant)}
          sx={{ ml: 0.5, borderRadius: 2, fontWeight: 700, textTransform: "none", fontSize: "0.72rem", py: 0.45, px: 1.5, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", whiteSpace: "nowrap" }}>
          + Add
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box>
      <SubHeader />
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: "#6366f1" }} /></Box>
      ) : (
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          {/* Variants */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {filtered.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>No variants found.</Typography>
            ) : view === "card" ? (
              <Grid container spacing={1.5}>
                {paginated.map(v => <Grid key={v._id} size={{ xs: 6, sm: 4, md: 3 }}><VariantCard variant={v} /></Grid>)}
              </Grid>
            ) : (
              <Box>{paginated.map(v => <VariantRow key={v._id} variant={v} />)}</Box>
            )}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small" color="primary"
                  sx={{ "& .MuiPaginationItem-root.Mui-selected": { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white" } }} />
              </Box>
            )}
          </Box>

          {/* Cart summary sidebar — only on md+ */}
          {!isMobile && (
            <Box sx={{ width: 220, flexShrink: 0 }}>
              <CartPanel />
            </Box>
          )}
        </Box>
      )}

      {/* Cart summary below on mobile */}
      {isMobile && productCartItems.length > 0 && (
        <Box sx={{ mt: 2 }}><CartPanel /></Box>
      )}
    </Box>
  );
};

export default MemoProductDetail;
