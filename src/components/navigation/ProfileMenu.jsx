import React from "react";
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import { Logout, AccountCircle } from "@mui/icons-material";

const ProfileMenu = ({
  user,
  isAdmin,
  anchorEl,
  setAnchorEl,
  handleLogoutClick,
}) => {
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          ml: 1,
          color: "white",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.15)",
            transform: "scale(1.1)",
          },
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: "rgba(255,255,255,0.25)",
            fontWeight: 700,
            border: "2px solid rgba(255,255,255,0.3)",
          }}
        >
          {(user?.name || user?.email || "U")[0].toUpperCase()}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 240,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            overflow: "visible",
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 20,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2.5, py: 2, bgcolor: "grey.50" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: "primary.main",
                mr: 1.5,
                fontWeight: 700,
              }}
            >
              {(user?.name || user?.email || "U")[0].toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name || "User"}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {user?.email}
              </Typography>
            </Box>
          </Box>
          {isAdmin() && (
            <Chip
              label="Administrator"
              size="small"
              color="primary"
              sx={{
                fontWeight: 700,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}
        </Box>

        <Divider />

        <MenuItem
          onClick={() => {
            handleClose();
            handleLogoutClick();
          }}
          sx={{
            py: 1.5,
            px: 2.5,
            color: "error.main",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "error.lighter",
            },
          }}
        >
          <Logout sx={{ mr: 1.5, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
