// src/pages/CategoryManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import axiosClient from "../../api/axiosClient";
import {
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Chip,
  Avatar,
  LinearProgress,
  Snackbar,
  Tooltip,
  TablePagination,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ArrowBack,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";

/* ─── Styled helpers ─── */
const GlassCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 20,
  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 4px 32px rgba(79,70,229,0.07)",
  overflow: "hidden",
}));

const StyledRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "14px 20px",
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  transition: "background 0.18s",
  "&:hover": {
    background: alpha(theme.palette.primary.main, 0.03),
  },
  "&:last-child": { borderBottom: "none" },
}));

const FieldLabel = styled(Typography)({
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 6,
  color: "#6366f1",
});

const inputRoundSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
};

/* ─── Component ─── */
const CategoryManagement = () => {
  const { isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ _id: "", name: "", description: "", createdAt: "" });

  const showSnack = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  useEffect(() => {
    if (!isAuthenticated) navigate("/admin/login");
    else if (!isAdmin()) { logout(); navigate("/admin/login"); }
    else fetchCategories();
  }, [isAuthenticated]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/categories");
      setCategories(res.data.data || []);
    } catch (err) {
      showSnack(err.response?.data?.message || "Failed to fetch categories.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleCreateSubmit = async (e) => {
    e?.preventDefault();
    if (!newCategory.name.trim()) return;
    setProcessing(true);
    try {
      await axiosClient.post("/categories", newCategory);
      showSnack(`Category "${newCategory.name}" created!`);
      setNewCategory({ name: "", description: "" });
      setOpenCreateDialog(false);
      fetchCategories();
    } catch (err) {
      showSnack(err.response?.data?.message || "Failed to create category.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleEditSubmit = async () => {
    setProcessing(true);
    try {
      await axiosClient.put(`/categories/${currentCategory._id}`, {
        name: currentCategory.name,
        description: currentCategory.description,
      });
      showSnack(`Category updated to "${currentCategory.name}"!`);
      setOpenEditDialog(false);
      fetchCategories();
    } catch (err) {
      showSnack(err.response?.data?.message || "Failed to update category.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setProcessing(true);
    try {
      await axiosClient.delete(`/categories/${currentCategory._id}`);
      showSnack(`Category "${currentCategory.name}" deleted.`);
      setOpenDeleteDialog(false);
      fetchCategories();
    } catch (err) {
      showSnack(err.response?.data?.message || "Failed to delete. It may have associated products.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  // gradient avatar colors cycling
  const avatarColors = [
    ["#6366f1", "#8b5cf6"],
    ["#0ea5e9", "#6366f1"],
    ["#10b981", "#0ea5e9"],
    ["#f59e0b", "#ef4444"],
    ["#ec4899", "#8b5cf6"],
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: 2 }}>
        <CircularProgress size={48} thickness={4} sx={{ color: "#6366f1" }} />
        <Typography color="text.secondary" fontWeight={600}>Loading categories…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)", pb: 8 }}>
      {/* ─── Topbar ─── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 1.5, sm: 2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "12px", p: 1, "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" } }}
          >
            <ArrowBack fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 800, fontSize: { xs: "1rem", sm: "1.1rem" }, lineHeight: 1.2 }}>
              Category Management
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.62)", fontSize: "0.72rem" }}>
              {categories.length} {categories.length !== 1 ? "categories" : "category"} total
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
          sx={{
            borderRadius: "12px",
            px: { xs: 1.5, sm: 2.5 },
            py: 1,
            fontWeight: 700,
            textTransform: "none",
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            backgroundColor: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.28)",
            color: "white",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.28)" },
            boxShadow: "none",
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Add Category</Box>
          <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>Add</Box>
        </Button>
      </Box>

      {/* ─── Body ─── */}
      <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, sm: 3 }, pt: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", gap: 3 }}>

        {/* Stats row */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {[
            { label: "Total Categories", value: categories.length, color: "#6366f1" },
            { label: "Filtered Results", value: filteredCategories.length, color: "#0ea5e9" },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{
                flex: 1,
                minWidth: 140,
                background: "white",
                borderRadius: "16px",
                border: `1.5px solid ${alpha(stat.color, 0.15)}`,
                boxShadow: `0 4px 20px ${alpha(stat.color, 0.08)}`,
                p: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.6)})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CategoryIcon sx={{ fontSize: 20, color: "white" }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.72rem" }}>
                  {stat.label}
                </Typography>
                <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", lineHeight: 1, color: stat.color }}>
                  {stat.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Search bar */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search categories…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment>,
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")} sx={{ p: 0.25 }}>
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ ...inputRoundSx }}
          />
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchCategories}
              sx={{ borderRadius: "12px", border: "1.5px solid", borderColor: "divider", px: 1.5 }}
            >
              <RefreshIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Categories list */}
        <GlassCard>
          {processing && <LinearProgress sx={{ borderRadius: "20px 20px 0 0" }} />}

          {/* Table header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: "20px",
              py: "10px",
              background: alpha("#6366f1", 0.04),
              borderBottom: "1.5px solid",
              borderColor: alpha("#6366f1", 0.08),
            }}
          >
            <Typography sx={{ flex: 1, fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>
              Category
            </Typography>
            <Typography sx={{ flex: 1, fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary", display: { xs: "none", sm: "block" } }}>
              Description
            </Typography>
            <Typography sx={{ width: 90, fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary", display: { xs: "none", md: "block" } }}>
              Created
            </Typography>
            <Typography sx={{ width: 80, fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary", textAlign: "right" }}>
              Actions
            </Typography>
          </Box>

          {paginatedCategories.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
              <CategoryIcon sx={{ fontSize: 52, color: "primary.light", mb: 2 }} />
              <Typography variant="h6" fontWeight={700} color="text.secondary">
                {searchTerm ? "No results found" : "No categories yet"}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                {searchTerm ? `No match for "${searchTerm}"` : "Click 'Add Category' to create your first one"}
              </Typography>
            </Box>
          ) : (
            paginatedCategories.map((category, idx) => {
              const [c1, c2] = avatarColors[idx % avatarColors.length];
              return (
                <StyledRow key={category._id}>
                  {/* Name + avatar */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "12px",
                        background: `linear-gradient(135deg,${c1},${c2})`,
                        flexShrink: 0,
                        fontSize: "0.85rem",
                        fontWeight: 800,
                      }}
                    >
                      {category.name[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} fontSize="0.9rem" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {category.name}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.68rem" }}>
                        {category._id.substring(0, 10)}…
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.82rem", display: { xs: "none", sm: "block" } }}
                  >
                    {category.description || <span style={{ opacity: 0.4 }}>—</span>}
                  </Typography>

                  {/* Date */}
                  <Typography variant="caption" color="text.secondary" sx={{ width: 90, display: { xs: "none", md: "block" }, fontSize: "0.78rem" }}>
                    {formatDate(category.createdAt)}
                  </Typography>

                  {/* Actions */}
                  <Box sx={{ display: "flex", gap: 0.5, width: 80, justifyContent: "flex-end", flexShrink: 0 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => { setCurrentCategory(category); setOpenEditDialog(true); }}
                        sx={{ borderRadius: "10px", color: "#6366f1", "&:hover": { background: alpha("#6366f1", 0.08) } }}
                      >
                        <EditIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => { setCurrentCategory(category); setOpenDeleteDialog(true); }}
                        sx={{ borderRadius: "10px", color: "error.main", "&:hover": { background: alpha("#ef4444", 0.08) } }}
                      >
                        <DeleteIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </StyledRow>
              );
            })
          )}

          <TablePagination
            component="div"
            count={filteredCategories.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ borderTop: "1px solid", borderColor: "divider", "& .MuiTablePagination-toolbar": { minHeight: 48 } }}
          />
        </GlassCard>
      </Box>

      {/* ─── Create Dialog ─── */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px", overflow: "hidden" } }}
      >
        <Box sx={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", px: 3, py: 2.5 }}>
          <Typography fontWeight={800} fontSize="1.05rem" color="white">Create Category</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>Add a new product category</Typography>
        </Box>
        <DialogContent sx={{ pt: 3, px: 3 }}>
          <Box component="form" onSubmit={handleCreateSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <FieldLabel>Category Name *</FieldLabel>
              <TextField
                autoFocus
                fullWidth
                size="small"
                placeholder="e.g. Safety Equipment"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                required
                disabled={processing}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><CategoryIcon sx={{ fontSize: 17, color: "primary.main" }} /></InputAdornment>,
                }}
                sx={inputRoundSx}
              />
            </Box>
            <Box>
              <FieldLabel>Description</FieldLabel>
              <TextField
                fullWidth
                size="small"
                placeholder="Brief description (optional)"
                multiline
                rows={3}
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                disabled={processing}
                sx={inputRoundSx}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setOpenCreateDialog(false)} disabled={processing} sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={processing || !newCategory.name.trim()}
            startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 14px rgba(99,102,241,0.35)", "&:hover": { background: "linear-gradient(135deg,#4f46e5,#7c3aed)" } }}
          >
            {processing ? "Creating…" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Edit Dialog ─── */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px", overflow: "hidden" } }}
      >
        <Box sx={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)", px: 3, py: 2.5 }}>
          <Typography fontWeight={800} fontSize="1.05rem" color="white">Edit Category</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>Update "{currentCategory.name}"</Typography>
        </Box>
        <DialogContent sx={{ pt: 3, px: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <FieldLabel>Category Name *</FieldLabel>
              <TextField
                autoFocus
                fullWidth
                size="small"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                required
                disabled={processing}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><CategoryIcon sx={{ fontSize: 17, color: "primary.main" }} /></InputAdornment>,
                }}
                sx={inputRoundSx}
              />
            </Box>
            <Box>
              <FieldLabel>Description</FieldLabel>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                value={currentCategory.description || ""}
                onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                disabled={processing}
                sx={inputRoundSx}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setOpenEditDialog(false)} disabled={processing} sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={processing || !currentCategory.name.trim()}
            startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <EditIcon />}
            sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)", "&:hover": { background: "linear-gradient(135deg,#0284c7,#4f46e5)" } }}
          >
            {processing ? "Saving…" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Delete Dialog ─── */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px", overflow: "hidden" } }}
      >
        <DialogContent sx={{ pt: 4, px: 3, textAlign: "center" }}>
          <Box
            sx={{ width: 60, height: 60, borderRadius: "18px", background: "linear-gradient(135deg,#fecaca,#fca5a5)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}
          >
            <WarningIcon sx={{ fontSize: 30, color: "#ef4444" }} />
          </Box>
          <Typography fontWeight={800} fontSize="1.1rem" gutterBottom>Delete Category?</Typography>
          <Typography color="text.secondary" fontSize="0.88rem">
            You're about to delete <strong>"{currentCategory.name}"</strong>. This cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2, borderRadius: "12px", fontSize: "0.8rem", textAlign: "left" }}>
            This will fail if products are linked to this category.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={processing} sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600, flex: 1 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteSubmit}
            variant="contained"
            color="error"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, flex: 1, boxShadow: "0 4px 14px rgba(239,68,68,0.35)" }}
          >
            {processing ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Snackbar ─── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryManagement;