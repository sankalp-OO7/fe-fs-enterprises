import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import useAuth from "../../context/useAuth";
import SingleVariantDialog from "../../components/product/SingleVariantDialog";
import {
  Box,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useQuery } from "@tanstack/react-query";
import { fetchProductWithVariants } from "../../api/product.api";
import Lottie from "lottie-react";
import gearsAnimation from "../../lottie-animations/settings-gears.json";
import { styled, alpha } from "@mui/material/styles";

/* ─── Styled helpers ─── */
const GlassCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 16,
  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 4px 24px rgba(79,70,229,0.07)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 8px 32px rgba(79,70,229,0.14)",
  },
}));

const ITEMS_PER_PAGE = 8;

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const { addItemToCart, snackbarOpen, snackbarMessage, closeSnackbar } = useCart();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [variantSearchTerm, setVariantSearchTerm] = useState("");
  const [openVariantDialog, setOpenVariantDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: product = { productDetails: {}, variants: [] },
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product-details", productId],
    queryFn: () => fetchProductWithVariants(productId),
    enabled: !!productId,
  });

  useEffect(() => { setCurrentPage(1); }, [variantSearchTerm, selectedBrand]);
  useEffect(() => { if (isMobile) setViewMode("list"); }, [isMobile]);

  const filteredVariants = useMemo(() => {
    if (!Array.isArray(product?.variants)) return [];
    let filtered = [...product.variants];
    if (selectedBrand?.trim()) filtered = filtered.filter((v) => v.brand === selectedBrand);
    if (variantSearchTerm.trim())
      filtered = filtered.filter((v) =>
        v.variantName?.toLowerCase().includes(variantSearchTerm.toLowerCase())
      );
    return filtered;
  }, [product.variants, variantSearchTerm, selectedBrand]);

  const totalPages = Math.ceil(filteredVariants.length / ITEMS_PER_PAGE);
  const paginatedVariants = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVariants.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVariants, currentPage]);

  const uniqueBrands = useMemo(
    () => [...new Set((product.variants || []).map((v) => v.brand).filter(Boolean))],
    [product.variants]
  );

  const handleOpenVariant = (variant) => { setSelectedVariant(variant); setOpenVariantDialog(true); };
  const handleAddToCart = (variant, qty) => { if (product) addItemToCart(product, variant, qty); };

  const productImg = product?.productDetails?.imageUrl;
  const productName = product?.productDetails?.productName || "Product Details";
  const categoryName = product?.productDetails?.categoryId?.name || product?.categoryId?.name || "Uncategorized";
  const variantCount = product?.variants?.length ?? 0;

  /* ── Price display helper ── */
  const showInvoice = isAuthenticated && (user?.role === "admin" || user?.role === "user");
  const showEstimate = isAuthenticated && (user?.role === "admin" || user?.role === "user" || user?.role === "viewer");

  /* ── Image with fallback ── */
  const VariantImage = ({ src, size = 160 }) =>
    src ? (
      <Box
        component="img"
        src={src}
        alt=""
        sx={{ width: "100%", height: size, objectFit: "cover" }}
      />
    ) : (
      <Box
        sx={{
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#f0f4ff,#e8f0fe)",
        }}
      >
        <Lottie animationData={gearsAnimation} loop autoplay style={{ width: size * 0.7, height: size * 0.7 }} />
      </Box>
    );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 2 }}>
        <CircularProgress size={48} thickness={4} sx={{ color: "#6366f1" }} />
        <Typography color="text.secondary" fontWeight={600}>Loading product…</Typography>
      </Box>
    );
  }

  if (isError || !product) {
    return (
      <Box sx={{ mt: 6, px: 3, maxWidth: 480, mx: "auto" }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>Failed to load product details.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg,#f8faff 0%,#f1f5fd 100%)", pb: 8 }}>

      {/* ─── Single unified header row ─── */}
      <Box
        sx={{
          background: "white",
          borderBottom: "1.5px solid",
          borderColor: alpha("#6366f1", 0.1),
          boxShadow: "0 2px 12px rgba(79,70,229,0.06)",
          px: { xs: 2, sm: 3, md: 5 },
          py: { xs: 1.25, sm: 1.5 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        {/* Left: back + thumbnail + name */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <IconButton
            onClick={() => navigate("/products")}
            size="small"
            sx={{ borderRadius: "10px", border: "1.5px solid", borderColor: alpha("#6366f1", 0.2), color: "#6366f1", p: 0.65, "&:hover": { background: alpha("#6366f1", 0.06) } }}
          >
            <ArrowBackIcon sx={{ fontSize: 17 }} />
          </IconButton>

          {productImg && (
            <Box
              component="img"
              src={productImg}
              alt={productName}
              sx={{ width: 32, height: 32, borderRadius: "8px", objectFit: "cover", border: "1.5px solid", borderColor: alpha("#6366f1", 0.15), flexShrink: 0 }}
            />
          )}

          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontWeight={800}
              sx={{ fontSize: { xs: "0.88rem", sm: "0.95rem" }, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: { xs: 200, sm: 260, md: 340 } }}
            >
              {productName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
                {categoryName}
              </Typography>
              <Chip
                label={`${variantCount} variant${variantCount !== 1 ? "s" : ""}`}
                size="small"
                sx={{ height: 16, fontSize: "0.62rem", fontWeight: 700, bgcolor: alpha("#6366f1", 0.09), color: "#6366f1", border: "none" }}
              />
            </Box>
          </Box>
        </Box>

        {/* Right: search + brand + count + view toggle */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search variants…"
            value={variantSearchTerm}
            onChange={(e) => setVariantSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "#6366f1" }} /></InputAdornment>,
              endAdornment: variantSearchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setVariantSearchTerm("")} sx={{ p: 0.2, color: "#6366f1" }}>
                    <ClearIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 0, "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "0.85rem" } }}
          />

          {/* Brand filter */}
          {uniqueBrands.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
              <InputLabel sx={{ fontSize: "0.85rem" }}>Brand</InputLabel>
              <Select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                label="Brand"
                sx={{ borderRadius: "10px", fontSize: "0.85rem" }}
              >
                <MenuItem value=""><em>All</em></MenuItem>
                {uniqueBrands.map((b) => (
                  <MenuItem key={b} value={b} sx={{ fontSize: "0.85rem" }}>{b}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Count */}
          <Chip
            label={`${filteredVariants.length}`}
            size="small"
            sx={{ fontWeight: 700, fontSize: "0.7rem", bgcolor: alpha("#6366f1", 0.08), color: "#6366f1", border: "none", flexShrink: 0, minWidth: 28 }}
          />

          {/* View toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
            sx={{
              flexShrink: 0,
              "& .MuiToggleButton-root": { border: "1.5px solid", borderColor: alpha("#6366f1", 0.2), borderRadius: "8px !important", px: 0.9, py: 0.4, color: "#6366f1" },
              "& .Mui-selected": { backgroundColor: `${alpha("#6366f1", 0.1)} !important`, color: "#4f46e5 !important" },
            }}
          >
            <ToggleButton value="card"><ViewModuleIcon sx={{ fontSize: 17 }} /></ToggleButton>
            <ToggleButton value="list"><ViewListIcon sx={{ fontSize: 17 }} /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ─── Body ─── */}
      {variantCount > 0 ? (
        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 5 }, pt: 3 }}>

          {/* ── No results ── */}
          {filteredVariants.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography fontSize="2.5rem" mb={1}>🔍</Typography>
              <Typography variant="h6" fontWeight={700} color="text.secondary">No Variants Found</Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                {variantSearchTerm ? `No results for "${variantSearchTerm}"` : "No variants available."}
              </Typography>
              {(variantSearchTerm || selectedBrand) && (
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
                  onClick={() => { setVariantSearchTerm(""); setSelectedBrand(""); }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
          ) : viewMode === "card" ? (
            /* ── Card View ── */
            <>
              <Grid container spacing={2.5} sx={{ justifyContent: "center" }}>
                {paginatedVariants.map((variant) => (
                  <Grid key={variant._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }} sx={{ display: "flex", justifyContent: "center" }}>
                    <GlassCard sx={{ width: { xs: "100%", sm: 320 } }}>
                      {/* Image */}
                      <Box sx={{ position: "relative" }}>
                        <VariantImage src={variant?.imageUrl || productImg} size={190} />
                        {variant.sku && (
                          <Box sx={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", color: "white", px: 1, py: 0.25, borderRadius: "6px", fontSize: "0.65rem", fontWeight: 700 }}>
                            {variant.sku}
                          </Box>
                        )}
                        {variant.brand && (
                          <Chip
                            label={variant.brand}
                            size="small"
                            sx={{ position: "absolute", bottom: 8, left: 8, height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: alpha("#6366f1", 0.85), color: "white", border: "none" }}
                          />
                        )}
                      </Box>

                      {/* Content */}
                      <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        <Typography fontWeight={700} fontSize="0.9rem" sx={{ mb: 0.5, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {variant.variantName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", mb: 1.5, minHeight: 32 }}>
                          {variant.variantDescription || "No description"}
                        </Typography>

                        <Box sx={{ mt: "auto" }}>
                          {showEstimate && (
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>Est. Price</Typography>
                              <Typography fontWeight={800} fontSize="0.95rem" color="#6366f1">
                                ₹{variant?.estimatePrice?.toFixed(2) ?? "N/A"}
                              </Typography>
                            </Box>
                          )}
                          {showInvoice && (
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>Invoice</Typography>
                              <Typography fontWeight={800} fontSize="0.9rem" color="success.main">
                                ₹{variant?.invoicePrice?.toFixed(2) ?? "N/A"}
                              </Typography>
                            </Box>
                          )}
                          {!isAuthenticated && (
                            <Typography variant="caption" color="text.disabled" sx={{ display: "block", mb: 1 }}>Log in to see prices</Typography>
                          )}
                          {isAuthenticated && (
                            <Typography variant="caption" color={variant.stockQty > 0 ? "success.main" : "error.main"} fontWeight={700} sx={{ display: "block", mb: 1 }}>
                              Stock: {variant.stockQty ?? 0}
                            </Typography>
                          )}
                          {!isAdmin() && isAuthenticated && (
                            <Button
                              variant="contained"
                              fullWidth
                              size="small"
                              startIcon={<ShoppingCartIcon sx={{ fontSize: 15 }} />}
                              onClick={() => handleOpenVariant(variant)}
                              sx={{ borderRadius: "10px", py: 0.75, fontWeight: 700, textTransform: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 3px 10px rgba(99,102,241,0.3)", "&:hover": { background: "linear-gradient(135deg,#4f46e5,#7c3aed)" } }}
                            >
                              Add to Cart
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </GlassCard>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            /* ── List View ── */
            <Box
              sx={{
                background: "white",
                borderRadius: "16px",
                border: "1.5px solid",
                borderColor: alpha("#6366f1", 0.1),
                boxShadow: "0 4px 24px rgba(79,70,229,0.06)",
                overflow: "hidden",
                mb: 3,
              }}
            >
              {/* List header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr auto", sm: "1fr 100px 110px 110px 70px auto" },
                  px: 2,
                  py: 1,
                  bgcolor: alpha("#6366f1", 0.04),
                  borderBottom: "1.5px solid",
                  borderColor: alpha("#6366f1", 0.08),
                }}
              >
                {["Variant", "Brand", "Est. Price", "Invoice", "Stock", ""].map((h, i) => (
                  <Typography key={i} sx={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "text.secondary", display: { xs: i > 1 && i < 5 ? "none" : "block", sm: "block" }, textAlign: i > 1 ? "center" : "left" }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              {paginatedVariants.map((variant) => (
                <Box
                  key={variant._id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr auto", sm: "1fr 100px 110px 110px 70px auto" },
                    px: 2,
                    py: 1.5,
                    alignItems: "center",
                    borderBottom: "1px solid",
                    borderColor: alpha("#6366f1", 0.06),
                    "&:last-child": { borderBottom: "none" },
                    "&:hover": { bgcolor: alpha("#6366f1", 0.02) },
                    transition: "background 0.15s",
                  }}
                >
                  {/* Name + thumb */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
                      {variant?.imageUrl || productImg ? (
                        <Box component="img" src={variant?.imageUrl || productImg} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: alpha("#6366f1", 0.07) }}>
                          <Lottie animationData={gearsAnimation} loop autoplay style={{ width: 32, height: 32 }} />
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} fontSize="0.85rem" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {variant.variantName}
                      </Typography>
                      {variant.sku && <Typography variant="caption" color="text.disabled" fontSize="0.67rem">SKU: {variant.sku}</Typography>}
                    </Box>
                  </Box>

                  {/* Brand */}
                  <Box sx={{ display: { xs: "none", sm: "flex" }, justifyContent: "center" }}>
                    <Chip label={variant.brand || "—"} size="small" sx={{ fontWeight: 600, fontSize: "0.72rem", height: 22, bgcolor: alpha("#6366f1", 0.08), color: "#6366f1", border: "none" }} />
                  </Box>

                  {/* Est price */}
                  <Typography sx={{ display: { xs: "none", sm: "block" }, textAlign: "center", fontWeight: 800, fontSize: "0.88rem", color: "#6366f1" }}>
                    {showEstimate ? `₹${variant?.estimatePrice?.toFixed(2) ?? "N/A"}` : "—"}
                  </Typography>

                  {/* Invoice */}
                  <Typography sx={{ display: { xs: "none", sm: "block" }, textAlign: "center", fontWeight: 800, fontSize: "0.88rem", color: "success.main" }}>
                    {showInvoice ? `₹${variant?.invoicePrice?.toFixed(2) ?? "N/A"}` : "—"}
                  </Typography>

                  {/* Stock */}
                  <Typography sx={{ display: { xs: "none", sm: "block" }, textAlign: "center", fontWeight: 700, fontSize: "0.82rem", color: variant.stockQty > 0 ? "success.main" : "error.main" }}>
                    {isAuthenticated ? (variant.stockQty ?? 0) : "—"}
                  </Typography>

                  {/* Cart button */}
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    {!isAdmin() && isAuthenticated && (
                      <IconButton
                        size="small"
                        onClick={() => handleOpenVariant(variant)}
                        sx={{ borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", p: 0.75, "&:hover": { background: "linear-gradient(135deg,#4f46e5,#7c3aed)" } }}
                      >
                        <ShoppingCartIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, v) => { setCurrentPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                color="primary"
                size={isMobile ? "small" : "medium"}
                showFirstButton={!isMobile}
                showLastButton={!isMobile}
                sx={{
                  "& .MuiPaginationItem-root": { fontWeight: 600, borderRadius: 2 },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                  },
                }}
              />
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <LocalOfferIcon sx={{ fontSize: 52, color: "primary.light", mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary">No variants available</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>This product has no variants yet.</Typography>
        </Box>
      )}

      <SingleVariantDialog
        open={openVariantDialog}
        onClose={() => setOpenVariantDialog(false)}
        variant={selectedVariant}
        onAddToCart={handleAddToCart}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: isMobile ? "center" : "left" }}
      >
        <Alert onClose={closeSnackbar} severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDetailsPage;
