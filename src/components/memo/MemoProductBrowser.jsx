import React, { useState, useMemo } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton, Chip,
  TextField, InputAdornment, CircularProgress,
  Slide, useMediaQuery, useTheme, Avatar, Pagination,
} from "@mui/material";
import Grid from "@mui/material/Grid";
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
import {
  fetchProducts,
  fetchCategories,
  fetchProductWithVariants,
} from "../../api/product.api";
import { useCart } from "../../context/CartContext";

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

const VariantCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 14,
  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.18s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 8px 24px rgba(99,102,241,0.15)",
  },
}));

const CATALOG_PAGE_SIZE = 16;
const VARIANT_PAGE_SIZE = 12;

/* ─── Level 2: Product detail with variants ─── */
const ProductDetailPanel = ({ productId, productImg: fallbackImg, onBack, onAdded }) => {
  const { addItemToCart } = useCart();
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState({});
  const [page, setPage] = useState(1);

  const { data: product = { productDetails: {}, variants: [] }, isLoading } =
    useQuery({
      queryKey: ["product-details", productId],
      queryFn: () => fetchProductWithVariants(productId),
      enabled: !!productId,
      staleTime: 5 * 60 * 1000,
    });

  const filtered = useMemo(() => {
    if (!product.variants) return [];
    if (!search.trim()) return product.variants;
    const s = search.toLowerCase();
    return product.variants.filter((v) =>
      v.variantName?.toLowerCase().includes(s)
    );
  }, [product.variants, search]);

  const totalPages = Math.ceil(filtered.length / VARIANT_PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (page - 1) * VARIANT_PAGE_SIZE;
    return filtered.slice(start, start + VARIANT_PAGE_SIZE);
  }, [filtered, page]);

  const getQty = (id) => qty[id] || 1;
  const changeQty = (id, delta) =>
    setQty((q) => ({ ...q, [id]: Math.max(1, (q[id] || 1) + delta) }));

  const handleAdd = (variant) => {
    addItemToCart(product, variant, getQty(variant._id));
    onAdded(variant.variantName);
  };

  const productName = product.productDetails?.productName || "Product";
  const productImg = product.productDetails?.imageUrl || fallbackImg;

  return (
    <Box>
      {/* Sub-header bar */}
      <Box
        sx={{
          display: "flex", alignItems: "center", gap: 1.5,
          px: 2, py: 1.5, mb: 2,
          background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
          borderRadius: 3,
        }}
      >
        <IconButton
          size="small" onClick={onBack}
          sx={{ color: "white", bgcolor: "rgba(255,255,255,0.18)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        {productImg && (
          <Avatar src={productImg} variant="rounded"
            sx={{ width: 34, height: 34, border: "2px solid rgba(255,255,255,0.3)" }} />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={800} sx={{ color: "white", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {productName}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
            {product.variants?.length ?? 0} variants
          </Typography>
        </Box>
        <TextField
          size="small" placeholder="Search…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }} /></InputAdornment> }}
          sx={{
            width: { xs: 120, sm: 180 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5, color: "white", fontSize: "0.8rem",
              "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              "&:hover fieldset, &.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.7)" },
            },
            "& input::placeholder": { color: "rgba(255,255,255,0.4)" },
          }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No variants found.</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={1.5}>
            {paginated.map((variant) => (
              <Grid key={variant._id} size={{ xs: 6, sm: 4, md: 3 }}>
                <VariantCard>
                  <Box sx={{ height: 120, overflow: "hidden", bgcolor: alpha("#6366f1", 0.04) }}>
                    {variant.imageUrl || productImg ? (
                      <Box component="img" src={variant.imageUrl || productImg} alt=""
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Lottie animationData={gearsAnimation} loop style={{ width: 60 }} />
                      </Box>
                    )}
                    {variant.brand && (
                      <Chip label={variant.brand} size="small"
                        sx={{ position: "absolute", bottom: 6, left: 6, height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: alpha("#6366f1", 0.85), color: "white" }} />
                    )}
                  </Box>
                  <Box sx={{ p: 1.25, flex: 1, display: "flex", flexDirection: "column" }}>
                    <Typography fontWeight={700} fontSize="0.8rem" sx={{ lineHeight: 1.3, mb: 0.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {variant.variantName}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Inv</Typography>
                      <Typography fontWeight={800} fontSize="0.82rem" color="success.main">₹{variant.invoicePrice?.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Est</Typography>
                      <Typography fontWeight={700} fontSize="0.78rem" color="primary.main">₹{variant.estimatePrice?.toFixed(2)}</Typography>
                    </Box>
                    <Typography variant="caption" fontWeight={700}
                      color={variant.stockQty > 0 ? "success.main" : "error.main"} sx={{ mb: 1 }}>
                      Stock: {variant.stockQty ?? 0}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: "auto" }}>
                      <IconButton size="small" onClick={() => changeQty(variant._id, -1)}
                        sx={{ bgcolor: alpha("#6366f1", 0.08), borderRadius: 1.5, p: 0.4 }}>
                        <RemoveIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                      <Typography fontWeight={800} sx={{ minWidth: 22, textAlign: "center", fontSize: "0.85rem" }}>
                        {getQty(variant._id)}
                      </Typography>
                      <IconButton size="small" onClick={() => changeQty(variant._id, 1)}
                        sx={{ bgcolor: alpha("#6366f1", 0.08), borderRadius: 1.5, p: 0.4 }}>
                        <AddIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                      <Button variant="contained" size="small" fullWidth
                        startIcon={<ShoppingCartIcon sx={{ fontSize: 12 }} />}
                        onClick={() => handleAdd(variant)}
                        sx={{ ml: 0.5, borderRadius: 2, fontWeight: 700, textTransform: "none", fontSize: "0.72rem", py: 0.5, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", "&:hover": { background: "linear-gradient(135deg,#4f46e5,#7c3aed)" } }}>
                        Add
                      </Button>
                    </Box>
                  </Box>
                </VariantCard>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => { setPage(v); }}
                size="small" color="primary"
                sx={{ "& .MuiPaginationItem-root.Mui-selected": { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white" } }} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

/* ─── Level 1: Product Catalog ─── */
const ProductCatalogPanel = ({ products, categories, loading, onSelectProduct }) => {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = products;
    if (selectedCat) list = list.filter((p) => (p.categoryId?._id || p.categoryId) === selectedCat);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) => p.productName?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s)
      );
    }
    return list;
  }, [products, search, selectedCat]);

  const totalPages = Math.ceil(filtered.length / CATALOG_PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (page - 1) * CATALOG_PAGE_SIZE;
    return filtered.slice(start, start + CATALOG_PAGE_SIZE);
  }, [filtered, page]);

  const handleFilter = (cat) => { setSelectedCat(cat); setPage(1); };
  const handleSearch = (v) => { setSearch(v); setPage(1); };

  return (
    <Box>
      {/* Search + category chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small" placeholder="Search products…" value={search}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "#6366f1" }} /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 160, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
        />
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          <Chip label="All" size="small" onClick={() => handleFilter("")}
            color={!selectedCat ? "primary" : "default"} sx={{ fontWeight: 700 }} />
          {categories.map((c) => (
            <Chip key={c._id} label={c.name} size="small"
              onClick={() => handleFilter(c._id)}
              color={selectedCat === c._id ? "primary" : "default"} sx={{ fontWeight: 600 }} />
          ))}
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
        {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
        {totalPages > 1 && ` — page ${page} of ${totalPages}`}
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No products found.</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={{ xs: 1, sm: 1.5 }}>
            {paginated.map((product) => {
              const img =
                product.variants?.[0]?.imageUrl ||
                (product.imageUrl !== "https://example.com/default-product.jpg"
                  ? product.imageUrl
                  : null);
              const cat =
                categories.find(
                  (c) => c._id === (product.categoryId?._id || product.categoryId)
                )?.name || "—";
              return (
                <Grid key={product._id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Box
                    onClick={() => onSelectProduct(product._id, img)}
                    sx={{
                      borderRadius: 2.5, overflow: "hidden", cursor: "pointer",
                      border: "1.5px solid", borderColor: alpha("#6366f1", 0.1),
                      background: "white", transition: "all 0.18s ease",
                      "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(99,102,241,0.18)", borderColor: alpha("#6366f1", 0.4) },
                    }}
                  >
                    <Box sx={{ height: { xs: 90, sm: 110 }, overflow: "hidden", bgcolor: alpha("#6366f1", 0.04) }}>
                      {img ? (
                        <Box component="img" src={img} alt={product.productName}
                          sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Lottie animationData={gearsAnimation} loop style={{ width: 55 }} />
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ p: 1 }}>
                      <Typography fontWeight={700} fontSize="0.78rem"
                        sx={{ lineHeight: 1.3, mb: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {product.productName}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <LocalOfferIcon sx={{ fontSize: 10, color: alpha("#6366f1", 0.55) }} />
                        <Typography variant="caption" color="text.secondary" fontSize="0.62rem">{cat}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)}
                size="small" color="primary"
                sx={{ "& .MuiPaginationItem-root.Mui-selected": { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white" } }} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

/* ─── Main exported component ─── */
const MemoProductBrowser = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductImg, setSelectedProductImg] = useState(null);
  const [toast, setToast] = useState("");

  // ⚡ Queries are ALWAYS running (component stays mounted), data ready before dialog opens
  const { data: products = [], isLoading: pLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });

  const handleSelectProduct = (id, img) => {
    setSelectedProductId(id);
    setSelectedProductImg(img);
  };

  const handleBack = () => {
    setSelectedProductId(null);
    setSelectedProductImg(null);
  };

  const handleAdded = (name) => {
    setToast(`✅ ${name} added to cart`);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={selectedProductId ? "lg" : "md"}
      TransitionComponent={Transition}
      keepMounted={false}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          height: { xs: "100dvh", sm: "88vh" },
          m: { xs: 0, sm: 2 },
          display: "flex", flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0, flexShrink: 0 }}>
        <Box sx={{
          background: "linear-gradient(135deg,#1e3c72 0%,#6366f1 100%)",
          px: 3, py: { xs: 1.5, sm: 2 },
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="white" fontSize={{ xs: "0.95rem", sm: "1.1rem" }}>
              {selectedProductId ? "📦 Select Variants" : "🛍️ Product Catalogue"}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
              {selectedProductId ? "Set quantities and add to order" : "Click any product to view variants"}
            </Typography>
          </Box>
          <IconButton onClick={onClose}
            sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" } }}>
            <CloseIcon />
          </IconButton>
        </Box>
        {toast && (
          <Box sx={{ bgcolor: "#d1fae5", color: "#065f46", px: 3, py: 0.75, fontSize: "0.83rem", fontWeight: 700, letterSpacing: "0.01em" }}>
            {toast}
          </Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2 }, overflow: "auto", flex: 1 }}>
        {selectedProductId ? (
          <ProductDetailPanel
            productId={selectedProductId}
            productImg={selectedProductImg}
            onBack={handleBack}
            onAdded={handleAdded}
          />
        ) : (
          <ProductCatalogPanel
            products={products}
            categories={categories}
            loading={pLoading}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.75, borderTop: "1px solid", borderColor: "divider", flexShrink: 0, justifyContent: "space-between" }}>
        {selectedProductId ? (
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}
            sx={{ borderRadius: 2, fontWeight: 600 }}>
            Back to Catalogue
          </Button>
        ) : <Box />}
        <Button variant="contained" onClick={onClose}
          sx={{ borderRadius: 2, fontWeight: 700, background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          ✓ Done — View Cart
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemoProductBrowser;
