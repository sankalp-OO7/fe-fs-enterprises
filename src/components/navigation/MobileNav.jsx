import React from "react";
import {
  IconButton,
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Avatar,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  Menu,
  Close,
  Inventory,
  People,
  ListAlt,
  Logout,
  ShoppingCart,
  Login,
  PersonAdd,
} from "@mui/icons-material";

const MobileNav = ({
  user,
  isAdmin,
  mobileOpen,
  handleMobileToggle,
  getTotalCartItems,
  openCart,
  handleLogoutClick,
}) => {
  const handleNavClick = () => {
    handleMobileToggle();
  };

  const handleCartClick = () => {
    handleMobileToggle();
    openCart();
  };

  return (
    <>
      <IconButton
        onClick={handleMobileToggle}
        sx={{
          display: { xs: "flex", md: "none" },
          color: "white",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.15)",
            transform: "rotate(90deg)",
          },
        }}
      >
        {mobileOpen ? <Close /> : <Menu />}
      </IconButton>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleMobileToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, letterSpacing: 0.5 }}
            >
              FS Enterprises
            </Typography>
            <IconButton onClick={handleMobileToggle} sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

          {user ? (
            <>
              <List sx={{ px: 2, pt: 2, flexGrow: 1 }}>
                {isAdmin() && (
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      component={RouterLink}
                      to="/adminOrders"
                      onClick={handleNavClick}
                      sx={{
                        borderRadius: 2,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.15)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                        <ListAlt />
                      </ListItemIcon>
                      <ListItemText primary="Orders" />
                    </ListItemButton>
                  </ListItem>
                )}

                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={RouterLink}
                    to="/products"
                    onClick={handleNavClick}
                    sx={{
                      borderRadius: 2,
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                    }}
                  >
                    <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                      <Inventory />
                    </ListItemIcon>
                    <ListItemText primary="Products" />
                  </ListItemButton>
                </ListItem>

                {isAdmin() && (
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      component={RouterLink}
                      to="/users"
                      onClick={handleNavClick}
                      sx={{
                        borderRadius: 2,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.15)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                        <People />
                      </ListItemIcon>
                      <ListItemText primary="Users" />
                    </ListItemButton>
                  </ListItem>
                )}

                {!isAdmin() && (
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={handleCartClick}
                      sx={{
                        borderRadius: 2,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.15)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                        <Badge
                          badgeContent={getTotalCartItems()}
                          color="error"
                          sx={{
                            "& .MuiBadge-badge": {
                              fontWeight: 700,
                              fontSize: "0.65rem",
                              minWidth: 16,
                              height: 16,
                            },
                          }}
                        >
                          <ShoppingCart />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText primary="Cart" />
                    </ListItemButton>
                  </ListItem>
                )}

                <ListItem disablePadding sx={{ mt: 3 }}>
                  <ListItemButton
                    onClick={() => {
                      handleNavClick();
                      handleLogoutClick();
                    }}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                    }}
                  >
                    <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                      <Logout />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </List>

              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "rgba(255,255,255,0.3)",
                        mr: 1.5,
                        fontWeight: 700,
                      }}
                    >
                      {(user?.name || user?.email || "U")[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user?.name || "User"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.9,
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
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 1.5,
                        py: 0.5,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderRadius: 1,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      ADMIN
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          ) : (
            <List sx={{ px: 2, pt: 2 }}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to="/login"
                  onClick={handleNavClick}
                  sx={{
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                  }}
                >
                  <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                    <Login />
                  </ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/register"
                  onClick={handleNavClick}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                    <PersonAdd />
                  </ListItemIcon>
                  <ListItemText primary="Register" />
                </ListItemButton>
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default MobileNav;
