// src/components/ConfirmDialog.jsx
// Reusable MUI confirmation dialog — drop-in replacement for window.confirm
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DeleteIcon from "@mui/icons-material/Delete";

const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "error",
  icon = "warning", // "warning" | "delete"
  onConfirm,
  onCancel,
}) => {
  const Icon = icon === "delete" ? DeleteIcon : WarningAmberIcon;
  const iconBg =
    confirmColor === "error"
      ? "linear-gradient(135deg,#ef4444,#dc2626)"
      : "linear-gradient(135deg,#f59e0b,#d97706)";

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            background: iconBg,
            px: 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Icon sx={{ color: "white", fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 1 }}>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{ borderRadius: 2, fontWeight: 600, flex: 1 }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          sx={{ borderRadius: 2, fontWeight: 600, flex: 1 }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
