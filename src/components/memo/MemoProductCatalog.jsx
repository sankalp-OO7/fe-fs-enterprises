import React, { useState, useMemo } from "react";
import { Box, Typography, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress, Pagination, Badge } from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Lottie from "lottie-react";
import gearsAnimation from "../../lottie-animations/settings-gears.json";
import { useCart } from "../../context/CartContext";

const PAGE_SIZE = 16;

const MemoProductCatalog = ({ products, categories, loading, onSelectProduct }) => {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [page, setPage] = useState(1);
  const { cart } = useCart();

  // total qty in cart per product._id
  const cartCountByProduct = useMemo(() => {
    const map = {};
    cart.forEach(item => {
      const pid = item.product?.productDetails?._id || item.product?._id;
      if (pid) map[pid] = (map[pid] || 0) + item.quantity;
    });
    return map;
  }, [cart]);

  const filtered = useMemo(() => {
    let list = products;
    if (cat) list = list.filter(p => (p.categoryId?._id || p.categoryId) === cat);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(p => p.productName?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
    }
    return list;
  }, [products, search, cat]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const reset = (fn) => { fn(); setPage(1); };

  return (
    <Box>
      {/* Search + Category dropdown */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small" placeholder="Search products…" value={search}
          onChange={e => reset(() => setSearch(e.target.value))}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "#6366f1" }} /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 180, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
        />
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>Category</InputLabel>
          <Select value={cat} label="Category" onChange={e => reset(() => setCat(e.target.value))}
            sx={{ borderRadius: 2.5 }}>
            <MenuItem value=""><em>All Categories</em></MenuItem>
            {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
        {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        {totalPages > 1 && ` — page ${page}/${totalPages}`}
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: "#6366f1" }} /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}><Typography color="text.secondary">No products found.</Typography></Box>
      ) : (
        <>
          <Grid container spacing={{ xs: 1, sm: 1.5 }}>
            {paginated.map(product => {
              const img = product.variants?.[0]?.imageUrl || (product.imageUrl !== "https://example.com/default-product.jpg" ? product.imageUrl : null);
              const catName = categories.find(c => c._id === (product.categoryId?._id || product.categoryId))?.name || "";
              const cartCount = cartCountByProduct[product._id] || 0;
              return (
                <Grid key={product._id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Badge badgeContent={cartCount > 0 ? cartCount : null} color="success"
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    sx={{ width: "100%", "& .MuiBadge-badge": { fontSize: "0.7rem", fontWeight: 800, top: 8, right: 8, minWidth: 22, height: 22, borderRadius: "11px", border: "2px solid white" } }}>
                    <Box onClick={() => onSelectProduct(product._id, img)} sx={{
                      width: "100%", borderRadius: 2.5, overflow: "hidden", cursor: "pointer",
                      border: "1.5px solid", borderColor: cartCount > 0 ? alpha("#16a34a", 0.4) : alpha("#6366f1", 0.1),
                      background: cartCount > 0 ? alpha("#f0fdf4", 0.8) : "white",
                      transition: "all 0.18s ease",
                      "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(99,102,241,0.18)", borderColor: alpha("#6366f1", 0.4) },
                    }}>
                      <Box sx={{ height: { xs: 90, sm: 110 }, overflow: "hidden", bgcolor: alpha("#6366f1", 0.04), position: "relative" }}>
                        {img
                          ? <Box component="img" src={img} alt={product.productName} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Lottie animationData={gearsAnimation} loop style={{ width: 55 }} /></Box>
                        }
                        {cartCount > 0 && (
                          <Box sx={{ position: "absolute", bottom: 6, left: 6, bgcolor: "#16a34a", color: "white", px: 0.8, py: 0.2, borderRadius: 1.5, display: "flex", alignItems: "center", gap: 0.4 }}>
                            <ShoppingCartIcon sx={{ fontSize: 10 }} />
                            <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, lineHeight: 1 }}>{cartCount} in cart</Typography>
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ p: 1 }}>
                        <Typography fontWeight={700} fontSize="0.78rem" sx={{ lineHeight: 1.3, mb: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {product.productName}
                        </Typography>
                        {catName && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                            <LocalOfferIcon sx={{ fontSize: 10, color: alpha("#6366f1", 0.55) }} />
                            <Typography variant="caption" color="text.secondary" fontSize="0.62rem">{catName}</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Badge>
                </Grid>
              );
            })}
          </Grid>
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small" color="primary"
                sx={{ "& .MuiPaginationItem-root.Mui-selected": { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white" } }} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default MemoProductCatalog;
