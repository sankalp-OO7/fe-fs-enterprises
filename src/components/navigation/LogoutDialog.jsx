import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack,
  Box,
} from "@mui/material";
import { Logout, Warning } from "@mui/icons-material";

const LogoutDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Logout sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Confirm Logout
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          Are you sure you want to log out of your account?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(244, 67, 54, 0.4)",
            },
          }}
        >
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;
